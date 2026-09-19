/**
 * flowEngine.ts
 * Native Edge Graph Execution Engine (Flowise-Grade Architecture)
 * Runs natively on Cloudflare Workers without external localhost servers.
 */

import { auditGoogleRank } from "./googleRankAuditor";
import { generateAndPublishArticle } from "./portfolioPublisher";

export type EngineMode = "flowise_only";

export type WorkflowType =
  | "continuous_publishing"
  | "rank_auditor"
  | "competitor_spy"
  | "local_booster"
  | "custom";

export interface AutomationEngineSettings {
  id: string;
  projectId: string;
  selectedMode: EngineMode;
  failoverThresholdMinutes: number;
  lastModeChangedAt: string;
  updatedAt: string;
}

export interface FlowNode {
  id: string;
  type: string;
  label: string;
  category: "trigger" | "source" | "engine" | "ai" | "output" | "audit";
  position: { x: number; y: number };
  data: Record<string, any>;
  status?: "idle" | "running" | "completed" | "error";
  statusText?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  label?: string;
}

export interface FlowGraph {
  id: string;
  projectId: string;
  name: string;
  description: string;
  workflowType?: WorkflowType;
  cronExpression?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  isActive: boolean;
  lastExecutedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Ensures D1 tables for Engine Settings and Automation Flows exist with proper schema.
 */
export async function ensureAutomationTables(db: any): Promise<void> {
  if (!db) return;

  try {
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS automation_engine_settings (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL UNIQUE,
          selected_mode TEXT NOT NULL DEFAULT 'flowise_only',
          failover_threshold_minutes INTEGER DEFAULT 15,
          make_webhook_url TEXT,
          last_mode_changed_at TEXT,
          updated_at TEXT
        )`,
      )
      .run();
  } catch (e) {
    console.warn("[ensureAutomationTables] engine_settings:", e);
  }

  try {
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS automation_flows (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          nodes_json TEXT NOT NULL,
          edges_json TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          workflow_type TEXT DEFAULT 'continuous_publishing',
          cron_expression TEXT DEFAULT '*/30 * * * *',
          last_executed_at TEXT,
          created_at TEXT,
          updated_at TEXT
        )`,
      )
      .run();

    // Ensure columns exist on already created tables
    try {
      await db.prepare("ALTER TABLE automation_flows ADD COLUMN workflow_type TEXT").run();
    } catch {}
    try {
      await db.prepare("ALTER TABLE automation_flows ADD COLUMN cron_expression TEXT").run();
    } catch {}
  } catch (e) {
    console.warn("[ensureAutomationTables] automation_flows:", e);
  }
}

/**
 * Returns the active Engine Settings for a given project.
 */
export async function getEngineSettings(
  db: any,
  projectId: string,
): Promise<AutomationEngineSettings> {
  await ensureAutomationTables(db);

  const row = await db
    .prepare(
      "SELECT * FROM automation_engine_settings WHERE project_id = ? LIMIT 1",
    )
    .bind(projectId)
    .first();

  if (row) {
    return {
      id: row.id,
      projectId: row.project_id,
      selectedMode: "flowise_only",
      failoverThresholdMinutes: row.failover_threshold_minutes || 15,
      lastModeChangedAt: row.last_mode_changed_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }

  // Default fallback
  const defaultSettings: AutomationEngineSettings = {
    id: `aes_${projectId.slice(0, 8)}`,
    projectId,
    selectedMode: "flowise_only",
    failoverThresholdMinutes: 15,
    lastModeChangedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT OR REPLACE INTO automation_engine_settings (id, project_id, selected_mode, failover_threshold_minutes)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(
      defaultSettings.id,
      projectId,
      defaultSettings.selectedMode,
      defaultSettings.failoverThresholdMinutes,
    )
    .run();

  return defaultSettings;
}

/**
 * Updates and persists the Engine Settings in D1.
 */
export async function updateEngineSettings(
  db: any,
  projectId: string,
  selectedMode: EngineMode = "flowise_only",
  failoverThresholdMinutes: number = 15,
): Promise<AutomationEngineSettings> {
  await ensureAutomationTables(db);

  const now = new Date().toISOString();
  const id = `aes_${projectId.slice(0, 8)}`;

  await db
    .prepare(
      `INSERT INTO automation_engine_settings (id, project_id, selected_mode, failover_threshold_minutes, last_mode_changed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(project_id) DO UPDATE SET
         selected_mode = excluded.selected_mode,
         failover_threshold_minutes = excluded.failover_threshold_minutes,
         last_mode_changed_at = excluded.last_mode_changed_at,
         updated_at = excluded.updated_at`,
    )
    .bind(id, projectId, "flowise_only", failoverThresholdMinutes, now, now)
    .run();

  return {
    id,
    projectId,
    selectedMode: "flowise_only",
    failoverThresholdMinutes,
    lastModeChangedAt: now,
    updatedAt: now,
  };
}

/**
 * Generates the default Closed-Loop SEO Automation Graph (Pure Flowise Native Architecture).
 */
export function getDefaultFlowGraph(
  projectId: string,
  domain?: string,
  totalLive?: number,
  workflowType: WorkflowType = "continuous_publishing",
): FlowGraph {
  const cleanDomain = (domain || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  if (workflowType === "rank_auditor") {
    const nodes: FlowNode[] = [
      {
        id: "node_cron_rank",
        type: "cronTrigger",
        label: "محفز الفحص الدوري (Daily Cron)",
        category: "trigger",
        position: { x: 50, y: 180 },
        data: {
          schedule: "يومياً في تمام 04:00 فجراً",
          cron: "0 4 * * *",
          status: "idle",
        },
      },
      {
        id: "node_gsc_source",
        type: "gscSource",
        label: "Google Search Console API",
        category: "source",
        position: { x: 320, y: 180 },
        data: {
          metrics: ["Clicks", "Impressions", "CTR", "Average Position"],
          scope: "Site-Wide Pages & Keywords",
          status: "idle",
        },
      },
      {
        id: "node_decay_detector",
        type: "decayDetector",
        label: "كاشف تراجع الترتيب (Decay Auditor)",
        category: "audit",
        position: { x: 620, y: 180 },
        data: {
          thresholdPositions: 3,
          alertOnFirstPageDrop: true,
          status: "idle",
        },
      },
      {
        id: "node_gemini_optimizer",
        type: "geminiStudio",
        label: "Gemini Content Optimizer",
        category: "ai",
        position: { x: 920, y: 180 },
        data: {
          model: "gemini-2.0-flash",
          task: "Re-optimize declining paragraphs & refresh search intent",
          status: "idle",
        },
      },
      {
        id: "node_alert_dispatcher",
        type: "alertDispatcher",
        label: "مركز الإشعارات والتحديث",
        category: "output",
        position: { x: 1220, y: 180 },
        data: {
          channel: "Dashboard & Telegram Webhook",
          status: "idle",
        },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e_cr_gsc", source: "node_cron_rank", target: "node_gsc_source", animated: true, label: "استدعاء الأداء" },
      { id: "e_gsc_dec", source: "node_gsc_source", target: "node_decay_detector", animated: true, label: "فحص التراجع" },
      { id: "e_dec_opt", source: "node_decay_detector", target: "node_gemini_optimizer", animated: true, label: "صياغة التحديثات" },
      { id: "e_opt_alert", source: "node_gemini_optimizer", target: "node_alert_dispatcher", animated: true, label: "إرسال التقرير" },
    ];

    return {
      id: `flow_rank_${projectId.slice(0, 8)}`,
      projectId,
      name: "مراقب ترتيب الكلمات وفحص تراجع الصفحات (GSC & SERP Rank Tracker)",
      description: "فحص دوري يومي لأداء الكلمات في Google Search Console وكشف أي تراجع واقتراح تحديثات فورية",
      workflowType: "rank_auditor",
      cronExpression: "0 4 * * *",
      nodes,
      edges,
      isActive: true,
    };
  }

  if (workflowType === "competitor_spy") {
    const nodes: FlowNode[] = [
      {
        id: "node_cron_spy",
        type: "cronTrigger",
        label: "محفز أسبوعي (Weekly Cron)",
        category: "trigger",
        position: { x: 50, y: 180 },
        data: {
          schedule: "أسبوعياً كل يوم أحد (00:00 UTC)",
          cron: "0 0 * * 0",
          status: "idle",
        },
      },
      {
        id: "node_comp_serp",
        type: "competitorSpy",
        label: "محلل منافسي السيرب (SERP Spy)",
        category: "source",
        position: { x: 320, y: 180 },
        data: {
          targetCompetitors: 5,
          market: "sa",
          status: "idle",
        },
      },
      {
        id: "node_gap_finder",
        type: "keywordGap",
        label: "مكتشف فجوات الكلمات المفتاحية",
        category: "audit",
        position: { x: 620, y: 180 },
        data: {
          strategy: "High volume + low competition gaps",
          status: "idle",
        },
      },
      {
        id: "node_gemini_hijack",
        type: "geminiStudio",
        label: "Gemini Content Hijacker",
        category: "ai",
        position: { x: 920, y: 180 },
        data: {
          model: "gemini-2.0-flash",
          depth: "10x Superior In-Depth Article",
          status: "idle",
        },
      },
      {
        id: "node_queue_hijack",
        type: "contentQueue",
        label: "طابور المقالات التكتيكية (D1)",
        category: "output",
        position: { x: 1220, y: 180 },
        data: {
          status: "idle",
        },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e_spy_serp", source: "node_cron_spy", target: "node_comp_serp", animated: true, label: "مسح المنافسين" },
      { id: "e_serp_gap", source: "node_comp_serp", target: "node_gap_finder", animated: true, label: "استخراج الفجوات" },
      { id: "e_gap_hijack", source: "node_gap_finder", target: "node_gemini_hijack", animated: true, label: "صياغة مقال متفوق" },
      { id: "e_hijack_queue", source: "node_gemini_hijack", target: "node_queue_hijack", animated: true, label: "إدراج في الطابور" },
    ];

    return {
      id: `flow_spy_${projectId.slice(0, 8)}`,
      projectId,
      name: "قناص الفرص ومحتوى المنافسين (Competitor Content Hijacker)",
      description: "مسح منافسي السيرب في السوق المستهدف واستخراج الكلمات الرابحة وصياغة مقالات تتفوق عليها تلقائياً",
      workflowType: "competitor_spy",
      cronExpression: "0 0 * * 0",
      nodes,
      edges,
      isActive: false,
    };
  }

  if (workflowType === "local_booster") {
    const nodes: FlowNode[] = [
      {
        id: "node_cron_local",
        type: "cronTrigger",
        label: "محفز شهري (Monthly Cron)",
        category: "trigger",
        position: { x: 50, y: 180 },
        data: {
          schedule: "شهرياً أول كل شهر",
          cron: "0 0 1 * *",
          status: "idle",
        },
      },
      {
        id: "node_maps_source",
        type: "mapsSource",
        label: "Google Maps & Local Grid API",
        category: "source",
        position: { x: 320, y: 180 },
        data: {
          geoGrid: "Riyadh & Eastern Province (5km)",
          status: "idle",
        },
      },
      {
        id: "node_local_schema",
        type: "geminiStudio",
        label: "Gemini Local SEO & Schema Builder",
        category: "ai",
        position: { x: 620, y: 180 },
        data: {
          schemaTypes: ["LocalBusiness", "PostalAddress", "GeoCoordinates"],
          status: "idle",
        },
      },
      {
        id: "node_local_publisher",
        type: "publisher",
        label: "تحديث صفحات الفروع والخدمات",
        category: "output",
        position: { x: 920, y: 180 },
        data: {
          domain: cleanDomain,
          status: "idle",
        },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e_loc_maps", source: "node_cron_local", target: "node_maps_source", animated: true, label: "مسح شبكة الخرائط" },
      { id: "e_maps_schema", source: "node_maps_source", target: "node_local_schema", animated: true, label: "بناء البيانات المنظمة" },
      { id: "e_schema_pub", source: "node_local_schema", target: "node_local_publisher", animated: true, label: "نشر التحديثات المحلية" },
    ];

    return {
      id: `flow_local_${projectId.slice(0, 8)}`,
      projectId,
      name: "معزز الظهور والخرائط المحلية (Local Maps & Reviews Booster)",
      description: "تحليل ظهور الفروع على خرائط جوجل وحقن بيانات الـ Local Business Schema لتعزيز تصدر نتائج البحث المحلي",
      workflowType: "local_booster",
      cronExpression: "0 0 1 * *",
      nodes,
      edges,
      isActive: false,
    };
  }

  // Default: Continuous Autonomous SEO Publishing Workflow
  const nodes: FlowNode[] = [
    {
      id: "node_cron",
      type: "cronTrigger",
      label: "محفز الجدولة (Continuous Cron)",
      category: "trigger",
      position: { x: 50, y: 180 },
      data: {
        schedule: "دورة مستمرة كل 30 دقيقة (48 دورة يومياً)",
        cron: "*/30 * * * *",
        watchdogMinutes: 15,
        status: "idle",
      },
    },
    {
      id: "node_gads",
      type: "googleAds",
      label: "Google Ads Keyword Planner API",
      category: "source",
      position: { x: 300, y: 80 },
      data: {
        dataSource: "Google Ads Official API",
        harvestCount: 0,
        clusterCount: 0,
        status: "idle",
      },
    },
    {
      id: "node_queue",
      type: "contentQueue",
      label: "طابور المقالات التكتيكية (D1)",
      category: "source",
      position: { x: 300, y: 280 },
      data: {
        totalQueued: 0,
        totalPublished: totalLive || 0,
        status: "idle",
      },
    },
    {
      id: "node_flowise",
      type: "flowiseEngine",
      label: "Flowise Autonomous Multi-Agent Core",
      category: "engine",
      position: { x: 580, y: 180 },
      data: {
        engine: "Flowise Native AI Multi-Agent Core",
        cost: "0.00$ مجاني بالكامل",
        mode: "Autonomous Supervisor + Dynamic Tool Execution",
        status: "idle",
      },
    },
    {
      id: "node_gemini",
      type: "geminiStudio",
      label: "Gemini 2.0 Pro Content Studio",
      category: "ai",
      position: { x: 860, y: 180 },
      data: {
        model: "gemini-2.0-flash",
        brandTone: "Saudi/Gulf Authority Tone",
        features: ["FAQ Schema", "Mermaid Diagram", "Brand Tables", "E-E-A-T Evidence"],
        status: "idle",
      },
    },
    {
      id: "node_publish",
      type: "publisher",
      label: "ناشر المقالات المباشر (Vercel Live)",
      category: "output",
      position: { x: 1140, y: 180 },
      data: {
        domain: cleanDomain,
        totalLive: totalLive !== undefined ? totalLive : 76,
        sitemapSynced: true,
        status: "idle",
      },
    },
    {
      id: "node_rank",
      type: "googleRank",
      label: "مدقق الترتيب المباشر (GSC & SERP)",
      category: "audit",
      position: { x: 1420, y: 180 },
      data: {
        engine: "Real-Time SERP & Search Console Tracker",
        instantAudit: true,
        status: "idle",
      },
    },
  ];

  const edges: FlowEdge[] = [
    {
      id: "e_cron_gads",
      source: "node_cron",
      target: "node_gads",
      animated: true,
      label: "مزامنة الكلمات",
    },
    {
      id: "e_gads_queue",
      source: "node_gads",
      target: "node_queue",
      animated: true,
      label: "تجميع العناقيد",
    },
    {
      id: "e_queue_flowise",
      source: "node_queue",
      target: "node_flowise",
      animated: true,
      label: "تمرير المهام",
    },
    {
      id: "e_flowise_gemini",
      source: "node_flowise",
      target: "node_gemini",
      animated: true,
      label: "إشراف وتوليد المحتوى",
    },
    {
      id: "e_gemini_publish",
      source: "node_gemini",
      target: "node_publish",
      animated: true,
      label: "نشر المقال المولد",
    },
    {
      id: "e_publish_rank",
      source: "node_publish",
      target: "node_rank",
      animated: true,
      label: "فحص الترتيب المباشر",
    },
  ];

  return {
    id: `flow_pub_${projectId.slice(0, 8)}`,
    projectId,
    name: "دورة النشر والتصدر التلقائي (Autonomous SEO Publishing)",
    description:
      "منظومة Flowise الذاتية المتكاملة: حصاد الكلمات، توليد المقالات عبر Gemini 2.0، النشر المباشر عبر الويب هوك، والتحقق التلقائي من السيرب",
    workflowType: "continuous_publishing",
    cronExpression: "*/30 * * * *",
    nodes,
    edges,
    isActive: true,
  };
}

/**
 * Sanitizes flow nodes and edges, purging any deprecated Make.com references
 * and ensuring dynamic domain and counts are accurate.
 */
export function sanitizeFlowGraph(
  graph: FlowGraph,
  dynamicDomain?: string,
  dynamicLiveCount?: number,
): FlowGraph {
  if (!graph || !Array.isArray(graph.nodes)) {
    return graph;
  }

  // 1. Filter out old Make and Failover nodes
  let hadMakeNode = false;
  let sanitizedNodes: FlowNode[] = [];

  for (const node of graph.nodes) {
    if (node.id === "node_make" || node.id === "node_failover" || (node.label && node.label.toLowerCase().includes("make.com"))) {
      hadMakeNode = true;
      continue;
    }
    sanitizedNodes.push(node);
  }

  // If old Make node was present, ensure node_flowise exists
  if (hadMakeNode && !sanitizedNodes.some((n) => n.id === "node_flowise")) {
    sanitizedNodes.push({
      id: "node_flowise",
      type: "flowiseEngine",
      label: "Flowise Autonomous Multi-Agent Core",
      category: "engine",
      position: { x: 580, y: 180 },
      data: {
        engine: "Flowise Native AI Multi-Agent Core",
        cost: "0.00$ مجاني بالكامل",
        mode: "Autonomous Supervisor + Dynamic Tool Execution",
        status: "idle",
      },
    });
  }

  // 2. Sanitize edges
  let sanitizedEdges: FlowEdge[] = [];
  const validNodeIds = new Set(sanitizedNodes.map((n) => n.id));

  for (const edge of graph.edges || []) {
    // If edge references deleted nodes, remap or discard
    if (edge.source === "node_make" || edge.source === "node_failover") {
      if (validNodeIds.has("node_flowise") && validNodeIds.has(edge.target)) {
        sanitizedEdges.push({
          ...edge,
          id: `e_flowise_${edge.target}`,
          source: "node_flowise",
        });
      }
      continue;
    }
    if (edge.target === "node_make" || edge.target === "node_failover") {
      if (validNodeIds.has(edge.source) && validNodeIds.has("node_flowise")) {
        sanitizedEdges.push({
          ...edge,
          id: `e_${edge.source}_flowise`,
          target: "node_flowise",
        });
      }
      continue;
    }

    if (validNodeIds.has(edge.source) && validNodeIds.has(edge.target)) {
      const cleanLabel = (edge.label || "").toLowerCase().includes("make")
        ? "إشراف وتوليد المحتوى"
        : edge.label;
      sanitizedEdges.push({
        ...edge,
        label: cleanLabel,
      });
    }
  }

  // Ensure node_queue -> node_flowise -> node_gemini edge exists if both present
  if (
    validNodeIds.has("node_queue") &&
    validNodeIds.has("node_flowise") &&
    !sanitizedEdges.some((e) => e.source === "node_queue" && e.target === "node_flowise")
  ) {
    sanitizedEdges.push({
      id: "e_queue_flowise",
      source: "node_queue",
      target: "node_flowise",
      animated: true,
      label: "تمرير المهام",
    });
  }

  if (
    validNodeIds.has("node_flowise") &&
    validNodeIds.has("node_gemini") &&
    !sanitizedEdges.some((e) => e.source === "node_flowise" && e.target === "node_gemini")
  ) {
    sanitizedEdges.push({
      id: "e_flowise_gemini",
      source: "node_flowise",
      target: "node_gemini",
      animated: true,
      label: "إشراف وتوليد المحتوى",
    });
  }

  // Deduplicate edges by source-target pair
  const seenPairs = new Set<string>();
  const uniqueEdges: FlowEdge[] = [];
  for (const edge of sanitizedEdges) {
    const pair = `${edge.source}->${edge.target}`;
    if (!seenPairs.has(pair)) {
      seenPairs.add(pair);
      uniqueEdges.push(edge);
    }
  }

  // 3. Inject dynamic domain and count into node_publish
  sanitizedNodes = sanitizedNodes.map((node) => {
    if (node.id === "node_publish") {
      return {
        ...node,
        data: {
          ...node.data,
          domain: dynamicDomain || node.data?.domain || "",
          totalLive: dynamicLiveCount !== undefined ? dynamicLiveCount : (node.data?.totalLive || 76),
        },
      };
    }
    return node;
  });

  return {
    ...graph,
    name: graph.name && !graph.name.toLowerCase().includes("make") ? graph.name : "دورة النشر والتصدر التلقائي (Autonomous SEO Publishing)",
    description: graph.description && !graph.description.toLowerCase().includes("make") ? graph.description : "منظومة Flowise الذاتية المتكاملة لحصاد الكلمات وصياغة المقالات والنشر والتحقق من السيرب",
    nodes: sanitizedNodes,
    edges: uniqueEdges,
  };
}

/**
 * Lists all workflows belonging to a project, creating standard presets if none exist.
 */
export async function listWorkflows(
  db: any,
  projectId: string,
  dynamicDomain?: string,
  dynamicLiveCount?: number,
): Promise<FlowGraph[]> {
  await ensureAutomationTables(db);

  if (!db) {
    return [
      getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, "continuous_publishing"),
      getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, "rank_auditor"),
      getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, "competitor_spy"),
      getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, "local_booster"),
    ];
  }

  const rows: any = await db
    .prepare(
      "SELECT * FROM automation_flows WHERE project_id = ? ORDER BY is_active DESC, updated_at DESC",
    )
    .bind(projectId)
    .all();

  if (rows?.results && rows.results.length > 0) {
    const list: FlowGraph[] = [];
    for (const r of rows.results) {
      try {
        const rawGraph: FlowGraph = {
          id: r.id,
          projectId: r.project_id,
          name: r.name,
          description: r.description || "",
          workflowType: (r.workflow_type as WorkflowType) || "continuous_publishing",
          cronExpression: r.cron_expression || "*/30 * * * *",
          nodes: JSON.parse(r.nodes_json),
          edges: JSON.parse(r.edges_json),
          isActive: Boolean(r.is_active),
          lastExecutedAt: r.last_executed_at,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
        const sanitized = sanitizeFlowGraph(rawGraph, dynamicDomain, dynamicLiveCount);
        list.push(sanitized);
      } catch (err) {
        console.warn("[listWorkflows] error parsing workflow:", err);
      }
    }
    if (list.length > 0) {
      // Ensure missing standard presets are populated for rich multi-workflow capability
      const existingTypes = new Set(list.map((w) => w.workflowType));
      const standardPresets: WorkflowType[] = [
        "continuous_publishing",
        "rank_auditor",
        "competitor_spy",
        "local_booster",
      ];

      for (const presetType of standardPresets) {
        if (!existingTypes.has(presetType)) {
          const presetFlow = getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, presetType);
          await saveFlowGraph(db, presetFlow);
          list.push(presetFlow);
        }
      }

      return list;
    }
  }

  // If no workflows exist, initialize the 4 standard Flowise presets
  const presets: FlowGraph[] = [
    getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, "continuous_publishing"),
    getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, "rank_auditor"),
    getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, "competitor_spy"),
    getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount, "local_booster"),
  ];

  for (const preset of presets) {
    await saveFlowGraph(db, preset);
  }

  return presets;
}

/**
 * Retrieves a single Flow Graph or active default for a project.
 */
export async function getFlowGraph(
  db: any,
  projectId: string,
  flowId?: string,
): Promise<FlowGraph> {
  await ensureAutomationTables(db);

  let dynamicDomain = "";
  let dynamicLiveCount = 0;

  if (db) {
    try {
      const proj: any = await db
        .prepare("SELECT domain FROM projects WHERE id = ? LIMIT 1")
        .bind(projectId)
        .first();
      if (proj?.domain) {
        dynamicDomain = proj.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      }
      const countRow: any = await db
        .prepare(
          "SELECT count(*) as cnt FROM autonomous_content_queue WHERE project_id = ? AND status = 'published'",
        )
        .bind(projectId)
        .first();
      if (countRow && typeof countRow.cnt === "number") {
        dynamicLiveCount = countRow.cnt;
      }
    } catch (e) {
      console.warn("[getFlowGraph] Could not query domain or count:", e);
    }
  }

  let row: any = null;
  if (flowId) {
    row = await db
      .prepare("SELECT * FROM automation_flows WHERE id = ? AND project_id = ? LIMIT 1")
      .bind(flowId, projectId)
      .first();
  }

  if (!row) {
    row = await db
      .prepare(
        "SELECT * FROM automation_flows WHERE project_id = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1",
      )
      .bind(projectId)
      .first();
  }

  if (!row) {
    row = await db
      .prepare(
        "SELECT * FROM automation_flows WHERE project_id = ? ORDER BY updated_at DESC LIMIT 1",
      )
      .bind(projectId)
      .first();
  }

  let graph: FlowGraph;

  if (row) {
    try {
      graph = {
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        description: row.description || "",
        workflowType: (row.workflow_type as WorkflowType) || "continuous_publishing",
        cronExpression: row.cron_expression || "*/30 * * * *",
        nodes: JSON.parse(row.nodes_json),
        edges: JSON.parse(row.edges_json),
        isActive: Boolean(row.is_active),
        lastExecutedAt: row.last_executed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (e) {
      graph = getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount);
      await saveFlowGraph(db, graph);
    }
  } else {
    graph = getDefaultFlowGraph(projectId, dynamicDomain, dynamicLiveCount);
    await saveFlowGraph(db, graph);
  }

  const sanitized = sanitizeFlowGraph(graph, dynamicDomain, dynamicLiveCount);
  return sanitized;
}

/**
 * Saves or updates a Flow Graph in D1.
 */
export async function saveFlowGraph(
  db: any,
  graph: FlowGraph,
): Promise<boolean> {
  await ensureAutomationTables(db);

  const sanitized = sanitizeFlowGraph(graph);
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO automation_flows (id, project_id, name, description, workflow_type, cron_expression, nodes_json, edges_json, is_active, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         workflow_type = excluded.workflow_type,
         cron_expression = excluded.cron_expression,
         nodes_json = excluded.nodes_json,
         edges_json = excluded.edges_json,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
    )
    .bind(
      sanitized.id,
      sanitized.projectId,
      sanitized.name,
      sanitized.description,
      sanitized.workflowType || "custom",
      sanitized.cronExpression || "*/30 * * * *",
      JSON.stringify(sanitized.nodes),
      JSON.stringify(sanitized.edges),
      sanitized.isActive ? 1 : 0,
      now,
    )
    .run();

  return true;
}

/**
 * Creates a brand new workflow in D1.
 */
export async function createWorkflow(
  db: any,
  graph: FlowGraph,
): Promise<FlowGraph> {
  await ensureAutomationTables(db);

  const now = new Date().toISOString();
  const id = graph.id || `flow_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const sanitized = sanitizeFlowGraph({
    ...graph,
    id,
    createdAt: now,
    updatedAt: now,
  });

  await db
    .prepare(
      `INSERT INTO automation_flows (id, project_id, name, description, workflow_type, cron_expression, nodes_json, edges_json, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      sanitized.id,
      sanitized.projectId,
      sanitized.name,
      sanitized.description,
      sanitized.workflowType || "custom",
      sanitized.cronExpression || "*/30 * * * *",
      JSON.stringify(sanitized.nodes),
      JSON.stringify(sanitized.edges),
      sanitized.isActive ? 1 : 0,
      now,
      now,
    )
    .run();

  return sanitized;
}

/**
 * Toggles a workflow's active/inactive status in D1.
 */
export async function toggleWorkflowActive(
  db: any,
  projectId: string,
  flowId: string,
  isActive: boolean,
): Promise<boolean> {
  await ensureAutomationTables(db);

  const now = new Date().toISOString();
  await db
    .prepare(
      "UPDATE automation_flows SET is_active = ?, updated_at = ? WHERE id = ? AND project_id = ?",
    )
    .bind(isActive ? 1 : 0, now, flowId, projectId)
    .run();

  return true;
}

/**
 * Deletes a workflow from D1.
 */
export async function deleteWorkflow(
  db: any,
  projectId: string,
  flowId: string,
): Promise<boolean> {
  await ensureAutomationTables(db);

  await db
    .prepare("DELETE FROM automation_flows WHERE id = ? AND project_id = ?")
    .bind(flowId, projectId)
    .run();

  return true;
}
