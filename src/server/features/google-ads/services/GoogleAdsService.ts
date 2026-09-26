import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema";
import { createGoogleAdsClient } from "@/server/lib/googleAdsClient";
import { GoogleAdsApiError, GoogleAdsTokenError } from "@/server/lib/googleAdsErrors";
import { GOOGLE_ADS_OAUTH_PROVIDER_ID, type KeywordPlannerMetric } from "@/shared/google-ads";
import {
  GoogleAdsConnectionRepository,
  type GoogleAdsConnection,
} from "../repositories/GoogleAdsConnectionRepository";

async function getConnection(projectId: string): Promise<GoogleAdsConnection | null> {
  return GoogleAdsConnectionRepository.getByProjectId(projectId);
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

async function listCustomersForUser(userId: string) {
  const grants = await listGrantsForUser(userId);
  if (grants.length === 0) {
    return [];
  }

  const results = await Promise.all(
    grants.map(async (grant) => {
      const client = createGoogleAdsClient({
        userId,
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
}): Promise<GoogleAdsConnection> {
  const grants = await listGrantsForUser(input.connectedByUserId);
  const matchedGrant = grants.find((g) => g.accountId === input.accountId) || grants[0];

  const client = createGoogleAdsClient({
    userId: input.connectedByUserId,
    googleAdsAccountId: input.accountId,
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
  userHasGrant,
  listCustomersForUser,
  setCustomer,
  disconnect,
  searchKeywordPlanner,
};
