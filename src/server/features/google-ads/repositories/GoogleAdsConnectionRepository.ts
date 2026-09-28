import { env } from "cloudflare:workers";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { googleAdsConnections } from "@/db/schema";

export type GoogleAdsConnection = typeof googleAdsConnections.$inferSelect;

const memAdsStore = new Map<string, GoogleAdsConnection>();
let googleAdsTableEnsured = false;

async function ensureGoogleAdsConnectionsTable(): Promise<void> {
  if (googleAdsTableEnsured) return;
  try {
    const rawD1 = (env as any)?.DB;
    if (rawD1 && typeof rawD1.prepare === "function") {
      await rawD1
        .prepare(
          `CREATE TABLE IF NOT EXISTS google_ads_connections (
            id TEXT PRIMARY KEY NOT NULL,
            project_id TEXT NOT NULL UNIQUE,
            organization_id TEXT NOT NULL,
            customer_id TEXT NOT NULL,
            customer_descriptive_name TEXT NOT NULL,
            currency_code TEXT,
            time_zone TEXT,
            connected_by_user_id TEXT NOT NULL,
            google_ads_account_id TEXT NOT NULL,
            connected_account_email TEXT,
            created_at TEXT DEFAULT (current_timestamp) NOT NULL,
            updated_at TEXT DEFAULT (current_timestamp) NOT NULL
          )`,
        )
        .run();
      googleAdsTableEnsured = true;
    }
  } catch {
    // Non-blocking fallback to OAUTH_KV
  }
}

function getKvKey(projectId: string) {
  return `google_ads_conn_v2:${projectId}`;
}

async function getByProjectId(
  projectId: string,
): Promise<GoogleAdsConnection | null> {
  // 1. Prioritize OAUTH_KV first for sub-millisecond read and D1 quota protection
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      const raw = await kv.get(getKvKey(projectId));
      if (raw) {
        const parsed = JSON.parse(raw) as GoogleAdsConnection;
        memAdsStore.set(projectId, parsed);
        return parsed;
      }
    }
  } catch {}

  try {
    await ensureGoogleAdsConnectionsTable();
    const rows = await db
      .select()
      .from(googleAdsConnections)
      .where(eq(googleAdsConnections.projectId, projectId))
      .limit(1);
    if (rows[0]) {
      memAdsStore.set(projectId, rows[0]);
      return rows[0];
    }
  } catch (err) {
    console.warn("[GoogleAdsConnectionRepository.getByProjectId] D1 fallback to KV:", err);
  }

  return memAdsStore.get(projectId) ?? null;
}

async function upsert(input: {
  projectId: string;
  organizationId: string;
  customerId: string;
  customerDescriptiveName: string;
  currencyCode?: string | null;
  timeZone?: string | null;
  connectedByUserId: string;
  googleAdsAccountId: string;
  connectedAccountEmail: string | null;
}): Promise<GoogleAdsConnection> {
  const now = new Date().toISOString();
  const fallbackRow: GoogleAdsConnection = {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    organizationId: input.organizationId,
    customerId: input.customerId,
    customerDescriptiveName: input.customerDescriptiveName,
    currencyCode: input.currencyCode ?? "EGP",
    timeZone: input.timeZone ?? "Africa/Cairo",
    connectedByUserId: input.connectedByUserId,
    googleAdsAccountId: input.googleAdsAccountId,
    connectedAccountEmail: input.connectedAccountEmail,
    createdAt: now,
    updatedAt: now,
  };

  memAdsStore.set(input.projectId, fallbackRow);
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
      .insert(googleAdsConnections)
      .values({
        id: fallbackRow.id,
        projectId: input.projectId,
        organizationId: input.organizationId,
        customerId: input.customerId,
        customerDescriptiveName: input.customerDescriptiveName,
        currencyCode: input.currencyCode ?? null,
        timeZone: input.timeZone ?? null,
        connectedByUserId: input.connectedByUserId,
        googleAdsAccountId: input.googleAdsAccountId,
        connectedAccountEmail: input.connectedAccountEmail,
      })
      .onConflictDoUpdate({
        target: googleAdsConnections.projectId,
        set: {
          organizationId: input.organizationId,
          customerId: input.customerId,
          customerDescriptiveName: input.customerDescriptiveName,
          currencyCode: input.currencyCode ?? null,
          timeZone: input.timeZone ?? null,
          connectedByUserId: input.connectedByUserId,
          googleAdsAccountId: input.googleAdsAccountId,
          connectedAccountEmail: sql`case
            when ${googleAdsConnections.connectedByUserId} = ${input.connectedByUserId}
              and ${googleAdsConnections.googleAdsAccountId} = ${input.googleAdsAccountId}
            then coalesce(${input.connectedAccountEmail}, ${googleAdsConnections.connectedAccountEmail})
            else ${input.connectedAccountEmail}
          end`,
          updatedAt: sql`(current_timestamp)`,
        },
      })
      .returning();
    if (row) {
      memAdsStore.set(input.projectId, row);
      return row;
    }
  } catch (err) {
    console.warn("[GoogleAdsConnectionRepository.upsert] Saved in OAUTH_KV fallback:", err);
  }

  return fallbackRow;
}

async function deleteByProjectId(projectId: string): Promise<void> {
  memAdsStore.delete(projectId);
  try {
    const kv = (env as any)?.OAUTH_KV;
    if (kv) {
      await kv.delete(getKvKey(projectId));
    }
  } catch {}

  try {
    await db
      .delete(googleAdsConnections)
      .where(eq(googleAdsConnections.projectId, projectId));
  } catch {}
}

async function existsForConnectorAccount(
  userId: string,
  googleAdsAccountId: string,
): Promise<boolean> {
  try {
    const rows = await db
      .select({ id: googleAdsConnections.id })
      .from(googleAdsConnections)
      .where(
        and(
          eq(googleAdsConnections.connectedByUserId, userId),
          eq(googleAdsConnections.googleAdsAccountId, googleAdsAccountId),
        ),
      )
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

export const GoogleAdsConnectionRepository = {
  getByProjectId,
  upsert,
  deleteByProjectId,
  existsForConnectorAccount,
};
