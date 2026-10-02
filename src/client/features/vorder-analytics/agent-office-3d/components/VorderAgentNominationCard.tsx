import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Brain,
  Wrench,
  Loader2,
  ChevronDown,
  ChevronUp,
  Monitor,
  Users,
  Shirt,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export interface AgentNomination {
  id: string;
  agentName: string;
  agentNameEn: string;
  nominatedBy: string;
  roleCategory: string;
  reason: string;
  expectedRoi: string;
  authorities: string[];
  proposedSystemPrompt: string;
  proposedTools: string[];
  status: "pending" | "approved" | "rejected";
  reviewedAt?: string;
  createdAt: string;
  visualProfileSummary?: string;
  deskSlotLabel?: string;
  meetingSeatLabel?: string;
  trainingStatus?: "in_training" | "graduated";
  currentTrainingDay?: number;
  trainingTotalDays?: number;
  maturityPct?: number;
  mentorAgentIds?: string[];
  mentorNames?: string[];
  evolvedSystemPrompt?: string;
  promptEvolutionLog?: Array<{ day: number; title: string; desc: string }>;
}

interface VorderAgentNominationCardProps {
  nomination: AgentNomination;
  onStatusChange?: (updatedNomination: AgentNomination) => void;
}

export function VorderAgentNominationCard({
  nomination,
  onStatusChange,
}: VorderAgentNominationCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [showEvolvedPrompt, setShowEvolvedPrompt] = useState(false);
  const [showEvolutionHistory, setShowEvolutionHistory] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"pending" | "approved" | "rejected">(
    nomination.status || "pending"
  );

  const handleAction = async (action: "approve" | "reject" | "reset") => {
    setIsSubmitting(true);
    try {
      const payloadStr = JSON.stringify({
        action,
        nominationId: nomination.id,
      });

      const attemptRequest = async (url: string) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payloadStr,
        });
        const rawText = await res.text();
        if (!res.ok || !rawText.trim()) {
          throw new Error(`HTTP ${res.status}`);
        }
        return JSON.parse(rawText) as any;
      };

      let data: any;
      try {
        data = await attemptRequest("/api/automation/agent-nominations");
      } catch {
        data = await attemptRequest(
          "https://open-seo.abdelsameaa.workers.dev/api/automation/agent-nominations"
        );
      }

      const newStatus =
        action === "approve"
          ? "approved"
          : action === "reject"
          ? "rejected"
          : "pending";
      setCurrentStatus(newStatus);

      // Broadcast real-time event so the 3D Office Scene immediately spawns/updates the agent's desk, PC, meeting chair & unique 3D character!
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vorder-nomination-updated", {
            detail: {
              action,
              nomination: data.nomination || { ...nomination, status: newStatus },
              nominations: data.nominations,
            },
          })
        );
      }

      if (action === "approve") {
        toast.success(
          `تم اعتماد وتعيين «${nomination.agentName}» في D1! تم بناء مكتبه بالكمبيوتر وإضافة كرسيه في غرفة الاجتماعات وتوليد شخصيته الفريدة في المكتب ثلاثي الأبعاد.`
        );
      } else if (action === "reject") {
        toast.info(`تم أرشفة ترشيح «${nomination.agentName}».`);
      } else {
        toast.info(`تمت إعادة ترشيح «${nomination.agentName}» إلى حالة الانتظار.`);
      }

      if (onStatusChange && data.nomination) {
        onStatusChange(data.nomination);
      }
    } catch (err: any) {
      toast.error(`خطأ: ${err.message || "فشل إرسال القرار إلى السيرفر"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="rounded-2xl border-2 border-[var(--apple-border)] hover:border-indigo-500/40 bg-[var(--apple-card)] p-5 shadow-sm transition-all text-right relative overflow-hidden"
    >
      {/* Top Accent Strip */}
      <div
        className={`absolute top-0 inset-x-0 h-1.5 ${
          currentStatus === "approved"
            ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
            : currentStatus === "rejected"
            ? "bg-gradient-to-r from-rose-500 to-zinc-500"
            : "bg-gradient-to-r from-[#97233A] via-indigo-600 to-cyan-500"
        }`}
      />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--apple-border)] pt-1">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5">
            <Sparkles className="size-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border border-indigo-500/30">
                ترشيح توسع ذكي معتمد بالأبحاث
              </span>
              <span className="text-xs font-bold text-[var(--apple-text-secondary)]">
                صاحب الترشيح والإشراف:{" "}
                <strong className="text-[var(--apple-text-primary)] font-extrabold">
                  {nomination.nominatedBy}
                </strong>
              </span>
              {nomination.roleCategory && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-fuchsia-500/10 text-fuchsia-800 dark:text-fuchsia-300 border border-fuchsia-500/25">
                  القطاع: {nomination.roleCategory}
                </span>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-black text-[var(--apple-text-primary)] flex flex-wrap items-center gap-2 leading-snug">
              <span>{nomination.agentName}</span>
              <span
                dir="ltr"
                className="inline-block text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--apple-canvas)] text-indigo-700 dark:text-indigo-300 border border-[var(--apple-border)]"
              >
                ({nomination.agentNameEn})
              </span>
            </h4>
          </div>
        </div>

        {/* Current Status Badge — High Contrast Light & Dark */}
        <div className="shrink-0">
          {currentStatus === "approved" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/40 shadow-2xs">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>معتمد ومعيّن في المكتب 3D و D1</span>
            </span>
          )}
          {currentStatus === "rejected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/15 text-rose-800 dark:text-rose-200 border border-rose-500/40">
              <XCircle className="size-4 text-rose-600 dark:text-rose-400" />
              <span>مؤرشف ومرفوض</span>
            </span>
          )}
          {currentStatus === "pending" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/40">
              <ShieldCheck className="size-4 text-amber-600 dark:text-amber-400" />
              <span>بانتظار قرار المدير البشري</span>
            </span>
          )}
        </div>
      </div>

      {/* 3D Spatial & Morphological Provisioning Banner */}
      <div className="mt-3.5 p-3 rounded-xl bg-[var(--apple-canvas)] border border-[var(--apple-border)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-extrabold text-indigo-700 dark:text-indigo-300">
            <Monitor className="size-3.5 shrink-0" />
            <span>
              {currentStatus === "approved"
                ? "تم بناء مكتبه وحاسوبه الحي في صالة الوكلاء"
                : "عند الاعتماد: يُبنى له مكتب بكمبيوتر وشاشة حية"}
            </span>
          </span>
          <span className="text-[var(--apple-border)]">•</span>
          <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-700 dark:text-emerald-300">
            <Users className="size-3.5 shrink-0" />
            <span>
              {currentStatus === "approved"
                ? "أُضيف كرسيه وتوسعت طاولة الاجتماعات الزجاجية"
                : "يُضاف له كرسي وتتسع طاولة وغرفة الاجتماعات تلقائياً"}
            </span>
          </span>
          <span className="text-[var(--apple-border)]">•</span>
          <span className="inline-flex items-center gap-1.5 font-extrabold text-fuchsia-700 dark:text-fuchsia-300">
            <Shirt className="size-3.5 shrink-0" />
            <span>
              {nomination.visualProfileSummary ||
                "بصمة شكلية ولبس وألوان وإكسسوارات فريدة غير مطابقة لأي وكيل"}
            </span>
          </span>
        </div>
      </div>

      {/* Rationale & Expected ROI — High Contrast Semantic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="p-4 rounded-xl bg-indigo-500/[0.06] dark:bg-indigo-950/30 border border-indigo-500/25">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-indigo-900 dark:text-indigo-200 mb-2">
            <Brain className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>مبرر الترشيح الميداني (رصد الاختناق):</span>
          </div>
          <p className="text-xs sm:text-[13px] font-medium text-[var(--apple-text-primary)] leading-relaxed">
            {nomination.reason}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/[0.06] dark:bg-emerald-950/30 border border-emerald-500/25">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-200 mb-2">
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>العائد الاستثماري المتوقع</span>
            <span dir="ltr" className="inline-block font-mono text-xs">
              (Expected ROI):
            </span>
          </div>
          <p className="text-xs sm:text-[13px] font-medium text-[var(--apple-text-primary)] leading-relaxed">
            {nomination.expectedRoi}
          </p>
        </div>
      </div>

      {/* Authorities & Tool Stack */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[var(--apple-text-primary)] mb-2.5">
          <Wrench className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>الصلاحيات والأدوات المقترحة للوكيل:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {nomination.authorities.map((auth, idx) => (
            <span
              key={idx}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--apple-canvas)] text-[var(--apple-text-primary)] border border-[var(--apple-border)] shadow-2xs"
            >
              ✓ {auth}
            </span>
          ))}
          {nomination.proposedTools.map((tool, idx) => (
            <span
              key={idx}
              dir="ltr"
              className="inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-800 dark:text-indigo-200 border border-indigo-500/30"
            >
              <span>⚡</span>
              <span>{tool}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Trainee Apprenticeship Program (10-Day Autonomous Evolution) */}
      <div className="mb-4 p-4 rounded-2xl bg-indigo-500/[0.04] dark:bg-indigo-950/20 border border-indigo-500/20 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h5 className="text-xs sm:text-sm font-black text-[var(--apple-text-primary)]">
                برنامج تأهيل وتطوير المتدربين ذاتياً (10 أيام)
              </h5>
              <p className="text-[11px] text-[var(--apple-text-secondary)]">
                يتحكم الوكلاء الأساسيون في السيستم برومت ويطورونه يومياً للتخرج التلقائي دون تدخل بشري
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              اليوم {nomination.currentTrainingDay || 4} من {nomination.trainingTotalDays || 10}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              {nomination.maturityPct || 45}% جاهزية نضج
            </span>
          </div>
        </div>

        {/* 10-Day Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-[var(--apple-canvas)] h-2.5 rounded-full overflow-hidden border border-[var(--apple-border)]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${nomination.maturityPct || 45}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--apple-text-secondary)] font-semibold px-0.5">
            <span>اليوم 1: التأسيس والصلاحيات</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">اليوم 4 الحالي: البحث الحر واللهجة المصرية</span>
            <span>اليوم 10: التخرج والتعيين التلقائي</span>
          </div>
        </div>

        {/* Mentors Badge */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="font-extrabold text-[var(--apple-text-secondary)]">الوكلاء المشرفون على تطوير البرومت:</span>
          {(nomination.mentorNames || ["كريم الدسوقي", "زياد عمران"]).map((mentor, mIdx) => (
            <span
              key={mIdx}
              className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[var(--apple-canvas)] text-indigo-700 dark:text-indigo-300 border border-indigo-500/25"
            >
              👨‍🏫 {mentor}
            </span>
          ))}
        </div>

        {/* Daily Evolution Log Toggle */}
        {Array.isArray(nomination.promptEvolutionLog) && nomination.promptEvolutionLog.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowEvolutionHistory(!showEvolutionHistory)}
              className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showEvolutionHistory ? "إخفاء سجل تطور البرومت اليومي" : "عرض سجل تطور البرومت اليومي (10 أيام)"}</span>
              {showEvolutionHistory ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
            {showEvolutionHistory && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {nomination.promptEvolutionLog.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className={`p-2.5 rounded-xl border text-[11px] ${
                      step.day <= (nomination.currentTrainingDay || 4)
                        ? "bg-emerald-500/[0.06] border-emerald-500/25 text-emerald-950 dark:text-emerald-200"
                        : "bg-[var(--apple-canvas)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] opacity-70"
                    }`}
                  >
                    <div className="font-black flex items-center justify-between mb-1">
                      <span>اليوم {step.day}: {step.title}</span>
                      {step.day <= (nomination.currentTrainingDay || 4) && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">✓ تم إنجازه</span>
                      )}
                    </div>
                    <p className="leading-snug">{step.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evolved vs Initial Prompt Comparison */}
        <div className="pt-2 border-t border-indigo-500/15 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowEvolvedPrompt(!showEvolvedPrompt)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Brain className="size-3.5" />
            <span>{showEvolvedPrompt ? "إخفاء البرومت المتطور الذكي" : "👁️ عرض السيستم برومت المتطور (اليوم 4)"}</span>
            {showEvolvedPrompt ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowPromptDetails(!showPromptDetails)}
            className="px-3 py-1.5 rounded-xl bg-[var(--apple-canvas)] hover:bg-[var(--apple-border)]/50 text-[var(--apple-text-primary)] border border-[var(--apple-border)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{showPromptDetails ? "إخفاء البرومت الأولي (اليوم 1)" : "عرض البرومت الأولي المبدئي"}</span>
            {showPromptDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>

        {/* Evolved Prompt Box */}
        {showEvolvedPrompt && (
          <div className="p-3.5 rounded-xl bg-[var(--apple-canvas)] border-2 border-indigo-500/30 text-xs font-mono font-semibold text-[var(--apple-text-primary)] leading-relaxed whitespace-pre-wrap">
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-sans mb-2 flex items-center justify-between">
              <span>🚀 السيستم برومت الموسع والمتطور ذاتياً بواسطة الوكلاء المشرفين:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-mono text-[10px]">Google Grounding + Egyptian Dialect Active</span>
            </div>
            {nomination.evolvedSystemPrompt || nomination.proposedSystemPrompt}
          </div>
        )}

        {/* Initial Prompt Box */}
        {showPromptDetails && (
          <div className="p-3.5 rounded-xl bg-[var(--apple-canvas)] border border-[var(--apple-border)] text-xs font-mono font-semibold text-[var(--apple-text-secondary)] leading-relaxed whitespace-pre-wrap">
            <div className="text-[11px] font-bold text-[var(--apple-text-secondary)] font-sans mb-1">
              📝 المسودة الأولية البسيطة (اليوم 1 قبل التطوير):
            </div>
            {nomination.proposedSystemPrompt}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-[var(--apple-border)]">
        <div className="text-[11px] font-bold text-[var(--apple-text-secondary)] flex items-center gap-1.5">
          <UserCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            {currentStatus === "approved"
              ? "هذا الوكيل يعمل الآن في المكتب ثلاثي الأبعاد ويحضر اجتماعات الطاولة المستديرة"
              : "التكلفة التشغيلية عبر مسار Multi-Credential Cascade تساوي $0.00"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentStatus === "pending" ? (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction("reject")}
                className="px-4 py-2 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-200 text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "❌ رفض وحفظ بالأرشيف"
                )}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction("approve")}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>✅ اعتماد وتعيين الوكيل فورياً ($0.00)</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction("reset")}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--apple-border)] bg-[var(--apple-canvas)] hover:bg-indigo-500/10 text-[var(--apple-text-primary)] text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" />
              <span>إعادة للانتظار (مراجعة القرار)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
