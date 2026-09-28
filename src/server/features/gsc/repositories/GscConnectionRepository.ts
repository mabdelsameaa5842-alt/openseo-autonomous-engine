import { env } from "cloudflare:workers";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { gscConnections } from "@/db/schema";

export type GscConnection = typeof gscConnections.$inferSelect;

const memGscStore = new Map<string, GscConnection>();

function getKvKey(projectId: string) {
  return `gsc_conn_v2:${projectId}`;
}

async function getByProjectId(
  projectId: string,
): Promise<GscConnection | null> {
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      const raw = await kv.get(getKvKey(projectId));
      if (raw) {
        const parsed = JSON.parse(raw) as GscConnection;
        if (parsed?.siteUrl) {
          memGscStore.set(projectId, parsed);
          return parsed;
        }
      }
    }
  } catch {}

  try {
    const rows = await db
      .select()
      .from(gscConnections)
      .where(eq(gscConnections.projectId, projectId))
      .limit(1);
    if (rows[0]) {
      memGscStore.set(projectId, rows[0]);
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
    console.warn("[GscConnectionRepository.getByProjectId] D1 fallback to OAUTH_KV:", err);
  }

  // Auto-bind from stored oauth_grant:gsc in OAUTH_KV if user already authenticated with Google
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      const grantRaw = await kv.get("oauth_grant:gsc");
      if (grantRaw) {
        const grant = JSON.parse(grantRaw) as {
          status?: string;
          userId?: string;
          accountId?: string;
          email?: string;
          selectedResource?: string;
          availableResources?: Array<{ id: string }>;
          connectedAt?: string;
        };
        if (grant && grant.status !== "disconnected") {
          const preferredSite =
            grant.availableResources?.find((r) =>
              r.id?.toLowerCase().includes("mohamed-abdelsamee"),
            )?.id ||
            grant.selectedResource ||
            grant.availableResources?.[0]?.id ||
            "https://mohamed-abdelsamee-portfolio.vercel.app/";
          const now = grant.connectedAt || new Date().toISOString();
          const autoRow: GscConnection = {
            id: `gsc_${projectId}`,
            projectId,
            organizationId: "local-org",
            siteUrl: preferredSite,
            connectedByUserId: grant.userId || "local-admin",
            gscAccountId: grant.accountId || "google_gsc_kv",
            connectedAccountEmail: grant.email || "mohamed701164@gmail.com",
            createdAt: now,
            updatedAt: now,
          };
          memGscStore.set(projectId, autoRow);
          await kv.put(getKvKey(projectId), JSON.stringify(autoRow), {
            expirationTtl: 60 * 60 * 24 * 180,
          });
          return autoRow;
        }
      }
    }
  } catch {}

  return memGscStore.get(projectId) ?? null;
}

async function upsert(input: {
  projectId: string;
  organizationId: string;
  siteUrl: string;
  connectedByUserId: string;
  gscAccountId: string;
  connectedAccountEmail: string | null;
}): Promise<GscConnection> {
  const now = new Date().toISOString();
  const fallbackRow: GscConnection = {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    organizationId: input.organizationId,
    siteUrl: input.siteUrl,
    connectedByUserId: input.connectedByUserId,
    gscAccountId: input.gscAccountId,
    connectedAccountEmail: input.connectedAccountEmail,
    createdAt: now,
    updatedAt: now,
  };

  memGscStore.set(input.projectId, fallbackRow);
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
      .insert(gscConnections)
      .values({ id: fallbackRow.id, ...input })
      .onConflictDoUpdate({
        target: gscConnections.projectId,
        set: {
          siteUrl: input.siteUrl,
          organizationId: input.organizationId,
          connectedByUserId: input.connectedByUserId,
          gscAccountId: input.gscAccountId,
          connectedAccountEmail: sql`coalesce(${input.connectedAccountEmail}, ${gscConnections.connectedAccountEmail})`,
          updatedAt: sql`(current_timestamp)`,
        },
      })
      .returning();
    if (row) {
      memGscStore.set(input.projectId, row);
      return row;
    }
  } catch (err) {
    console.warn("[GscConnectionRepository.upsert] Saved in OAUTH_KV fallback:", err);
  }

  return fallbackRow;
}

async function deleteByProjectId(projectId: string): Promise<void> {
  memGscStore.delete(projectId);
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      await kv.delete(getKvKey(projectId));
      const grantRaw = await kv.get("oauth_grant:gsc");
      if (grantRaw) {
        const parsed = JSON.parse(grantRaw);
        await kv.put(
          "oauth_grant:gsc",
          JSON.stringify({ ...parsed, status: "disconnected" }),
          { expirationTtl: 60 * 60 * 24 * 30 },
        );
      }
    }
  } catch {}

  try {
    await db
      .delete(gscConnections)
      .where(eq(gscConnections.projectId, projectId));
  } catch {}
}

async function existsForConnectorAccount(
  userId: string,
  gscAccountId: string,
): Promise<boolean> {
  try {
    const rows = await db
      .select({ id: gscConnections.id })
      .from(gscConnections)
      .where(
        and(
          eq(gscConnections.connectedByUserId, userId),
          eq(gscConnections.gscAccountId, gscAccountId),
        ),
      )
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

export const GscConnectionRepository = {
  getByProjectId,
  upsert,
  deleteByProjectId,
  existsForConnectorAccount,
};
