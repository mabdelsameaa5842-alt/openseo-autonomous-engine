CREATE TABLE IF NOT EXISTS autonomous_harvested_keywords (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  batch_id TEXT,
  keyword TEXT NOT NULL,
  target_market TEXT NOT NULL,
  city TEXT,
  monthly_volume INTEGER DEFAULT 0,
  competition TEXT DEFAULT 'LOW',
  cpc_usd REAL DEFAULT 0.0,
  intent TEXT DEFAULT 'commercial',
  status TEXT DEFAULT 'harvested',
  clustered_article_slug TEXT,
  strategic_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS autonomous_task_executions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  cycle_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL DEFAULT 9,
  status TEXT NOT NULL DEFAULT 'running',
  has_fallbacks INTEGER DEFAULT 0,
  steps_summary_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS autonomous_step_logs (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_label_ar TEXT NOT NULL,
  status TEXT NOT NULL,
  primary_source TEXT NOT NULL,
  fallback_source TEXT,
  why_succeeded TEXT,
  why_failed TEXT,
  raw_error_message TEXT,
  execution_time_ms INTEGER,
  payload_preview TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
