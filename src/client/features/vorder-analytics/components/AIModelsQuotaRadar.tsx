import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  AVAILABLE_MODELS,
  MODEL_CATEGORY_PILLS,
  type AIModelOption,
} from "@/client/features/sam/components/ModelQuotaBadge";

const LOCAL_STORAGE_KEY = "openseo_active_chat_model";

interface AIModelsQuotaRadarProps {
  isRtl?: boolean;
}

export const AIModelsQuotaRadar: React.FC<AIModelsQuotaRadarProps> = ({
  isRtl = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);

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

  const activeModel =
    AVAILABLE_MODELS.find((m) => m.id === activeModelId) || AVAILABLE_MODELS[0];

  const handleSelectModel = (model: AIModelOption) => {
    setActiveModelId(model.id);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, model.id);
    }
    setIsOpen(false);
    toast.success(
      isRtl
        ? `✅ تم اعتماد ${model.name} كموديل افتراضي لمحادثات SAM ورادارات التحليل!`
        : `Switched active default model to ${model.name}`,
    );
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-3.5 md:p-4 shadow-2xs transition-all mb-5"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Apple HIG Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        {/* Left / Primary: Active Model Selector Trigger */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Apple Squircle Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-2xs">
            <Cpu className="h-5 w-5" />
          </div>

          {/* Model Title & Pull-down Trigger */}
          <div className="relative">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {isRtl ? "نموذج الذكاء الاصطناعي النشط:" : "Active AI Model:"}
              </span>

              {/* Apple HIG Dropdown Trigger Button */}
              <button
                id="ai-model-selector-trigger-btn"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="group inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/90 dark:bg-zinc-800/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <bdi dir="ltr" className="font-bold text-indigo-600 dark:text-indigo-400">
                  {activeModel.name}
                </bdi>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                  ({activeModel.tag})
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-indigo-500" : ""
                  }`}
                />
              </button>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isRtl ? "نشط" : "Active"}
              </span>
            </div>

            {/* Active Model Specs Strip */}
            <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5">
                <Zap className="h-2.5 w-2.5 text-amber-500" />
                <bdi dir="ltr">{activeModel.rpm} RPM</bdi>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5">
                <Activity className="h-2.5 w-2.5 text-blue-500" />
                <bdi dir="ltr">{activeModel.rpd.toLocaleString()} RPD</bdi>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5">
                <Layers className="h-2.5 w-2.5 text-purple-500" />
                <bdi dir="ltr">{activeModel.tpm} TPM</bdi>
              </span>
            </div>
          </div>
        </div>

        {/* Right / Secondary: Circuit Breaker Status & AI Studio Link */}
        <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/30 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>
              {isRtl ? "الحماية الذاتية والتبديل الصامت مفعل" : "Circuit Breaker Active"}
            </span>
          </div>

          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs"
          >
            <Cpu className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-[11px]">Google AI Studio</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Apple HIG Pull-Down Popover / Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 top-full mt-2 inset-x-2 md:inset-x-auto md:w-[580px] rounded-2xl border border-zinc-200/90 dark:border-zinc-700/90 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
          style={isRtl ? { right: 0 } : { left: 0 }}
        >
          {/* Dropdown Menu Header */}
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>{isRtl ? "فهرس موديلات Google AI Studio (50 نموذج)" : "Google AI Studio Catalog"}</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                {isRtl ? "تبديل فوري في نفس المللي ثانية" : "Sub-ms seamless failover"}
              </span>
            </div>

            {/* Category Filter Pills (Apple HIG Segmented Style) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-2 scrollbar-none">
              {MODEL_CATEGORY_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap transition-colors font-medium cursor-pointer ${
                    selectedCategory === pill.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model Items List */}
          <div className="py-1 space-y-1 max-h-[380px] overflow-y-auto">
            {(selectedCategory === "all"
              ? AVAILABLE_MODELS
              : AVAILABLE_MODELS.filter((m) => m.categoryGroup === selectedCategory)
            ).map((model) => {
              const isActive = model.id === activeModelId;
              const isWarningModel = model.id === "gemini-3.6-flash";

              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelectModel(model)}
                  className={`w-full text-start p-2.5 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isActive
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-500/30 text-indigo-950 dark:text-indigo-100 shadow-2xs"
                      : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 border border-transparent text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : isWarningModel
                            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <Cpu className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          <bdi dir="ltr">{model.name}</bdi>
                        </span>
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                          {model.tag}
                        </span>
                        {model.recommended && (
                          <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {isRtl ? "موصى به" : "Recommended"}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal line-clamp-1">
                        {model.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Metrics & Active Checkmark */}
                  <div className="shrink-0 flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5">
                        <bdi dir="ltr">{model.rpm} RPM</bdi>
                      </span>
                      <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5">
                        <bdi dir="ltr">{model.rpd.toLocaleString()} RPD</bdi>
                      </span>
                    </div>

                    {isActive ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 opacity-40 hover:opacity-100">
                        <ArrowRightLeft className="h-3 w-3 text-zinc-500" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Notice */}
          <div className="mt-1 px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-b-xl flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
            <span>
              {isRtl
                ? "⚡ في حال وصول الموديل لحد 429 يتحول النظام تلقائياً للبديل"
                : "⚡ On 429 rate limit, system seamlessly routes to alternate"}
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Zero Downtime
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
