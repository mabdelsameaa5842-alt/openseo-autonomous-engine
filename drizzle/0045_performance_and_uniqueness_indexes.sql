CREATE INDEX IF NOT EXISTS idx_acq_status_order ON autonomous_content_queue (project_id, status, queue_order);
CREATE INDEX IF NOT EXISTS idx_acq_slug ON autonomous_content_queue (article_slug);
CREATE INDEX IF NOT EXISTS idx_acq_published ON autonomous_content_queue (status, published_at);
CREATE INDEX IF NOT EXISTS idx_acq_primary_kw ON autonomous_content_queue (primary_keyword);
CREATE INDEX IF NOT EXISTS idx_harvested_kw_lookup ON autonomous_harvested_keywords (project_id, status, monthly_volume);
CREATE INDEX IF NOT EXISTS idx_harvested_kw_name ON autonomous_harvested_keywords (keyword);
CREATE INDEX IF NOT EXISTS idx_task_exec_project ON autonomous_task_executions (project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_step_logs_exec ON autonomous_step_logs (execution_id, step_number);
