import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  Check,
  ChevronDown,
  Cpu,
  Info,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export interface AIModelOption {
  id: string;
  name: string;
  tag: string;
  rpm: number;
  rpd: number;
  tpm: string;
  speed: string;
  badgeClass: string;
  bgClass: string;
  recommended?: boolean;
  description: string;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    tag: "⚡ موصى به للسرعة",
    rpm: 10,
    rpd: 20,
    tpm: "250K",
    speed: "2x أسرع",
    badgeClass: "badge-success text-success-content",
    bgClass: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
    recommended: true,
    description: "أسرع استجابة باستهلاك خفيف للكوتا (10 RPM). مثالي لتحليل الكلمات والمحادثات اليومية.",
  },
  {
    id: "antigravity",
    name: "Antigravity Agents",
    tag: "🚀 أعلى سعة يومية",
    rpm: 60,
    rpd: 100,
    tpm: "100K",
    speed: "12x تدفق",
    badgeClass: "badge-info text-info-content",
    bgClass: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
    recommended: false,
    description: "معدل تدفق فائق (60 طلب/دقيقة و 100 طلب/يوم). مخصص للوكلاء والأتمتة بدون أي انتظار.",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    tag: "🔥 سرعة وسعة متوازنة",
    rpm: 15,
    rpd: 1500,
    tpm: "1M",
    speed: "1.5K يومياً",
    badgeClass: "badge-primary text-primary-content",
    bgClass: "border-primary/30 bg-primary/5 hover:bg-primary/10",
    recommended: false,
    description: "أعلى رصيد مجاني متوازن مع نافذة استيعاب عملاقة حتى 1 مليون توكن.",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    tag: "🧠 تحليلي دقيق",
    rpm: 5,
    rpd: 20,
    tpm: "250K",
    speed: "5 RPM",
    badgeClass: "badge-warning text-warning-content",
    bgClass: "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10",
    recommended: false,
    description: "نموذج تحليلي مكثف. حده 5 RPM، وفي حال بلوغ الحد يتحول النظام تلقائياً للبديل.",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    tag: "✨ استدلالي محدث",
    rpm: 10,
    rpd: 50,
    tpm: "500K",
    speed: "محدث بانتظام",
    badgeClass: "badge-secondary text-secondary-content",
    bgClass: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
    recommended: false,
    description: "نموذج استدلالي محدث بانتظام للتحليلات التنافسية ومراجعات المحتوى المعقد.",
  },
];

const LOCAL_STORAGE_KEY = "openseo_active_chat_model";

export function ModelQuotaBadge({
  sessionId,
  className = "",
}: {
  sessionId?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
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
  const [isSyncing, setIsSyncing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with server session DO
  const syncModelWithServer = useCallback(
    async (modelId: string) => {
      if (!sessionId) return;
      try {
        setIsSyncing(true);
        await fetch(`/agents/sam-chat/${sessionId}/set-model`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: modelId }),
        });
      } catch (err) {
        console.warn("[ModelQuotaBadge] Failed to sync model with server DO:", err);
      } finally {
        setIsSyncing(false);
      }
    },
    [sessionId],
  );

  // Initial sync when sessionId changes
  useEffect(() => {
    if (sessionId && activeModelId) {
      void syncModelWithServer(activeModelId);
    }
  }, [sessionId, activeModelId, syncModelWithServer]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectModel = (model: AIModelOption) => {
    setActiveModelId(model.id);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, model.id);
    }
    void syncModelWithServer(model.id);
    setIsOpen(false);
  };

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === activeModelId) || AVAILABLE_MODELS[0];

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-right ${className}`}
      dir="rtl"
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 rounded-xl border border-base-300 bg-base-100/90 px-3 py-1.5 text-xs font-medium text-base-content shadow-sm transition-all hover:border-primary/40 hover:bg-base-200/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
        title="تغيير نموذج الذكاء الاصطناعي وحدود الاستخدام"
      >
        <span className="relative flex size-2 shrink-0">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              currentModel.id === "gemini-3.6-flash"
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
          />
          <span
            className={`relative inline-flex size-2 rounded-full ${
              currentModel.id === "gemini-3.6-flash"
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
          />
        </span>

        <span className="font-semibold text-base-content flex items-center gap-1.5">
          <Cpu className="size-3.5 text-primary" />
          {currentModel.name}
        </span>

        <span className="rounded-md bg-base-200 px-1.5 py-0.5 text-[11px] font-mono text-base-content/75 border border-base-300/50">
          {currentModel.rpm} RPM | {currentModel.rpd} RPD
        </span>

        <ChevronDown
          className={`size-3 text-base-content/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 sm:w-96 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          {/* Header */}
          <div className="mb-2.5 border-b border-base-200 pb-2 px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-sm text-base-content">
                <Sparkles className="size-4 text-primary" />
                <span>محرك الموديلات والكوتا (AI Models Hub)</span>
              </div>
              <span className="badge badge-xs badge-ghost text-[10px] gap-1 font-mono">
                <ShieldCheck className="size-3 text-emerald-500" />
                Failover نشط
              </span>
            </div>
            <p className="text-[11px] text-base-content/65 mt-0.5 leading-relaxed">
              اختر الموديل يدوياً. إذا وصل أي موديل للحدود يتم التحويل التلقائي الذكي فوراً دون انقطاع.
            </p>
          </div>

          {/* Model Options List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = model.id === currentModel.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelectModel(model)}
                  className={`w-full text-right p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                      : model.bgClass
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base-content text-[13px]">
                        {model.name}
                      </span>
                      {model.recommended && (
                        <span className="badge badge-xs badge-success text-[10px] font-semibold">
                          موصى به
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-base-200/80 px-1.5 py-0.5 text-[10px] font-mono text-base-content/80 border border-base-300/60">
                        {model.rpm} RPM
                      </span>
                      <span className="rounded bg-base-200/80 px-1.5 py-0.5 text-[10px] font-mono text-base-content/80 border border-base-300/60">
                        {model.rpd} RPD
                      </span>
                      {isSelected ? (
                        <div className="size-4 rounded-full bg-primary text-primary-content flex items-center justify-center">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-[11px] text-base-content/75 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-base-content/60 pt-0.5 border-t border-base-content/5">
                    <span className="flex items-center gap-1">
                      <Activity className="size-3 text-primary/70" />
                      سعة التوكن: {model.tpm}
                    </span>
                    <span className="font-medium text-primary">
                      {model.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2.5 pt-2 border-t border-base-200 px-1 flex items-center justify-between text-[10px] text-base-content/60">
            <span className="flex items-center gap-1">
              <Zap className="size-3 text-amber-500" />
              التبديل يحفظ في متصفحك وسيرفر الجلسة
            </span>
            {isSyncing && (
              <span className="text-primary animate-pulse">جاري المزامنة...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
