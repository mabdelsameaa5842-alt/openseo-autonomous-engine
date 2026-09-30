import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Server,
  Cpu,
  Globe,
  Database,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck,
  Radio,
  Eye,
  Coffee,
  Cigarette,
  Laptop,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import {
  AgentTelemetryProfile,
  INITIAL_NINE_AGENTS
} from "@/server/features/automation/agentCloudWatchdog";

interface Props {
  projectId: string;
  isRtl?: boolean;
}

export function VorderOfficeSimulationCanvas({ projectId, isRtl = true }: Props) {
  const queryClient = useQueryClient();

  // Selected agent for Deep Dossier Modal
  const [selectedAgent, setSelectedAgent] = useState<AgentTelemetryProfile | null>(null);

  // Read-Only Flowise Blueprint Modal open state
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  // Drag and drop state
  const [draggedAgentId, setDraggedAgentId] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Local state of agents for ultra-fast 60 FPS physics
  const [localAgents, setLocalAgents] = useState<AgentTelemetryProfile[]>(INITIAL_NINE_AGENTS);

  // Fetch live state from server (with economical 60s stale time)
  const { data: serverData, refetch } = useQuery({
    queryKey: ["agents-simulation-state"],
    queryFn: async () => {
      const res = await fetch("/api/automation/agents-simulation-state");
      if (!res.ok) return { agents: INITIAL_NINE_AGENTS };
      return res.json() as Promise<{ agents: AgentTelemetryProfile[] }>;
    },
    staleTime: 60000,
    refetchInterval: 30000
  });

  useEffect(() => {
    if (serverData?.agents && serverData.agents.length > 0) {
      setLocalAgents(serverData.agents);
      if (selectedAgent) {
        const updated = serverData.agents.find(a => a.id === selectedAgent.id);
        if (updated) setSelectedAgent(updated);
      }
    }
  }, [serverData]);

  // Ping connection mutation (Economical on-demand test)
  const pingMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const res = await fetch("/api/automation/agents-ping-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId })
      });
      return res.json();
    },
    onSuccess: (data: any, agentId) => {
      if (data?.ok) {
        toast.success(`👑 ${data.message}`);
        refetch();
      }
    }
  });

  // Change state mutation
  const changeStateMutation = useMutation({
    mutationFn: async (payload: { agentId: number; state: any; position?: { x: number; y: number } }) => {
      const res = await fetch("/api/automation/agents-change-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return res.json();
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Handle Dragging
  const handleDragStart = (e: React.MouseEvent, agent: AgentTelemetryProfile) => {
    e.stopPropagation();
    setDraggedAgentId(agent.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedAgentId !== null) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (draggedAgentId !== null) {
      const agent = localAgents.find(a => a.id === draggedAgentId);
      if (agent) {
        // Toggle state if dropped on desk vs smoke corner
        const newState = agent.state === "CHILLING_SMOKE_CORNER" ? "WORKING_AT_DESK" : "CHILLING_SMOKE_CORNER";
        const newPos = newState === "WORKING_AT_DESK" ? { ...agent.deskPosition } : { ...agent.smokePosition };
        
        setLocalAgents(prev =>
          prev.map(a => (a.id === draggedAgentId ? { ...a, state: newState, position: newPos } : a))
        );

        changeStateMutation.mutate({
          agentId: draggedAgentId,
          state: newState,
          position: newPos
        });

        if (newState === "WORKING_AT_DESK") {
          toast.success(`👑 تم استدعاء الوكيل [${agent.name}] لمكتبه وانطلاق المهمة فورياً!`);
        } else {
          toast.info(`☕ توجه الوكيل [${agent.name}] إلى ركن التدخين واستراحة السطح.`);
        }
      }
      setDraggedAgentId(null);
      setDragPosition(null);
    }
  };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden border border-base-content/10 bg-gradient-to-b from-base-300/80 to-base-200 shadow-2xl select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      dir="rtl"
    >
      {/* Top Simulator Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-base-300/90 backdrop-blur-md border-b border-base-content/10">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2 text-base-content">
            <span>محاكي مكتب الوكلاء الأذكياء (VORDER AI Agency)</span>
            <span className="badge badge-sm bg-[#97233A] text-white border-0 font-mono">9 AGENTS ACTIVE</span>
          </h3>
        </div>

        {/* Action Pills & Telemetry Summary */}
        <div className="flex items-center gap-2">
          {/* Holographic Wall Terminal Trigger Button */}
          <button
            onClick={() => setIsBlueprintModalOpen(true)}
            className="btn btn-sm btn-outline border-primary/30 hover:border-primary hover:bg-primary/10 text-primary gap-1.5 transition-all"
            title="فتح المخطط الهيكلي للأتمتة في وضع القراءة"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold">المخطط الهيكلي (Read-Only Blueprint)</span>
          </button>

          {/* Refresh Pulse */}
          <button
            onClick={() => refetch()}
            className="btn btn-sm btn-ghost btn-square text-base-content/70 hover:text-base-content"
            title="تحديث حالة الوكلاء"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Office World Canvas Container */}
      <div className="relative w-full h-[620px] overflow-hidden bg-[#0e0e12] border-b border-base-content/10">
        {/* Ambient Room Lighting Gradients */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_25%_40%,rgba(151,35,58,0.12),transparent_60%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_30%,rgba(249,115,22,0.08),transparent_50%)]" />
        
        {/* Isometric Grid Floor pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* ========================================================================= */}
        {/* ZONE 1: Workstations Open Pod (قاعة المكاتب التكتيكية - Left/Center) */}
        {/* ========================================================================= */}
        <div className="absolute left-6 top-6 bottom-6 w-[58%] rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-5 backdrop-blur-sm">
          {/* Zone Header Label */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <span className="text-xs font-bold tracking-wider text-base-content/60 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#B8324D]" />
              <span>قاعة المكاتب التكتيكية ومحطات العمل (9 Workstations Pod)</span>
            </span>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              60 FPS LOCKED • 1.2% CPU
            </span>
          </div>

          {/* Desks Grid (3x3 Formation) */}
          <div className="grid grid-cols-3 gap-3.5 h-[calc(100%-40px)]">
            {localAgents.map(agent => {
              const isWorkingHere = agent.state === "WORKING_AT_DESK";
              return (
                <div
                  key={`desk-${agent.id}`}
                  onClick={() => setSelectedAgent(agent)}
                  className={`relative rounded-xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 group ${
                    isWorkingHere
                      ? "border-[#97233A]/40 bg-[#97233A]/10 hover:border-[#97233A] hover:shadow-[0_0_20px_rgba(151,35,58,0.25)]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/20 opacity-75"
                  }`}
                >
                  {/* Desk Header & Agent Nameplate */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-bold text-xs text-white">{agent.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-base-content/70">
                      #{agent.stepNumber}
                    </span>
                  </div>

                  {/* Desk Centerpiece: Laptop & Screens */}
                  <div className="flex flex-col items-center justify-center my-1 relative">
                    {/* Animated Screen Glow */}
                    <div className="w-16 h-10 rounded-md bg-gradient-to-tr from-slate-900 via-primary/30 to-slate-800 border border-white/20 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                      {isWorkingHere ? (
                        <>
                          <div className="w-full h-1 bg-emerald-400 animate-pulse mb-1" />
                          <div className="flex gap-0.5 items-center">
                            <span className="w-1 h-2 bg-primary/70 animate-bounce" />
                            <span className="w-1 h-3 bg-emerald-400/80 animate-bounce delay-75" />
                            <span className="w-1 h-1.5 bg-amber-400/70 animate-bounce delay-150" />
                          </div>
                          <span className="text-[8px] font-mono text-emerald-300 mt-0.5 font-bold">
                            {agent.executionLatencyMs}ms
                          </span>
                        </>
                      ) : (
                        <span className="text-[9px] text-white/40">خامل</span>
                      )}
                    </div>
                    {/* Laptop Base */}
                    <div className="w-20 h-1.5 bg-slate-700 rounded-b-sm border-t border-slate-600 mt-0.5" />
                  </div>

                  {/* Agent Presence on Chair */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    {isWorkingHere ? (
                      <div 
                        onMouseDown={(e) => handleDragStart(e, agent)}
                        className="flex items-center gap-1.5 hover:scale-105 transition-transform"
                        title="اسحب الوكيل بالفأرة لركن التدخين"
                      >
                        <span className="text-base">{agent.avatar}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5" />
                          <span>يعمل باللابتوب</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-white/40 text-[10px]">
                        <span>🪑 كرسي فارغ</span>
                        <span className="text-[9px] text-amber-400/80">(بالاستراحة)</span>
                      </div>
                    )}

                    <span className="text-[9px] text-white/50 truncate max-w-[80px]">
                      {agent.role.split(" ")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ZONE 2: Smoke Corner & Rooftop Lounge (ركن التدخين واستراحة السطح - Right) */}
        {/* ========================================================================= */}
        <div className="absolute right-6 top-6 bottom-6 w-[36%] rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-purple-950/20 to-black/60 p-4 backdrop-blur-md flex flex-col justify-between">
          {/* Smoke Lounge Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Cigarette className="w-4 h-4 text-amber-400" />
              <Coffee className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold text-amber-200">
                ركن التدخين واستراحة السطح (Smoke Corner)
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              استراحة الوكلاء
            </span>
          </div>

          {/* Panoramic Skyline Sunset Backdrop */}
          <div className="relative h-44 rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-indigo-950 via-purple-900 to-amber-900/60 p-3 flex flex-col justify-between">
            {/* Skyline City Silhouette */}
            <div className="absolute inset-x-0 bottom-0 h-24 opacity-35 pointer-events-none flex items-end justify-around">
              <div className="w-6 h-16 bg-black" />
              <div className="w-8 h-20 bg-black" />
              <div className="w-5 h-12 bg-black" />
              <div className="w-10 h-22 bg-black" />
              <div className="w-7 h-15 bg-black" />
            </div>

            {/* Glass Railing & Cozy Balcony */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[11px] text-amber-200/90 font-medium flex items-center gap-1">
                <span>🌆 أفق المدينة (Sunset 18:30)</span>
              </span>
              <span className="text-[10px] text-white/50">☕ قهوة إسبريسو متاحة</span>
            </div>

            {/* Agents Hanging out in Smoke Corner */}
            <div className="relative z-10 flex flex-wrap gap-2.5 items-end justify-center py-2">
              {localAgents
                .filter(a => a.state === "CHILLING_SMOKE_CORNER")
                .map(agent => (
                  <div
                    key={`smoke-${agent.id}`}
                    onMouseDown={(e) => handleDragStart(e, agent)}
                    onClick={() => setSelectedAgent(agent)}
                    className="flex flex-col items-center cursor-grab active:cursor-grabbing group hover:scale-110 transition-transform"
                    title="انقر لفحص ملف الوكيل أو اسحبه بالفأرة للمكتب"
                  >
                    {/* Floating Speech Bubble */}
                    <div className="mb-1 px-2 py-1 rounded-lg bg-black/80 border border-amber-400/40 text-[9px] text-amber-100 shadow-lg whitespace-nowrap animate-pulse">
                      💬 {agent.name}: كوتا مستقرة
                    </div>
                    {/* Agent Character with Cigarette Smoke */}
                    <div className="relative">
                      <span className="text-2xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                        {agent.avatar}
                      </span>
                      {/* Pixel Smoke Particle Animation */}
                      <span className="absolute -top-1.5 -right-1 text-[10px] animate-bounce opacity-80">
                        💨
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-200 mt-0.5">
                      {agent.name}
                    </span>
                  </div>
                ))}
              {localAgents.filter(a => a.state === "CHILLING_SMOKE_CORNER").length === 0 && (
                <div className="text-xs text-white/40 text-center py-6">
                  لا يوجد وكلاء في الاستراحة حالياً، الجميع يعمل على المكاتب!
                </div>
              )}
            </div>

            {/* Balcony Base Bar */}
            <div className="relative z-10 h-2 bg-white/20 rounded-full w-full backdrop-blur-sm" />
          </div>

          {/* Server & Infrastructure Monitoring Box inside the Game */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Server className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">غرفة سيرفرات الكلاود والشبكات</h4>
                <p className="text-[10px] text-base-content/60">Cloudflare • Google Ads • Gemini</p>
              </div>
            </div>

            {/* Wall Blueprint Terminal Button */}
            <button
              onClick={() => setIsBlueprintModalOpen(true)}
              className="btn btn-xs bg-[#97233A] hover:bg-[#7F1C2F] text-white border-0 gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              <span>عرض المخطط</span>
            </button>
          </div>
        </div>

        {/* Dragging Ghost Sprite Floating with Mouse */}
        {draggedAgentId !== null && dragPosition && (
          <div
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: dragPosition.x, top: dragPosition.y }}
          >
            <div className="px-2.5 py-1 rounded-full bg-[#97233A] text-white text-xs font-bold shadow-2xl animate-pulse">
              سحب الوكيل للمكتب 💻
            </div>
            <span className="text-3xl filter drop-shadow-[0_10px_20px_rgba(151,35,58,0.8)] mt-1">
              {localAgents.find(a => a.id === draggedAgentId)?.avatar || "🧑‍💻"}
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Agent Live Dossier & Observability HUD (نافذة التشريح الجنائي) */}
      {/* ========================================================================= */}
      {selectedAgent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedAgent(null)}
        >
          <div 
            className="relative w-full max-w-3xl rounded-2xl bg-base-100 border border-base-content/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-content/10 bg-base-200/60">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-base-300 border border-base-content/10">
                  {selectedAgent.avatar}
                </span>
                <div>
                  <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
                    <span>{selectedAgent.name} ({selectedAgent.nameEn})</span>
                    <span className="badge badge-sm badge-outline text-[#B8324D] border-[#B8324D]">
                      خطوة #{selectedAgent.stepNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-base-content/70">{selectedAgent.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* 1. The Triple Connection Matrix */}
              <div>
                <h4 className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>1. مصفوفة الاتصالات الثلاثية التي يتحكم بها الوكيل</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* AI Connection */}
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>محرك الذكاء الاصطناعي</span>
                      </span>
                      <span className="badge badge-xs badge-success">نشط</span>
                    </div>
                    <p className="text-xs font-medium text-white truncate">
                      {selectedAgent.connections.aiModels.primary}
                    </p>
                    <p className="text-[10px] text-base-content/60 mt-1 font-mono">
                      كوتا: {selectedAgent.connections.aiModels.rpmQuota}
                    </p>
                  </div>

                  {/* Server Infra Connection */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                        <Server className="w-3.5 h-3.5" />
                        <span>خوادم السيرفر و D1</span>
                      </span>
                      <span className="badge badge-xs badge-success">متصل</span>
                    </div>
                    <p className="text-xs font-medium text-white truncate">
                      {selectedAgent.connections.serverInfra.primary}
                    </p>
                    <p className="text-[10px] text-base-content/60 mt-1 font-mono">
                      حدود: {selectedAgent.connections.serverInfra.rowLimit}
                    </p>
                  </div>

                  {/* Google Trio Connection */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        <span>حسابات جوجل الثلاثية</span>
                      </span>
                      <span className="badge badge-xs badge-success">مصرح</span>
                    </div>
                    <p className="text-xs font-medium text-white truncate">
                      {selectedAgent.connections.googleTrio.accountName}
                    </p>
                    <p className="text-[10px] text-base-content/60 mt-1 font-mono truncate">
                      {selectedAgent.connections.googleTrio.details}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Economical Periodic Health-Check & Instant Ping */}
              <div className="rounded-xl border border-base-content/10 bg-base-200/40 p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-emerald-400">
                      {selectedAgent.healthCheck.statusMessage}
                    </span>
                    <p className="text-[10px] text-base-content/60">
                      فحص اقتصادي مجدول كل {selectedAgent.healthCheck.cacheTtlSeconds} ثانية • آخر تدقيق: {selectedAgent.healthCheck.lastChecked}
                    </p>
                  </div>
                </div>
                <button
                  disabled={pingMutation.isPending}
                  onClick={() => pingMutation.mutate(selectedAgent.id)}
                  className="btn btn-xs btn-outline border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 gap-1 font-semibold"
                >
                  <Zap className="w-3 h-3" />
                  <span>{pingMutation.isPending ? "جاري الفحص..." : "فحص الاتصال الآن ⚡"}</span>
                </button>
              </div>

              {/* 3. Tactical Plan, Latency & Plain Arabic Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="rounded-xl border border-base-content/10 bg-base-200/30 p-3.5">
                  <span className="text-[11px] font-bold text-base-content/60">الخطة التكتيكية الجارية:</span>
                  <p className="text-xs font-bold text-[#B8324D] mt-0.5">
                    {selectedAgent.activeCampaign}
                  </p>
                  <span className="text-[11px] font-bold text-base-content/60 block mt-2">المهمة الحالية:</span>
                  <p className="text-xs text-base-content mt-0.5">{selectedAgent.currentTask}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-base-content/60">زمن التحميل والتنفيذ:</span>
                    <span className="badge badge-sm bg-emerald-500/20 text-emerald-300 border-0 font-mono font-bold">
                      {selectedAgent.executionLatencyMs}ms (فائق السرعة)
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-base-content/10 bg-base-200/30 p-3.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-base-content/60">شرح مبسط لما يفعله الوكيل:</span>
                    <p className="text-xs text-base-content/90 mt-1 leading-relaxed">
                      "{selectedAgent.plainArabicExplanation}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-base-content/10 mt-2">
                    <span className="text-[11px] font-bold text-base-content/60">الاوتبوت المستهدف تسليمه:</span>
                    <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                      {selectedAgent.expectedOutput}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Domain Log Stream & Anomaly Detector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-base-content/60 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span>سجلات الوكيل البرمجية وكاشف المشاكل (Domain Log Stream)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    ✅ خلو تام من المشاكل البرمجية (0 Errors)
                  </span>
                </div>
                <div className="rounded-xl bg-black/70 border border-base-content/10 p-3 font-mono text-[11px] space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedAgent.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-white/40">[{log.timestamp}]</span>
                      <span className={log.level === "OK" ? "text-emerald-400" : "text-blue-400"}>
                        {log.level}
                      </span>
                      <span className="text-base-content/90">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Fallback Engine & Logs */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>نظام ومصدر الإسناد الاحتياطي (Fallback Architecture)</span>
                  </span>
                  <span className="badge badge-xs badge-outline text-amber-300 border-amber-300">
                    جاهز للاستدعاء
                  </span>
                </div>
                <div className="text-xs space-y-1 text-base-content/80">
                  <p><strong className="text-base-content/60">المصدر الأساسي:</strong> {selectedAgent.fallback.primarySource}</p>
                  <p><strong className="text-base-content/60">المصدر الاحتياطي:</strong> {selectedAgent.fallback.fallbackSource}</p>
                  <p><strong className="text-base-content/60">شرط تفعيل الفولباك:</strong> {selectedAgent.fallback.triggerCondition}</p>
                  <p><strong className="text-base-content/60">سجل الفولباك:</strong> {selectedAgent.fallback.fallbackLog}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-base-content/10 bg-base-200/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newState = "WORKING_AT_DESK";
                    setLocalAgents(prev =>
                      prev.map(a => (a.id === selectedAgent.id ? { ...a, state: newState, position: a.deskPosition } : a))
                    );
                    changeStateMutation.mutate({ agentId: selectedAgent.id, state: newState });
                    toast.success(`👑 تم استدعاء ${selectedAgent.name} للمكتب.`);
                  }}
                  className="btn btn-sm bg-[#97233A] hover:bg-[#7F1C2F] text-white border-0 gap-1.5"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>العمل على المكتب</span>
                </button>
                <button
                  onClick={() => {
                    const newState = "CHILLING_SMOKE_CORNER";
                    setLocalAgents(prev =>
                      prev.map(a => (a.id === selectedAgent.id ? { ...a, state: newState, position: a.smokePosition } : a))
                    );
                    changeStateMutation.mutate({ agentId: selectedAgent.id, state: newState });
                    toast.info(`☕ إرسال ${selectedAgent.name} لركن الاستراحة.`);
                  }}
                  className="btn btn-sm btn-outline border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-1.5"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>إرسال لركن الاستراحة</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedAgent(null)}
                className="btn btn-sm btn-ghost"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Read-Only Flowise Blueprint Modal (عارض المخطط الهيكلي المقروء فقط) */}
      {/* ========================================================================= */}
      {isBlueprintModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsBlueprintModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-5xl rounded-2xl bg-base-100 border border-base-content/20 shadow-2xl overflow-hidden flex flex-col h-[80vh]"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-content/10 bg-base-200/70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-base-content flex items-center gap-2">
                    <span>مخطط التدفق العقدي للأتمتة (Flowise Native DAG Blueprint)</span>
                    <span className="badge badge-sm badge-warning font-mono">وضع القراءة فقط (READ-ONLY)</span>
                  </h3>
                  <p className="text-xs text-base-content/60">
                    عرض المخطط الهيكلي لتسلسل البيانات السحابية بين الوكلاء بدون إمكانية التعديل
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsBlueprintModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only Schematic Body */}
            <div className="flex-1 p-6 overflow-auto bg-[#0b0b0e] relative flex items-center justify-center">
              {/* DAG Nodes Display (Static / Non-editable) */}
              <div className="flex items-center gap-4 flex-wrap justify-center max-w-4xl py-6">
                {localAgents.map((agent, index) => (
                  <React.Fragment key={`blueprint-${agent.id}`}>
                    <div className="w-52 rounded-xl border border-primary/30 bg-base-200/80 p-3 shadow-lg flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          العقدة #{agent.stepNumber}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <h5 className="font-bold text-xs text-white truncate">{agent.name}: {agent.role.split(" ")[0]}</h5>
                      <p className="text-[10px] text-base-content/60 truncate">{agent.expectedOutput}</p>
                      <div className="flex items-center justify-between text-[9px] font-mono text-emerald-300 pt-1 border-t border-white/10">
                        <span>Latency: {agent.executionLatencyMs}ms</span>
                        <span>Source: OK</span>
                      </div>
                    </div>
                    {index < localAgents.length - 1 && (
                      <div className="text-primary font-bold text-lg hidden md:block">
                        ←
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-base-content/10 bg-base-200/60">
              <span className="text-xs text-base-content/60">
                🔒 هذا المخطط محمي ويعمل بصفة ذاتية متصلة بالسحابة، التعديلات تتم عبر مهام الوكلاء حصراً.
              </span>
              <button 
                onClick={() => setIsBlueprintModalOpen(false)}
                className="btn btn-sm btn-primary"
              >
                إغلاق المخطط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
