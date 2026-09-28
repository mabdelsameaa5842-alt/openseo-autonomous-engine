import { env } from "cloudflare:workers";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { ga4Connections } from "@/db/schema";

export type Ga4Connection = typeof ga4Connections.$inferSelect;

const memGa4Store = new Map<string, Ga4Connection>();

function getKvKey(projectId: string) {
  return `ga4_conn_v2:${projectId}`;
}

async function getByProjectId(
  projectId: string,
): Promise<Ga4Connection | null> {
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      const raw = await kv.get(getKvKey(projectId));
      if (raw) {
        const parsed = JSON.parse(raw) as Ga4Connection;
        if (parsed?.propertyId) {
          memGa4Store.set(projectId, parsed);
          return parsed;
        }
      }
    }
  } catch {}

  try {
    const rows = await db
      .select()
      .from(ga4Connections)
      .where(eq(ga4Connections.projectId, projectId))
      .limit(1);
    if (rows[0]) {
      memGa4Store.set(projectId, rows[0]);
      try {
        const kv = (env as any)?.OAUTH_KV;
        if (kv) {
          await kv.put(getKvKey(projectId), JSON.stringify(rows[0]), {
            expirationTtl: 60 * 60 * 24 * 180,
          });
        }
      } catch {}
      return rows[0];
    }
  } catch (err) {
    console.warn("[Ga4ConnectionRepository.getByProjectId] D1 fallback to OAUTH_KV:", err);
  }

  // Auto-bind from stored oauth_grant:ga4 in OAUTH_KV if user already authenticated with Google
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      const grantRaw = await kv.get("oauth_grant:ga4");
      if (grantRaw) {
        const grant = JSON.parse(grantRaw) as {
          status?: string;
          userId?: string;
          accountId?: string;
          email?: string;
          selectedResource?: string;
          availableResources?: Array<{ id: string; label?: string }>;
          connectedAt?: string;
        };
        if (grant && grant.status !== "disconnected") {
          const preferredProp =
            grant.availableResources?.find(
              (r) =>
                r.id === "properties/553404486" ||
                r.label?.toLowerCase().includes("mohamed-abdelsamee") ||
                r.label?.toLowerCase().includes("portfolio"),
            ) ||
            grant.availableResources?.[0];
          const propId =
            preferredProp?.id ||
            grant.selectedResource ||
            "properties/553404486";
          const propLabel =
            preferredProp?.label ||
            "https://mohamed-abdelsamee-portfolio.vercel.app/ — mohamed abdelsameaa";
          const now = grant.connectedAt || new Date().toISOString();
          const autoRow: Ga4Connection = {
            id: `ga4_${projectId}`,
            projectId,
            organizationId: "local-org",
            propertyId: propId,
            propertyDisplayName: propLabel,
            propertyTimeZone: "Africa/Cairo",
            propertyCurrencyCode: "EGP",
            connectedByUserId: grant.userId || "local-admin",
            ga4AccountId: grant.accountId || "google_ga4_kv",
            connectedAccountEmail: grant.email || "mohamed701164@gmail.com",
            createdAt: now,
            updatedAt: now,
          };
          memGa4Store.set(projectId, autoRow);
          await kv.put(getKvKey(projectId), JSON.stringify(autoRow), {
            expirationTtl: 60 * 60 * 24 * 180,
          });
          return autoRow;
        }
      }
    }
  } catch {}

  return memGa4Store.get(projectId) ?? null;
}

async function upsert(input: {
  projectId: string;
  organizationId: string;
  propertyId: string;
  propertyDisplayName: string;
  propertyTimeZone: string;
  propertyCurrencyCode: string;
  connectedByUserId: string;
  ga4AccountId: string;
  connectedAccountEmail: string | null;
}): Promise<Ga4Connection> {
  const now = new Date().toISOString();
  const fallbackRow: Ga4Connection = {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    organizationId: input.organizationId,
    propertyId: input.propertyId,
    propertyDisplayName: input.propertyDisplayName,
    propertyTimeZone: input.propertyTimeZone,
    propertyCurrencyCode: input.propertyCurrencyCode,
    connectedByUserId: input.connectedByUserId,
    ga4AccountId: input.ga4AccountId,
    connectedAccountEmail: input.connectedAccountEmail,
    createdAt: now,
    updatedAt: now,
  };

  memGa4Store.set(input.projectId, fallbackRow);
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      await kv.put(getKvKey(input.projectId), JSON.stringify(fallbackRow), {
        expirationTtl: 60 * 60 * 24 * 180,
      });
    }
  } catch {}

  try {
    const [row] = await db
      .insert(ga4Connections)
      .values({ id: fallbackRow.id, ...input })
      .onConflictDoUpdate({
        target: ga4Connections.projectId,
        set: {
          organizationId: input.organizationId,
          propertyId: input.propertyId,
          propertyDisplayName: input.propertyDisplayName,
          propertyTimeZone: input.propertyTimeZone,
          propertyCurrencyCode: input.propertyCurrencyCode,
          connectedByUserId: input.connectedByUserId,
          ga4AccountId: input.ga4AccountId,
          connectedAccountEmail: sql`case
            when ${ga4Connections.connectedByUserId} = ${input.connectedByUserId}
              and ${ga4Connections.ga4AccountId} = ${input.ga4AccountId}
            then coalesce(${input.connectedAccountEmail}, ${ga4Connections.connectedAccountEmail})
            else ${input.connectedAccountEmail}
          end`,
          updatedAt: sql`(current_timestamp)`,
        },
      })
      .returning();
    if (row) {
      memGa4Store.set(input.projectId, row);
      return row;
    }
  } catch (err) {
    console.warn("[Ga4ConnectionRepository.upsert] Saved in OAUTH_KV fallback:", err);
  }

  return fallbackRow;
}

async function deleteByProjectId(projectId: string): Promise<void> {
  memGa4Store.delete(projectId);
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      await kv.delete(getKvKey(projectId));
      const grantRaw = await kv.get("oauth_grant:ga4");
      if (grantRaw) {
        const parsed = JSON.parse(grantRaw);
        await kv.put(
          "oauth_grant:ga4",
          JSON.stringify({ ...parsed, status: "disconnected" }),
          { expirationTtl: 60 * 60 * 24 * 30 },
        );
      }
    }
  } catch {}

  try {
    await db
      .delete(ga4Connections)
      .where(eq(ga4Connections.projectId, projectId));
  } catch {}
}

async function existsForConnectorAccount(
  userId: string,
  ga4AccountId: string,
): Promise<boolean> {
  try {
    const rows = await db
      .select({ id: ga4Connections.id })
      .from(ga4Connections)
      .where(
        and(
          eq(ga4Connections.connectedByUserId, userId),
          eq(ga4Connections.ga4AccountId, ga4AccountId),
        ),
      )
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

export const Ga4ConnectionRepository = {
  getByProjectId,
  upsert,
  deleteByProjectId,
  existsForConnectorAccount,
};
