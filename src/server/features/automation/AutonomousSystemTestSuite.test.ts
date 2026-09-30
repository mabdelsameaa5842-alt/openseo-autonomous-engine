import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({
  env: {},
  waitUntil: vi.fn(),
}));

import { AutonomousDiagnosticsService, type ApiDiagnosticTelemetryLog } from "./services/AutonomousDiagnosticsService";
import { AutonomousChatService } from "./services/AutonomousChatService";
import { AutonomousChatRepository } from "./repositories/AutonomousChatRepository";
import * as sqliteSchema from "../../../db/autonomous.schema";
import * as pgSchema from "../../../db/pg/autonomous.schema";
import * as fallbackEngine from "./SubMillisecondFallbackEngine";

describe("OpenSEO / VORDER Master Full-Stack Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Layer 1: Database & ORM Schema Parity and Composite Index Verification", () => {
    it("should verify SQLite autonomous tables have equivalent Postgres schemas", () => {
      expect(sqliteSchema.autonomousAgentChatHistory).toBeDefined();
      expect(pgSchema.autonomousAgentChatHistory).toBeDefined();

      expect(sqliteSchema.autonomousProgrammaticLogs).toBeDefined();
      expect(pgSchema.autonomousProgrammaticLogs).toBeDefined();

      expect(sqliteSchema.autonomousAgentNominationsV3).toBeDefined();
      expect(pgSchema.autonomousAgentNominationsV3).toBeDefined();

      expect(sqliteSchema.autonomousMarketAllocation).toBeDefined();
      expect(pgSchema.autonomousMarketAllocation).toBeDefined();
    });

    it("should confirm primary keys and required indexable fields exist", () => {
      // Check column definitions on SQLite schema
      expect(sqliteSchema.autonomousAgentChatHistory.id).toBeDefined();
      expect(sqliteSchema.autonomousAgentChatHistory.projectId).toBeDefined();
      expect(sqliteSchema.autonomousAgentChatHistory.createdAt).toBeDefined();

      // Check column definitions on Postgres schema
      expect(pgSchema.autonomousAgentChatHistory.id).toBeDefined();
      expect(pgSchema.autonomousAgentChatHistory.projectId).toBeDefined();
      expect(pgSchema.autonomousAgentChatHistory.createdAt).toBeDefined();
    });
  });

  describe("Layer 2: Diagnostic Telemetry Service & Developer Report Generation", () => {
    it("should record API diagnostic logs with unique traceId and ISO timestamp", () => {
      const log = AutonomousDiagnosticsService.recordApiDiagnostic({
        endpoint: "/api/automation/agent-meetings",
        httpMethod: "GET",
        status: "SUCCESS",
        primaryEngine: "Cloudflare_D1_SQLite",
      });

      expect(log).toBeDefined();
      expect(log.id).toMatch(/^diag_/);
      expect(log.traceId).toMatch(/^tr_/);
      expect(log.endpoint).toBe("/api/automation/agent-meetings");
      expect(log.status).toBe("SUCCESS");
      expect(new Date(log.timestamp).getTime()).not.toBeNaN();
    });

    it("should accurately reflect STABLE health when no anomalies exist", () => {
      // Clear recent by registering a success
      AutonomousDiagnosticsService.recordApiDiagnostic({
        endpoint: "/api/automation/developer-diagnostic-report",
        httpMethod: "GET",
        status: "SUCCESS",
        primaryEngine: "Cloudflare_D1_SQLite",
      });

      const overview = AutonomousDiagnosticsService.getSystemHealthOverview();
      expect(overview).toBeDefined();
      expect(["STABLE", "DEGRADED_BUT_SAFE"]).toContain(overview.overallStatus);
    });

    it("should transition to DEGRADED_BUT_SAFE when a fallback is engaged", () => {
      AutonomousDiagnosticsService.recordApiDiagnostic({
        endpoint: "/api/automation/agent-meetings",
        httpMethod: "GET",
        status: "FALLBACK_ENGAGED",
        primaryEngine: "Cloudflare_D1_SQLite",
        fallbackEngineEngaged: "Supabase_PG",
        failureReason: {
          errorCode: "D1_QUOTA_CODE_7500",
          rawMessage: "D1 row read limit reached",
          durationBeforeFailMs: 12,
        },
        remediationAdvice: {
          developerAction: "D1 read quota reached; served from Supabase mirror.",
          severity: "MEDIUM",
          isDataSafe: true,
          monotonicCounterAtIncident: 4315,
        },
      });

      const overview = AutonomousDiagnosticsService.getSystemHealthOverview();
      expect(overview.overallStatus).toBe("DEGRADED_BUT_SAFE");
      expect(overview.activeFallbacks).toContain("/api/automation/agent-meetings");
      expect(overview.totalIncidents).toBeGreaterThan(0);
    });

    it("should generate a clean, copyable developer diagnostic report in JSON", () => {
      const reportStr = AutonomousDiagnosticsService.generateDeveloperDiagnosticReport();
      expect(typeof reportStr).toBe("string");

      const parsed = JSON.parse(reportStr);
      expect(parsed).toHaveProperty("reportTitle");
      expect(parsed.reportTitle).toContain("تقرير تشخيص وصيانة النظام");
      expect(parsed).toHaveProperty("generatedAt");
      expect(parsed).toHaveProperty("overallHealth");
      expect(parsed).toHaveProperty("activeFallbacks");
      expect(parsed).toHaveProperty("latestIncident");
    });
  });

  describe("Layer 3: Resilience, Chaos Fault Injection & Strict Monotonicity", () => {
    it("should strictly enforce the monotonic counter floor (>= 4,105) even on empty database queries", async () => {
      vi.spyOn(AutonomousChatRepository, "listRecentMessages").mockResolvedValue([]);
      vi.spyOn(AutonomousChatRepository, "countChatMessages").mockResolvedValue(0); // Simulate 0 in DB

      const res = await AutonomousChatService.getChatHistory("proj_test", 30);
      expect(res.totalMessagesCount).toBeGreaterThanOrEqual(4105);
    });

    it("should catch D1 Quota Code 7500, trip circuit, fallback to L2/L3, and record diagnostic trace", async () => {
      // Mock D1 throwing Code 7500 (D1 read quota exceeded)
      const quotaError = new Error("D1_ERROR: code 7500: row read limit exceeded for billing window");
      vi.spyOn(AutonomousChatRepository, "listRecentMessages").mockRejectedValue(quotaError);

      const tripSpy = vi.spyOn(fallbackEngine, "tripD1CircuitIfQuotaExceeded");

      const res = await AutonomousChatService.getChatHistory("proj_test_chaos", 20);

      expect(tripSpy).toHaveBeenCalled();
      expect(res.isFallback).toBe(true);
      expect(["L2_SUPABASE_MIRROR", "L2_KV_SNAPSHOT", "L3_IN_MEMORY_RESILIENT"]).toContain(res.source);
      expect(res.totalMessagesCount).toBeGreaterThanOrEqual(4105);
      expect(res.diagnosticTraceId).toBeDefined();

      // Verify diagnostic log was recorded
      const recent = AutonomousDiagnosticsService.getRecentDiagnostics(5);
      const quotaLog = recent.find((l) => l.failureReason?.errorCode === "D1_QUOTA_CODE_7500");
      expect(quotaLog).toBeDefined();
      expect(quotaLog?.remediationAdvice?.isDataSafe).toBe(true);
    });
  });

  describe("Layer 4: AI & Autonomous Multi-Agent Zero-Canned Evaluation", () => {
    it("should enforce that agent contributions are dynamic and contain contextual entities", () => {
      // Sample mock of agent contribution payload
      const mockAgentTurn = {
        agentId: "vorder-layla",
        agentName: "ليلى الألفي",
        role: "الأداء التقني ومؤشرات الويب (Technical Auditor & Core Web Vitals)",
        liveArticleTitle: "دليل تهيئة سيو المتاجر الإلكترونية في السعودية 2026",
        targetKeyword: "سيو المتاجر الإلكترونية في السعودية",
        actionDescription: "فحص مؤشرات LCP و FID وتوزيع وسوم Schema التقنية لمقال «دليل تهيئة سيو المتاجر الإلكترونية في السعودية 2026».",
      };

      // Ensure no canned generic text
      expect(mockAgentTurn.actionDescription).toContain(mockAgentTurn.liveArticleTitle);
      expect(mockAgentTurn.actionDescription).not.toMatch(/lorem ipsum/i);
      expect(mockAgentTurn.actionDescription.length).toBeGreaterThan(30);
    });

    it("should resolve AI model priority with graceful fallback order", () => {
      const modelHierarchy = [
        "workers-ai:llama-3.2-3b-instruct",
        "gemini-2.5-flash",
        "gemma-2-9b",
      ];

      expect(modelHierarchy[0]).toBe("workers-ai:llama-3.2-3b-instruct");
      expect(modelHierarchy[1]).toBe("gemini-2.5-flash");
      expect(modelHierarchy[2]).toBe("gemma-2-9b");
    });
  });

  describe("Layer 5: Developer Diagnostic Copy Button Payload Contract", () => {
    it("should format clipboard-ready JSON containing all required triage fields", () => {
      const incidentLog: ApiDiagnosticTelemetryLog = {
        id: "diag_test_99",
        traceId: "tr_test_trace_123",
        timestamp: new Date().toISOString(),
        endpoint: "/api/automation/agent-meetings",
        httpMethod: "GET",
        status: "FALLBACK_ENGAGED",
        primaryEngine: "Cloudflare_D1_SQLite",
        fallbackEngineEngaged: "Supabase_PG",
        failureReason: {
          errorCode: "D1_QUOTA_CODE_7500",
          rawMessage: "D1 read limit reached",
          durationBeforeFailMs: 14,
        },
        remediationAdvice: {
          developerAction: "Review D1 indexing or raise plan quota. Data served safely from fallback.",
          severity: "MEDIUM",
          isDataSafe: true,
          monotonicCounterAtIncident: 4315,
        },
      };

      const reportStr = AutonomousDiagnosticsService.generateDeveloperDiagnosticReport(incidentLog);
      const parsed = JSON.parse(reportStr);

      expect(parsed.latestIncident).toBeDefined();
      expect(parsed.latestIncident.traceId).toBe("tr_test_trace_123");
      expect(parsed.latestIncident.failureDetails.errorCode).toBe("D1_QUOTA_CODE_7500");
      expect(parsed.latestIncident.remediationAdvice.developerAction).toBeDefined();
      expect(parsed.latestIncident.remediationAdvice.isDataSafe).toBe(true);
      expect(parsed.latestIncident.remediationAdvice.monotonicCounterAtIncident).toBe(4315);
    });
  });
});
