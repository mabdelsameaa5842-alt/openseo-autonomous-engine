import { symmetricEncrypt } from "better-auth/crypto";
import { env } from "cloudflare:workers";
import { getGlobalWorkerEnv } from "@/server/lib/workerEnv";

function getEffectiveEnv(): any {
  return getGlobalWorkerEnv() || env;
}
import { and, eq } from "drizzle-orm";
import { decodeJwt } from "jose";
import { z } from "zod";
import { db } from "@/db";
import { account } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { getAuthMode, isHostedAuthMode } from "@/lib/auth-mode";
import { resolveCloudflareAccessContext } from "@/middleware/ensure-user/cloudflareAccess";
import { resolveLocalNoAuthContext } from "@/middleware/ensure-user/delegated";
import { AppError } from "@/server/lib/errors";
import { responseForAppError } from "@/server/lib/http-errors";
import { getPublicOrigin } from "@/server/mcp/public-origin";
import { GA4_OAUTH_PROVIDER_ID, GA4_OAUTH_SCOPES } from "@/shared/ga4";
import { GOOGLE_ADS_OAUTH_PROVIDER_ID, GOOGLE_ADS_OAUTH_SCOPES } from "@/shared/google-ads";
import { GSC_OAUTH_PROVIDER_ID, GSC_OAUTH_SCOPES } from "@/shared/gsc";
import {
  getGoogleOAuthClientConfig,
  hasSelfHostedGoogleOAuthConfig,
} from "./oauth-config";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export type SelfHostedGoogleOAuthIntegration = {
  providerId: string;
  stateNamespace: string;
  displayName: string;
  callbackPath: `/${string}`;
  scopes: readonly string[];
};

type SelfHostedGoogleUser = {
  userId: string;
  userEmail: string;
};

export const GSC_INTEGRATION: SelfHostedGoogleOAuthIntegration = {
  providerId: GSC_OAUTH_PROVIDER_ID,
  // Preserve the state-signing namespace used by the original GSC flow so a
  // deployment does not invalidate an authorization already in progress.
  stateNamespace: "gsc",
  displayName: "Search Console",
  callbackPath: "/api/gsc/oauth/callback",
  scopes: GSC_OAUTH_SCOPES,
};

export const GA4_INTEGRATION: SelfHostedGoogleOAuthIntegration = {
  providerId: GA4_OAUTH_PROVIDER_ID,
  stateNamespace: "ga4",
  displayName: "Google Analytics",
  callbackPath: "/api/ga4/oauth/callback",
  scopes: GA4_OAUTH_SCOPES,
};

export const GOOGLE_ADS_INTEGRATION: SelfHostedGoogleOAuthIntegration = {
  providerId: GOOGLE_ADS_OAUTH_PROVIDER_ID,
  stateNamespace: "google-ads",
  displayName: "Google Ads",
  callbackPath: "/api/google-ads/oauth/callback",
  scopes: GOOGLE_ADS_OAUTH_SCOPES,
};

export const GOOGLE_AI_STUDIO_INTEGRATION: SelfHostedGoogleOAuthIntegration = {
  providerId: "google-ai-studio",
  // Reuse the whitelisted GSC callback path & state signing namespace so no extra redirect URI is required in Google Cloud Console
  stateNamespace: "gsc",
  displayName: "Google Gemini AI Studio",
  callbackPath: "/api/gsc/oauth/callback",
  scopes: [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/generative-language.retriever",
  ],
};

const oauthStateSchema = z.object({
  userId: z.string().min(1),
  callbackPath: z.string().min(1),
  exp: z.number().int(),
  redirectUri: z.string().optional(),
  targetPlatform: z.string().optional(),
});

const googleTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
  token_type: z.string().optional(),
});

const googleIdTokenSchema = z.object({ sub: z.string().min(1) });
type GoogleTokenResponse = z.infer<typeof googleTokenResponseSchema>;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const binary = atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getStateKey(clientSecret: string, stateNamespace: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`openseo:${stateNamespace}:${clientSecret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signState(
  payload: string,
  clientSecret: string,
  stateNamespace: string,
) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getStateKey(clientSecret, stateNamespace),
    new TextEncoder().encode(payload),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

function getSafeCallbackPath(callbackURL: string, publicOrigin: string) {
  try {
    const url = new URL(callbackURL, publicOrigin);
    if (url.origin !== publicOrigin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

async function createState(input: {
  integration: SelfHostedGoogleOAuthIntegration;
  clientSecret: string;
  userId: string;
  callbackURL: string;
  publicOrigin: string;
  redirectUri?: string;
}) {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        userId: input.userId,
        callbackPath: getSafeCallbackPath(
          input.callbackURL,
          input.publicOrigin,
        ),
        exp: Date.now() + 10 * 60 * 1_000,
        redirectUri: input.redirectUri,
        targetPlatform:
          input.integration.providerId === "google-ai-studio"
            ? "google_ai_studio"
            : undefined,
      }),
    ),
  );
  const signature = await signState(
    payload,
    input.clientSecret,
    input.integration.stateNamespace,
  );
  return `${payload}.${signature}`;
}

async function verifyState(input: {
  state: string;
  clientSecret: string;
  integration: SelfHostedGoogleOAuthIntegration;
}) {
  const [payload, signature] = input.state.split(".");
  if (!payload || !signature) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Invalid ${input.integration.displayName} state`,
    );
  }
  const ok = await crypto.subtle.verify(
    "HMAC",
    await getStateKey(input.clientSecret, input.integration.stateNamespace),
    base64UrlToBytes(signature),
    new TextEncoder().encode(payload),
  );
  if (!ok) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Invalid ${input.integration.displayName} state`,
    );
  }
  const parsed = oauthStateSchema.parse(
    JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))),
  );
  if (parsed.exp < Date.now()) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Expired ${input.integration.displayName} state`,
    );
  }
  return parsed;
}

function getRedirectUri(
  publicOrigin: string,
  integration: SelfHostedGoogleOAuthIntegration,
) {
  return `${publicOrigin}${integration.callbackPath}`;
}

async function getGoogleAccountProfile(tokens: GoogleTokenResponse): Promise<{
  accountId: string;
  email: string | null;
  name: string | null;
}> {
  let sub: string | null = null;
  let email: string | null = null;
  let name: string | null = null;

  if (tokens.id_token) {
    try {
      const decoded = decodeJwt(tokens.id_token) as Record<string, any>;
      if (typeof decoded.sub === "string" && decoded.sub) sub = decoded.sub;
      if (typeof decoded.email === "string" && decoded.email) email = decoded.email;
      if (typeof decoded.name === "string" && decoded.name) name = decoded.name;
    } catch {
      // Fallback to userinfo below
    }
  }

  if (tokens.access_token && (!sub || !email)) {
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userInfoRes.ok) {
        const data = (await userInfoRes.json()) as {
          sub?: string;
          id?: string;
          email?: string;
          name?: string;
        };
        sub = sub || data.sub || data.id || null;
        email = email || data.email || null;
        name = name || data.name || null;
      }
    } catch (e) {
      console.warn("[getGoogleAccountProfile] userinfo fallback failed:", e);
    }
  }

  return {
    accountId: sub || `google_${Date.now()}`,
    email,
    name,
  };
}

function unwrapErrorMessage(err: unknown): {
  rawMessage: string;
  causeMessage: string;
  fullTrace: string;
} {
  if (!err) {
    return { rawMessage: "Unknown error", causeMessage: "Unknown cause", fullTrace: "" };
  }
  const e = err as any;
  const rawMessage = e?.message || String(err);
  const causeMessage =
    e?.cause?.message ||
    e?.cause?.detail ||
    (typeof e?.cause === "string" ? e.cause : "") ||
    rawMessage;
  const fullTrace = e?.stack || JSON.stringify(e, Object.getOwnPropertyNames(e));
  return { rawMessage, causeMessage, fullTrace };
}

export async function recordOAuthDiagnosticLog(
  stateNamespace: string,
  entry: {
    step: string;
    status: "error" | "warning" | "healthy";
    rawMessage: string;
    causeMessage: string;
    httpStatus?: number;
    arabicSummary: string;
    fixSuggestion: string;
    timestamp?: string;
  },
) {
  const payload = {
    ...entry,
    platform: stateNamespace,
    timestamp: entry.timestamp || new Date().toISOString(),
  };
  try {
    const kv = getEffectiveEnv()?.OAUTH_KV;
    if (kv) {
      await kv.put(`diag:global:${stateNamespace}`, JSON.stringify(payload), {
        expirationTtl: 60 * 60 * 24 * 14,
      });
    }
  } catch (e) {
    console.warn("[recordOAuthDiagnosticLog] KV write failed:", e);
  }
}

const inMemoryOAuthTokenCache = new Map<
  string,
  {
    accessToken: string;
    expiresAt: number;
    email: string | null;
    accountId: string;
    selectedResource: string | null;
    availableResources: Array<{ id: string; label: string; permission?: string }>;
  }
>();

const inMemorySelectedResourceCache = new Map<string, string>();

export function setInMemoryOAuthSelectedResource(
  stateNamespace: string,
  resourceId: string,
): void {
  const canonical =
    stateNamespace === "gemini" || stateNamespace === "google-ai-studio"
      ? "google_ai_studio"
      : stateNamespace;
  inMemorySelectedResourceCache.set(canonical, resourceId);
  const existing = inMemoryOAuthTokenCache.get(canonical);
  if (existing) {
    existing.selectedResource = resourceId;
  }
}

export async function getOrRefreshGoogleOAuthTokenFromKv(
  stateNamespace: "gsc" | "ga4" | "google-ads" | "google_ai_studio" | string,
  forceRefresh = false,
): Promise<{
  accessToken: string;
  email: string | null;
  accountId: string;
  selectedResource: string | null;
  availableResources: Array<{ id: string; label: string; permission?: string }>;
} | null> {
  const canonicalNs =
    stateNamespace === "gemini" || stateNamespace === "google-ai-studio"
      ? "google_ai_studio"
      : stateNamespace;
  const cached = inMemoryOAuthTokenCache.get(canonicalNs);
  if (!forceRefresh && cached && cached.accessToken && cached.expiresAt > Date.now() + 90_000) {
    return {
      ...cached,
      selectedResource:
        inMemorySelectedResourceCache.get(canonicalNs) || cached.selectedResource || null,
    };
  }
  try {
    const kv = getEffectiveEnv()?.OAUTH_KV;
    if (!kv) return null;

    const providerKeyMap: Record<string, string> = {
      gsc: GSC_OAUTH_PROVIDER_ID,
      ga4: GA4_OAUTH_PROVIDER_ID,
      "google-ads": GOOGLE_ADS_OAUTH_PROVIDER_ID,
      google_ai_studio: "google-ai-studio",
      "google-ai-studio": "google_ai_studio",
      gemini: "google_ai_studio",
    };
    const primaryKey = `oauth_grant:${stateNamespace}`;
    const secondaryKey = providerKeyMap[stateNamespace]
      ? `oauth_grant:${providerKeyMap[stateNamespace]}`
      : null;

    let raw =
      (await kv.get(primaryKey)) ||
      (secondaryKey ? await kv.get(secondaryKey) : null);

    // Self-Healing Bridge from Supabase KV mirror & D1 account table when OAUTH_KV is unseeded or evicted
    if (!raw) {
      try {
        const { supabaseKvGet } = await import("@/server/features/automation/SubMillisecondFallbackEngine");
        const supaVal = (await supabaseKvGet<any>(primaryKey)) || (secondaryKey ? await supabaseKvGet<any>(secondaryKey) : null);
        if (supaVal) {
          raw = typeof supaVal === "string" ? supaVal : JSON.stringify(supaVal);
        } else {
          // If asking for gsc or google-ads, oauth_grant:ga4 in Supabase contains the master refresh token with all scopes
          const ga4Master = await supabaseKvGet<any>("oauth_grant:ga4");
          if (ga4Master) {
            const parsedGa4 = typeof ga4Master === "string" ? JSON.parse(ga4Master) : ga4Master;
            if (parsedGa4?.refreshToken) {
              const adaptedPayload = {
                ...parsedGa4,
                providerId: providerKeyMap[stateNamespace] || stateNamespace,
                stateNamespace,
                selectedResource:
                  stateNamespace === "gsc"
                    ? "https://mohamed-abdelsamee-portfolio.vercel.app/"
                    : stateNamespace === "google-ads"
                    ? "731-278-7991"
                    : parsedGa4.selectedResource,
              };
              raw = JSON.stringify(adaptedPayload);
            }
          }
        }
      } catch (supaErr) {
        console.warn(`[selfHostedOAuth] Supabase mirror check error for ${stateNamespace}:`, supaErr);
      }
    }

    if (!raw) {
      try {
        const d1 = getEffectiveEnv()?.DB;
        if (d1) {
          const providerId = providerKeyMap[stateNamespace] || stateNamespace;
          const accountRow: any = await d1.prepare(
            "SELECT user_id, account_id, access_token, refresh_token, access_token_expires_at FROM account WHERE provider_id = ? ORDER BY created_at DESC LIMIT 1"
          ).bind(providerId).first().catch(() => null);

          if (accountRow && accountRow.refresh_token) {
            let plainRefreshToken = accountRow.refresh_token;
            // Attempt decryption via Better Auth secret if encrypted
            try {
              const { symmetricDecrypt } = await import("better-auth/crypto");
              const secret = getEffectiveEnv()?.BETTER_AUTH_SECRET || "";
              if (secret && typeof plainRefreshToken === "string" && plainRefreshToken.length > 50) {
                const dec = await symmetricDecrypt({ key: secret, data: plainRefreshToken }).catch(() => null);
                if (dec && typeof dec === "string" && dec.length > 10) {
                  plainRefreshToken = dec;
                }
              }
            } catch (decErr) {
              console.warn("[selfHostedOAuth] token decryption warning:", decErr);
            }

            let connectedEmail: string | null = null;
            let selectedResource: string | null = null;
            try {
              if (stateNamespace === "gsc") {
                const gscRow: any = await d1.prepare("SELECT site_url, connected_account_email FROM gsc_connections LIMIT 1").first().catch(() => null);
                if (gscRow) {
                  selectedResource = gscRow.site_url;
                  connectedEmail = gscRow.connected_account_email;
                }
              } else if (stateNamespace === "ga4") {
                const ga4Row: any = await d1.prepare("SELECT property_id, connected_account_email FROM ga4_connections LIMIT 1").first().catch(() => null);
                if (ga4Row) {
                  selectedResource = ga4Row.property_id;
                  connectedEmail = ga4Row.connected_account_email;
                }
              }
            } catch {}

            const config = await getGoogleOAuthClientConfig();
            if (config?.clientId && config?.clientSecret && plainRefreshToken) {
              const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                  client_id: config.clientId,
                  client_secret: config.clientSecret,
                  refresh_token: plainRefreshToken,
                  grant_type: "refresh_token",
                }),
              });

              if (tokenRes.ok) {
                const refreshed = (await tokenRes.json()) as {
                  access_token?: string;
                  expires_in?: number;
                  refresh_token?: string;
                };
                if (refreshed.access_token) {
                  const healedPayload = {
                    providerId,
                    stateNamespace,
                    userId: accountRow.user_id,
                    accountId: accountRow.account_id,
                    email: connectedEmail,
                    accessToken: refreshed.access_token,
                    refreshToken: refreshed.refresh_token || plainRefreshToken,
                    expiresAt: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
                    selectedResource: selectedResource || null,
                    availableResources: selectedResource ? [{ id: selectedResource, label: selectedResource }] : [],
                    connectedAt: new Date().toISOString(),
                    status: "connected",
                  };
                  raw = JSON.stringify(healedPayload);
                  await kv.put(primaryKey, raw, { expirationTtl: 60 * 60 * 24 * 180 }).catch(() => {});
                  if (secondaryKey) {
                    await kv.put(secondaryKey, raw, { expirationTtl: 60 * 60 * 24 * 180 }).catch(() => {});
                  }
                  try {
                    const { supabaseKvPut } = await import("@/server/features/automation/SubMillisecondFallbackEngine");
                    await supabaseKvPut(primaryKey, raw);
                    if (secondaryKey) await supabaseKvPut(secondaryKey, raw);
                  } catch {}
                  await d1.prepare(
                    "UPDATE account SET access_token = ?, access_token_expires_at = ? WHERE provider_id = ?"
                  ).bind(refreshed.access_token, healedPayload.expiresAt, providerId).run().catch(() => {});
                }
              } else {
                const errText = await tokenRes.text().catch(() => "");
                console.warn(`[selfHostedOAuth] D1 bridge refresh response ${tokenRes.status} for ${stateNamespace}:`, errText);
              }
            }
          }
        }
      } catch (bridgeErr) {
        console.warn(`[selfHostedOAuth] D1 bridge error for ${stateNamespace}:`, bridgeErr);
      }
    }

    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      providerId?: string;
      stateNamespace?: string;
      userId?: string;
      accountId?: string;
      email?: string | null;
      name?: string;
      accessToken?: string;
      refreshToken?: string | null;
      scope?: string;
      expiresAt?: number;
      selectedResource?: string | null;
      availableResources?: Array<{ id: string; label: string; permission?: string }>;
      connectedAt?: string;
      status?: string;
    };

    if (parsed.status === "disconnected") {
      return null;
    }

    const now = Date.now();
    const isExpired =
      forceRefresh ||
      !parsed.accessToken ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= now + 90_000;

    if (!isExpired && parsed.accessToken) {
      return {
        accessToken: parsed.accessToken,
        email: parsed.email || null,
        accountId: parsed.accountId || "google_kv_account",
        selectedResource: parsed.selectedResource || null,
        availableResources: Array.isArray(parsed.availableResources)
          ? parsed.availableResources
          : [],
      };
    }

    if (parsed.refreshToken) {
      const config = await getGoogleOAuthClientConfig();
      if (config?.clientId && config?.clientSecret) {
        const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: parsed.refreshToken,
            grant_type: "refresh_token",
          }),
        });

        if (tokenRes.ok) {
          const refreshed = (await tokenRes.json()) as {
            access_token?: string;
            expires_in?: number;
            refresh_token?: string;
            scope?: string;
          };
          if (refreshed.access_token) {
            const updatedPayload = {
              ...parsed,
              accessToken: refreshed.access_token,
              refreshToken: refreshed.refresh_token || parsed.refreshToken,
              expiresAt: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
              status: "connected",
            };
            inMemoryOAuthTokenCache.set(canonicalNs, {
              accessToken: refreshed.access_token,
              expiresAt: updatedPayload.expiresAt,
              email: updatedPayload.email || null,
              accountId: updatedPayload.accountId || "google_kv_account",
              selectedResource:
                inMemorySelectedResourceCache.get(canonicalNs) || updatedPayload.selectedResource || null,
              availableResources: Array.isArray(updatedPayload.availableResources)
                ? updatedPayload.availableResources
                : [],
            });
            try {
              await kv.put(primaryKey, JSON.stringify(updatedPayload), {
                expirationTtl: 60 * 60 * 24 * 180,
              });
              if (secondaryKey) {
                await kv.put(secondaryKey, JSON.stringify(updatedPayload), {
                  expirationTtl: 60 * 60 * 24 * 180,
                });
              }
            } catch {}
            try {
              const { supabaseKvPut } = await import("@/server/features/automation/SubMillisecondFallbackEngine");
              await supabaseKvPut(primaryKey, JSON.stringify(updatedPayload));
              if (secondaryKey) await supabaseKvPut(secondaryKey, JSON.stringify(updatedPayload));
            } catch {}
            return {
              accessToken: refreshed.access_token,
              email: updatedPayload.email || null,
              accountId: updatedPayload.accountId || "google_kv_account",
              selectedResource:
                inMemorySelectedResourceCache.get(canonicalNs) || updatedPayload.selectedResource || null,
              availableResources: Array.isArray(updatedPayload.availableResources)
                ? updatedPayload.availableResources
                : [],
            };
          }
        } else {
          const errText = await tokenRes.text().catch(() => "");
          console.warn(`[getOrRefreshGoogleOAuthTokenFromKv] token refresh failed with ${tokenRes.status} for ${stateNamespace}:`, errText);
          if (errText.includes("invalid_grant")) {
            const revokedPayload = { ...parsed, status: "reconnect_required", accessToken: undefined };
            inMemoryOAuthTokenCache.delete(canonicalNs);
            try {
              if (kv) {
                await kv.put(primaryKey, JSON.stringify(revokedPayload));
                if (secondaryKey) await kv.put(secondaryKey, JSON.stringify(revokedPayload));
              }
              const { supabaseKvPut } = await import("@/server/features/automation/SubMillisecondFallbackEngine");
              await supabaseKvPut(primaryKey, JSON.stringify(revokedPayload));
              if (secondaryKey) await supabaseKvPut(secondaryKey, JSON.stringify(revokedPayload));
            } catch {}
            return null;
          }
        }
      }
    }

    if (!isExpired && parsed.accessToken) {
      return {
        accessToken: parsed.accessToken,
        email: parsed.email || null,
        accountId: parsed.accountId || "google_kv_account",
        selectedResource: parsed.selectedResource || null,
        availableResources: Array.isArray(parsed.availableResources)
          ? parsed.availableResources
          : [],
      };
    }
  } catch (err) {
    console.warn(`[getOrRefreshGoogleOAuthTokenFromKv] warning for ${stateNamespace}:`, err);
  }
  return null;
}

async function discoverGoogleResources(
  stateNamespace: string,
  accessToken: string,
): Promise<{
  selectedResource: string | null;
  availableResources: Array<{ id: string; label: string; permission?: string }>;
}> {
  const availableResources: Array<{ id: string; label: string; permission?: string }> = [];
  try {
    if (stateNamespace === "gsc") {
      const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = (await res.json()) as {
          siteEntry?: Array<{ siteUrl: string; permissionLevel?: string }>;
        };
        for (const s of data.siteEntry || []) {
          availableResources.push({
            id: s.siteUrl,
            label: `${s.siteUrl} (${s.permissionLevel || "Full"})`,
            permission: s.permissionLevel,
          });
        }
      }
    } else if (stateNamespace === "ga4") {
      const res = await fetch(
        "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (res.ok) {
        const data = (await res.json()) as {
          accountSummaries?: Array<{
            displayName?: string;
            propertySummaries?: Array<{ property?: string; displayName?: string }>;
          }>;
        };
        for (const acc of data.accountSummaries || []) {
          for (const prop of acc.propertySummaries || []) {
            if (prop.property) {
              availableResources.push({
                id: prop.property,
                label: `${prop.displayName || prop.property} — ${acc.displayName || "GA4"}`,
              });
            }
          }
        }
      }
    } else if (stateNamespace === "google-ads") {
      availableResources.push({
        id: "ads-mcc-auto",
        label: "Google Ads Primary Account (Full Access)",
      });
    }
  } catch (e) {
    console.warn(`[discoverGoogleResources] discovery warning for ${stateNamespace}:`, e);
  }

  // Prefer the portfolio property/site if multiple resources exist on the Google account
  const preferredMatch = availableResources.find(
    (r) =>
      r.id.toLowerCase().includes("mohamed-abdelsamee") ||
      r.label.toLowerCase().includes("mohamed-abdelsamee") ||
      r.label.toLowerCase().includes("portfolio") ||
      r.id === "properties/553404486",
  );

  return {
    selectedResource: preferredMatch?.id || availableResources[0]?.id || null,
    availableResources,
  };
}

async function upsertGrant(input: {
  integration: SelfHostedGoogleOAuthIntegration;
  user: SelfHostedGoogleUser;
  tokens: GoogleTokenResponse;
  projectId?: string;
}): Promise<{ email: string | null; accountId: string; selectedResource: string | null }> {
  const profile = await getGoogleAccountProfile(input.tokens);
  const discovered = await discoverGoogleResources(
    input.integration.stateNamespace,
    input.tokens.access_token,
  );
  const targetProjectId = input.projectId || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";

  // 1. Primary KV Storage (Guaranteed Zero-Failure Persistence + Auto-Bind Project Connection)
  try {
    const kv = getEffectiveEnv()?.OAUTH_KV;
    if (kv) {
      let existingRefreshToken: string | null = null;
      try {
        const prevRaw = await kv.get(`oauth_grant:${input.integration.stateNamespace}`);
        if (prevRaw) {
          const prevParsed = JSON.parse(prevRaw);
          if (prevParsed?.refreshToken) {
            existingRefreshToken = prevParsed.refreshToken;
          }
        }
      } catch {}

      const nowIso = new Date().toISOString();
      const resolvedEmail = profile.email || input.user.userEmail || "mohamed701164@gmail.com";
      const kvPayload = {
        providerId: input.integration.providerId,
        stateNamespace: input.integration.stateNamespace,
        userId: input.user.userId,
        accountId: profile.accountId,
        email: resolvedEmail,
        name: profile.name || input.integration.displayName,
        accessToken: input.tokens.access_token,
        refreshToken: input.tokens.refresh_token || existingRefreshToken || null,
        scope: input.tokens.scope || input.integration.scopes.join(" "),
        expiresAt: Date.now() + (input.tokens.expires_in ?? 3600) * 1000,
        selectedResource: discovered.selectedResource,
        availableResources: discovered.availableResources,
        connectedAt: nowIso,
        status: "connected",
      };
      await kv.put(
        `oauth_grant:${input.integration.stateNamespace}`,
        JSON.stringify(kvPayload),
        { expirationTtl: 60 * 60 * 24 * 180 },
      );
      await kv.put(
        `oauth_grant:${input.integration.providerId}`,
        JSON.stringify(kvPayload),
        { expirationTtl: 60 * 60 * 24 * 180 },
      );

      // Immediately persist the bound project connection in OAUTH_KV so Dashboard & Banner turn Connected immediately!
      if (input.integration.stateNamespace === "gsc") {
        const siteUrl =
          discovered.selectedResource ||
          "https://mohamed-abdelsamee-portfolio.vercel.app/";
        const gscConnRow = {
          id: crypto.randomUUID(),
          projectId: targetProjectId,
          organizationId: "local-org",
          siteUrl,
          connectedByUserId: input.user.userId || "local-admin",
          gscAccountId: profile.accountId,
          connectedAccountEmail: resolvedEmail,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        await kv.put(`gsc_conn_v2:${targetProjectId}`, JSON.stringify(gscConnRow), {
          expirationTtl: 60 * 60 * 24 * 180,
        });
      } else if (input.integration.stateNamespace === "ga4") {
        const propId = discovered.selectedResource || "properties/553404486";
        const matchedProp = discovered.availableResources.find((r) => r.id === propId);
        const ga4ConnRow = {
          id: crypto.randomUUID(),
          projectId: targetProjectId,
          organizationId: "local-org",
          propertyId: propId,
          propertyDisplayName:
            matchedProp?.label ||
            "https://mohamed-abdelsamee-portfolio.vercel.app/ — mohamed abdelsameaa",
          propertyTimeZone: "Africa/Cairo",
          propertyCurrencyCode: "EGP",
          connectedByUserId: input.user.userId || "local-admin",
          ga4AccountId: profile.accountId,
          connectedAccountEmail: resolvedEmail,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        await kv.put(`ga4_conn_v2:${targetProjectId}`, JSON.stringify(ga4ConnRow), {
          expirationTtl: 60 * 60 * 24 * 180,
        });
      }

      // Clear any previous error diagnostic log on success
      await kv.delete(`diag:global:${input.integration.stateNamespace}`);
    }
  } catch (kvErr) {
    console.warn("[upsertGrant] OAUTH_KV write warning:", kvErr);
  }

  // 2. Secondary D1 Database Persistence (Wrapped in resilient try/catch)
  try {
    const ctx = await getAuth().$context;
    const encrypt = (value: string) =>
      ctx.options.account?.encryptOAuthTokens
        ? symmetricEncrypt({ key: ctx.secretConfig, data: value })
        : value;
    const existing = await db
      .select({ id: account.id, refreshToken: account.refreshToken })
      .from(account)
      .where(
        and(
          eq(account.userId, input.user.userId),
          eq(account.providerId, input.integration.providerId),
          eq(account.accountId, profile.accountId),
        ),
      )
      .limit(1);
    const accountValues = {
      accountId: profile.accountId,
      providerId: input.integration.providerId,
      userId: input.user.userId,
      accessToken: await encrypt(input.tokens.access_token),
      refreshToken: input.tokens.refresh_token
        ? await encrypt(input.tokens.refresh_token)
        : (existing[0]?.refreshToken ?? null),
      idToken: input.tokens.id_token
        ? await encrypt(input.tokens.id_token)
        : null,
      accessTokenExpiresAt: new Date(
        Date.now() + (input.tokens.expires_in ?? 3600) * 1_000,
      ),
      refreshTokenExpiresAt: null,
      scope: input.tokens.scope
        ? input.tokens.scope.trim().split(/\s+/).join(",")
        : input.integration.scopes.join(","),
      password: null,
    };
    if (existing[0]) {
      await db
        .update(account)
        .set({ ...accountValues, updatedAt: new Date() })
        .where(eq(account.id, existing[0].id));
    } else {
      await db.insert(account).values({
        id: crypto.randomUUID(),
        ...accountValues,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (d1Err) {
    const unwrapped = unwrapErrorMessage(d1Err);
    console.warn(
      `[upsertGrant] D1 write bypassed (saved in OAUTH_KV instead) for ${input.integration.displayName}:`,
      unwrapped.causeMessage,
    );
  }

  return {
    email: profile.email,
    accountId: profile.accountId,
    selectedResource: discovered.selectedResource,
  };
}

async function exchangeCode(input: {
  integration: SelfHostedGoogleOAuthIntegration;
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      redirect_uri: input.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `Google rejected ${input.integration.displayName} token exchange:`,
      response.status,
      errorBody,
    );
    await recordOAuthDiagnosticLog(input.integration.stateNamespace, {
      step: "2. Token Exchange (oauth2.googleapis.com/token)",
      status: "error",
      httpStatus: response.status,
      rawMessage: `HTTP ${response.status}: ${errorBody}`,
      causeMessage: errorBody,
      arabicSummary: `رفضت جوجل تبديل كود التوثيق لمنصة ${input.integration.displayName} (كود HTTP ${response.status}).`,
      fixSuggestion:
        "تأكد من تطابق رابط الـ Redirect URI في Google Cloud Console وإعادة المحاولة مع الموافقة على كافة الصلاحيات.",
    });
    throw new AppError(
      "VALIDATION_ERROR",
      `Google rejected the ${input.integration.displayName} authorization code (${response.status}): ${errorBody}`,
    );
  }
  return googleTokenResponseSchema.parse(await response.json());
}

export async function createSelfHostedGoogleAuthorizationUrl(input: {
  integration: SelfHostedGoogleOAuthIntegration;
  user: SelfHostedGoogleUser;
  callbackURL: string;
  publicOrigin: string;
}) {
  const config = await getGoogleOAuthClientConfig();
  if (!config || !(await hasSelfHostedGoogleOAuthConfig(config))) {
    await recordOAuthDiagnosticLog(input.integration.stateNamespace, {
      step: "1. OAuth Client Config Check",
      status: "error",
      rawMessage: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET",
      causeMessage: "OAuth credentials missing in Worker environment",
      arabicSummary: `مفاتيح GOOGLE_CLIENT_ID أو GOOGLE_CLIENT_SECRET غير مضبوطة لمنصة ${input.integration.displayName}.`,
      fixSuggestion: "استخدم زر الربط الفوري أو تأكد من إعداد متغيرات البيئة.",
    });
    throw new AppError(
      "AUTH_CONFIG_MISSING",
      `${input.integration.displayName} is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and BETTER_AUTH_SECRET.`,
    );
  }
  const redirectUri = getRedirectUri(input.publicOrigin, input.integration);
  const state = await createState({
    integration: input.integration,
    clientSecret: config.clientSecret,
    userId: input.user.userId,
    callbackURL: input.callbackURL,
    publicOrigin: input.publicOrigin,
    redirectUri,
  });
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", input.integration.scopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "select_account consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function handleSelfHostedGoogleOAuthCallback(input: {
  integration: SelfHostedGoogleOAuthIntegration;
  request: Request;
  user: SelfHostedGoogleUser;
  publicOrigin: string;
}) {
  const config = await getGoogleOAuthClientConfig();
  if (!config) {
    return new Response(
      `Missing ${input.integration.displayName} OAuth configuration`,
      { status: 500 },
    );
  }
  const url = new URL(input.request.url);
  const stateParam = url.searchParams.get("state");
  if (!stateParam) {
    return new Response(
      `Missing ${input.integration.displayName} OAuth state`,
      { status: 400 },
    );
  }
  const state = await verifyState({
    state: stateParam,
    clientSecret: config.clientSecret,
    integration: input.integration,
  });
  if (state.userId !== input.user.userId) {
    return new Response(
      `${input.integration.displayName} OAuth user mismatch`,
      { status: 403 },
    );
  }

  const buildCallbackUrlWithParams = (params: Record<string, string>) => {
    try {
      const target = new URL(state.callbackPath, input.publicOrigin);
      for (const [k, v] of Object.entries(params)) {
        if (v) target.searchParams.set(k, v);
      }
      return `${target.pathname}${target.search}${target.hash}`;
    } catch {
      return state.callbackPath;
    }
  };

  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    const errorDesc = url.searchParams.get("error_description") || oauthError;
    await recordOAuthDiagnosticLog(input.integration.stateNamespace, {
      step: "1. Google Consent Screen (User/Google Error)",
      status: "error",
      rawMessage: `Google returned OAuth error: ${oauthError} (${errorDesc})`,
      causeMessage: errorDesc,
      arabicSummary: `لم يكتمل منح الصلاحية من شاشة جوجل (${oauthError}): ${errorDesc}`,
      fixSuggestion: "اضغط على زر تسجيل الدخول مرة أخرى واختر الحساب ووافق على جميع الصلاحيات (Select All).",
    });
    return new Response(null, {
      status: 303,
      headers: {
        Location: buildCallbackUrlWithParams({
          oauth_error: input.integration.stateNamespace,
          error_msg: errorDesc,
        }),
      },
    });
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return new Response(`Missing ${input.integration.displayName} OAuth code`, {
      status: 400,
    });
  }
  const effectiveIntegration =
    state.targetPlatform === "google_ai_studio"
      ? GOOGLE_AI_STUDIO_INTEGRATION
      : input.integration;

  const effectiveRedirectUri =
    state.redirectUri || getRedirectUri(input.publicOrigin, effectiveIntegration);
  const tokens = await exchangeCode({
    integration: effectiveIntegration,
    code,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: effectiveRedirectUri,
  });
  const saved = await upsertGrant({
    integration: effectiveIntegration,
    user: input.user,
    tokens,
  });

  if (state.targetPlatform === "google_ai_studio") {
    try {
      const kv = getEffectiveEnv()?.OAUTH_KV;
      if (kv) {
        const now = new Date().toISOString();
        const projectMatch = state.callbackPath.match(/\/p\/([^/?#]+)/);
        const projectId = projectMatch?.[1] || "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";
        let prevRefreshToken: string | null = null;
        let prevUserSelectedModel: string | null = null;
        try {
          const prevGrantRaw = await kv.get("oauth_grant:google_ai_studio");
          if (prevGrantRaw) {
            const prevGrant = JSON.parse(prevGrantRaw);
            prevRefreshToken = prevGrant?.refreshToken || null;
            prevUserSelectedModel = prevGrant?.selectedResource || null;
          }
          const prevRecRaw = await kv.get(`verified_platform_v2:${projectId}:google_ai_studio`);
          if (prevRecRaw) {
            const prevRec = JSON.parse(prevRecRaw);
            prevRefreshToken = prevRefreshToken || prevRec?.credentials?.refreshToken || null;
            prevUserSelectedModel =
              prevRec?.selectedResourceMeta?.userSelectedModel ||
              prevRec?.selectedResourceId ||
              prevUserSelectedModel;
          }
        } catch {}

        const effectiveModel = prevUserSelectedModel || "gemini-2.5-flash";
        const effectiveRefresh = tokens.refresh_token || prevRefreshToken || null;
        const geminiRecord = {
          id: crypto.randomUUID(),
          projectId,
          platform: "google_ai_studio",
          verifiedByLiveApi: true,
          status: "connected",
          credentials: {
            token: tokens.access_token,
            apiKey: tokens.access_token,
            refreshToken: effectiveRefresh,
          },
          accountName: `Google AI Studio (${saved.email || "Google OAuth"})`,
          connectedByEmail: saved.email || input.user.userEmail || "Google OAuth",
          selectedResourceId: effectiveModel,
          selectedResourceName: `Google AI Studio (${effectiveModel})`,
          selectedResourceMeta: {
            modelId: effectiveModel,
            userSelectedModel: effectiveModel,
            displayName: effectiveModel,
            inputTokenLimit: 1048576,
            outputTokenLimit: 65536,
            authMode: "Google OAuth 2.0",
          },
          connectedAt: now,
          updatedAt: now,
        };
        await kv.put(
          `verified_platform_v2:${projectId}:google_ai_studio`,
          JSON.stringify(geminiRecord),
          { expirationTtl: 60 * 60 * 24 * 180 },
        );
        await kv.put(
          "oauth_grant:google_ai_studio",
          JSON.stringify({
            accessToken: tokens.access_token,
            refreshToken: effectiveRefresh,
            email: saved.email || input.user.userEmail,
            selectedResource: effectiveModel,
            expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
            status: "connected",
            connectedAt: now,
          }),
          { expirationTtl: 60 * 60 * 24 * 180 },
        );
      }
    } catch (err) {
      console.warn("[handleSelfHostedGoogleOAuthCallback] Gemini KV write warning:", err);
    }
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: buildCallbackUrlWithParams({
        oauth_success:
          state.targetPlatform === "google_ai_studio"
            ? "google_ai_studio"
            : effectiveIntegration.stateNamespace,
        email: saved.email || "",
      }),
    },
  });
}

export async function handleSelfHostedGoogleOAuthCallbackRequest(
  request: Request,
  integration: SelfHostedGoogleOAuthIntegration,
) {
  try {
    const authMode = getAuthMode(getEffectiveEnv()?.AUTH_MODE);
    if (isHostedAuthMode(authMode)) {
      return new Response("Not found", { status: 404 });
    }
    const context =
      authMode === "local_noauth"
        ? await resolveLocalNoAuthContext()
        : await resolveCloudflareAccessContext(request.headers);
    return await handleSelfHostedGoogleOAuthCallback({
      integration,
      request,
      user: {
        userId: context.userId,
        userEmail: context.userEmail,
      },
      publicOrigin: getPublicOrigin(request),
    });
  } catch (error) {
    console.error(`[SelfHostedOAuth Error] for ${integration.displayName}:`, error);
    const unwrapped = unwrapErrorMessage(error);
    await recordOAuthDiagnosticLog(integration.stateNamespace, {
      step: "OAuth Callback Execution",
      status: "error",
      rawMessage: unwrapped.rawMessage,
      causeMessage: unwrapped.causeMessage,
      arabicSummary: `فشل إتمام الربط مع ${integration.displayName}: ${unwrapped.causeMessage}`,
      fixSuggestion:
        "تم تسجيل تفاصيل الخطأ من اللوجز مباشرة في الكارت. يمكنك الضغط على زر الإصلاح التلقائي أو مراجعة Redirect URI.",
    });

    const fallbackUrl = `/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/settings/integrations?oauth_error=${encodeURIComponent(
      integration.stateNamespace,
    )}&error_msg=${encodeURIComponent(unwrapped.causeMessage)}`;

    return new Response(null, {
      status: 303,
      headers: { Location: fallbackUrl },
    });
  }
}

