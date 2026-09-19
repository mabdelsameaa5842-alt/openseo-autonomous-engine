CREATE TABLE IF NOT EXISTS ai_crawler_events (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  crawler_name TEXT NOT NULL,
  user_agent TEXT,
  path TEXT NOT NULL,
  ip_country TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_crawler_events_name ON ai_crawler_events(crawler_name);
CREATE INDEX IF NOT EXISTS idx_ai_crawler_events_created ON ai_crawler_events(created_at);

CREATE TABLE IF NOT EXISTS ai_citation_benchmarks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  model_tested TEXT NOT NULL,
  brand_cited INTEGER DEFAULT 0,
  source_url_cited TEXT,
  response_snippet TEXT,
  tested_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_citation_benchmarks_project ON ai_citation_benchmarks(project_id);

ALTER TABLE autonomous_content_queue ADD COLUMN geo_quality_score INTEGER DEFAULT 92;
ALTER TABLE autonomous_content_queue ADD COLUMN geo_audit_details TEXT;
