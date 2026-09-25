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
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
  const [currentStatus, setCurrentStatus] = useState<"pending" | "approved" | "rejected">(
    nomination.status || "pending"
  );

  const handleAction = async (action: "approve" | "reject") => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/automation/agent-nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          nominationId: nomination.id,
        }),
      });

      if (!res.ok) throw new Error("فشل إرسال القرار إلى السيرفر");

      const data = (await res.json()) as any;
      const newStatus = action === "approve" ? "approved" : "rejected";
      setCurrentStatus(newStatus);

      if (action === "approve") {
        toast.success(
          `تم بنجاح اعتماد وتعيين "${nomination.agentName}"! تم حفظ ملف الوكيل في GitHub وتفعيله في المنظومة.`
        );
      } else {
        toast.info(`تم أرشفة ترشيح "${nomination.agentName}".`);
      }

      if (onStatusChange && data.nomination) {
        onStatusChange(data.nomination);
      }
    } catch (err: any) {
      toast.error(`خطأ: ${err.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 via-zinc-900/40 to-zinc-950/60 p-5 shadow-lg backdrop-blur-md relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="size-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ترشيح أسبوعي ذكي لوكيل جديد
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                صاحب الترشيح: {nomination.nominatedBy}
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-1 flex items-center gap-2">
              <span>{nomination.agentName}</span>
              <span className="text-xs text-zinc-400 font-normal">({nomination.agentNameEn})</span>
            </h4>
          </div>
        </div>

        {/* Current Status Badge */}
        <div>
          {currentStatus === "approved" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="size-3.5" />
              <span>معتمد ومعيّن في الفريق</span>
            </span>
          )}
          {currentStatus === "rejected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <XCircle className="size-3.5" />
              <span>مؤرشف ومرفوض</span>
            </span>
          )}
          {currentStatus === "pending" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              <ShieldCheck className="size-3.5" />
              <span>بانتظار قرار المدير البشري</span>
            </span>
          )}
        </div>
      </div>

      {/* Rationale & Expected ROI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1.5">
            <Brain className="size-3.5" />
            <span>مبرر الترشيح الميداني (رصد الاختناق):</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {nomination.reason}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1.5">
            <TrendingUp className="size-3.5" />
            <span>العائد الاستثماري المتوقع (Expected ROI):</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {nomination.expectedRoi}
          </p>
        </div>
      </div>

      {/* Authorities & Tool Stack */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2">
          <Wrench className="size-3.5 text-zinc-400" />
          <span>الصلاحيات والأدوات المقترحة:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {nomination.authorities.map((auth, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-200 border border-white/10"
            >
              ✓ {auth}
            </span>
          ))}
          {nomination.proposedTools.map((tool, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-500/20"
            >
              ⚡ {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable System Prompt */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowPromptDetails(!showPromptDetails)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
        >
          <span>{showPromptDetails ? "إخفاء التعليمات البرمجية المقترحة (System Prompt)" : "عرض التعليمات البرمجية المقترحة (System Prompt)"}</span>
          {showPromptDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
        {showPromptDetails && (
          <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-zinc-400 leading-relaxed">
            {nomination.proposedSystemPrompt}
          </div>
        )}
      </div>

      {/* Actions */}
      {currentStatus === "pending" && (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleAction("reject")}
            className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : "❌ رفض وحفظ بالأرشيف"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleAction("approve")}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                <span>✅ اعتماد وتعيين الوكيل فورياً ($0.00)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
