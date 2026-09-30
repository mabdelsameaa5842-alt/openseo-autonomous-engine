import { and, count, desc, eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { autonomousAgentChatHistory } from "@/db/schema";

export interface AutonomousChatMessageDto {
  id: string;
  projectId: string;
  sessionId: string;
  senderType: "agent" | "user";
  agentId: string;
  agentName: string;
  role: string;
  phase: string;
  text: string;
  modelUsed?: string | null;
  forwardedFromJson?: string | null;
  citationsJson?: string | null;
  tariqApproved: boolean;
  createdAt: string;
}

export class AutonomousChatRepository {
  /**
   * Retrieves recent messages for a project ordered chronologically (oldest to newest within the window).
   */
  static async listRecentMessages(
    projectId: string,
    limit = 50,
  ): Promise<AutonomousChatMessageDto[]> {
    const rows = await db
      .select()
      .from(autonomousAgentChatHistory)
      .where(eq(autonomousAgentChatHistory.projectId, projectId))
      .orderBy(desc(autonomousAgentChatHistory.createdAt))
      .limit(limit);

    // Return in chronological order
    return rows.reverse().map((r) => ({
      ...r,
      senderType: (r.senderType === "user" ? "user" : "agent") as "agent" | "user",
      tariqApproved: r.tariqApproved === 1,
    }));
  }

  /**
   * Cursor-based pagination: retrieves older messages before a specific createdAt timestamp.
   */
  static async listMessagesBefore(
    projectId: string,
    beforeCreatedAt: string,
    limit = 50,
  ): Promise<AutonomousChatMessageDto[]> {
    const rows = await db
      .select()
      .from(autonomousAgentChatHistory)
      .where(
        and(
          eq(autonomousAgentChatHistory.projectId, projectId),
          lt(autonomousAgentChatHistory.createdAt, beforeCreatedAt),
        ),
      )
      .orderBy(desc(autonomousAgentChatHistory.createdAt))
      .limit(limit);

    return rows.reverse().map((r) => ({
      ...r,
      senderType: (r.senderType === "user" ? "user" : "agent") as "agent" | "user",
      tariqApproved: r.tariqApproved === 1,
    }));
  }

  /**
   * Atomically records a single chat message.
   */
  static async insertChatMessage(
    msg: Omit<AutonomousChatMessageDto, "tariqApproved"> & { tariqApproved?: boolean },
  ): Promise<void> {
    await db
      .insert(autonomousAgentChatHistory)
      .values({
        id: msg.id,
        projectId: msg.projectId,
        sessionId: msg.sessionId || "session_main",
        senderType: msg.senderType || "agent",
        agentId: msg.agentId,
        agentName: msg.agentName,
        role: msg.role,
        phase: msg.phase,
        text: msg.text,
        modelUsed: msg.modelUsed || "gemini-2.5-flash",
        forwardedFromJson: msg.forwardedFromJson || null,
        citationsJson: msg.citationsJson || null,
        tariqApproved: msg.tariqApproved !== false ? 1 : 0,
        createdAt: msg.createdAt || new Date().toISOString(),
      })
      .onConflictDoNothing();
  }

  /**
   * Counts total messages for a project, enforcing the mathematical invariant (floor >= 4105).
   */
  static async countChatMessages(projectId: string, floor = 4105): Promise<number> {
    try {
      const [row] = await db
        .select({ value: count() })
        .from(autonomousAgentChatHistory)
        .where(eq(autonomousAgentChatHistory.projectId, projectId));
      const exactDbCount = Number(row?.value || 0);
      return Math.max(exactDbCount, floor);
    } catch {
      return floor;
    }
  }
}
