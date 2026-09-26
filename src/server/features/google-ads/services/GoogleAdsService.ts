import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema";
import {
  createGoogleAdsClient,
  getStoredGoogleAdsDeveloperToken,
  saveStoredGoogleAdsDeveloperToken,
} from "@/server/lib/googleAdsClient";
import { GoogleAdsApiError, GoogleAdsTokenError } from "@/server/lib/googleAdsErrors";
import { GOOGLE_ADS_OAUTH_PROVIDER_ID, type KeywordPlannerMetric } from "@/shared/google-ads";
import {
  GoogleAdsConnectionRepository,
  type GoogleAdsConnection,
} from "../repositories/GoogleAdsConnectionRepository";

async function getConnection(projectId: string): Promise<GoogleAdsConnection | null> {
  return GoogleAdsConnectionRepository.getByProjectId(projectId);
}

async function getDeveloperTokenStatus(projectId: string): Promise<{
  configured: boolean;
  maskedToken: string | null;
}> {
  const token = await getStoredGoogleAdsDeveloperToken(projectId);
  if (!token) {
    return { configured: false, maskedToken: null };
  }
  const masked =
    token.length > 8
      ? `${token.slice(0, 4)}••••••••${token.slice(-4)}`
      : "••••••••";
  return { configured: true, maskedToken: masked };
}

async function saveDeveloperToken(input: {
  projectId: string;
  organizationId: string;
  connectedByUserId: string;
  developerToken: string;
  customerId?: string;
}) {
  const savedToken = await saveStoredGoogleAdsDeveloperToken({
    projectId: input.projectId,
    developerToken: input.developerToken,
  });

  if (input.customerId && input.customerId.trim()) {
    const cleanCustomerId = input.customerId.trim();
    const existing = await getConnection(input.projectId);
    const grants = await listGrantsForUser(input.connectedByUserId);
    const accountId =
      existing?.googleAdsAccountId ||
      grants[0]?.accountId ||
      "google-ads";
    const email =
      existing?.connectedAccountEmail ||
      grants[0]?.email ||
      "m.abdelsameaa5842@gmail.com";

    await GoogleAdsConnectionRepository.upsert({
      projectId: input.projectId,
      organizationId: input.organizationId,
      customerId: cleanCustomerId,
      customerDescriptiveName: `Google Ads (${cleanCustomerId})`,
      currencyCode: "EGP",
      timeZone: "Africa/Cairo",
      connectedByUserId: input.connectedByUserId,
      googleAdsAccountId: accountId,
      connectedAccountEmail: email,
    });
  }

  return {
    configured: Boolean(savedToken),
    maskedToken:
      savedToken.length > 8
        ? `${savedToken.slice(0, 4)}••••••••${savedToken.slice(-4)}`
        : "••••••••",
  };
}

async function listGrantsForUser(userId: string): Promise<Array<{ id: string; accountId: string; email?: string | null }>> {
  try {
    const rows = await db
      .select({ id: account.id, accountId: account.accountId })
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, GOOGLE_ADS_OAUTH_PROVIDER_ID),
        ),
      );
    if (rows.length > 0) return rows;
  } catch (err) {
    console.warn("[GoogleAdsService.listGrantsForUser] D1 query warning:", err);
  }

  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      const raw =
        (await kv.get("oauth_grant:google-ads")) ||
        (await kv.get(`oauth_grant:${GOOGLE_ADS_OAUTH_PROVIDER_ID}`));
      if (raw) {
        const parsed = JSON.parse(raw) as {
          accountId?: string;
          email?: string;
          accessToken?: string;
        };
        if (parsed && parsed.accessToken) {
          return [
            {
              id: `kv-${parsed.accountId || "google-ads"}`,
              accountId: parsed.accountId || "google-ads",
              email: parsed.email || null,
            },
          ];
        }
      }
    }
  } catch {}

  return [];
}

async function userHasGrant(userId: string): Promise<boolean> {
  const grants = await listGrantsForUser(userId);
  return grants.length > 0;
}

function requiresReconnect(error: unknown): boolean {
  return (
    error instanceof GoogleAdsTokenError ||
    (error instanceof GoogleAdsApiError && error.status === 401)
  );
}

async function listCustomersForUser(userId: string, projectId?: string) {
  const grants = await listGrantsForUser(userId);
  if (grants.length === 0) {
    return [];
  }

  const results = await Promise.all(
    grants.map(async (grant) => {
      const client = createGoogleAdsClient({
        userId,
        projectId,
        googleAdsAccountId: grant.accountId,
      });
      try {
        const email = (await client.getUserInfoEmail()) || grant.email || null;
        const customers = await client.listAccessibleCustomers(email);
        return {
          accountId: grant.accountId,
          email,
          requiresReconnect: false,
          customers: customers.map((c) => ({
            ...c,
            customerId: c.id,
            isSelected: false,
          })),
        };
      } catch (error) {
        return {
          accountId: grant.accountId,
          email: grant.email || null,
          requiresReconnect: requiresReconnect(error),
          customers: [],
        };
      }
    }),
  );

  return results;
}

async function setCustomer(input: {
  projectId: string;
  organizationId: string;
  connectedByUserId: string;
  accountId: string;
  customerId: string;
  customerDescriptiveName?: string;
  developerToken?: string;
}): Promise<GoogleAdsConnection> {
  if (input.developerToken && input.developerToken.trim()) {
    await saveStoredGoogleAdsDeveloperToken({
      projectId: input.projectId,
      developerToken: input.developerToken,
    });
  }

  const grants = await listGrantsForUser(input.connectedByUserId);
  const matchedGrant = grants.find((g) => g.accountId === input.accountId) || grants[0];

  const client = createGoogleAdsClient({
    userId: input.connectedByUserId,
    projectId: input.projectId,
    googleAdsAccountId: input.accountId,
    developerToken: input.developerToken,
  });

  const email = (await client.getUserInfoEmail()) || matchedGrant?.email || null;

  return GoogleAdsConnectionRepository.upsert({
    projectId: input.projectId,
    organizationId: input.organizationId,
    customerId: input.customerId,
    customerDescriptiveName:
      input.customerDescriptiveName || `Google Ads (${input.customerId})`,
    currencyCode: "EGP",
    timeZone: "Africa/Cairo",
    connectedByUserId: input.connectedByUserId,
    googleAdsAccountId: input.accountId,
    connectedAccountEmail: email,
  });
}

async function disconnect(projectId: string): Promise<void> {
  await GoogleAdsConnectionRepository.deleteByProjectId(projectId);
}

async function searchKeywordPlanner(params: {
  projectId: string;
  keywords: string[];
  locationCode?: number;
  languageCode?: string;
}): Promise<KeywordPlannerMetric[]> {
  const connection = await getConnection(params.projectId);
  if (!connection) {
    throw new Error("Please connect your Google Ads account first to query Keyword Planner.");
  }

  const client = createGoogleAdsClient({
    userId: connection.connectedByUserId,
    projectId: params.projectId,
    googleAdsAccountId: connection.googleAdsAccountId,
  });

  return client.generateKeywordIdeas({
    customerId: connection.customerId,
    keywords: params.keywords,
    locationCode: params.locationCode,
    languageCode: params.languageCode,
  });
}

export const GoogleAdsService = {
  getConnection,
  getDeveloperTokenStatus,
  saveDeveloperToken,
  userHasGrant,
  listCustomersForUser,
  setCustomer,
  disconnect,
  searchKeywordPlanner,
};
