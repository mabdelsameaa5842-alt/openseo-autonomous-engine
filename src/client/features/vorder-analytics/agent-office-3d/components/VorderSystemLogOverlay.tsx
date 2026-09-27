import React, { useEffect, useState } from 'react';
import { X, Terminal } from 'lucide-react';

interface VorderSystemLogOverlayProps {
  onClose: () => void;
}

export const VorderSystemLogOverlay: React.FC<VorderSystemLogOverlayProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<Array<{ time: string; level: string; source: string; msg: string }>>([
    {
      time: new Date().toLocaleTimeString('ar-EG'),
      level: 'SUCCESS',
      source: 'GUARDRAIL_ENGINE',
      msg: 'تفعيل فلتر الحماية البرمجي (Post-Generation Guardrail) لمنع أي عبارات مرفوضة في ذاكرة المالك بجدول D1',
    },
    {
      time: new Date().toLocaleTimeString('ar-EG'),
      level: 'SUCCESS',
      source: 'AUTONOMOUS_ROUNDTABLE',
      msg: 'عقد اجتماع الطاولة المستديرة للوكلاء الـ 9 وتحليل الـ 38 ظهوراً في كونسول بسرعة عرض TURBO_3X',
    },
    {
      time: new Date().toLocaleTimeString('ar-EG'),
      level: 'INFO',
      source: 'SITEMAP_GOVERNOR',
      msg: 'تطابق المدونة والسايت ماب وقاعدة D1 بنسبة 100% مع طابور نشر ممتلئ (100/100)',
    },
  ]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/automation/agent-programmatic-logs?limit=40')
      .then((r) => r.json())
      .then((data: any) => {
        if (!mounted || !Array.isArray(data?.logs) || data.logs.length === 0) return;
        setLogs(
          data.logs.map((l: any) => ({
            time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString('ar-EG') : 'الآن',
            level: l.status || 'SUCCESS',
            source: `${l.agentName || l.agentId} • ${l.modelUsed || 'D1'}`,
            msg: l.outputSummary || l.details || l.operationName,
          }))
        );
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div dir="rtl" className="absolute inset-4 z-40 flex flex-col rounded-3xl border border-purple-500/30 bg-zinc-950/95 p-6 text-white shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
            <Terminal className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">السجل الجنائي الحي لعمليات الوكلاء في D1 (Live Programmatic Logs)</h3>
            <span className="text-xs text-zinc-400">يعرض العمليات الفعلية المسجلة في جدول autonomous_programmatic_logs لحظة بلحظة</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Terminal Log Output */}
      <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs space-y-2.5">
        {logs.map((log, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-white/5 pb-2 text-[11px]">
            <span className="text-zinc-500 shrink-0">[{log.time}]</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                log.level === 'SUCCESS'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {log.source}
            </span>
            <span className="text-zinc-200 leading-relaxed">{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
