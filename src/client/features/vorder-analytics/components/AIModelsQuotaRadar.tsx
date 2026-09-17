import React, { useState, useEffect } from "react";
import {
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRightLeft,
} from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_MODELS, type AIModelOption } from "@/client/features/sam/components/ModelQuotaBadge";

const LOCAL_STORAGE_KEY = "openseo_active_chat_model";

interface AIModelsQuotaRadarProps {
  isRtl?: boolean;
}

export const AIModelsQuotaRadar: React.FC<AIModelsQuotaRadarProps> = ({
  isRtl = true,
}) => {
  const [activeModelId, setActiveModelId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        if (saved === "gemini-2.5-flash-lite" || saved === "gemini-2.0-flash-lite") {
          return "gemini-3.5-flash-lite";
        }
        if (saved === "gemini-2.0-flash") {
          return "gemini-3.5-flash";
        }
        if (saved === "gemini-2.5-flash") {
          return "gemini-3.6-flash";
        }
        if (AVAILABLE_MODELS.some((m) => m.id === saved)) {
          return saved;
        }
      }
    }
    return "gemini-3.5-flash-lite";
  });

  const handleSelectModel = (model: AIModelOption) => {
    setActiveModelId(model.id);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, model.id);
    }
    toast.success(
      isRtl
        ? `✅ تم اعتماد ${model.name} كموديل افتراضي لمحادثات SAM وأدوات التحليل!`
        : `Switched active default model to ${model.name}`,
    );
  };

  return (
    <div
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-5 md:p-6 shadow-sm mb-6"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              {isRtl
                ? "رادار كوتا ونماذج الذكاء الاصطناعي (AI Models Quota Radar)"
                : "AI Models Quota Radar & Failover Guard"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" />
              {isRtl ? "التبديل التلقائي والحماية الذاتية نشطة" : "Circuit Breaker Active"}
            </span>
          </div>
          <h2 className="mt-2.5 text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {isRtl
              ? "مراقبة حدود الاستخدام والتبديل اليدوي بين نماذج Gemini & Antigravity"
              : "Monitor Free Quotas and Select Active AI Model"}
          </h2>
          <p className="mt-1 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">
            {isRtl
              ? "يمكنك التبديل يدوياً بين النماذج بنقرة زر واحدة لتوزيع الأحمال ومضاعفة السرعة. في حالة وصول أي موديل للحدود المسموحة (Rate Limit 429) يقوم النظام بالتحويل الفوري الصامت للبديل المتاح دون انقطاع."
              : "Switch between models anytime to optimize speed and capacity. If any model reaches its rate limit, automatic circuit breaker seamlessly routes turns to the healthiest candidate."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 text-indigo-500" />
            <span>Google AI Studio</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {AVAILABLE_MODELS.map((model) => {
          const isActive = model.id === activeModelId;
          const isWarningModel = model.id === "gemini-3.6-flash";

          return (
            <div
              key={model.id}
              className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isActive
                  ? "border-indigo-500/80 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500/50 shadow-sm"
                  : isWarningModel
                    ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 hover:border-amber-300 dark:hover:border-amber-800"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : isWarningModel
                            ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {model.name}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {isRtl ? "الموديل النشط" : "Active"}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                        {model.tag}
                      </span>
                    </div>
                  </div>

                  {model.recommended && !isActive && (
                    <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {isRtl ? "موصى به" : "Recommended"}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {model.description}
                </p>

                {/* Limits & Quotas Spec Pills */}
                <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3">
                  <div className="rounded-lg bg-white dark:bg-zinc-800/80 p-2 text-center border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">
                      {isRtl ? "حد الدقيقة" : "RPM"}
                    </span>
                    <span className="block text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {model.rpm} RPM
                    </span>
                  </div>

                  <div className="rounded-lg bg-white dark:bg-zinc-800/80 p-2 text-center border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">
                      {isRtl ? "حد اليوم" : "RPD"}
                    </span>
                    <span className="block text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {model.rpd.toLocaleString()} RPD
                    </span>
                  </div>

                  <div className="rounded-lg bg-white dark:bg-zinc-800/80 p-2 text-center border border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">
                      {isRtl ? "السياق" : "TPM"}
                    </span>
                    <span className="block text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {model.tpm}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2">
                {isActive ? (
                  <div className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-950/50 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{isRtl ? "الموديل المعتمد حالياً" : "Currently Active"}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectModel(model)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{isRtl ? "تفعيل هذا الموديل" : "Select Model"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
