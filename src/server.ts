import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { routeAgentRequest } from "agents";
import { resolveUserContextFromHeaders } from "@/middleware/ensure-user/resolve";
import { ProjectRepository } from "@/server/features/projects/repositories/ProjectRepository";
import { SamSessionRepository } from "@/server/features/sam/SamSessionRepository";
import { runScheduledRankChecks } from "@/server/features/rank-tracking/services/scheduledRankChecks";
import { reconcileStaleAudits } from "@/server/features/audit/services/auditReconciler";
import { getOrCreateOrganizationCustomer } from "@/server/billing/subscription";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { getAuthMode, isHostedAuthMode } from "@/lib/auth-mode";
import {
  createOpenSeoOAuthProvider,
  type OpenSeoOAuthEnv,
} from "@/server/mcp/oauth-provider";
import { requestWithPublicOrigin } from "@/server/mcp/public-origin";
import { MCP_ROUTE } from "@/server/mcp/context";
import { handleSelfHostedOpenSeoMcpRequest } from "@/server/mcp/transport";
import { withPgClient } from "@/db";
import {
  AUTUMN_WEBHOOK_PATH,
  handleAutumnWebhookRequest,
} from "@/server/billing/autumn-webhook";
import { sweepDubReferredOrganizations } from "@/server/referrals/dub";
import { maybeSendSelfHostHeartbeat } from "@/server/lib/self-host-telemetry";
import { handleGdprStorageErasure } from "@/server/gdpr/storage-erasure";
import { GDPR_STORAGE_ERASURE_PATH } from "@/shared/gdpr-erasure";
import {
  handleAutonomousSeoCycle,
  handleTriggerCycle,
  handleAutonomousQueue,
  handleAutonomousDeduplicate,
  handleAutonomousRobots,
  handleAutonomousSitemap,
  handlePublishQueuedArticle,
  handleAiHarvestKeywords,
  handleAiClusterAndQueue,
  handleGetEngineMode,
  handlePostEngineMode,
  handleGetFlowGraph,
  handlePostFlowGraph,
  handleListWorkflows,
  handleCreateWorkflow,
  handleToggleWorkflow,
  handleDeleteWorkflow,
  handleGenerateAiWorkflow,
  handleCheckLiveRank,
  handlePublicAutonomousArticles,
  handleDualPipelinesTelemetry,
  handleSiteWideRankAudit,
  executeScheduledAutonomousTick,
  handleHarvestedKeywords,
  handleTaskExecutions,
  handleStepDetails,
  handleAddCustomKeywords,
  handleRunTaskStep,
  handleReplenishQueue,
  handleResubmitSitemap,
  handleGeoRadarTelemetry,
  handleRunCitationBenchmark,
  recordAiCrawlerVisit,
  handleGroundTruthTelemetry,
  handleForceSyncPortfolio,
  handleStartTaskExecution,
  scrapePortfolioGroundTruth,
  handleCreateCustomArticle,
  handleUpdateArticle,
  handleDeleteArticles,
  handleBulkUpdateArticles,
  handleDeleteKeywords,
  handleSyncLiveSitemap,
  handleDeduplicateArticles,
} from "@/server/features/automation/autonomousHandler";
import { handleGoogleAdsTestPermissions } from "@/server/features/google-ads/testPermissionsHandler";
import {
  handleSuperAdminLogin,
  handleSuperAdminSession,
  handleSuperAdminLogout,
} from "@/server/features/auth/superAdminAuth";

const appFetch = createStartHandler(defaultStreamHandler);
const openSeoOAuthProvider = createOpenSeoOAuthProvider(appFetch);

// Authorize an onboarding-chat connection in the Worker, before it reaches the
// Durable Object. The DO instance name is the projectId (set client-side); we
// resolve the session here and confirm the caller's org owns that project, so
// the DO can trust its `name`. Returning a Response rejects; void lets it through.
async function authorizeOnboardingChat(
  request: Request,
  projectId: string,
): Promise<Response | undefined> {
  let context;
  try {
    context = await resolveUserContextFromHeaders(request.headers);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
  const project = await ProjectRepository.getProjectForOrganization(
    projectId,
    context.organizationId,
  );
  if (!project) {
    return new Response("Forbidden", { status: 403 });
  }
  // Ensure the org's Autumn customer exists (and gets its default onboarding-plan
  // credits) before the DO checks the balance — otherwise a brand-new org's first
  // message can hit a false "out of credits" gate. Hosted-only; self-hosted has
  // no Autumn.
  if (await isHostedServerAuthMode()) {
    await getOrCreateOrganizationCustomer(context);
  }
  return undefined;
}

// Authorize a SAM agent connection in the Worker, before it reaches the Durable
// Object. The DO instance name is the sessionId (set client-side); we resolve
// the session here and authorize the caller against the session's project via
// the same canonical project-access check the rest of the app uses, so the DO
// can trust its `name` and derive org/project/user from the session row.
async function authorizeSamChat(
  request: Request,
  sessionId: string,
): Promise<Response | undefined> {
  let context;
  try {
    context = await resolveUserContextFromHeaders(request.headers);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
  const session = await SamSessionRepository.getActiveSession(
    sessionId,
    context.userId,
  );
  const project = session
    ? await ProjectRepository.getProjectForOrganization(
        session.projectId,
        context.organizationId,
      )
    : null;
  if (!session || !project) {
    return new Response("Forbidden", { status: 403 });
  }
  // Same as onboarding above: make sure the Autumn customer (and its default
  // free-plan credits) exists before the DO's balance gate runs, or a brand-new
  // org's first message hits a false "out of credits".
  if (await isHostedServerAuthMode()) {
    await getOrCreateOrganizationCustomer(context);
  }
  return undefined;
}

// Both chat DOs live behind /agents/*. Dispatch on the DO binding partyserver
// resolved for the request (rather than re-parsing the path), and fail closed
// on anything unrecognized.
function authorizeChatAgent(
  request: Request,
  lobby: { className: string; name: string },
): Promise<Response | undefined> | Response {
  switch (lobby.className) {
    case "SAM_CHAT":
      return authorizeSamChat(request, lobby.name);
    case "ONBOARDING_CHAT":
      return authorizeOnboardingChat(request, lobby.name);
    default:
      return new Response("Forbidden", { status: 403 });
  }
}

// Route /agents/* to the onboarding and SAM chat DOs. Auth happens here (both
// the WS upgrade and any HTTP message-history fetch), keeping it off the OAuth
// wrapper and TanStack route guard below.
async function routeChatAgents(request: Request, env: Env): Promise<Response> {
  const response = await routeAgentRequest(request, env, {
    cors: true,
    onBeforeConnect: (req, lobby) => authorizeChatAgent(req, lobby),
    onBeforeRequest: (req, lobby) => authorizeChatAgent(req, lobby),
  });
  return response ?? new Response("Not found", { status: 404 });
}

function fetch(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  // Scope a per-request Postgres client (no-op in D1 mode). The client isn't
  // closed here — the Workers↔Hyperdrive socket is reclaimed at invocation end.
  return withPgClient(() => Promise.resolve(handleFetch(request, env, ctx)));
}

function handleFetch(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Response | Promise<Response> {
  ctx.waitUntil(maybeSendSelfHostHeartbeat());

  // Non-blocking Edge AI Crawler Interceptor (GPTBot, ClaudeBot, PerplexityBot, etc.)
  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent) {
    let matchedBot: string | null = null;
    if (/GPTBot/i.test(userAgent)) matchedBot = "GPTBot";
    else if (/ChatGPT-User/i.test(userAgent)) matchedBot = "ChatGPT-User";
    else if (/ClaudeBot|Claude-Web|Anthropic-AI/i.test(userAgent)) matchedBot = "ClaudeBot";
    else if (/PerplexityBot/i.test(userAgent)) matchedBot = "PerplexityBot";
    else if (/Google-Extended/i.test(userAgent)) matchedBot = "Google-Extended";
    else if (/Bytespider/i.test(userAgent)) matchedBot = "Bytespider";
    else if (/Applebot-Extended|Applebot/i.test(userAgent)) matchedBot = "Applebot";

    if (matchedBot) {
      const url = new URL(request.url);
      const country = (request as any).cf?.country || request.headers.get("cf-ipcountry") || "Unknown";
      ctx.waitUntil(recordAiCrawlerVisit(env, matchedBot, userAgent, url.pathname, country));
    }
  }

  const authMode = getAuthMode(env.AUTH_MODE);
  const publicRequest = requestWithPublicOrigin(request);
  const pathname = new URL(publicRequest.url).pathname;

  if (pathname === "/api/automation/geo-radar-telemetry") {
    return handleGeoRadarTelemetry(publicRequest, env);
  }

  if (pathname === "/api/automation/ground-truth-telemetry") {
    return handleGroundTruthTelemetry(publicRequest, env);
  }

  if (pathname === "/api/automation/force-sync-portfolio") {
    return handleForceSyncPortfolio(publicRequest, env);
  }

  if (pathname === "/api/automation/start-task-execution") {
    return handleStartTaskExecution(publicRequest, env);
  }

  if (pathname === "/api/automation/run-citation-benchmark") {
    return handleRunCitationBenchmark(publicRequest, env);
  }

  if (pathname === GDPR_STORAGE_ERASURE_PATH) {
    return handleGdprStorageErasure(publicRequest, env);
  }

  if (pathname === "/api/automation/seo-cycle" || pathname === "/api/autonomous/cycle") {
    return handleAutonomousSeoCycle(publicRequest, env);
  }

  if (pathname === "/api/automation/queue" || pathname === "/api/autonomous/queue") {
    return handleAutonomousQueue(publicRequest, env);
  }

  if (pathname === "/api/automation/deduplicate" || pathname === "/api/autonomous/deduplicate") {
    return handleAutonomousDeduplicate(publicRequest, env);
  }

  if (pathname === "/api/automation/publish-article") {
    return handlePublishQueuedArticle(publicRequest, env);
  }

  if (pathname === "/api/automation/ai-harvest-keywords") {
    return handleAiHarvestKeywords(publicRequest, env);
  }

  if (pathname === "/api/automation/ai-cluster-and-queue") {
    return handleAiClusterAndQueue(publicRequest, env);
  }

  if (pathname === "/robots.txt" || pathname === "/api/autonomous/robots") {
    return handleAutonomousRobots(publicRequest, env);
  }

  if (pathname === "/sitemap.xml" || pathname === "/api/autonomous/sitemap") {
    return handleAutonomousSitemap(publicRequest, env);
  }

  if (pathname === "/api/automation/dual-pipelines-telemetry") {
    return handleDualPipelinesTelemetry(publicRequest, env);
  }

  if (pathname === "/api/automation/site-wide-rank-audit") {
    return handleSiteWideRankAudit(publicRequest, env);
  }

  if (pathname === "/api/automation/trigger-run") {
    return handleTriggerCycle(publicRequest, env);
  }

  if (pathname === "/api/automation/engine-mode") {
    if (publicRequest.method === "POST") {
      return handlePostEngineMode(publicRequest, env);
    }
    return handleGetEngineMode(publicRequest, env);
  }

  if (pathname === "/api/automation/flow-graph") {
    if (publicRequest.method === "POST") {
      return handlePostFlowGraph(publicRequest, env);
    }
    return handleGetFlowGraph(publicRequest, env);
  }

  if (pathname === "/api/automation/workflows") {
    if (publicRequest.method === "POST") {
      return handleCreateWorkflow(publicRequest, env);
    }
    if (publicRequest.method === "DELETE") {
      return handleDeleteWorkflow(publicRequest, env);
    }
    return handleListWorkflows(publicRequest, env);
  }

  if (pathname === "/api/automation/workflows/toggle" && publicRequest.method === "POST") {
    return handleToggleWorkflow(publicRequest, env);
  }

  if (pathname === "/api/automation/generate-ai-workflow" && publicRequest.method === "POST") {
    return handleGenerateAiWorkflow(publicRequest, env);
  }

  if (pathname === "/api/automation/check-live-rank") {
    return handleCheckLiveRank(publicRequest, env);
  }

  if (pathname === "/api/automation/harvested-keywords") {
    return handleHarvestedKeywords(publicRequest, env);
  }

  if (pathname === "/api/automation/task-executions") {
    return handleTaskExecutions(publicRequest, env);
  }

  if (pathname === "/api/automation/step-details") {
    return handleStepDetails(publicRequest, env);
  }

  if (pathname === "/api/automation/add-custom-keywords") {
    return handleAddCustomKeywords(publicRequest, env);
  }

  if (pathname === "/api/automation/run-task-step") {
    return handleRunTaskStep(publicRequest, env);
  }

  if (pathname === "/api/automation/replenish-queue") {
    return handleReplenishQueue(publicRequest, env);
  }

  if (pathname === "/api/automation/resubmit-sitemap") {
    return handleResubmitSitemap(publicRequest, env);
  }

  if (pathname === "/api/automation/create-custom-article" && publicRequest.method === "POST") {
    return handleCreateCustomArticle(publicRequest, env);
  }

  if (pathname === "/api/automation/update-article" && publicRequest.method === "POST") {
    return handleUpdateArticle(publicRequest, env);
  }

  if (pathname === "/api/automation/delete-articles" && publicRequest.method === "POST") {
    return handleDeleteArticles(publicRequest, env);
  }

  if (pathname === "/api/automation/bulk-update-articles" && publicRequest.method === "POST") {
    return handleBulkUpdateArticles(publicRequest, env);
  }

  if (pathname === "/api/automation/delete-keywords" && publicRequest.method === "POST") {
    return handleDeleteKeywords(publicRequest, env);
  }

  if (pathname === "/api/automation/sync-live-sitemap") {
    return handleSyncLiveSitemap(publicRequest, env);
  }

  if (pathname === "/api/automation/deduplicate-articles") {
    return handleDeduplicateArticles(publicRequest, env);
  }

  if (pathname === "/api/google-ads/test-permissions") {
    return handleGoogleAdsTestPermissions(publicRequest, env);
  }

  if (
    pathname === "/api/public/autonomous-articles" ||
    pathname === "/api/public/articles"
  ) {
    return handlePublicAutonomousArticles(publicRequest, env);
  }

  if (pathname === "/api/auth/super-admin/login") {
    return handleSuperAdminLogin(publicRequest, env);
  }

  if (pathname === "/api/auth/super-admin/session") {
    return handleSuperAdminSession(publicRequest);
  }

  if (pathname === "/api/auth/super-admin/logout") {
    return handleSuperAdminLogout();
  }

  if (pathname.startsWith("/agents/")) {
    return routeChatAgents(publicRequest, env);
  }

  if (isHostedAuthMode(authMode)) {
    if (pathname === AUTUMN_WEBHOOK_PATH) {
      return handleAutumnWebhookRequest(publicRequest);
    }

    return openSeoOAuthProvider.fetch(
      publicRequest,
      env as OpenSeoOAuthEnv,
      ctx,
    );
  }

  if (
    (authMode === "cloudflare_access" || authMode === "local_noauth") &&
    pathname === MCP_ROUTE
  ) {
    return handleSelfHostedOpenSeoMcpRequest(publicRequest, authMode, env, ctx);
  }

  return appFetch(request);
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
          await sweepDubReferredOrganizations();
        } catch (err) {
          console.error("[cron] Dub referral sale sweep failed:", err);
        }
      }
      return;
    }

    // Watchdog first: reconcile audits stuck in "running" whose workflow died
    // without reaching mark-failed (OOM/CPU kills, expired instances). Runs
    // before the rank loop so a slow tick can't delay or starve it. Its
    // failure is held until after the rank checks so it can't suppress them,
    // then rethrown so the invocation still reports as failed.
    let watchdogError: unknown;
    try {
      await withPgClient(() => reconcileStaleAudits());
    } catch (err) {
      watchdogError = err;
      console.error("[cron] Stale-audit reconcile failed:", err);
    }
    // Scope a per-request Postgres client for the cron run (no-op in D1 mode).
    await withPgClient(() => runScheduledRankChecks(env));

    // Autonomous SEO, Self-Healing Pipeline & IndexNow Scheduled Tick (Every 30 min)
    try {
      await executeScheduledAutonomousTick(env);
    } catch (autoErr) {
      console.warn("[cron] Autonomous pipeline scheduled tick warning:", autoErr);
    }

    // Ground-Truth 360° Portfolio Deep Scraper (Every 15 min ground-truth verification)
    try {
      await scrapePortfolioGroundTruth(env, true);
    } catch (scrapeErr) {
      console.warn("[cron] Ground-Truth Portfolio Scraper warning:", scrapeErr);
    }

    if (watchdogError) throw watchdogError;
  },
};
