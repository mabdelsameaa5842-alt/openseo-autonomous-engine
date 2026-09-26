import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  ListTodo,
  Terminal,
  MessageSquare,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  createVorderOfficeScene,
  VORDER_OFFICE_AGENTS,
  type VorderAgentConfig,
} from '../VorderOfficeScene';
import { VorderOfficeTicker } from './VorderOfficeTicker';
import { VorderOfficeHUD } from './VorderOfficeHUD';
import { VorderTaskBoardOverlay } from './VorderTaskBoardOverlay';
import { VorderSystemLogOverlay } from './VorderSystemLogOverlay';
import { VorderAgentDirectorChat } from './VorderAgentDirectorChat';
import { VORDER_AGENTS_ROSTER, type VorderAgentData } from '../../agent-office-engine/vorderAgentsData';

interface Vorder3DCanvasProps {
  onSelectAgent?: (agent: VorderAgentData) => void;
}

export const Vorder3DCanvas: React.FC<Vorder3DCanvasProps> = ({ onSelectAgent }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<any>(null);
  const onSelectAgentRef = useRef(onSelectAgent);

  useEffect(() => {
    onSelectAgentRef.current = onSelectAgent;
  }, [onSelectAgent]);

  // Simulation State
  const [timeMinutes, setTimeMinutes] = useState<number>(540); // 9:00 AM start
  const [status, setStatus] = useState<string>('العمل العميق · جميع الوكلاء الـ 9 متصلون وينفذون المهام');
  const [inMeeting, setInMeeting] = useState<boolean>(false);
  const [cyberpunk, setCyberpunk] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Selected Agent & Overlays
  const [selectedAgentId, setSelectedAgentId] = useState<number>(0);
  const [dossierAgent, setDossierAgent] = useState<VorderAgentData | null>(null);
  const [showTaskBoard, setShowTaskBoard] = useState<boolean>(false);
  const [showSystemLog, setShowSystemLog] = useState<boolean>(false);
  const [chattingAgent, setChattingAgent] = useState<VorderAgentData | null>(null);

  const formatTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60);
    const isPM = h >= 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isPM ? 'م' : 'ص'}`;
  };

  // 30-Minute Cloudflare Cadence Duty & Rest Calculations
  const cycleMin = timeMinutes % 30;
  const isBreak = cycleMin >= 24 && cycleMin < 28;
  const isMeetingCycle = cycleMin >= 28;
  const baseProgressPct = isBreak || isMeetingCycle ? 100 : Math.min(100, Math.floor((cycleMin / 24) * 100));

  // Initialize Three.js 3D Miniature Office Scene ONCE (preserves camera and walking timers)
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = createVorderOfficeScene(containerRef.current, {
      onTimeUpdate: (m) => setTimeMinutes(m),
      onStatusUpdate: (s) => setStatus(s),
      onMeetingChange: (m) => setInMeeting(m),
      onAgentClick: (agentId, agent) => {
        setSelectedAgentId(agentId);
        const matched = VORDER_AGENTS_ROSTER[agentId] || null;
        setDossierAgent(matched);
        if (onSelectAgentRef.current && matched) {
          onSelectAgentRef.current(matched);
        }
      },
    });

    sceneRef.current = scene;

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, []);

  const handleTimeChange = useCallback((m: number) => {
    setTimeMinutes(m);
    if (sceneRef.current) {
      sceneRef.current.setTime(m);
    }
  }, []);

  const handleCyberpunkToggle = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.toggleCyberpunk();
      setCyberpunk((prev) => !prev);
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.zoomOut();
    }
  }, []);

  const handleQuickAgentSelect = (idx: number) => {
    setSelectedAgentId(idx);
    const matched = VORDER_AGENTS_ROSTER[idx] || null;
    setDossierAgent(matched);
    if (sceneRef.current) {
      sceneRef.current.flyToAgent(idx);
    }
    if (onSelectAgentRef.current && matched) {
      onSelectAgentRef.current(matched);
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      id="vorder-3d-office-container"
      className={`relative w-full overflow-hidden rounded-2xl bg-[#000C1E] border border-cyan-500/20 text-white shadow-2xl transition-all duration-300 font-sans select-none ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : 'h-[740px] sm:h-[800px]'
      }`}
    >
      {/* 1. Top Activity Ticker */}
      <VorderOfficeTicker />

      {/* 2. Top Sub-Bar with HUD Metrics and Overlays */}
      <div className="absolute top-12 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-xs shadow-lg">
          <div className="size-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold text-cyan-300">مقر VORDER التكتيكي 3D (الوكلاء الـ 9)</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400 hidden sm:inline">36 ظهور حي • 647 مقال (مدونة=سايت ماب=D1) • Site Audit 100%</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] hidden md:inline">
            محرك 60 FPS
          </span>
        </div>

        {/* Camera and Navigation Shortcuts Guide */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 text-[11px] text-zinc-300 shadow">
          <span className="text-cyan-400 font-bold">🎮 التحكم:</span>
          <span>سحب أيسر: تدوير</span>
          <span className="text-zinc-600">•</span>
          <span>زر أيمن / Shift: تحريك أفقي (Pan)</span>
          <span className="text-zinc-600">•</span>
          <span>عجلة / أزرار HUD: زووم ناعم</span>
        </div>

        {/* Quick Modal Overlays */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (sceneRef.current?.toggleMeetingRoom) {
                sceneRef.current.toggleMeetingRoom();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs shadow-md transition-all cursor-pointer ${
              inMeeting
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-purple-500/25 hover:bg-purple-500/35 border-purple-400/50 text-purple-200'
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>{inMeeting ? 'إنهاء الاجتماع والعودة للمكاتب' : 'جمع الـ 9 وكلاء في أوضة الميتينج (9 كراسي) 🎙️'}</span>
          </button>

          <button
            type="button"
            onClick={() => setChattingAgent(VORDER_AGENTS_ROSTER[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="size-3.5" />
            <span>مدير الوكلاء (طارق العبدلي)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTaskBoard(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 font-semibold text-xs shadow transition-all cursor-pointer"
          >
            <ListTodo className="size-3.5 text-cyan-400" />
            <span className="hidden sm:inline">لوحة المهام</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSystemLog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 font-semibold text-xs shadow transition-all cursor-pointer"
          >
            <Terminal className="size-3.5 text-emerald-400" />
            <span className="hidden sm:inline">السجل الحي</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom Agent Selector Row (All 9 VORDER Agents with Live Progress Bars) */}
      <div className="absolute bottom-20 left-4 right-4 z-20 overflow-x-auto no-scrollbar py-1 flex items-center gap-2 justify-start sm:justify-center pointer-events-auto">
        {VORDER_AGENTS_ROSTER.map((agent, idx) => {
          const isSelected = selectedAgentId === idx;
          const officeConfig = VORDER_OFFICE_AGENTS[idx];
          const agentProgress = isBreak || isMeetingCycle ? 100 : Math.min(100, Math.max(0, baseProgressPct - (idx % 3) * 2));

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => handleQuickAgentSelect(idx)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all border whitespace-nowrap shadow-md ${
                isSelected
                  ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_18px_rgba(13,238,243,0.35)] scale-105'
                  : 'bg-slate-950/80 hover:bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <img
                src={agent.avatarUrl}
                alt={agent.title}
                className="size-7 rounded-lg object-cover border border-white/20"
              />
              <div className="text-right">
                <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1.5">
                  <span>{agent.title}</span>
                  {idx === 8 && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/30 text-blue-300 font-mono">
                      مشرف
                    </span>
                  )}
                </div>
                {/* Live % Progress Bar and Duty Status */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${agentProgress}%`,
                        backgroundColor: officeConfig?.hex || '#0DEEF3',
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-bold" style={{ color: officeConfig?.hex || '#0DEEF3' }}>
                    {isBreak ? '☕ 100%' : isMeetingCycle ? '📋 مزامنة' : `${agentProgress}%`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Bottom Glass HUD (Time scrubber, Zoom In/Out, Reset, Cyberpunk mode, Status) */}
      <VorderOfficeHUD
        timeMinutes={timeMinutes}
        timeFormatted={formatTime(timeMinutes)}
        status={status}
        cyberpunk={cyberpunk}
        inMeeting={inMeeting}
        isFullscreen={isFullscreen}
        onTimeChange={handleTimeChange}
        onCyberpunkToggle={handleCyberpunkToggle}
        onResetCamera={handleResetCamera}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 5. Detailed Dossier Modal when clicking any Agent */}
      {dossierAgent && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-950 border border-cyan-500/40 p-6 shadow-2xl text-right animate-scale-up">
            <button
              type="button"
              onClick={() => setDossierAgent(null)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={dossierAgent.avatarUrl}
                alt={dossierAgent.title}
                className="size-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              />
              <div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{dossierAgent.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    LVL {dossierAgent.level}
                  </span>
                </div>
                <div className="text-xs text-cyan-400 font-medium">
                  {dossierAgent.roleAr}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  {dossierAgent.roleEn}
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 mb-4">
              {dossierAgent.summary}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-zinc-400 block text-[10px]">المحرك الذكي</span>
                <span className="font-mono text-cyan-300 text-xs">{dossierAgent.model}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-zinc-400 block text-[10px]">المحطة الميدانية</span>
                <span className="text-white text-xs">{dossierAgent.station}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-zinc-400 block text-[10px]">حالة الفرع (Git)</span>
                <span className="font-mono text-emerald-400 text-xs">{dossierAgent.gitBranch}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-zinc-400 block text-[10px]">الاستجابة والجاهزية</span>
                <span className="font-mono text-amber-300 text-xs">{dossierAgent.latency}ms • {dossierAgent.power}%</span>
              </div>
            </div>

            {/* Connected Platforms */}
            {dossierAgent.platforms && dossierAgent.platforms.length > 0 && (
              <div className="mb-3">
                <span className="text-[11px] font-bold text-zinc-400 block mb-1.5">
                  المنصات السحابية المتصلة:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dossierAgent.platforms.map((p) => {
                    const isCf = p.includes('Cloudflare') || p.includes('D1') || p.includes('Wrangler');
                    const isGsc = p.includes('Search Console');
                    const isAds = p.includes('Ads');
                    const isGa = p.includes('Analytics');
                    const isGh = p.includes('GitHub');
                    const isSupa = p.includes('Supabase');
                    const isVercel = p.includes('Vercel');
                    const isAi = p.includes('AI Studio');
                    const isIndexNow = p.includes('IndexNow');

                    const colorClass = isCf
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      : isGsc
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : isAds
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : isGa
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      : isGh
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : isSupa
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isVercel
                      ? 'bg-zinc-800 text-zinc-200 border-zinc-600'
                      : isAi
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : isIndexNow
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-white/10 text-white border-white/20';

                    return (
                      <span
                        key={p}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono font-medium ${colorClass}`}
                      >
                        {p}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Data transmission & effectiveness role */}
            {dossierAgent.dataRoleAr && (
              <div className="mb-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
                <span className="font-bold text-cyan-300 block mb-1">
                  ⚡ دور نقل البيانات والفعالية:
                </span>
                <span>{dossierAgent.dataRoleAr}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const targetAgent = dossierAgent;
                  setDossierAgent(null);
                  setChattingAgent(targetAgent);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg transition-all"
              >
                <MessageSquare className="size-4" />
                <span>إرسال توجيهات تكتيكية لـ {dossierAgent.title}</span>
              </button>

              <button
                type="button"
                onClick={() => setDossierAgent(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modals (Task Board, System Logs, Agent Chat) */}
      {showTaskBoard && (
        <VorderTaskBoardOverlay onClose={() => setShowTaskBoard(false)} />
      )}
      {showSystemLog && (
        <VorderSystemLogOverlay onClose={() => setShowSystemLog(false)} />
      )}
      {chattingAgent && (
        <VorderAgentDirectorChat agent={chattingAgent} onClose={() => setChattingAgent(null)} />
      )}
    </div>
  );
};
