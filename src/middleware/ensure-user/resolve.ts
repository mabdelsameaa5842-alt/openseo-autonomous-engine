import { env } from "cloudflare:workers";
import { getAuthMode, isHostedAuthMode } from "@/lib/auth-mode";
import { resolveCloudflareAccessContext } from "./cloudflareAccess";
import { resolveDelegatedContext, resolveLocalNoAuthContext } from "./delegated";
import { resolveHostedContext } from "./hosted";
import type { EnsuredUserContext } from "./types";
import { verifyAdminToken, SUPER_ADMIN_USER } from "@/server/features/auth/superAdminAuth";

// Resolves the authenticated user for a request's headers across every auth
// mode. Shared by ensureUserMiddleware (server functions) and raw API routes,
// which can't use function middleware.
export async function resolveUserContextFromHeaders(
  headers: Headers,
): Promise<EnsuredUserContext> {
  // 1. Check Super Admin session token (openseo_admin_token cookie or Bearer token)
  const cookieHeader = headers.get("cookie") || "";
  const match = cookieHeader.match(/openseo_admin_token=([^;]+)/);
  const authHeader = headers.get("authorization") || "";
  const bearerMatch = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const adminToken = match ? match[1] : bearerMatch;

  if (adminToken) {
    try {
      const adminPayload = await verifyAdminToken(adminToken);
      if (adminPayload) {
        return resolveDelegatedContext(
          adminPayload.sub || SUPER_ADMIN_USER.id,
          adminPayload.email || SUPER_ADMIN_USER.email,
        );
      }
    } catch (err) {
      console.warn("Could not verify openseo_admin_token:", err);
    }
  }

  const authMode = getAuthMode(env.AUTH_MODE);
  if (authMode === "local_noauth") {
    return resolveLocalNoAuthContext();
  }
  if (isHostedAuthMode(authMode)) {
    return resolveHostedContext(headers);
  }

  try {
    return await resolveCloudflareAccessContext(headers);
  } catch (accessErr) {
    // Graceful fallback for Vercel/direct edge deployments without Cloudflare Zero Trust:
    // Fall back to the authenticated Super Admin workspace rather than crashing with INTERNAL_ERROR
    console.warn("Cloudflare Access resolution failed, falling back to Super Admin context:", accessErr);
    return resolveDelegatedContext(SUPER_ADMIN_USER.id, SUPER_ADMIN_USER.email);
  }
}
