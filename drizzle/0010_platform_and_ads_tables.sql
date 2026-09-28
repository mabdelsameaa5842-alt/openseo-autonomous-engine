CREATE TABLE IF NOT EXISTS `platform_integrations` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `platform` text NOT NULL,
  `verified_by_live_api` integer DEFAULT false NOT NULL,
  `status` text DEFAULT 'connected' NOT NULL,
  `credentials_json` text NOT NULL,
  `account_name` text,
  `connected_by_email` text,
  `selected_resource_id` text,
  `selected_resource_name` text,
  `selected_resource_meta_json` text,
  `connected_at` text DEFAULT (current_timestamp) NOT NULL,
  `updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `platform_integrations_project_platform_unique` ON `platform_integrations` (`project_id`, `platform`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `platform_integrations_project_idx` ON `platform_integrations` (`project_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `google_ads_connections` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `organization_id` text NOT NULL,
  `customer_id` text NOT NULL,
  `customer_descriptive_name` text NOT NULL,
  `currency_code` text,
  `time_zone` text,
  `connected_by_user_id` text NOT NULL,
  `google_ads_account_id` text NOT NULL,
  `connected_account_email` text,
  `created_at` text DEFAULT (current_timestamp) NOT NULL,
  `updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `google_ads_connections_project_id_unique` ON `google_ads_connections` (`project_id`);
