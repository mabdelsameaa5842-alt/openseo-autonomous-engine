import { withPgClient } from "@/db";
import { getAuthMode, isHostedAuthMode } from "@/lib/auth-mode";
import { type OpenSeoOAuthEnv } from "@/server/mcp/oauth-provider";
import { handleMasterRouter, openSeoOAuthProvider } from "@/server/router";

function fetch(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  // Scope a per-request Postgres client (no-op in D1 mode). The client isn't
  // closed here — the Workers↔Hyperdrive socket is reclaimed at invocation end.
  return withPgClient(() => handleMasterRouter(request, env, ctx));
}

// Export Workflow classes as named exports. SiteAuditWorkflow and the
// AuditScratchpad DO live in the open-seo-audit aux worker
// (src/audit-worker.ts); this worker reaches them via cross-script bindings.
export { RankCheckWorkflow } from "./server/workflows/RankCheckWorkflow";
// Durable Object class for the onboarding strategy chat (Agents SDK).
export { OnboardingChatAgent } from "./server/features/onboarding/OnboardingChatAgent";
// Durable Object class for the SAM in-app agent (Agents SDK).
export { SamChatAgent } from "./server/features/sam/SamChatAgent";

// Daily OAuth KV garbage collection; must match a trigger in wrangler.jsonc.
const MCP_OAUTH_PURGE_CRON = "17 3 * * *";

export default {
  fetch,
  async scheduled(
    controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ) {
    if (controller.cron === MCP_OAUTH_PURGE_CRON) {
      // Only hosted mode runs the OAuth provider (and has OAUTH_KV bound).
      if (isHostedAuthMode(getAuthMode(env.AUTH_MODE))) {
        const result = await openSeoOAuthProvider.purgeExpiredData(
          env as OpenSeoOAuthEnv,
        );
        console.log("[mcp-oauth] purged expired OAuth data", result);
        if (!result.done) {
          // The sweep only advances past live records via deletions; a
          // persistent incomplete scan means the keyspace outgrew the batch.
          console.warn("[mcp-oauth] purge did not cover the full keyspace");
        }

        // Daily referral-sale sweep: catches paid Autumn invoices the
        // billing.updated webhook path misses (renewals, one-time top-ups).
        try {
          const { sweepDubReferredOrganizations } = await import("@/server/referrals/dub");
          await sweepDubReferredOrganizations();
        } catch (err) {
          console.error("[cron] Dub referral sale sweep failed:", err);
        }
      }
      return;
    }

    // Differentiate cron triggers to prevent overloading D1 row read quota
    const isThirtyMinCron = controller.cron === "*/30 * * * *";
    const isFifteenMinCron = controller.cron === "*/15 * * * *";

    // Watchdog first: reconcile audits stuck in "running"
    let watchdogError: unknown;
    try {
      const { reconcileStaleAudits } = await import("@/server/features/audit/services/auditReconciler");
      await withPgClient(() => reconcileStaleAudits());
    } catch (err) {
      watchdogError = err;
      console.error("[cron] Stale-audit reconcile failed:", err);
    }

    // Rank checks run every 30 minutes (not on every 15-minute tick)
    if (isThirtyMinCron || !isFifteenMinCron) {
      try {
        const { runScheduledRankChecks } = await import("@/server/features/rank-tracking/services/scheduledRankChecks");
        await withPgClient(() => runScheduledRankChecks(env));
      } catch (rankErr) {
        console.warn("[cron] Scheduled rank check warning:", rankErr);
      }
    }

    // Autonomous SEO, Self-Healing Pipeline & IndexNow Scheduled Tick
    try {
      const { executeScheduledAutonomousTick, scrapePortfolioGroundTruth } = await import(
        "@/server/features/automation/autonomousHandler"
      );
      if (isThirtyMinCron || !isFifteenMinCron) {
        await executeScheduledAutonomousTick(env);
      }
      await scrapePortfolioGroundTruth(env, isThirtyMinCron);
    } catch (autoErr) {
      console.warn("[cron] Autonomous pipeline scheduled tick warning:", autoErr);
    }

    if (watchdogError) throw watchdogError;
  },
};
