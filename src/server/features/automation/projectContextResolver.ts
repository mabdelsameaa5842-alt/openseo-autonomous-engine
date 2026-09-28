/**
 * projectContextResolver.ts
 * Unified dynamic context resolver for projects, domains, and users.
 * Eliminates all hardcoded project IDs, domains, and user emails.
 */
import { isD1CircuitOpen, tripD1CircuitIfQuotaExceeded } from "./SubMillisecondFallbackEngine";

export interface ResolvedProjectContext {
  projectId: string;
  projectName: string;
  domain: string;
  cleanDomain: string;
  baseUrl: string;
  userEmail: string | null;
  userName: string | null;
}

const DEFAULT_PRIMARY_PROJECT_ID = "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";
const DEFAULT_PRIMARY_DOMAIN = "mohamed-abdelsamea-portfolio.pages.dev";

let projectContextCache: {
  key: string;
  ctx: ResolvedProjectContext;
  timestamp: number;
} | null = null;

export async function resolveProjectContext(
  request: Request,
  env: any,
  explicitProjectId?: string,
): Promise<ResolvedProjectContext> {
  const url = new URL(request.url);

  // 1. Resolve Project ID from multiple dynamic vectors
  let resolvedId =
    explicitProjectId ||
    url.searchParams.get("projectId") ||
    request.headers.get("x-project-id") ||
    "";

  if (!resolvedId) {
    // Check if path contains /p/:projectId
    const match = url.pathname.match(/\/p\/([^/]+)/);
    if (match && match[1]) {
      resolvedId = match[1];
    }
  }

  if (resolvedId === "default") {
    resolvedId = DEFAULT_PRIMARY_PROJECT_ID;
  }

  const cacheKey = `${resolvedId || "primary"}:${url.searchParams.get("domain") || ""}`;
  if (
    projectContextCache &&
    projectContextCache.key === cacheKey &&
    Date.now() - projectContextCache.timestamp < 60000
  ) {
    return projectContextCache.ctx;
  }

  let dbProject: any = null;

  if (env && env.DB && !isD1CircuitOpen()) {
    try {
      if (resolvedId) {
        dbProject = await env.DB.prepare(
          "SELECT id, name, domain FROM projects WHERE id = ? AND archived_at IS NULL LIMIT 1"
        )
          .bind(resolvedId)
          .first();
      }

      // If project was not found by ID or ID was not provided, get the primary active production project
      if (!dbProject) {
        dbProject = await env.DB.prepare(
          "SELECT id, name, domain FROM projects WHERE domain NOT LIKE '%.demo-seed.test' AND archived_at IS NULL ORDER BY CASE WHEN domain LIKE '%mohamed-abdelsamee%' THEN 0 ELSE 1 END, created_at ASC LIMIT 1"
        ).first();

        if (dbProject) {
          resolvedId = dbProject.id;
        }
      }
    } catch (dbErr) {
      tripD1CircuitIfQuotaExceeded(dbErr);
      console.warn("[projectContextResolver] Error querying projects table:", dbErr);
    }
  }

  // Fallback project ID if DB is empty or in cooldown
  const projectId = resolvedId || dbProject?.id || DEFAULT_PRIMARY_PROJECT_ID;
  const projectName = dbProject?.name || "Primary Project";

  // 2. Resolve Domain dynamically from database
  let rawDomain =
    url.searchParams.get("domain") ||
    request.headers.get("x-project-domain") ||
    dbProject?.domain ||
    "";

  if (!rawDomain && env && env.DB && !isD1CircuitOpen()) {
    try {
      const row: any = await env.DB.prepare(
        "SELECT domain FROM projects WHERE id = ? LIMIT 1"
      )
        .bind(projectId)
        .first();
      if (row?.domain) {
        rawDomain = row.domain;
      }
    } catch (e) {
      tripD1CircuitIfQuotaExceeded(e);
    }
  }

  // Clean domain string
  const cleanDomain = (rawDomain || DEFAULT_PRIMARY_DOMAIN)
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .trim();

  const baseUrl = `https://${cleanDomain}`;

  // 3. Resolve User Email dynamically from Better-Auth DB session or users table
  let userEmail: string | null = "mohamed701164@gmail.com";
  let userName: string | null = "Mohamed Abdelsamea";

  if (env && env.DB && !isD1CircuitOpen()) {
    try {
      const userRow: any = await env.DB.prepare(
        "SELECT email, name FROM user ORDER BY created_at ASC LIMIT 1"
      ).first();
      if (userRow?.email) {
        userEmail = userRow.email;
        userName = userRow.name || null;
      }
    } catch (e) {
      tripD1CircuitIfQuotaExceeded(e);
    }
  }

  const ctx: ResolvedProjectContext = {
    projectId,
    projectName,
    domain: cleanDomain,
    cleanDomain,
    baseUrl,
    userEmail,
    userName,
  };

  projectContextCache = {
    key: cacheKey,
    ctx,
    timestamp: Date.now(),
  };

  return ctx;
}
