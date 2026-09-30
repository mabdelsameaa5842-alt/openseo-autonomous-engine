import { supabaseKvPut } from "../SubMillisecondFallbackEngine";

export interface ApiDiagnosticTelemetryLog {
  id: string;
  traceId: string;
  timestamp: string;
  endpoint: string;
  httpMethod: "GET" | "POST";
  status: "SUCCESS" | "FALLBACK_ENGAGED" | "CRITICAL_ANOMALY";
  primaryEngine: "Cloudflare_D1_SQLite" | "Postgres_Primary";
  fallbackEngineEngaged?: "Supabase_PG" | "Cloudflare_KV" | "In_Memory_Resilient";
  failureReason?: {
    errorCode: string;
    rawMessage: string;
    durationBeforeFailMs: number;
  };
  remediationAdvice?: {
    developerAction: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    isDataSafe: boolean;
    monotonicCounterAtIncident: number;
  };
}

const inMemoryDiagnosticTelemetryLogs: ApiDiagnosticTelemetryLog[] = [];

export class AutonomousDiagnosticsService {
  /**
   * Records an API diagnostic log whenever an endpoint succeeds or triggers a fallback.
   */
  static recordApiDiagnostic(
    entry: Omit<ApiDiagnosticTelemetryLog, "id" | "timestamp" | "traceId"> & { id?: string; timestamp?: string; traceId?: string },
    env?: any,
  ): ApiDiagnosticTelemetryLog {
    const fullLog: ApiDiagnosticTelemetryLog = {
      id: entry.id || `diag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      traceId: entry.traceId || `tr_${Math.random().toString(36).slice(2, 10)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      endpoint: entry.endpoint,
      httpMethod: entry.httpMethod,
      status: entry.status,
      primaryEngine: entry.primaryEngine,
      fallbackEngineEngaged: entry.fallbackEngineEngaged,
      failureReason: entry.failureReason,
      remediationAdvice: entry.remediationAdvice,
    };

    inMemoryDiagnosticTelemetryLogs.unshift(fullLog);
    if (inMemoryDiagnosticTelemetryLogs.length > 80) {
      inMemoryDiagnosticTelemetryLogs.length = 80;
    }

    // Async push to Supabase KV mirror
    void supabaseKvPut("vorder:api_diagnostic_telemetry_logs_v1", inMemoryDiagnosticTelemetryLogs.slice(0, 40)).catch(() => {});

    return fullLog;
  }

  /**
   * Retrieves recent diagnostic logs for inspection and UI display.
   */
  static getRecentDiagnostics(limit = 30): ApiDiagnosticTelemetryLog[] {
    return inMemoryDiagnosticTelemetryLogs.slice(0, limit);
  }

  /**
   * Generates a concise system health assessment across all APIs.
   */
  static getSystemHealthOverview(): {
    overallStatus: "STABLE" | "DEGRADED_BUT_SAFE" | "CRITICAL";
    totalIncidents: number;
    activeFallbacks: string[];
    lastIncidentAt?: string;
  } {
    const recent = inMemoryDiagnosticTelemetryLogs.slice(0, 20);
    const fallbacks = recent.filter((l) => l.status === "FALLBACK_ENGAGED");
    const criticals = recent.filter((l) => l.status === "CRITICAL_ANOMALY");

    if (criticals.length > 0) {
      return {
        overallStatus: "CRITICAL",
        totalIncidents: criticals.length,
        activeFallbacks: Array.from(new Set(criticals.map((c) => c.endpoint))),
        lastIncidentAt: criticals[0]?.timestamp,
      };
    }

    if (fallbacks.length > 0) {
      return {
        overallStatus: "DEGRADED_BUT_SAFE",
        totalIncidents: fallbacks.length,
        activeFallbacks: Array.from(new Set(fallbacks.map((f) => f.endpoint))),
        lastIncidentAt: fallbacks[0]?.timestamp,
      };
    }

    return {
      overallStatus: "STABLE",
      totalIncidents: 0,
      activeFallbacks: [],
    };
  }

  /**
   * Formats a clean, professional JSON report that the system owner can copy and send to the programmer.
   */
  static generateDeveloperDiagnosticReport(latestLog?: ApiDiagnosticTelemetryLog): string {
    const health = this.getSystemHealthOverview();
    const logToReport = latestLog || inMemoryDiagnosticTelemetryLogs[0];

    const payload = {
      reportTitle: "OpenSEO VORDER - تقرير تشخيص وصيانة النظام الموجه للمطور",
      generatedAt: new Date().toISOString(),
      overallHealth: health.overallStatus,
      activeFallbacks: health.activeFallbacks,
      latestIncident: logToReport
        ? {
            traceId: logToReport.traceId,
            endpoint: logToReport.endpoint,
            method: logToReport.httpMethod,
            status: logToReport.status,
            primaryEngine: logToReport.primaryEngine,
            fallbackEngaged: logToReport.fallbackEngineEngaged,
            failureDetails: logToReport.failureReason,
            remediationAdvice: logToReport.remediationAdvice,
          }
        : "لا توجد حوادث مسجلة - جميع الـ APIs تعمل على الخط الأساسي L1 بثبات كامل.",
    };

    return JSON.stringify(payload, null, 2);
  }
}
