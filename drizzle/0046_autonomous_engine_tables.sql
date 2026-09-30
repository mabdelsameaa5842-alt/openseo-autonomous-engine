-- Migration 0046: Formalize Autonomous Engine tables with Composite Indexes for D1 Quota Protection and Postgres/Supabase Parity

CREATE TABLE IF NOT EXISTS autonomous_agent_chat_history (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  session_id TEXT NOT NULL DEFAULT 'session_main',
  sender_type TEXT NOT NULL DEFAULT 'agent',
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  role TEXT NOT NULL,
  phase TEXT NOT NULL,
  text TEXT NOT NULL,
  model_used TEXT,
  forwarded_from_json TEXT,
  citations_json TEXT,
  tariq_approved INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_history_proj_created ON autonomous_agent_chat_history (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON autonomous_agent_chat_history (session_id);

CREATE TABLE IF NOT EXISTS autonomous_agent_learned_memory (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  category TEXT NOT NULL,
  rule_text TEXT NOT NULL,
  learned_by_agent TEXT NOT NULL DEFAULT 'الوكلاء الـ 9',
  source_excerpt TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_proj_cat ON autonomous_agent_learned_memory (project_id, category);

CREATE TABLE IF NOT EXISTS autonomous_programmatic_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  module_file TEXT NOT NULL,
  operation_name TEXT NOT NULL,
  status TEXT NOT NULL,
  model_used TEXT,
  duration_ms INTEGER DEFAULT 0,
  input_summary TEXT,
  output_summary TEXT,
  error_diagnostic TEXT,
  remediation_hint TEXT
);

CREATE INDEX IF NOT EXISTS idx_prog_logs_proj_ts ON autonomous_programmatic_logs (project_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS autonomous_market_allocation (
  project_id TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  flag TEXT NOT NULL,
  cities_json TEXT NOT NULL,
  share_percent INTEGER NOT NULL DEFAULT 15,
  impression_velocity TEXT NOT NULL DEFAULT 'HIGH',
  active INTEGER NOT NULL DEFAULT 1,
  controlled_by_agent TEXT NOT NULL,
  last_updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (project_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_market_proj_active ON autonomous_market_allocation (project_id, active);

CREATE TABLE IF NOT EXISTS autonomous_agent_nominations_v3 (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_nominations_status ON autonomous_agent_nominations_v3 (status);
