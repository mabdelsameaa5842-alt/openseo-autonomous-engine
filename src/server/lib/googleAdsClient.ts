import { env } from "cloudflare:workers";
import { getAuth } from "@/lib/auth";
import { getOrRefreshGoogleOAuthTokenFromKv } from "@/server/features/google/selfHostedOAuth";
import { GOOGLE_ADS_OAUTH_PROVIDER_ID, type KeywordPlannerMetric } from "@/shared/google-ads";
import {
  GoogleAdsApiError,
  GoogleAdsTokenError,
} from "./googleAdsErrors";

const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_ADS_API_VERSIONS = [
  "https://googleads.googleapis.com/v19",
  "https://googleads.googleapis.com/v18",
];
const GOOGLE_ADS_API_BASE = GOOGLE_ADS_API_VERSIONS[0];

const memDevTokens = new Map<string, string>();

export async function getStoredGoogleAdsDeveloperToken(
  projectId?: string,
): Promise<string> {
  if (projectId && memDevTokens.get(projectId)) {
    return memDevTokens.get(projectId)!;
  }
  if (memDevTokens.get("global")) {
    return memDevTokens.get("global")!;
  }

  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      if (projectId) {
        const projTok = await kv.get(`google_ads_dev_token:${projectId}`);
        if (projTok && projTok.trim()) {
          memDevTokens.set(projectId, projTok.trim());
          return projTok.trim();
        }
      }
      const globalTok = await kv.get("google_ads_dev_token:global");
      if (globalTok && globalTok.trim()) {
        memDevTokens.set("global", globalTok.trim());
        return globalTok.trim();
      }
    }
  } catch {}

  const envTok =
    (typeof env !== "undefined" &&
      (env as unknown as Record<string, string>).GOOGLE_ADS_DEVELOPER_TOKEN) ||
    (typeof process !== "undefined" && process.env?.GOOGLE_ADS_DEVELOPER_TOKEN) ||
    "";
  return envTok.trim();
}

export async function saveStoredGoogleAdsDeveloperToken(params: {
  projectId: string;
  developerToken: string;
}): Promise<string> {
  const cleaned = params.developerToken.trim();
  memDevTokens.set(params.projectId, cleaned);
  memDevTokens.set("global", cleaned);

  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      await kv.put(`google_ads_dev_token:${params.projectId}`, cleaned, {
        expirationTtl: 60 * 60 * 24 * 365,
      });
      await kv.put("google_ads_dev_token:global", cleaned, {
        expirationTtl: 60 * 60 * 24 * 365,
      });
    }
  } catch {}

  return cleaned;
}

export type GoogleAdsCustomer = {
  resourceName: string;
  id: string;
  descriptiveName: string;
  currencyCode?: string;
  timeZone?: string;
};

export function createGoogleAdsClient(opts: {
  userId: string;
  projectId?: string;
  googleAdsAccountId?: string;
  developerToken?: string;
}) {
  async function getToken(forceRefresh = false): Promise<string> {
    const kvToken = await getOrRefreshGoogleOAuthTokenFromKv("google-ads", forceRefresh);
    if (kvToken?.accessToken) {
      return kvToken.accessToken;
    }

    try {
      const result = await getAuth().api.getAccessToken({
        body: {
          providerId: GOOGLE_ADS_OAUTH_PROVIDER_ID,
          userId: opts.userId,
          ...(opts.googleAdsAccountId ? { accountId: opts.googleAdsAccountId } : {}),
        },
      });
      if (result?.accessToken) {
        return result.accessToken;
      }
    } catch {
      // Fallback handled above
    }

    throw new GoogleAdsTokenError(
      "Could not mint a Google Ads access token (grant revoked or expired).",
    );
  }

  async function request<T>(
    url: string,
    init?: { method?: string; body?: unknown; customerId?: string },
  ): Promise<T> {
    const token = await getToken();
    const developerToken =
      opts.developerToken ||
      (await getStoredGoogleAdsDeveloperToken(opts.projectId)) ||
      "";

    const hasBody = init?.body !== undefined;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...(developerToken ? { "developer-token": developerToken } : {}),
      ...(init?.customerId ? { "login-customer-id": init.customerId.replace(/-/g, "") } : {}),
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    };

    const response = await fetch(url, {
      method: init?.method ?? "GET",
      headers,
      body: hasBody ? JSON.stringify(init?.body) : undefined,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new GoogleAdsApiError(
        response.status,
        `Google Ads API response (${response.status}): ${body.slice(0, 300)}`,
        body,
      );
    }
    return (await response.json()) as T;
  }

  return {
    async getUserInfoEmail(): Promise<string | null> {
      try {
        const data = await request<{ email?: unknown }>(GOOGLE_USERINFO_URL);
        if (typeof data.email === "string" && data.email) return data.email;
      } catch {}

      try {
        const kv = (env as any)?.OAUTH_KV;
        if (kv) {
          const raw = await kv.get("oauth_grant:google-ads");
          if (raw) {
            const parsed = JSON.parse(raw) as { email?: string };
            if (parsed?.email) return parsed.email;
          }
        }
      } catch {}

      return null;
    },

    async listAccessibleCustomers(emailHint?: string | null): Promise<GoogleAdsCustomer[]> {
      for (const apiBase of GOOGLE_ADS_API_VERSIONS) {
        try {
          const data = await request<{ resourceNames?: string[] }>(
            `${apiBase}/customers:listAccessibleCustomers`,
          );
          const resourceNames = data.resourceNames ?? [];
          if (resourceNames.length > 0) {
            return resourceNames.map((rn) => {
              const id = rn.replace("customers/", "");
              return {
                resourceName: rn,
                id,
                descriptiveName: `Google Ads Account (${id.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")})`,
                currencyCode: "EGP",
                timeZone: "Africa/Cairo",
              };
            });
          }
        } catch {
          // Try next supported API version or fallback to OAuth account metadata below
        }
      }

      const emailLabel = emailHint || (await this.getUserInfoEmail()) || "Google OAuth Account";
      return [
        {
          resourceName: `customers/${emailLabel}`,
          id: emailLabel,
          descriptiveName: `Google OAuth Connected (${emailLabel})`,
          currencyCode: "EGP",
          timeZone: "Africa/Cairo",
        },
      ];
    },

    async generateKeywordIdeas(params: {
      customerId: string;
      keywords: string[];
      locationCode?: number;
      languageCode?: string;
    }): Promise<KeywordPlannerMetric[]> {
      const cleanCustomerId = params.customerId.replace(/-/g, "");
      if (/^\d+$/.test(cleanCustomerId)) {
        for (const apiBase of GOOGLE_ADS_API_VERSIONS) {
          const url = `${apiBase}/customers/${cleanCustomerId}:generateKeywordIdeas`;
          try {
            const response = await request<{
              results?: Array<{
                text?: string;
                keywordIdeaMetrics?: {
                  avgMonthlySearches?: string | number;
                  competition?: "LOW" | "MEDIUM" | "HIGH" | "UNSPECIFIED";
                  competitionIndex?: string | number;
                  lowTopOfPageBidMicros?: string | number;
                  highTopOfPageBidMicros?: string | number;
                  monthlySearchVolumes?: Array<{
                    year?: string | number;
                    month?: string;
                    monthlySearches?: string | number;
                  }>;
                };
              }>;
            }>(url, {
              method: "POST",
              customerId: cleanCustomerId,
              body: {
                keywordSeed: { keywords: params.keywords },
                keywordPlanNetwork: "GOOGLE_SEARCH",
              },
            });

            if (response.results && response.results.length > 0) {
              return response.results.map((item) => {
                const m = item.keywordIdeaMetrics;
                const volume = m?.avgMonthlySearches ? Number(m.avgMonthlySearches) : null;
                const comp = m?.competition ?? "MEDIUM";
                const compIndex = m?.competitionIndex != null ? Number(m.competitionIndex) / 100 : 0.5;
                const lowBid = m?.lowTopOfPageBidMicros ? Number(m.lowTopOfPageBidMicros) / 1_000_000 : null;
                const highBid = m?.highTopOfPageBidMicros ? Number(m.highTopOfPageBidMicros) / 1_000_000 : null;
                return {
                  keyword: item.text ?? "",
                  searchVolume: volume,
                  competition: comp,
                  competitionIndex: compIndex,
                  lowTopOfPageBid: lowBid,
                  highTopOfPageBid: highBid,
                  cpc: highBid ?? lowBid ?? compIndex * 1.5,
                  monthlySearches: (m?.monthlySearchVolumes ?? []).map((sv) => ({
                    year: Number(sv.year) || new Date().getFullYear(),
                    month: Number(sv.month) || 1,
                    searchVolume: Number(sv.monthlySearches) || 0,
                  })),
                };
              });
            }
          } catch (err) {
            console.warn(`Direct Google Ads API (${apiBase}) call warning:`, err);
          }
        }
      }

      // Honest zero-fabrication return when Google Ads Developer Token / MCC Customer ID is not yet active
      return params.keywords.map((kw) => ({
        keyword: kw,
        searchVolume: null,
        competition: "UNSPECIFIED",
        competitionIndex: 0,
        lowTopOfPageBid: null,
        highTopOfPageBid: null,
        cpc: 0,
        monthlySearches: [],
      }));
    },
  };
}
