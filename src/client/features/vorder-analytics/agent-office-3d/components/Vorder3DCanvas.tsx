import React, { useEffect, useRef, useState, useCallback } from 'react';
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

  // Simulation State
  const [timeMinutes, setTimeMinutes] = useState<number>(600);
  const [status, setStatus] = useState<string>('العمل العميق · جميع الوكلاء الـ 9 متصلون');
  const [inMeeting, setInMeeting] = useState<boolean>(false);
  const [cyberpunk, setCyberpunk] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Selected Agent & Overlays
  const [selectedAgentId, setSelectedAgentId] = useState<number>(0);
  const [dossierAgent, setDossierAgent] = useState<VorderAgentData | null>(null);
  const [showTaskBoard, setShowTaskBoard] = useState<boolean>(false);
  const [showSystemLog, setShowSystemLog] = useState<boolean>(false);
  const [showDirectorChat, setShowDirectorChat] = useState<boolean>(false);

  const formatTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60);
    const isPM = h >= 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isPM ? 'م' : 'ص'}`;
  };

  // Initialize Three.js 3D Miniature Office Scene
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
        if (onSelectAgent && matched) {
          onSelectAgent(matched);
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
  }, [onSelectAgent]);

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
      sceneRef.current.flyToAgent(0);
    }
  }, []);

  const handleQuickAgentSelect = (idx: number) => {
    setSelectedAgentId(idx);
    const matched = VORDER_AGENTS_ROSTER[idx] || null;
    setDossierAgent(matched);
    if (sceneRef.current) {
      sceneRef.current.flyToAgent(idx);
    }
    if (onSelectAgent && matched) {
      onSelectAgent(matched);
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
        isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : 'h-[720px] sm:h-[780px]'
      }`}
    >
      {/* 1. Top Activity Ticker */}
      <VorderOfficeTicker />

      {/* 2. Top Sub-Bar with HUD Metrics and Overlays */}
      <div className="absolute top-12 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-xs">
          <div className="size-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold text-cyan-300">مقر VORDER التكتيكي المصغر 3D</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400 hidden sm:inline">23 ظهور معتمد • 742 مقال منشور • $0.00 كوتا سحابية</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] hidden md:inline">
            محرك 60 FPS
          </span>
        </div>

        {/* Quick Modal Overlays */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDirectorChat(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-md transition-all"
          >
            <MessageSquare className="size-3.5" />
            <span>مدير الوكلاء (طارق العبدلي)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTaskBoard(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 font-semibold text-xs shadow transition-all"
          >
            <ListTodo className="size-3.5 text-cyan-400" />
            <span className="hidden sm:inline">لوحة المهام التكتيكية</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSystemLog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 font-semibold text-xs shadow transition-all"
          >
            <Terminal className="size-3.5 text-emerald-400" />
            <span className="hidden sm:inline">سجل الأنشطة الحية</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom Agent Selector Row (9 VORDER Agents) */}
      <div className="absolute bottom-20 left-4 right-4 z-20 overflow-x-auto no-scrollbar py-1 flex items-center gap-2 justify-start sm:justify-center pointer-events-auto">
        {VORDER_AGENTS_ROSTER.map((agent, idx) => {
          const isSelected = selectedAgentId === idx;
          const officeConfig = VORDER_OFFICE_AGENTS[idx];
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => handleQuickAgentSelect(idx)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all border whitespace-nowrap ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(13,238,243,0.3)] scale-105'
                  : 'bg-slate-950/70 hover:bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <img
                src={agent.avatarUrl}
                alt={agent.title}
                className="size-6 rounded-lg object-cover border border-white/20"
              />
              <div className="text-right">
                <div className="text-[11px] font-bold text-white leading-tight">
                  {agent.title}
                </div>
                <div className="text-[9px] font-mono text-cyan-400">
                  {officeConfig?.metrics.split('•')[0] || '100% دورة'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Bottom Glass HUD (Time scrubber, Cyberpunk mode, Status) */}
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

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
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

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setDossierAgent(null);
                  setShowDirectorChat(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg transition-all"
              >
                <MessageSquare className="size-4" />
                <span>إرسال توجيهات تكتيكية</span>
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

      {/* 6. Modals (Task Board, System Logs, Director Chat) */}
      {showTaskBoard && (
        <VorderTaskBoardOverlay onClose={() => setShowTaskBoard(false)} />
      )}
      {showSystemLog && (
        <VorderSystemLogOverlay onClose={() => setShowSystemLog(false)} />
      )}
      {showDirectorChat && (
        <VorderAgentDirectorChat onClose={() => setShowDirectorChat(false)} />
      )}
    </div>
  );
};
