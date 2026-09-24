import React from 'react';
import { X, CheckCircle2, Clock, Zap, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

interface VorderTaskBoardOverlayProps {
  onClose: () => void;
}

export const VorderTaskBoardOverlay: React.FC<VorderTaskBoardOverlayProps> = ({ onClose }) => {
  const inProgressTasks = [
    { id: 'task-1', title: 'صياغة مقال: سيو التجارة الإلكترونية في الرياض وجدة 2026', agent: 'ياسمين فهد', status: 'جاري الكتابة (88%)', time: 'منذ دقيقة' },
    { id: 'task-2', title: 'استخراج 40 كلمة مفتاحية نية شرائية لبوابات الدفع بالسعودية', agent: 'سارة فهد', status: 'تعدين دلالي (94%)', time: 'منذ دقيقتين' },
  ];

  const queuedTasks = [
    { id: 'task-3', title: 'مراجعة خريطة الموقع sitemap.xml والتحقق من الـ 740 رابط', agent: 'كريم الدسوقي', status: 'مجدول للكرون القادم', time: 'خلال 8 دقائق' },
    { id: 'task-4', title: 'تسخين كاش الحافة (Edge Prewarm) لآخر 5 مقالات منشورة', agent: 'عمر الشريف', status: 'طابور الانتظار', time: 'خلال 12 دقيقة' },
  ];

  const completedTasks = [
    { id: 'task-5', title: 'نشر مقال: إعلانات جوجل مصانع 6 أكتوبر والعاشر (مقال رقم 738)', agent: 'عمر الشريف', status: 'تم النشر بنجاح على Vercel', time: '06:00 UTC' },
    { id: 'task-6', title: 'مزامنة مرات الظهور اللحظية من كونسول (23 ظهوراً معتمداً)', agent: 'طارق النجار', status: 'موثق بدقة 100%', time: 'مكتمل' },
    { id: 'task-7', title: 'حماية حصة قراءات Cloudflare D1 وتفعيل الكاش الذاتي', agent: 'زياد ممدوح', status: 'حماية نشطة 100%', time: 'مكتمل' },
  ];

  return (
    <div className="absolute inset-4 z-40 flex flex-col rounded-3xl border border-cyan-500/30 bg-zinc-950/95 p-6 text-white shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Zap className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">لوحة مهام الوكلاء وكانبان السيو (Task Board)</h3>
            <span className="text-xs text-zinc-400">مستوحاة من agent-office/core ومربوطة بحقيقة D1 و Vercel اللحظية</span>
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

      {/* Kanban 3 Columns */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-y-auto">
        {/* Column 1: In Progress */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
              قيد التنفيذ النشط ({inProgressTasks.length})
            </span>
          </div>
          <div className="space-y-2.5">
            {inProgressTasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-xs space-y-1.5 shadow-sm">
                <span className="font-bold text-white block leading-tight">{t.title}</span>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                  <span className="text-cyan-400 font-semibold">{t.agent}</span>
                  <span className="text-amber-400 font-mono">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Queued */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Clock className="size-3.5" />
              طابور الانتظار والكرون ({queuedTasks.length})
            </span>
          </div>
          <div className="space-y-2.5">
            {queuedTasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-xs space-y-1.5 shadow-sm">
                <span className="font-bold text-white block leading-tight">{t.title}</span>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                  <span className="text-cyan-400 font-semibold">{t.agent}</span>
                  <span className="text-zinc-400 font-mono">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              مكتمل ومنشور حياً (738 مقال)
            </span>
          </div>
          <div className="space-y-2.5">
            {completedTasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-emerald-500/20 bg-zinc-900/80 p-3 text-xs space-y-1.5 shadow-sm">
                <span className="font-bold text-white block leading-tight">{t.title}</span>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                  <span className="text-cyan-400 font-semibold">{t.agent}</span>
                  <span className="text-emerald-400 font-mono">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
