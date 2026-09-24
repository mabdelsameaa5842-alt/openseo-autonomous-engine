import React from 'react';
import { X, Terminal, ShieldCheck, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

interface VorderSystemLogOverlayProps {
  onClose: () => void;
}

export const VorderSystemLogOverlay: React.FC<VorderSystemLogOverlayProps> = ({ onClose }) => {
  const logs = [
    { time: '06:00:11 UTC', level: 'SUCCESS', source: 'CRON_PUBLISHER', msg: 'نشر المقال رقم 738 بنجاح: "كيف تتقن تطبيق إعلانات جوجل مصانع 6 أكتوبر والعاشر القاهرة" على مدونة Vercel' },
    { time: '05:58:30 UTC', level: 'INFO', source: 'GSC_PAGE_AGGREGATOR', msg: 'مزامنة أبعاد الصفحات بكونسول: رصد 23 ظهوراً حياً عبر 14 صفحة بمتوسط ترتيب 35.52' },
    { time: '05:45:09 UTC', level: 'SUCCESS', source: 'CRON_PUBLISHER', msg: 'نشر المقال رقم 737: "استراتيجيات متقدمة لـ سيو عقارات الشيخ زايد والعاصمة 2026"' },
    { time: '05:30:10 UTC', level: 'SUCCESS', source: 'CRON_PUBLISHER', msg: 'نشر المقال رقم 736: "دليل 2026 الشامل في تحسين معدل التحويل القاهرة"' },
    { time: '05:15:09 UTC', level: 'INFO', source: 'EDGE_PREWARMER', msg: 'تسخين كاش الحافة Cloudflare CDN لروابط المدونة المنشورة حديثاً (استجابة < 28ms)' },
    { time: '05:00:11 UTC', level: 'INFO', source: 'QUOTA_GUARDIAN', msg: 'فحص استهلاك D1: القراءات اليومية 42,500 من أصل 5,000,000 (الحساب سليم 100%)' },
    { time: '04:45:09 UTC', level: 'SUCCESS', source: 'GEMINI_AI_STUDIO', msg: 'توليد وسوم Schema و FAQPage وتوطين اللهجة لمقالات المتاجر السعودية' },
  ];

  return (
    <div className="absolute inset-4 z-40 flex flex-col rounded-3xl border border-purple-500/30 bg-zinc-950/95 p-6 text-white shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
            <Terminal className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">سجل الأنشطة الحية ومراقبة الكلاود (System Live Log)</h3>
            <span className="text-xs text-zinc-400">سجل الأحداث والكرون اللحظي المنقول من agent-office/packages/ui</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition-all"
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
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
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
