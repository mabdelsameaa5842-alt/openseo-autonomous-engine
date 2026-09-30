import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const autonomousAgentChatHistory = sqliteTable(
  "autonomous_agent_chat_history",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    sessionId: text("session_id").notNull().default("session_main"),
    senderType: text("sender_type").notNull().default("agent"),
    agentId: text("agent_id").notNull(),
    agentName: text("agent_name").notNull(),
    role: text("role").notNull(),
    phase: text("phase").notNull(),
    text: text("text").notNull(),
    modelUsed: text("model_used"),
    forwardedFromJson: text("forwarded_from_json"),
    citationsJson: text("citations_json"),
    tariqApproved: integer("tariq_approved").notNull().default(1),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_chat_history_proj_created").on(table.projectId, table.createdAt),
    index("idx_chat_history_session").on(table.sessionId),
  ],
);

export const autonomousAgentLearnedMemory = sqliteTable(
  "autonomous_agent_learned_memory",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    category: text("category").notNull(),
    ruleText: text("rule_text").notNull(),
    learnedByAgent: text("learned_by_agent").notNull().default("الوكلاء الـ 9"),
    sourceExcerpt: text("source_excerpt"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_memory_proj_cat").on(table.projectId, table.category),
  ],
);

export const autonomousProgrammaticLogs = sqliteTable(
  "autonomous_programmatic_logs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    timestamp: text("timestamp").notNull(),
    agentId: text("agent_id").notNull(),
    agentName: text("agent_name").notNull(),
    moduleFile: text("module_file").notNull(),
    operationName: text("operation_name").notNull(),
    status: text("status").notNull(),
    modelUsed: text("model_used"),
    durationMs: integer("duration_ms").default(0),
    inputSummary: text("input_summary"),
    outputSummary: text("output_summary"),
    errorDiagnostic: text("error_diagnostic"),
    remediationHint: text("remediation_hint"),
  },
  (table) => [
    index("idx_prog_logs_proj_ts").on(table.projectId, table.timestamp),
  ],
);

export const autonomousMarketAllocation = sqliteTable(
  "autonomous_market_allocation",
  {
    projectId: text("project_id").notNull(),
    countryCode: text("country_code").notNull(),
    countryName: text("country_name").notNull(),
    flag: text("flag").notNull(),
    citiesJson: text("cities_json").notNull(),
    sharePercent: integer("share_percent").notNull().default(15),
    impressionVelocity: text("impression_velocity").notNull().default("HIGH"),
    active: integer("active").notNull().default(1),
    controlledByAgent: text("controlled_by_agent").notNull(),
    lastUpdatedBy: text("last_updated_by").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.countryCode] }),
    index("idx_market_proj_active").on(table.projectId, table.active),
  ],
);

export const autonomousAgentNominationsV3 = sqliteTable(
  "autonomous_agent_nominations_v3",
  {
    id: text("id").primaryKey(),
    status: text("status").notNull().default("pending"),
    reviewedAt: text("reviewed_at"),
    payloadJson: text("payload_json"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_nominations_status").on(table.status),
  ],
);
