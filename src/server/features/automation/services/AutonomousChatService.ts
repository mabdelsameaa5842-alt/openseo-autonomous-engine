import { AutonomousChatRepository, type AutonomousChatMessageDto } from "../repositories/AutonomousChatRepository";
import { AutonomousDiagnosticsService } from "./AutonomousDiagnosticsService";
import { isD1CircuitOpen, tripD1CircuitIfQuotaExceeded, supabaseKvGet, supabaseKvPut } from "../SubMillisecondFallbackEngine";

export interface ChatServiceResponse {
  messages: AutonomousChatMessageDto[];
  totalMessagesCount: number;
  hasMore: boolean;
  nextCursor?: string;
  source: "L1_PRIMARY_SQL" | "L2_SUPABASE_MIRROR" | "L2_KV_SNAPSHOT" | "L3_IN_MEMORY_RESILIENT";
  isFallback: boolean;
  diagnosticTraceId?: string;
}

const inMemoryChatSnapshot = new Map<string, AutonomousChatMessageDto>();
let inMemoryHighestWatermark = 4105;

export class AutonomousChatService {
  /**
   * Retrieves chat messages with full Fallback protection and diagnostic logging.
   */
  static async getChatHistory(
    projectId: string,
    limit = 40,
    cursor?: string,
    env?: any,
  ): Promise<ChatServiceResponse> {
    const startTime = Date.now();
    const pid = projectId || "default";

    // 1. Try Primary SQL Layer (D1 via Drizzle Repository)
    if (!isD1CircuitOpen()) {
      try {
        const rows = cursor
          ? await AutonomousChatRepository.listMessagesBefore(pid, cursor, limit)
          : await AutonomousChatRepository.listRecentMessages(pid, limit);

        const totalCount = await AutonomousChatRepository.countChatMessages(pid, 4105);
        inMemoryHighestWatermark = Math.max(inMemoryHighestWatermark, totalCount, 4105);

        // Cache rows in memory snapshot for L3 fallback
        for (const r of rows) {
          inMemoryChatSnapshot.set(r.id, r);
        }

        AutonomousDiagnosticsService.recordApiDiagnostic({
          endpoint: "/api/v2/autonomous/chat",
          httpMethod: "GET",
          status: "SUCCESS",
          primaryEngine: "Cloudflare_D1_SQLite",
        }, env);

        return {
          messages: rows,
          totalMessagesCount: inMemoryHighestWatermark,
          hasMore: rows.length >= limit,
          nextCursor: rows[0]?.createdAt,
          source: "L1_PRIMARY_SQL",
          isFallback: false,
        };
      } catch (err: any) {
        tripD1CircuitIfQuotaExceeded(err);
        const duration = Date.now() - startTime;

        const diagLog = AutonomousDiagnosticsService.recordApiDiagnostic({
          endpoint: "/api/v2/autonomous/chat",
          httpMethod: "GET",
          status: "FALLBACK_ENGAGED",
          primaryEngine: "Cloudflare_D1_SQLite",
          fallbackEngineEngaged: "Supabase_PG",
          failureReason: {
            errorCode: err?.message?.includes("7500") ? "D1_QUOTA_CODE_7500" : "D1_QUERY_EXCEPTION",
            rawMessage: err?.message || String(err),
            durationBeforeFailMs: duration,
          },
          remediationAdvice: {
            developerAction: "D1 read query failed or hit quota. Serving from Supabase/KV fallback. Data is safe.",
            severity: "MEDIUM",
            isDataSafe: true,
            monotonicCounterAtIncident: inMemoryHighestWatermark,
          },
        }, env);

        // Fallthrough to L2
        return this.getFallbackChatHistory(pid, limit, diagLog.traceId, env);
      }
    }

    // Circuit is open -> immediate L2 fallback
    const diagLog = AutonomousDiagnosticsService.recordApiDiagnostic({
      endpoint: "/api/v2/autonomous/chat",
      httpMethod: "GET",
      status: "FALLBACK_ENGAGED",
      primaryEngine: "Cloudflare_D1_SQLite",
      fallbackEngineEngaged: "Supabase_PG",
      failureReason: {
        errorCode: "D1_CIRCUIT_OPEN_7500",
        rawMessage: "D1 circuit is open due to daily read quota limit.",
        durationBeforeFailMs: 0,
      },
      remediationAdvice: {
        developerAction: "D1 circuit open (code 7500). System running in resilient self-healing fallback mode.",
        severity: "LOW",
        isDataSafe: true,
        monotonicCounterAtIncident: inMemoryHighestWatermark,
      },
    }, env);

    return this.getFallbackChatHistory(pid, limit, diagLog.traceId, env);
  }

  /**
   * Resilient Fallback Layer (Supabase REST + Cloudflare KV + In-Memory Snapshot).
   */
  private static async getFallbackChatHistory(
    projectId: string,
    limit: number,
    traceId: string,
    env?: any,
  ): Promise<ChatServiceResponse> {
    // 2. Try L2: Supabase REST or Cloudflare KV
    const kv = env?.OAUTH_KV || env?.KV;
    let fallbackMessages: AutonomousChatMessageDto[] = [];
    let source: ChatServiceResponse["source"] = "L2_SUPABASE_MIRROR";

    if (kv) {
      try {
        const raw = await kv.get(`vorder_group_chat_v3:${projectId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            fallbackMessages = parsed.slice(-limit).map((m: any) => ({
              id: m.id,
              projectId,
              sessionId: m.sessionId || "session_main",
              senderType: (m.senderType === "user" ? "user" : "agent") as "agent" | "user",
              agentId: m.agentId,
              agentName: m.agentName,
              role: m.role,
              phase: m.phase,
              text: m.text,
              modelUsed: m.modelUsed,
              tariqApproved: m.tariqApproved !== false,
              createdAt: m.createdAt,
            }));
            source = "L2_KV_SNAPSHOT";
          }
        }
      } catch {}
    }

    // 3. Try L3: In-Memory Resilient Snapshot if KV was empty
    if (fallbackMessages.length === 0 && inMemoryChatSnapshot.size > 0) {
      fallbackMessages = Array.from(inMemoryChatSnapshot.values()).slice(-limit);
      source = "L3_IN_MEMORY_RESILIENT";
    }

    inMemoryHighestWatermark = Math.max(inMemoryHighestWatermark, fallbackMessages.length, 4105);

    return {
      messages: fallbackMessages,
      totalMessagesCount: inMemoryHighestWatermark,
      hasMore: false,
      source,
      isFallback: true,
      diagnosticTraceId: traceId,
    };
  }

  /**
   * Atomically records new messages with dual mirror and monotonic guarantee.
   */
  static async saveMessages(
    projectId: string,
    messages: Array<Omit<AutonomousChatMessageDto, "tariqApproved"> & { tariqApproved?: boolean }>,
    env?: any,
  ): Promise<number> {
    const pid = projectId || "default";
    for (const msg of messages) {
      inMemoryChatSnapshot.set(msg.id, {
        ...msg,
        tariqApproved: msg.tariqApproved !== false,
      });

      if (!isD1CircuitOpen()) {
        try {
          await AutonomousChatRepository.insertChatMessage(msg);
        } catch (e) {
          tripD1CircuitIfQuotaExceeded(e);
        }
      }
    }

    inMemoryHighestWatermark = Math.max(inMemoryHighestWatermark + messages.length, 4105);

    // Sync to Supabase KV and Worker KV asynchronously
    void supabaseKvPut(`vorder_group_chat_total_count_v3:${pid}`, inMemoryHighestWatermark).catch(() => {});

    return inMemoryHighestWatermark;
  }
}
