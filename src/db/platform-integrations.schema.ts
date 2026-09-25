import { sql } from "drizzle-orm";
import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { projects } from "./app.schema";

export const platformIntegrations = sqliteTable(
  "platform_integrations",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(), // 'supabase' | 'github' | 'vercel' | 'google_ai_studio' | 'cloudflare'
    status: text("status").notNull().default("disconnected"), // 'connected' | 'disconnected' | 'error'
    credentialsEncrypted: text("credentials_encrypted"),
    accountName: text("account_name"),
    accountEmail: text("account_email"),
    metadata: text("metadata"),
    lastSyncedAt: text("last_synced_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("platform_integrations_project_platform_idx").on(
      table.projectId,
      table.platform,
    ),
    index("platform_integrations_project_idx").on(table.projectId),
  ],
);

export type PlatformIntegrationRow = typeof platformIntegrations.$inferSelect;
