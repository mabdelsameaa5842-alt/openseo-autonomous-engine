import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema";
import { AppError } from "@/server/lib/errors";
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

async function listGrantsForUser(userId: string) {
  return db
    .select({ id: account.id, accountId: account.accountId })
    .from(account)
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, GOOGLE_ADS_OAUTH_PROVIDER_ID),
      ),
    );
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
    // Return sample/mock customer account so user can inspect features even before OAuth
    return [
      {
        accountId: "sample",
        email: "user@example.com",
        requiresReconnect: false,
        customers: [
          {
            resourceName: "customers/sample",
            id: "123-456-7890",
            customerId: "123-456-7890",
            descriptiveName: "Google Ads Account (123-456-7890)",
            currencyCode: "SAR",
            timeZone: "Asia/Riyadh",
            isSelected: true,
          },
        ],
      },
    ];
  }

  const results = await Promise.all(
    grants.map(async (grant) => {
      const client = createGoogleAdsClient({
        userId,
        googleAdsAccountId: grant.accountId,
      });
      try {
        const customers = await client.listAccessibleCustomers();
        const email = await client.getUserInfoEmail();
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
          email: null,
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
  const client = createGoogleAdsClient({
    userId: input.connectedByUserId,
    googleAdsAccountId: input.accountId,
  });

  const email = await client.getUserInfoEmail();

  return GoogleAdsConnectionRepository.upsert({
    projectId: input.projectId,
    organizationId: input.organizationId,
    customerId: input.customerId,
    customerDescriptiveName: input.customerDescriptiveName || `Google Ads (${input.customerId})`,
    currencyCode: "USD",
    timeZone: "UTC",
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
    // If not yet connected, return keyword ideas estimated via Keyword Planner algorithms
    const client = createGoogleAdsClient({ userId: "system" });
    return client.generateKeywordIdeas({
      customerId: "default",
      keywords: params.keywords,
      locationCode: params.locationCode,
      languageCode: params.languageCode,
    });
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
