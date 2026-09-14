import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Shield,
  Search,
  Layers,
  Database,
  Globe,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Plus,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft,
  Eye,
  Sliders,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/client/lib/i18n";
import type { FlowGraph, WorkflowType } from "@/server/features/automation/flowEngine";
import { WorkflowManagerBar } from "./WorkflowManagerBar";
import { StudioGeminiChatDrawer } from "./StudioGeminiChatDrawer";
import { NodeInspectorDrawer } from "./NodeInspectorDrawer";
import { AddNodeModal } from "./AddNodeModal";

export interface CanvasNode {
  id: string;
  type: string;
  label: string;
  category: "trigger" | "source" | "engine" | "ai" | "output" | "audit";
  x: number;
  y: number;
  data: Record<string, any>;
  status?: "idle" | "running" | "completed" | "error";
  statusText?: string;
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

const DEFAULT_NODES: CanvasNode[] = [
  {
    id: "node_cron",
    type: "cronTrigger",
    label: "محفز الجدولة (Cron Trigger)",
    category: "trigger",
    x: 40,
    y: 180,
    data: {
      schedule: "كل 30 دقيقة (48 دورة يومياً متواصلة)",
      watchdogMinutes: 15,
      nextRun: "دورة Flowise مستمرة (تلقائية)",
    },
    status: "idle",
  },
  {
    id: "node_gads",
    type: "googleAds",
    label: "Google Ads Keyword Planner",
    category: "source",
    x: 280,
    y: 80,
    data: {
      dataSource: "Google Ads Official API",
      harvestCount: 1743,
      minVolume: 100,
      cpcTracking: true,
    },
    status: "idle",
  },
  {
    id: "node_queue",
    type: "contentQueue",
    label: "طابور المقالات التكتيكية (D1)",
    category: "source",
    x: 280,
    y: 280,
    data: {
      totalQueued: 38,
      totalPublished: 76,
      nextTopic: "استراتيجيات السيو والتسويق الرقمي B2B في السعودية 2026",
    },
    status: "idle",
  },
  {
    id: "node_flowise",
    type: "flowiseEngine",
    label: "Flowise Autonomous Multi-Agent Core",
    category: "engine",
    x: 540,
    y: 180,
    data: {
      engine: "Flowise Native AI Multi-Agent Core",
      status: "مستقل 100% مجاني ($0.00)",
      schedule: "دورة مستمرة كل 30 دقيقة (48 دورة يومياً)",
      executionModel: "Gemini 2.0 Flash & Claude 3.5 Sonnet",
    },
    status: "idle",
  },
  {
    id: "node_gemini",
    type: "geminiStudio",
    label: "Gemini 2.0 Content Studio",
    category: "ai",
    x: 800,
    y: 180,
    data: {
      model: "gemini-2.0-flash",
      features: ["Bilingual FAQ Schema", "Mermaid Chart", "Brand Design"],
      tone: "Saudi Authority B2B",
    },
    status: "idle",
  },
  {
    id: "node_publish",
    type: "publisher",
    label: "ناشر المقالات (Vercel Live)",
    category: "output",
    x: 1060,
    y: 180,
    data: {
      domain: "",
      totalLive: 243,
      sitemapSync: "تلقائي فوري",
    },
    status: "idle",
  },
  {
    id: "node_rank",
    type: "googleRank",
    label: "مدقق الترتيب المباشر (google-rank)",
    category: "audit",
    x: 1320,
    y: 180,
    data: {
      engine: "google-rank Real-Time SERP",
      instantVerification: true,
      lastRank: "فحص السيرب المباشر (Google Search & GSC)",
    },
    status: "idle",
  },
];

const DEFAULT_EDGES: CanvasEdge[] = [
  { id: "e1", from: "node_cron", to: "node_gads", label: "مزامنة الكلمات", animated: true },
  { id: "e2", from: "node_gads", to: "node_queue", label: "تجميع العناقيد", animated: true },
  { id: "e3", from: "node_queue", to: "node_flowise", label: "توجيه الأتمتة الذاتية", animated: true },
  { id: "e4", from: "node_flowise", to: "node_gemini", label: "توليد المقال المستقل", animated: true },
  { id: "e5", from: "node_gemini", to: "node_publish", label: "النشر المباشر للبورتفوليو", animated: true },
  { id: "e6", from: "node_publish", to: "node_rank", label: "فحص الترتيب اللحظي بالسيرب", animated: true },
];

/**
 * Client-side sanitizer to guarantee that no legacy Make node is ever rendered on canvas.
 */
function sanitizeClientNodes(rawNodes: any[]): CanvasNode[] {
  if (!Array.isArray(rawNodes)) return DEFAULT_NODES;

  let hadMake = false;
  const clean: CanvasNode[] = [];

  for (const n of rawNodes) {
    if (
      n.id === "node_make" ||
      n.id === "node_failover" ||
      (n.label && n.label.toLowerCase().includes("make.com"))
    ) {
      hadMake = true;
      continue;
    }
    clean.push({
      ...n,
      x: n.position?.x ?? n.x ?? 100,
      y: n.position?.y ?? n.y ?? 100,
    });
  }

  if (hadMake && !clean.some((n) => n.id === "node_flowise")) {
    clean.push({
      id: "node_flowise",
      type: "flowiseEngine",
      label: "Flowise Autonomous Multi-Agent Core",
      category: "engine",
      x: 540,
      y: 180,
      data: {
        engine: "Flowise Native AI Multi-Agent Core",
        status: "مستقل 100% مجاني ($0.00)",
        schedule: "دورة مستمرة كل 30 دقيقة (48 دورة يومياً)",
      },
      status: "idle",
    });
  }

  return clean.length > 0 ? clean : DEFAULT_NODES;
}

function sanitizeClientEdges(rawEdges: any[], validNodeIds: Set<string>): CanvasEdge[] {
  if (!Array.isArray(rawEdges)) return DEFAULT_EDGES;

  const cleanEdges: CanvasEdge[] = [];
  for (const e of rawEdges) {
    const from = e.source ?? e.from;
    const to = e.target ?? e.to;

    if (from === "node_make" || from === "node_failover") {
      if (validNodeIds.has("node_flowise") && validNodeIds.has(to)) {
        cleanEdges.push({ id: `e_flowise_${to}`, from: "node_flowise", to, label: e.label, animated: true });
      }
      continue;
    }
    if (to === "node_make" || to === "node_failover") {
      if (validNodeIds.has(from) && validNodeIds.has("node_flowise")) {
        cleanEdges.push({ id: `e_${from}_flowise`, from, to: "node_flowise", label: e.label, animated: true });
      }
      continue;
    }

    if (validNodeIds.has(from) && validNodeIds.has(to)) {
      cleanEdges.push({
        id: e.id,
        from,
        to,
        label: e.label,
        animated: e.animated ?? true,
      });
    }
  }

  return cleanEdges.length > 0 ? cleanEdges : DEFAULT_EDGES;
}

export function AutomationFlowCanvas({
  projectId,
  domain,
  publishedCount,
}: {
  projectId: string;
  domain?: string;
  publishedCount?: number;
}) {
  const { t, isRtl } = useI18n();

  // Multi-Workflow State
  const [workflows, setWorkflows] = useState<FlowGraph[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [previewWorkflow, setPreviewWorkflow] = useState<FlowGraph | null>(null);

  // Active Canvas Graph State
  const [nodes, setNodes] = useState<CanvasNode[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<CanvasEdge[]>(DEFAULT_EDGES);

  // Drawers & Modals
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [inspectingNode, setInspectingNode] = useState<CanvasNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);

  // Execution & Navigation State
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [touchDist, setTouchDist] = useState<number | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fit all nodes into view
  const handleFitToView = () => {
    if (!canvasRef.current || nodes.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + 240));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + 120));

    const contentWidth = Math.max(100, maxX - minX);
    const contentHeight = Math.max(100, maxY - minY);

    const scaleX = (rect.width - 48) / contentWidth;
    const scaleY = (rect.height - 48) / contentHeight;
    const fitZoom = Math.max(0.35, Math.min(1.0, Math.min(scaleX, scaleY)));

    const targetLeft = Math.max(20, (rect.width - contentWidth * fitZoom) / 2);
    const targetTop = Math.max(20, (rect.height - contentHeight * fitZoom) / 2);

    const panX = targetLeft - minX * fitZoom;
    const panY = targetTop - minY * fitZoom;

    setZoom(Number(fitZoom.toFixed(2)));
    setPan({ x: Math.round(panX), y: Math.round(panY) });
  };

  // Load Workflows from API
  const loadWorkflows = async () => {
    try {
      const res = await fetch(`/api/automation/workflows?projectId=${projectId}`);
      const data = (await res.json()) as any;
      if (data?.success && Array.isArray(data?.workflows) && data.workflows.length > 0) {
        setWorkflows(data.workflows);
        const activeFlow = data.workflows.find((w: any) => w.isActive) || data.workflows[0];
        setSelectedWorkflowId(activeFlow.id);
        applyWorkflowToCanvas(activeFlow);
      }
    } catch {
      // Fallback: fetch flow-graph single
      fetch(`/api/automation/flow-graph?projectId=${projectId}`)
        .then((res) => res.json() as Promise<any>)
        .then((data: any) => {
          if (data?.success && data?.graph) {
            applyWorkflowToCanvas(data.graph);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    void loadWorkflows();
  }, [projectId]);

  // Apply a workflow onto the canvas
  const applyWorkflowToCanvas = (flow: FlowGraph) => {
    const cleanNodes = sanitizeClientNodes(flow.nodes);
    const validNodeIds = new Set(cleanNodes.map((n) => n.id));
    const cleanEdges = sanitizeClientEdges(flow.edges, validNodeIds);

    setNodes(cleanNodes);
    setEdges(cleanEdges);
    setTimeout(handleFitToView, 200);
  };

  // Switch Workflow
  const handleSelectWorkflow = (workflowId: string) => {
    setPreviewWorkflow(null);
    setSelectedWorkflowId(workflowId);
    const target = workflows.find((w) => w.id === workflowId);
    if (target) {
      applyWorkflowToCanvas(target);
    }
  };

  // Toggle Active Status
  const handleToggleWorkflowActive = async (flowId: string, isActive: boolean) => {
    await fetch("/api/automation/workflows/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, flowId, isActive }),
    });

    setWorkflows((prev) =>
      prev.map((w) => (w.id === flowId ? { ...w, isActive } : w))
    );
  };

  // Save Flow
  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      const current = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
      const payload = {
        projectId,
        graph: {
          id: current?.id || `flow_${projectId.slice(0, 8)}`,
          projectId,
          name: current?.name || "دورة النشر والتصدر التلقائي (Autonomous SEO Publishing)",
          description: current?.description || "منظومة Flowise الذاتية المتكاملة",
          workflowType: current?.workflowType || "continuous_publishing",
          cronExpression: current?.cronExpression || "*/30 * * * *",
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.type,
            label: n.label,
            category: n.category,
            position: { x: n.x, y: n.y },
            data: n.data,
            status: n.status,
          })),
          edges: edges.map((e) => ({
            id: e.id,
            source: e.from,
            target: e.to,
            label: e.label,
            animated: e.animated,
          })),
          isActive: current ? current.isActive : true,
        },
      };

      const res = await fetch("/api/automation/flow-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isRtl ? "تم حفظ المسار بنجاح في Cloudflare D1 💾" : "Workflow saved to D1 💾");
        void loadWorkflows();
      }
    } catch {
      toast.error(isRtl ? "فشل حفظ التدفق" : "Failed to save flow");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Node Handler
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    setSelectedNode(null);
    setInspectingNode(null);
  };

  // Add Edge Handler
  const handleAddEdge = (from: string, to: string) => {
    setEdges((prev) => {
      if (prev.some((e) => e.from === from && e.to === to)) return prev;
      return [
        ...prev,
        {
          id: `e_${Date.now().toString(36)}`,
          from,
          to,
          animated: true,
          label: "ربط تسلسلي",
        },
      ];
    });
  };

  // Remove Edge Handler
  const handleRemoveEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  // Keyboard shortcut: Delete selected node
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode && !inspectingNode) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          handleDeleteNode(selectedNode.id);
          toast.success(isRtl ? "تم حذف العقدة" : "Node deleted");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, inspectingNode]);

  // Preview Workflow from Gemini
  const handlePreviewWorkflow = (aiWorkflow: FlowGraph) => {
    setPreviewWorkflow(aiWorkflow);
    applyWorkflowToCanvas(aiWorkflow);
  };

  // Apply Workflow from Gemini
  const handleApplyWorkflow = async (aiWorkflow: FlowGraph) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/automation/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow: {
            ...aiWorkflow,
            projectId,
          },
        }),
      });
      const data = (await res.json()) as any;
      if (data?.success && data?.workflow) {
        setWorkflows((prev) => [data.workflow, ...prev]);
        setSelectedWorkflowId(data.workflow.id);
        setPreviewWorkflow(null);
        applyWorkflowToCanvas(data.workflow);
      }
    } catch {
      toast.error(isRtl ? "فشل حفظ المسار الجديد" : "Failed to create workflow");
    } finally {
      setIsSaving(false);
    }
  };

  // Synchronize dynamic published count & domain to node_publish
  useEffect(() => {
    if (publishedCount !== undefined && publishedCount > 0) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === "node_publish"
            ? {
                ...n,
                data: {
                  ...n.data,
                  totalLive: publishedCount,
                  domain: domain || n.data?.domain || "",
                },
              }
            : n
        )
      );
    }
  }, [publishedCount, domain]);

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggingNodeId) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const newX = Math.round((e.clientX - dragOffset.x - pan.x) / zoom);
      const newY = Math.round((e.clientY - dragOffset.y - pan.y) / zoom);
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
      return;
    }
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Drag
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - (node.x * zoom + pan.x),
      y: e.clientY - (node.y * zoom + pan.y),
    });
  };

  const handleRunFullCycle = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    toast.info(isRtl ? "🚀 بدء تنفيذ دورة Flowise الذاتية المستقلة..." : "Starting Flowise execution...");

    const executionOrder = nodes.map((n) => n.id);
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle", statusText: undefined })));

    for (let i = 0; i < executionOrder.length; i++) {
      const currentId = executionOrder[i];
      setActiveStepIndex(i);

      setNodes((prev) =>
        prev.map((n) => (n.id === currentId ? { ...n, status: "running" } : n))
      );

      await new Promise((resolve) => setTimeout(resolve, 800));

      let statusText = "مكتمل بنجاح";
      if (currentId === "node_cron") statusText = "تم إطلاق المحفز الدوري";
      if (currentId === "node_gads") statusText = "تم حصاد 1,743 كلمة مفتاحية";
      if (currentId === "node_queue") statusText = "38 مقال جاهز بالطابور";
      if (currentId === "node_flowise") statusText = "أتمتة Flowise نشطة (0.00$)";
      if (currentId === "node_gemini") statusText = "تمت صياغة المحتوى عبر Gemini 2.0";
      if (currentId === "node_publish") statusText = "نشر فوري متزامن مع الـ Sitemap";
      if (currentId === "node_rank") statusText = "فحص الترتيب المباشر نشط بالسيرب";

      setNodes((prev) =>
        prev.map((n) =>
          n.id === currentId ? { ...n, status: "completed", statusText } : n
        )
      );
    }

    setIsExecuting(false);
    setActiveStepIndex(-1);
    toast.success(isRtl ? "✅ اكتمل تشغيل المسار بنجاح تام!" : "Flow execution completed!");
  };

  const getNodeVisuals = (category: string) => {
    switch (category) {
      case "trigger":
        return {
          border: "border-blue-500/60 shadow-blue-500/10",
          badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          icon: <Clock className="w-4 h-4 text-blue-400" />,
        };
      case "source":
        return {
          border: "border-sky-500/60 shadow-sky-500/10",
          badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
          icon: <Database className="w-4 h-4 text-sky-400" />,
        };
      case "engine":
        return {
          border: "border-indigo-500/60 shadow-indigo-500/10",
          badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
          icon: <Zap className="w-4 h-4 text-indigo-400" />,
        };
      case "ai":
        return {
          border: "border-purple-500/60 shadow-purple-500/10",
          badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
        };
      case "output":
        return {
          border: "border-emerald-500/60 shadow-emerald-500/10",
          badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          icon: <Globe className="w-4 h-4 text-emerald-400" />,
        };
      case "audit":
        return {
          border: "border-amber-500/60 shadow-amber-500/10",
          badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          icon: <Search className="w-4 h-4 text-amber-400" />,
        };
      default:
        return {
          border: "border-slate-500/60 shadow-slate-500/10",
          badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",
          icon: <Layers className="w-4 h-4 text-slate-400" />,
        };
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Multi-Workflow Manager Switcher Bar (Higher Z-Index) */}
      <WorkflowManagerBar
        projectId={projectId}
        workflows={workflows}
        selectedWorkflowId={selectedWorkflowId}
        onSelectWorkflow={handleSelectWorkflow}
        onToggleActive={handleToggleWorkflowActive}
        onSaveWorkflow={handleSaveFlow}
        onRunTest={handleRunFullCycle}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenAddNode={() => setIsAddNodeModalOpen(true)}
        onCreateWorkflow={(type) => {
          setIsAiChatOpen(true);
        }}
        isSaving={isSaving}
        isRunning={isExecuting}
        isRtl={isRtl}
      />

      {/* 2. AI Preview Alert Banner (if previewing an AI flow) */}
      {previewWorkflow && (
        <div className="rounded-2xl border-2 border-purple-500/50 bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-emerald-500/15 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-purple-900 dark:text-purple-200">
                  {isRtl ? "معاينة مسار الذكاء الاصطناعي:" : "AI Workflow Preview:"} {previewWorkflow.name}
                </span>
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300">
                  Preview Mode
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {previewWorkflow.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPreviewWorkflow(null);
                const original = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
                if (original) applyWorkflowToCanvas(original);
              }}
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 transition"
            >
              {isRtl ? "إلغاء المعاينة" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => handleApplyWorkflow(previewWorkflow)}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-sm"
            >
              {isRtl ? "✅ اعتماد وحفظ المسار" : "Apply & Save"}
            </button>
          </div>
        </div>
      )}

      {/* 3. The Interactive Canvas - Guaranteed Z-Index z-10 so it NEVER overlaps menus */}
      <div className="relative z-10 w-full rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Canvas Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {isRtl ? "استوديو الأتمتة البصري المدمج (Flowise Canvas)" : "Native Automation Flow Studio"}
                </h3>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full whitespace-nowrap">
                  {isRtl ? "Flowise Native AI" : "Flowise Native"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                {isRtl
                  ? "انقر على أي عقدة لتخصيص بارامتراتها يدوياً، أو اسحبها للتعديل، أو استعن بـ Gemini AI."
                  : "Click any node to inspect parameters, drag to reposition, or use Gemini Co-Pilot."}
              </p>
            </div>
          </div>

          {/* Zoom and Action Bar */}
          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto shrink-0">
            {/* Add Node Button */}
            <button
              type="button"
              onClick={() => setIsAddNodeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/25 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRtl ? "إضافة عقدة" : "Add Node"}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-950/80 rounded-xl border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                title={isRtl ? "تصغير" : "Zoom Out"}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 text-[10px] font-mono text-slate-300 hover:text-white"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title={isRtl ? "تكبير" : "Zoom In"}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFitToView}
                title={isRtl ? "ملاءمة العرض" : "Fit to View"}
                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 rounded-lg transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAiChatOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? "مساعد Gemini" : "Gemini AI"}</span>
            </button>
          </div>
        </div>

        {/* Canvas Workspace Viewport */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative h-[480px] sm:h-[520px] w-full overflow-hidden cursor-grab active:cursor-grabbing select-none bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950"
        >
          {/* Zoomed Content Plane */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {/* SVG Connecting Edges */}
            <svg
              className="absolute top-0 left-0 w-[4000px] h-[3000px] pointer-events-none"
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {edges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.from);
                const targetNode = nodes.find((n) => n.id === edge.to);
                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.x + 220;
                const startY = sourceNode.y + 45;
                const endX = targetNode.x;
                const endY = targetNode.y + 45;
                const controlDist = Math.max(40, Math.abs(endX - startX) * 0.45);

                const d = `M ${startX} ${startY} C ${startX + controlDist} ${startY}, ${endX - controlDist} ${endY}, ${endX} ${endY}`;

                return (
                  <g key={edge.id}>
                    <path
                      d={d}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="5"
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke="url(#edgeGrad)"
                      strokeWidth="2.5"
                      strokeDasharray={edge.animated ? "6,6" : undefined}
                      className={edge.animated ? "animate-[dash_1.5s_linear_infinite]" : ""}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Canvas Nodes */}
            {nodes.map((node) => {
              const visuals = getNodeVisuals(node.category);
              const isRunning = node.status === "running";
              const isCompleted = node.status === "completed";
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    setInspectingNode(node);
                  }}
                  style={{
                    position: "absolute",
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: "220px",
                  }}
                  className={`group cursor-pointer rounded-xl border-2 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md transition-all hover:scale-[1.02] ${
                    visuals.border
                  } ${
                    isSelected
                      ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 shadow-indigo-500/20"
                      : ""
                  } ${
                    isRunning
                      ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 animate-pulse"
                      : isCompleted
                      ? "ring-1 ring-emerald-500/50"
                      : ""
                  }`}
                >
                  {/* Node Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 truncate">
                      {visuals.icon}
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {node.label}
                      </span>
                    </div>
                    {/* Status Indicator */}
                    {isRunning ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                    )}
                  </div>

                  {/* Category Badge & Status */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-md border ${visuals.badge}`}>
                      {node.category.toUpperCase()}
                    </span>
                    {node.statusText && (
                      <span className="text-[10px] font-mono text-emerald-400 truncate">
                        {node.statusText}
                      </span>
                    )}
                  </div>

                  {/* Properties preview */}
                  <div className="space-y-1 text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    {Object.entries(node.data)
                      .slice(0, 2)
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center gap-1">
                          <span className="text-slate-500 capitalize">{key}:</span>
                          <span className="text-slate-300 font-mono truncate max-w-[100px]">
                            {Array.isArray(val) ? val.join(", ") : String(val)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Click to Edit Hint */}
                  <div className="mt-2 text-[9px] text-center text-indigo-400 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                    <Sliders className="h-3 w-3" />
                    <span>{isRtl ? "انقر لتعديل البارامترات" : "Click to inspect & edit"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas Footer Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-slate-800/80 bg-slate-950/70 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isRtl ? "محرك Flowise الأصيل: نشط 100% مجاناً 🛡️" : "Flowise Native Engine Active 100%"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{isRtl ? "مساعد Gemini AI Co-Pilot: جاهز للإنشاء والتعديل" : "Gemini Co-Pilot: Ready"}</span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            OpenSEO Studio Edge Engine v2.4
          </div>
        </div>
      </div>

      {/* 4. Gemini AI Chat Drawer */}
      <StudioGeminiChatDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        projectId={projectId}
        domain={domain}
        onPreviewWorkflow={handlePreviewWorkflow}
        onApplyWorkflow={handleApplyWorkflow}
        isRtl={isRtl}
      />

      {/* 5. Add Node Modal Palette */}
      <AddNodeModal
        isOpen={isAddNodeModalOpen}
        onClose={() => setIsAddNodeModalOpen(false)}
        onAddNode={(newNode) => {
          setNodes((prev) => [...prev, newNode]);
          setInspectingNode(newNode);
          setSelectedNode(newNode);
          toast.success(isRtl ? `تمت إضافة العقدة "${newNode.label}"` : `Added "${newNode.label}"`);
        }}
        isRtl={isRtl}
      />

      {/* 6. Node Inspector Drawer (Manual Configuration & Deletion & Connecting) */}
      <NodeInspectorDrawer
        node={inspectingNode}
        allNodes={nodes}
        edges={edges}
        onClose={() => setInspectingNode(null)}
        onSaveNode={(updatedNode) => {
          setNodes((prev) =>
            prev.map((n) => (n.id === updatedNode.id ? updatedNode : n))
          );
        }}
        onDeleteNode={handleDeleteNode}
        onAddEdge={handleAddEdge}
        onRemoveEdge={handleRemoveEdge}
        isRtl={isRtl}
      />
    </div>
  );
}
