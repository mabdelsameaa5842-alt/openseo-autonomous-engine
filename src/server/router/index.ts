import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { routeAgentRequest } from "agents";
import { resolveUserContextFromHeaders } from "@/middleware/ensure-user/resolve";
import { ProjectRepository } from "@/server/features/projects/repositories/ProjectRepository";
import { SamSessionRepository } from "@/server/features/sam/SamSessionRepository";
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
import {
  AUTUMN_WEBHOOK_PATH,
  handleAutumnWebhookRequest,
} from "@/server/billing/autumn-webhook";
import { handleGdprStorageErasure } from "@/server/gdpr/storage-erasure";
import { GDPR_STORAGE_ERASURE_PATH } from "@/shared/gdpr-erasure";
import { handleGoogleAdsTestPermissions } from "@/server/features/google-ads/testPermissionsHandler";
import {
  handleSuperAdminLogin,
  handleSuperAdminSession,
  handleSuperAdminLogout,
} from "@/server/features/auth/superAdminAuth";
import {
  handleNotificationSubscribe,
  handleNotificationTestPush,
  handleNotificationStatus,
} from "@/server/features/notifications/pushNotificationHandler";
import {
  AgentCloudWatchdogService,
  handleAgentsPingConnection,
  handleAgentsChangeState,
} from "@/server/features/automation/agentCloudWatchdog";
import {
  GSC_INTEGRATION,
  GA4_INTEGRATION,
  GOOGLE_ADS_INTEGRATION,
  handleSelfHostedGoogleOAuthCallbackRequest,
} from "@/server/features/google/selfHostedOAuth";
import { setGlobalWorkerEnv } from "@/server/lib/workerEnv";

// Core TanStack Start handler
const appFetch = createStartHandler(defaultStreamHandler);
const openSeoOAuthProvider = createOpenSeoOAuthProvider(appFetch);

// Chat Durable Objects Authorizers
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
  if (await isHostedServerAuthMode()) {
    await getOrCreateOrganizationCustomer(context);
  }
  return undefined;
}

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
  if (await isHostedServerAuthMode()) {
    await getOrCreateOrganizationCustomer(context);
  }
  return undefined;
}

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

async function routeChatAgents(request: Request, env: Env): Promise<Response> {
  const response = await routeAgentRequest(request, env, {
    cors: true,
    onBeforeConnect: (req, lobby) => authorizeChatAgent(req, lobby),
    onBeforeRequest: (req, lobby) => authorizeChatAgent(req, lobby),
  });
  return response ?? new Response("Not found", { status: 404 });
}

/**
 * Unified Master Router Pipeline
 * Centralizes 100% of the application's APIs, OAuth callbacks, autonomous engine routes,
 * agent chat websockets, push notifications, compliance, and SSR handlers.
 */
export async function handleMasterRouter(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  // Phase 0: Hydrate global worker context with live runtime bindings (OAUTH_KV, DB, R2, secrets)
  setGlobalWorkerEnv(env);

  // Phase 1: Edge AI Crawler Interceptor (GPTBot, ClaudeBot, PerplexityBot, etc.)
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
      ctx.waitUntil(
        import("@/server/features/automation/autonomousHandler").then((m) =>
          m.recordAiCrawlerVisit(env, matchedBot!, userAgent, url.pathname, country)
        )
      );
    }
  }

  const authMode = getAuthMode(env.AUTH_MODE);
  const publicRequest = requestWithPublicOrigin(request);
  const pathname = new URL(publicRequest.url).pathname;

  // Phase 2: Compliance & GDPR Storage Erasure
  if (pathname === GDPR_STORAGE_ERASURE_PATH) {
    return handleGdprStorageErasure(publicRequest, env);
  }

  // Phase 3: Google Ecosystem & Direct OAuth Callbacks
  if (pathname === "/api/gsc/oauth/callback") {
    return handleSelfHostedGoogleOAuthCallbackRequest(publicRequest, GSC_INTEGRATION);
  }
  if (pathname === "/api/ga4/oauth/callback") {
    return handleSelfHostedGoogleOAuthCallbackRequest(publicRequest, GA4_INTEGRATION);
  }
  if (pathname === "/api/google-ads/oauth/callback") {
    return handleSelfHostedGoogleOAuthCallbackRequest(publicRequest, GOOGLE_ADS_INTEGRATION);
  }
  if (pathname === "/api/google-ads/test-permissions") {
    return handleGoogleAdsTestPermissions(publicRequest, env);
  }

  // Phase 4: Autonomous SEO Engine & Multi-Agent Network (40+ Endpoints)
  if (
    pathname.startsWith("/api/automation/") ||
    pathname.startsWith("/api/autonomous/") ||
    pathname.startsWith("/api/integrations/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/api/public/autonomous-articles" ||
    pathname === "/api/public/articles"
  ) {
    if (pathname === "/api/automation/agents-simulation-state") {
      return Response.json({
        ok: true,
        agents: AgentCloudWatchdogService.getAgents(),
        timestamp: new Date().toISOString(),
      });
    }

    if (pathname === "/api/automation/agents-ping-connection" && publicRequest.method === "POST") {
      return handleAgentsPingConnection(publicRequest);
    }

    if (pathname === "/api/automation/agents-change-state" && publicRequest.method === "POST") {
      return handleAgentsChangeState(publicRequest);
    }

    const { dispatchAutonomousRoute } = await import(
      "@/server/features/automation/autonomousHandler"
    );
    const autonomousResponse = await dispatchAutonomousRoute(pathname, publicRequest, env);
    if (autonomousResponse) return autonomousResponse;
  }

  // Phase 5: Push Notifications & Alerting
  if (pathname === "/api/notifications/subscribe" && publicRequest.method === "POST") {
    return handleNotificationSubscribe(publicRequest, env);
  }
  if (
    pathname === "/api/notifications/test-push" &&
    (publicRequest.method === "POST" || publicRequest.method === "GET")
  ) {
    return handleNotificationTestPush(publicRequest, env);
  }
  if (pathname === "/api/notifications/status") {
    return handleNotificationStatus(publicRequest, env);
  }

  // Phase 6: Super-Admin Zero-Trust Authentication
  if (pathname === "/api/auth/super-admin/login") {
    return handleSuperAdminLogin(publicRequest, env);
  }
  if (pathname === "/api/auth/super-admin/session") {
    return handleSuperAdminSession(publicRequest);
  }
  if (pathname === "/api/auth/super-admin/logout") {
    return handleSuperAdminLogout();
  }

  // Phase 7: Durable Object Real-Time Agents Gateway (SAM & Onboarding)
  if (pathname.startsWith("/agents/")) {
    return routeChatAgents(publicRequest, env);
  }

  // Phase 8: Hosted Auth Mode, Autumn Webhooks & MCP OAuth Provider
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

  // Phase 9: Self-Hosted MCP Protocol Gateway
  if (
    (authMode === "cloudflare_access" || authMode === "local_noauth") &&
    pathname === MCP_ROUTE
  ) {
    return handleSelfHostedOpenSeoMcpRequest(publicRequest, authMode, env, ctx);
  }

  // Phase 10: TanStack Start Application Router (SSR, Pages & Server Functions)
  return appFetch(request);
}

export { openSeoOAuthProvider };
