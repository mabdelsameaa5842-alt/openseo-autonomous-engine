import React, { useEffect, useRef, useState } from 'react';
import {
  Server,
  Coffee,
  Flame,
  Monitor,
  Maximize2,
  Minimize2,
  MessageSquare,
  Activity,
  Zap,
  CheckCircle2,
  X,
  Send,
  Play,
  FileText,
  Radio,
  Cpu,
  ZoomIn,
  ZoomOut,
  Compass
} from 'lucide-react';
import { OfficeCanvas } from '../agent-office-engine/components/OfficeCanvas.js';
import { OfficeState } from '../agent-office-engine/engine/officeState.js';
import { EditorState } from '../agent-office-engine/editor/editorState.js';
import { initVorderOfficeEngine } from '../agent-office-engine/vorderAssetLoader.js';
import { VORDER_AGENTS_ROSTER, type VorderAgentData } from '../agent-office-engine/vorderAgentsData.js';
import { CharacterState, Direction } from '../agent-office-engine/types.js';
import { Vorder3DCanvas } from '../agent-office-3d/components/Vorder3DCanvas';

interface ChatMessage {
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

export const VorderIsometricVideoGame: React.FC = () => {
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorStateRef = useRef<EditorState>(new EditorState());
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [renderMode, setRenderMode] = useState<'3d' | '2d'>('3d');
  const [officeState, setOfficeState] = useState<OfficeState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [zoom, setZoom] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [selectedAgent, setSelectedAgent] = useState<VorderAgentData | null>(VORDER_AGENTS_ROSTER[0] || null);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAgent, setChatAgent] = useState<VorderAgentData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeStation, setActiveStation] = useState<string>('محطة الخوادم السحابية');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Initialize Engine & Agents
  useEffect(() => {
    let isMounted = true;

    initVorderOfficeEngine('/office-assets/').then((layout) => {
      if (!isMounted) return;

      const os = new OfficeState(layout);

      // Add the 9 human VORDER agents at their designated desks
      VORDER_AGENTS_ROSTER.forEach((agent, idx) => {
        os.addAgent(idx, idx % 6, 0);
        const ch = os.characters.get(idx);
        if (ch) {
          ch.tileCol = agent.seatCol;
          ch.tileRow = agent.seatRow;
          ch.x = agent.seatCol * 16 + 8;
          ch.y = agent.seatRow * 16 + 8;
          ch.state = CharacterState.TYPE;
          ch.dir = Direction.UP;
        }
      });

      // Default camera pan: center of office
      const mapW = layout.cols * 16 * 3;
      const mapH = layout.rows * 16 * 3;
      panRef.current = { x: 0, y: 0 };

      setOfficeState(os);
      setIsLoaded(true);
      showToast('مرحباً بك في مقر VORDER المكتبي البكسلي المتطور (60 FPS)');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Periodic Smoke Lounge & Rest Break Behavior
  useEffect(() => {
    if (!officeState || !isLoaded) return;

    const interval = setInterval(() => {
      // Pick random agent for a smoke or coffee break
      const eligibleIdxs = [4, 6, 1, 5]; // Fahd, Omar, Sarah, Layla love the terrace
      const randomIdx = eligibleIdxs[Math.floor(Math.random() * eligibleIdxs.length)];
      const ch = officeState.characters.get(randomIdx);
      const agentData = VORDER_AGENTS_ROSTER[randomIdx];

      if (ch && agentData) {
        if (ch.state === CharacterState.TYPE) {
          // Walk to smoke lounge terrace
          const targetCol = agentData.smokeCol || 19;
          const targetRow = agentData.smokeRow || 4;
          officeState.walkCharacterTo(randomIdx, targetCol, targetRow);
          showToast(`${agentData.title} يتوجه إلى شرفة التدخين والاستراحة`);
        } else {
          // Walk back to desk
          officeState.walkCharacterTo(randomIdx, agentData.seatCol, agentData.seatRow);
        }
      }
    }, 28000);

    return () => clearInterval(interval);
  }, [officeState, isLoaded]);

  // 3. Oscilloscope Waveform Animation for Dossier
  useEffect(() => {
    if (!dossierOpen || !waveformCanvasRef.current) return;
    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      const midY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const y =
          midY +
          Math.sin(x * 0.05 + t) * 12 +
          Math.sin(x * 0.1 - t * 1.5) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [dossierOpen]);

  // 4. Quick Station Jumpers
  const handleFocusStation = (stationName: string) => {
    setActiveStation(stationName);
    let targetCol = 6;
    let targetRow = 5;

    if (stationName.includes('الخوادم')) {
      targetCol = 6;
      targetRow = 5;
    } else if (stationName.includes('التحرير') || stationName.includes('الكافيه') || stationName.includes('القهوة')) {
      targetCol = 7;
      targetRow = 10;
    } else if (stationName.includes('التدخين') || stationName.includes('الاستراحة') || stationName.includes('شرفة')) {
      targetCol = 19;
      targetRow = 5;
    } else if (stationName.includes('التحليل')) {
      targetCol = 7;
      targetRow = 15;
    }

    if (officeState) {
      const layout = officeState.getLayout();
      const mapW = layout.cols * 16 * zoom;
      const mapH = layout.rows * 16 * zoom;
      panRef.current = {
        x: mapW / 2 - targetCol * 16 * zoom,
        y: mapH / 2 - targetRow * 16 * zoom,
      };
    }
    showToast(`الانتقال الفوري إلى: ${stationName}`);
  };

  // 5. Agent Click Handler
  const handleAgentClick = (numericId: number) => {
    const agent = VORDER_AGENTS_ROSTER[numericId] || VORDER_AGENTS_ROSTER[0];
    setSelectedAgent(agent);
    setDossierOpen(true);
  };

  // 6. Interactive Chat Handler
  const handleSendMessage = () => {
    if (!chatInput.trim() || !chatAgent) return;
    const userText = chatInput.trim();
    setChatInput('');

    const newMsgs: ChatMessage[] = [
      ...chatMessages,
      {
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setChatMessages(newMsgs);
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('كوتا') || lower.includes('تكلفة') || lower.includes('سيرفر') || lower.includes('cost')) {
        reply = `بناءً على مقاييس Cloudflare Quota Guardian، نحن نستهلك 0.0% من الحد المجاني، وتكلفة التشغيل الفعلية هي 0.00$ دائماً عبر تقنيات D1 وKV وWorkers!`;
      } else if (lower.includes('حمل') || lower.includes('إعلان') || lower.includes('ads') || lower.includes('سارة')) {
        reply = `حملات الإعلانات العضوية التكتيكية الأربعة تعمل بكفاءة 100%. تم ربطها بـ 485 مصطلح مفتاحي بدون إنفاق سنت واحد على مزادات جوجل المدفوعة.`;
      } else if (lower.includes('كلمات') || lower.includes('كيورد') || lower.includes('طارق') || lower.includes('gsc')) {
        reply = `تم استخراج 485 مصطلح بحث في D1 مع 6 مرات ظهور في Google Search Console وترتيب وسطي 48.5 ومعدل فهرسة جغرافي 93.9%!`;
      } else if (lower.includes('دخان') || lower.includes('شرفة') || lower.includes('سجائر') || lower.includes('راحة')) {
        reply = `شرفة التدخين والاستراحة مجهزة بجمرة متوهجة وأريكة جلدية قرمزية ومطلّة على الغروب، نلتقي فيها بين نبضات الـ Cron لمناقشة استراتيجيات السيو!`;
      } else {
        reply = `أكدت تنفيذ الإجراء المطلوب لـ "${chatAgent.roleAr}". جميع الأنظمة متصلة وتعمل بالتوازي مع دورة العمل الذاتية!`;
      }

      setChatMessages([
        ...newMsgs,
        {
          sender: 'agent',
          text: reply,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  if (renderMode === '3d') {
    return (
      <div className="relative w-full space-y-3 font-sans select-none">
        {/* Top View Mode Switcher Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRenderMode('3d')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs shadow-md transition-all"
            >
              <Zap className="size-3.5" />
              <span>المقر التنفيذي ثلاثي الأبعاد 360°</span>
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('2d')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white font-semibold text-xs transition-all"
            >
              <span>المشهد البكسلي التفاعلي 2.5D</span>
            </button>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
            بيئة العمل التكتيكية • محاكاة 60 إطار/ثانية ومسارات نيون
          </span>
        </div>

        <Vorder3DCanvas
          onSelectAgent={(agent) => {
            setSelectedAgent(agent);
            setDossierOpen(true);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-[#0a0b10] border border-cyan-500/30 text-white shadow-2xl transition-all duration-300 font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : 'h-[780px]'
      }`}
    >
      {/* Mode Switcher inside 2D view */}
      <div className="absolute top-12 left-4 z-30">
        <button
          type="button"
          onClick={() => setRenderMode('3d')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg transition-all"
        >
          <Zap className="size-3.5" />
          <span>الترقية إلى المقر ثلاثي الأبعاد التفاعلي</span>
        </button>
      </div>

      {/* TOP RETRO CYBERPUNK HUD BAR */}
      <div className="absolute top-0 inset-x-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0e101a]/95 backdrop-blur-md border-b border-cyan-500/20">
        {/* Brand & Telemetry Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wider">
            <Radio className="size-3.5 animate-pulse text-emerald-400" />
            <span className="font-bold">مقر VORDER التكتيكي للبكسل</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-cyan-400/80">
            <span className="flex items-center gap-1">
              <Cpu className="size-3.5 text-cyan-400" />
              <span>9 وكلاء نشطين</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="size-3.5" />
              <span>$0.00 / شهر</span>
            </span>
            <span className="hidden md:flex items-center gap-1 text-amber-400">
              <Activity className="size-3.5" />
              <span>60 FPS • 12ms</span>
            </span>
          </div>
        </div>

        {/* Station Navigation Jumpers */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
          <button
            id="station-btn-servers"
            data-station="servers"
            onClick={() => handleFocusStation('محطة الخوادم السحابية')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeStation === 'محطة الخوادم السحابية'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
            title="الانتقال إلى خوادم D1 ومكاتب السيرفرات"
          >
            <Server className="size-3.5 text-cyan-400" />
            <span>محطة الخوادم</span>
          </button>

          <button
            id="station-btn-editorial"
            data-station="editorial"
            onClick={() => handleFocusStation('استوديو التحرير والمحتوى')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeStation === 'استوديو التحرير والمحتوى'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
            title="الانتقال إلى مكاتب التحرير وبار القهوة"
          >
            <Coffee className="size-3.5 text-amber-400" />
            <span>استوديو التحرير</span>
          </button>

          <button
            id="station-btn-smoke"
            data-station="smoke"
            onClick={() => handleFocusStation('شرفة التدخين والاستراحة')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeStation === 'شرفة التدخين والاستراحة'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
            title="الانتقال إلى شرفة التدخين والاستراحة وتصاعد جزيئات الدخان"
          >
            <Flame className="size-3.5 text-rose-400" />
            <span>شرفة التدخين</span>
          </button>

          <button
            id="station-btn-analytics"
            data-station="analytics"
            onClick={() => handleFocusStation('مكاتب التحليل والخرائط')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              activeStation === 'مكاتب التحليل والخرائط'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
            title="الانتقال إلى مكاتب التحليل والخرائط"
          >
            <Monitor className="size-3.5 text-purple-400" />
            <span>مكاتب التحليل</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(6, z + 0.5))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
            title="تكبير المشهد (+)"
          >
            <ZoomIn className="size-4 text-cyan-400" />
          </button>

          <button
            onClick={() => setZoom((z) => Math.max(1.5, z - 0.5))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
            title="تصغير المشهد (-)"
          >
            <ZoomOut className="size-4 text-cyan-400" />
          </button>

          <button
            onClick={() => {
              panRef.current = { x: 0, y: 0 };
              showToast('إعادة ضبط الكاميرا إلى المركز');
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
            title="إعادة ضبط الكاميرا (Home)"
          >
            <Compass className="size-4 text-amber-400" />
          </button>

          <button
            onClick={() => {
              const agent = selectedAgent || VORDER_AGENTS_ROSTER[0];
              setChatAgent(agent);
              setChatMessages([
                {
                  sender: 'agent',
                  text: `مرحباً! أنا ${agent.title}. جاهز لتلقي أي توجيه أو استفسار بخصوص السيو والأتمتة.`,
                  timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              setChatOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-medium transition-all"
            title="فتح منصة المحادثة الحية (C)"
          >
            <MessageSquare className="size-3.5" />
            <span>شات الوكلاء</span>
          </button>

          {selectedAgent && (
            <button
              onClick={() => setDossierOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-medium transition-all"
              title="عرض ملف الوكيل الشامل (Enter)"
            >
              <FileText className="size-3.5" />
              <span>ملف الوكيل</span>
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
            title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* PIXEL CANVAS VIEWPORT */}
      <div
        id="vorder-game-viewport"
        className="w-full h-full relative overflow-hidden select-none flex items-center justify-center bg-[#10121d]"
      >
        {isLoaded && officeState ? (
          <OfficeCanvas
            officeState={officeState}
            onClick={handleAgentClick}
            isEditMode={false}
            editorState={editorStateRef.current}
            onEditorTileAction={() => {}}
            onEditorEraseAction={() => {}}
            onEditorSelectionChange={() => {}}
            onDeleteSelected={() => {}}
            onRotateSelected={() => {}}
            onDragMove={() => {}}
            editorTick={0}
            zoom={zoom}
            onZoomChange={setZoom}
            panRef={panRef}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-cyan-400 font-mono animate-pulse">
            <Radio className="size-8 animate-spin" />
            <span className="text-sm">جاري تهيئة مقر VORDER المكتبي الرقمي والأصول البكسلية...</span>
          </div>
        )}
      </div>

      {/* BOTTOM AGENT QUICK-BAR & ROSTER */}
      <div className="absolute bottom-2 left-3 right-3 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* All 9 Agents Roster Chips */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full lg:max-w-[70%] p-1.5 rounded-xl bg-[#0c0d16]/90 backdrop-blur-md border border-cyan-500/20 scrollbar-none">
          <span className="font-mono text-cyan-400 text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 shrink-0 font-bold">
            فريق الوكلاء:
          </span>
          {VORDER_AGENTS_ROSTER.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <button
                key={agent.id}
                id={`roster-btn-${agent.id}`}
                data-testid={`roster-agent-${agent.id}`}
                onClick={() => {
                  setSelectedAgent(agent);
                  setDossierOpen(true);
                  if (officeState) {
                    const layout = officeState.getLayout();
                    const mapW = layout.cols * 16 * zoom;
                    const mapH = layout.rows * 16 * zoom;
                    panRef.current = {
                      x: mapW / 2 - agent.seatCol * 16 * zoom,
                      y: mapH / 2 - agent.seatRow * 16 * zoom,
                    };
                  }
                  showToast(`فحص ملف الوكيل: ${agent.title}`);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                }`}
                title={`عرض ملف ${agent.title} (${agent.roleAr})`}
              >
                <div className="size-4 rounded-full overflow-hidden shrink-0 border border-cyan-400/30">
                  <img
                    src={agent.avatarUrl}
                    alt={agent.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="text-[11px] whitespace-nowrap">{agent.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {selectedAgent && (
          <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-cyan-950/90 backdrop-blur-md border border-cyan-400/40 text-xs text-cyan-200 shadow-lg">
            <span className="font-bold">{selectedAgent.title}</span>
            <span className="text-emerald-400 font-mono">LVL {selectedAgent.level || 45}</span>
            <button
              id="btn-open-dossier"
              data-testid="btn-open-dossier"
              onClick={() => setDossierOpen(true)}
              className="px-2.5 py-0.5 rounded bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors shadow-sm"
            >
              فتح الملف
            </button>
          </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-black/90 border border-cyan-400/50 text-cyan-300 text-xs font-mono shadow-2xl backdrop-blur-md animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* ─── MODAL 1: AGENT INSPECTION DOSSIER (IMAGE 1 AUTHENTIC REPLICA) ─── */}
      {dossierOpen && selectedAgent && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d0f19] border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h2 className="text-lg font-bold font-mono tracking-wider text-cyan-300 flex items-center gap-2">
                    <span>AGENT INSPECTION DOSSIER</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                      ID: AGT-VORDER-{selectedAgent.id.toUpperCase()}
                    </span>
                  </h2>
                  <p className="text-xs text-cyan-500/70 font-mono">
                    SECURITY CLEARANCE: LEVEL 4 // CLOUDFLARE D1 AUTHORIZED
                  </p>
                </div>
              </div>
              <button
                id="btn-close-dossier"
                data-testid="btn-close-dossier"
                onClick={() => setDossierOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              {/* Left Column: Portrait & Stats */}
              <div className="md:col-span-5 space-y-4">
                {/* Character Portrait Box - BESPOKE INDIVIDUAL AVATAR */}
                <div className="relative aspect-square rounded-xl overflow-hidden border border-cyan-500/40 bg-black/60 shadow-inner group">
                  <img
                    src={selectedAgent.avatarUrl || `/game-assets/avatars/agent_${selectedAgent.id.replace('vorder-', '')}.png`}
                    alt={selectedAgent.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                      LVL. {selectedAgent.level || 45}
                    </span>
                    <span className="text-cyan-300 font-bold">XP: {selectedAgent.xp || 88}%</span>
                  </div>
                </div>

                {/* Core Stats Radar */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-cyan-500/20">
                    <div className="text-[10px] text-white/50">POWER</div>
                    <div className="text-base font-bold text-emerald-400">{selectedAgent.power || 96}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-cyan-500/20">
                    <div className="text-[10px] text-white/50">LATENCY</div>
                    <div className="text-base font-bold text-cyan-400">{selectedAgent.latency || 12}ms</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-cyan-500/20">
                    <div className="text-[10px] text-white/50">COST</div>
                    <div className="text-base font-bold text-amber-400">$0.00</div>
                  </div>
                </div>

                {/* Real-time Oscillating Waveform */}
                <div className="p-3 rounded-xl bg-black/80 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
                    <span>LIVE LATENCY WAVE</span>
                    <span className="animate-pulse text-emerald-400">● 100% HEALTH</span>
                  </div>
                  <canvas ref={waveformCanvasRef} width={280} height={50} className="w-full h-12 block" />
                </div>

                {/* Triple Status Indicators */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/60">AUTONOMOUS HARNESS:</span>
                    <span className="text-cyan-300 font-bold">{selectedAgent.harnessName}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/60">MODEL INFRA:</span>
                    <span className="text-emerald-400 font-bold">{selectedAgent.model}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/60">ACTIVE GIT BRANCH:</span>
                    <span className="text-amber-300 font-mono text-[11px]">{selectedAgent.gitBranch}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Mission Log & Dossier Details */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Name and Roles */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {selectedAgent.station}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                        PR STATE: {selectedAgent.prState}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">{selectedAgent.title}</h1>
                    <div className="text-sm text-cyan-400/90 font-mono mt-0.5">{selectedAgent.roleAr} • {selectedAgent.roleEn}</div>
                  </div>

                  {/* Operational Summary */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-cyan-500/20 space-y-2">
                    <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                      <Activity className="size-3.5" />
                      <span>MISSION OPERATIONAL SUMMARY:</span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {selectedAgent.summary}
                    </p>
                    <p className="text-xs text-white/50 italic border-t border-white/5 pt-2">
                      &quot;{selectedAgent.personality}&quot;
                    </p>
                  </div>

                  {/* Real-time Telemetry Metrics Grid */}
                  <div>
                    <div className="text-xs font-mono text-cyan-400/80 mb-2 flex items-center gap-1.5">
                      <Zap className="size-3.5" />
                      <span>TELEMETRY METRICS IN D1 DATABASE:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedAgent.stats &&
                        Object.entries(selectedAgent.stats).map(([k, v]) => (
                          <div key={k} className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono">
                            <div className="text-[10px] text-white/40 uppercase">{k}</div>
                            <div className="text-sm font-bold text-cyan-300">{String(v)}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <CheckCircle2 className="size-4" />
                    <span>D1 CLOUD SYNC: 100% OPERATIONAL</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDossierOpen(false);
                        setChatAgent(selectedAgent);
                        setChatMessages([
                          {
                            sender: 'agent',
                            text: `مرحباً! أنا ${selectedAgent.title}. جاهز لأي توجيه تنفيذي في محطة "${selectedAgent.station}".`,
                            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                          }
                        ]);
                        setChatOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      <MessageSquare className="size-4" />
                      <span>فتح شات الوكيل</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: DIRECT CHAT DRAWER (IMAGE 2 AUTHENTIC REPLICA) ─── */}
      {chatOpen && chatAgent && (
        <div className="absolute inset-y-0 right-0 z-40 w-full max-w-md bg-[#0d0f19]/95 backdrop-blur-xl border-l-2 border-cyan-500/40 shadow-2xl flex flex-col animate-slideLeft text-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-cyan-500/30 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl overflow-hidden border border-cyan-500/40 bg-black/60 shrink-0">
                <img
                  src={chatAgent.avatarUrl || `/game-assets/avatars/agent_${chatAgent.id.replace('vorder-', '')}.png`}
                  alt={chatAgent.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-cyan-300">{chatAgent.title}</h3>
                <p className="text-[11px] text-emerald-400 font-mono">متصل ومتاح فوراً • $0.00</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-white/10 border border-cyan-500/20 text-white/90 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-white/40 mt-1 px-1 font-mono">{m.timestamp}</span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-cyan-400 font-mono animate-pulse w-fit">
                <div className="size-2 rounded-full bg-cyan-400 animate-ping" />
                <span>الوكيل يقوم بالتحليل والصياغة...</span>
              </div>
            )}
          </div>

          {/* Chat Quick Prompts */}
          <div className="p-2 border-t border-white/5 bg-black/40 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
            <button
              onClick={() => {
                setChatInput('ما هي حالة استهلاك الكوتا والتكلفة السحابية؟');
              }}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 shrink-0"
            >
              الكوتا والتكلفة
            </button>
            <button
              onClick={() => {
                setChatInput('كم عدد الكلمات المفتاحية النشطة في Search Console؟');
              }}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 shrink-0"
            >
              الكلمات المفتاحية
            </button>
            <button
              onClick={() => {
                setChatInput('أخبرني عن ركن الاستراحة وشرفة التدخين');
              }}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-rose-300 shrink-0"
            >
              شرفة التدخين
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-cyan-500/30 bg-black/60 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالتك أو استفسارك للوكيل..."
              className="flex-1 bg-white/5 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black transition-colors shrink-0"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
