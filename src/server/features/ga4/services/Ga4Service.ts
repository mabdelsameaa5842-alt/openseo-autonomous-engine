import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema";
import { AppError } from "@/server/lib/errors";
import { createGa4AdminClient } from "@/server/lib/ga4Client";
import { Ga4AdminApiError, Ga4TokenError } from "@/server/lib/ga4Errors";
import { GA4_OAUTH_PROVIDER_ID } from "@/shared/ga4";
import {
  Ga4ConnectionRepository,
  type Ga4Connection,
} from "@/server/features/ga4/repositories/Ga4ConnectionRepository";

async function getConnection(projectId: string): Promise<Ga4Connection | null> {
  return Ga4ConnectionRepository.getByProjectId(projectId);
}

async function listGrantsForUser(userId: string) {
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      const raw = await kv.get("oauth_grant:ga4");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          accountId?: string;
          status?: string;
          accessToken?: string;
          refreshToken?: string;
        };
        if (
          parsed &&
          parsed.status !== "disconnected" &&
          (parsed.accessToken || parsed.refreshToken)
        ) {
          return [
            {
              id: `kv_ga4_${parsed.accountId || "1"}`,
              accountId: parsed.accountId || "google_ga4_kv",
            },
          ];
        }
      }
    }
  } catch {}

  try {
    return await db
      .select({ id: account.id, accountId: account.accountId })
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, GA4_OAUTH_PROVIDER_ID),
        ),
      );
  } catch (err) {
    console.warn("[Ga4Service.listGrantsForUser] D1 fallback:", err);
    return [];
  }
}

async function userHasGrant(userId: string): Promise<boolean> {
  const grants = await listGrantsForUser(userId);
  return grants.length > 0;
}

function requiresReconnect(error: unknown): boolean {
  return (
    error instanceof Ga4TokenError ||
    (error instanceof Ga4AdminApiError && error.status === 401)
  );
}

async function listPropertiesForUserWithGrantStatus(userId: string) {
  const grants = await listGrantsForUser(userId);
  const accounts = await Promise.all(
    grants.map(async (grant) => {
      const client = createGa4AdminClient({
        userId,
        ga4AccountId: grant.accountId,
      });
      try {
        const properties = await client.listProperties();
        let email: string | null = null;
        try {
          email = await client.getUserInfoEmail();
        } catch {
          email = null;
        }
        return {
          accountId: grant.accountId,
          email,
          requiresReconnect: false,
          propertiesUnavailable: false,
          properties,
        };
      } catch (error) {
        const reconnect = requiresReconnect(error);
        if (!reconnect) {
          console.error("ga4.property_discovery_failed", {
            errorName: error instanceof Error ? error.name : "UnknownError",
            status:
              error instanceof Ga4AdminApiError ? error.status : undefined,
          });
        }
        return {
          accountId: grant.accountId,
          email: null,
          requiresReconnect: reconnect,
          propertiesUnavailable: !reconnect,
          properties: [],
        };
      }
    }),
  );
  return { accounts };
}

async function setProperty(input: {
  projectId: string;
  organizationId: string;
  propertyId: string;
  accountId: string;
  userId: string;
}): Promise<Ga4Connection> {
  const grants = await listGrantsForUser(input.userId);
  if (!grants.some((grant) => grant.accountId === input.accountId)) {
    throw new AppError(
      "NOT_FOUND",
      "That Google account isn't connected to your OpenSEO account.",
    );
  }

  const client = createGa4AdminClient({
    userId: input.userId,
    ga4AccountId: input.accountId,
  });
  const properties = await client.listProperties();
  if (
    !properties.some((property) => property.propertyId === input.propertyId)
  ) {
    throw new AppError(
      "NOT_FOUND",
      "That Google Analytics property isn't available on your connected Google account.",
    );
  }

  const property = await client.getProperty(input.propertyId);
  let connectedAccountEmail: string | null = null;
  try {
    connectedAccountEmail = await client.getUserInfoEmail();
  } catch {
    connectedAccountEmail = null;
  }

  return Ga4ConnectionRepository.upsert({
    projectId: input.projectId,
    organizationId: input.organizationId,
    propertyId: property.name,
    propertyDisplayName: property.displayName,
    propertyTimeZone: property.timeZone,
    propertyCurrencyCode: property.currencyCode,
    connectedByUserId: input.userId,
    ga4AccountId: input.accountId,
    connectedAccountEmail,
  });
}

async function unlinkUserGrant(
  userId: string,
  ga4AccountId: string,
): Promise<void> {
  try {
    const { isD1CircuitOpen, tripD1CircuitIfQuotaExceeded } = await import(
      "@/server/features/automation/SubMillisecondFallbackEngine"
    );
    if (!isD1CircuitOpen()) {
      await db
        .delete(account)
        .where(
          and(
            eq(account.userId, userId),
            eq(account.providerId, GA4_OAUTH_PROVIDER_ID),
            eq(account.accountId, ga4AccountId),
          ),
        );
    }
  } catch (err: any) {
    console.warn("[Ga4Service.unlinkUserGrant] D1 bypass active or quota reached:", err?.message || err);
    try {
      const { tripD1CircuitIfQuotaExceeded } = await import(
        "@/server/features/automation/SubMillisecondFallbackEngine"
      );
      tripD1CircuitIfQuotaExceeded(err);
    } catch {}
  }
}

async function disconnect(input: {
  projectId: string;
  userId: string;
}): Promise<void> {
  try {
    const connection = await Ga4ConnectionRepository.getByProjectId(
      input.projectId,
    );
    await Ga4ConnectionRepository.deleteByProjectId(input.projectId);
    if (
      connection?.ga4AccountId &&
      connection.connectedByUserId === input.userId
    ) {
      const stillUsed = await Ga4ConnectionRepository.existsForConnectorAccount(
        input.userId,
        connection.ga4AccountId,
      );
      if (!stillUsed) {
        await unlinkUserGrant(input.userId, connection.ga4AccountId);
      }
    }
  } catch (err: any) {
    console.warn("[Ga4Service.disconnect] Fallback applied to disconnect:", err?.message || err);
    try {
      await Ga4ConnectionRepository.deleteByProjectId(input.projectId);
    } catch {}
  }
}

export const Ga4Service = {
  getConnection,
  userHasGrant,
  listPropertiesForUserWithGrantStatus,
  setProperty,
  disconnect,
};
