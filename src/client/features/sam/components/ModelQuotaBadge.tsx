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
  categoryGroup?: "flash_lite" | "agents" | "flash_series" | "pro_reasoning" | "gemma_safety" | "live_media";
  description: string;
}

export const MODEL_CATEGORY_PILLS = [
  { id: "all", label: "الكل" },
  { id: "flash_lite", label: "⚡ Flash Lite (500 كوتا)" },
  { id: "agents", label: "🚀 Antigravity (60 RPM)" },
  { id: "flash_series", label: "🔥 سلسلة Flash" },
  { id: "pro_reasoning", label: "👑 Pro الاستدلال" },
  { id: "gemma_safety", label: "🛡️ Gemma (14.4K أمان)" },
  { id: "live_media", label: "🎙️ Live & Embeddings" },
];

export const AVAILABLE_MODELS: AIModelOption[] = [
  // ── 1. Flash Lite & High Capacity (500 RPD) ──
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    tag: "⚡ موصى به للسرعة",
    rpm: 15,
    rpd: 500,
    tpm: "250K",
    speed: "2x أسرع",
    badgeClass: "badge-success text-success-content",
    bgClass: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
    recommended: true,
    categoryGroup: "flash_lite",
    description: "أسرع استجابة مع سعة يومية ضخمة (500 طلب/يوم و 15 RPM). الخيار الافتراضي الأول لتحليل الكلمات وتوليد المقالات.",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    tag: "⚡ البديل الخاطف الأول",
    rpm: 15,
    rpd: 500,
    tpm: "250K",
    speed: "2x أسرع",
    badgeClass: "badge-success text-success-content",
    bgClass: "border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10",
    recommended: true,
    categoryGroup: "flash_lite",
    description: "البديل اللحظي الأول: كوتا 500 طلب يومياً و 15 طلب/دقيقة جاهزة بالكامل لتفادي أي طوابير انتظار.",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    tag: "⚡ فلاش لايت مستقر",
    rpm: 10,
    rpd: 20,
    tpm: "250K",
    speed: "مستقر",
    badgeClass: "badge-emerald text-emerald-content",
    bgClass: "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
    categoryGroup: "flash_lite",
    description: "نسخة مستقرة وخفيفة للأتمتة السريعة واستهلاك الحصص الثانوية.",
  },

  // ── 2. High Flow Autonomous Agents (60 RPM) ──
  {
    id: "antigravity",
    name: "Antigravity Agents",
    tag: "🚀 أعلى تدفق (طلب كل ثانية)",
    rpm: 60,
    rpd: 100,
    tpm: "100K",
    speed: "12x تدفق",
    badgeClass: "badge-info text-info-content",
    bgClass: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
    recommended: true,
    categoryGroup: "agents",
    description: "معدل تدفق استثنائي 60 طلب/دقيقة (طلب كل ثانية) وسعة 100 طلب/يوم، مخصص لوكلاء الأتمتة المتوازيين.",
  },

  // ── 3. Balanced Flash Series (20 RPD) ──
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tag: "🔥 أحدث جيل فلاش",
    rpm: 5,
    rpd: 20,
    tpm: "250K",
    speed: "متوازن",
    badgeClass: "badge-primary text-primary-content",
    bgClass: "border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10",
    categoryGroup: "flash_series",
    description: "أحدث موديل في عائلة فلاش لتوليد المقالات التحليلية ومراجعات المحتوى الدقيقة.",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    tag: "🔥 فلاش تحليلي",
    rpm: 5,
    rpd: 20,
    tpm: "250K",
    speed: "متوازن",
    badgeClass: "badge-primary text-primary-content",
    bgClass: "border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10",
    categoryGroup: "flash_series",
    description: "نموذج تحليلي متوازن للمقارنات التنافسية وبناء العناقيد الدلالية.",
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    tag: "🔥 فلاش الجيل الثالث",
    rpm: 5,
    rpd: 20,
    tpm: "250K",
    speed: "متوازن",
    badgeClass: "badge-primary text-primary-content",
    bgClass: "border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10",
    categoryGroup: "flash_series",
    description: "نموذج فلاش القياسي للأعمال اليومية في تحسين محركات البحث.",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    tag: "🔥 فلاش 3.5 شامل",
    rpm: 5,
    rpd: 20,
    tpm: "250K",
    speed: "متوازن",
    badgeClass: "badge-primary text-primary-content",
    bgClass: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
    categoryGroup: "flash_series",
    description: "نموذج فلاش 3.5 التكتيكي. يدعمه نظام التبديل اللحظي عند بلوغ الـ 5 RPM للقفز الفوري لبديل متوفر.",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    tag: "🧠 تحليلي مكثف",
    rpm: 5,
    rpd: 20,
    tpm: "250K",
    speed: "تحليلي",
    badgeClass: "badge-warning text-warning-content",
    bgClass: "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10",
    categoryGroup: "flash_series",
    description: "نموذج تحليلي مكثف. يبلغ حده 5 RPM، وفي حال استنفاذه يتحول المحرك في نفس المللي ثانية إلى Flash Lite.",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tag: "🔥 فلاش 2.5 كلاسيكي",
    rpm: 5,
    rpd: 20,
    tpm: "250K",
    speed: "كلاسيكي",
    badgeClass: "badge-secondary text-secondary-content",
    bgClass: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
    categoryGroup: "flash_series",
    description: "الجيل 2.5 المستقر من عائلة فلاش للتدقيق وتوليد الميتاداتا.",
  },

  // ── 4. Deep Reasoning & Pro (Dynamic Quota) ──
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tag: "👑 استدلال قيادي Pro",
    rpm: 2,
    rpd: 50,
    tpm: "1M",
    speed: "استدلال عميق",
    badgeClass: "badge-secondary text-secondary-content",
    bgClass: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
    categoryGroup: "pro_reasoning",
    description: "أقوى نماذج الاستدلال المنطقي والتخطيط الاستراتيجي لحملات السيو المعقدة ونافذة 1 مليون توكن.",
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    tag: "👑 استدلال فلسفي Pro",
    rpm: 2,
    rpd: 50,
    tpm: "1M",
    speed: "استدلال فائق",
    badgeClass: "badge-secondary text-secondary-content",
    bgClass: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
    categoryGroup: "pro_reasoning",
    description: "الجيل الأحدث من Pro لصياغة الدراسات والتقارير التنفيذية المعمقة بدقة غير مسبوقة.",
  },
  {
    id: "deep-research-pro-preview",
    name: "Deep Research Pro",
    tag: "🔬 بحث أكاديمي عميق",
    rpm: 5,
    rpd: 20,
    tpm: "1M",
    speed: "بحث مكثف",
    badgeClass: "badge-accent text-accent-content",
    bgClass: "border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10",
    categoryGroup: "pro_reasoning",
    description: "نموذج الأبحاث الأكاديمية العميقة واستقصاء المنافسين الشامل عبر الويب.",
  },
  {
    id: "computer-use-preview",
    name: "Computer Use Agent",
    tag: "💻 تفاعل مع الواجهات",
    rpm: 5,
    rpd: 20,
    tpm: "500K",
    speed: "تفاعلي",
    badgeClass: "badge-accent text-accent-content",
    bgClass: "border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10",
    categoryGroup: "pro_reasoning",
    description: "وكيل التفاعل مع واجهات الويب وتصفح المواقع وقراءة الشاشات برمجياً.",
  },

  // ── 5. Astronomical Safety Net (Gemma - 14,400 RPD) ──
  {
    id: "gemma-4-26b",
    name: "Gemma 4 26B",
    tag: "🛡️ صمام الأمان الفلكي (14.4K)",
    rpm: 30,
    rpd: 14400,
    tpm: "16K",
    speed: "30 RPM",
    badgeClass: "badge-success text-success-content",
    bgClass: "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15",
    categoryGroup: "gemma_safety",
    description: "صمام الأمان الفلكي: 14,400 طلب يومياً و 30 طلب/دقيقة يضمن استحالة توقف المنظومة حتى لو استنفدت كل فلاش.",
  },
  {
    id: "gemma-4-31b",
    name: "Gemma 4 31B",
    tag: "🛡️ صمام الأمان الأقصى (14.4K)",
    rpm: 30,
    rpd: 14400,
    tpm: "16K",
    speed: "30 RPM",
    badgeClass: "badge-success text-success-content",
    bgClass: "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15",
    categoryGroup: "gemma_safety",
    description: "الاحتياطي النهائي الأكبر (31B بارامتر) بسعة 14,400 طلب يومياً لدعم المهام الضخمة بلا أي انقطاع.",
  },

  // ── 6. Live API & Embeddings ──
  {
    id: "gemini-2.5-flash-native-audio",
    name: "Gemini 2.5 Flash Native Audio",
    tag: "🎙️ تدفق صوتي حي",
    rpm: 999,
    rpd: 99999,
    tpm: "500K",
    speed: "مباشر فوري",
    badgeClass: "badge-info text-info-content",
    bgClass: "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10",
    categoryGroup: "live_media",
    description: "واجهة البث الصوتي التفاعلي الحي ثنائي الاتجاه بدون حدود RPM/RPD تقليدية.",
  },
  {
    id: "gemini-3-flash-live",
    name: "Gemini 3 Flash Live",
    tag: "🎙️ محادثات حية Live Dialog",
    rpm: 999,
    rpd: 99999,
    tpm: "500K",
    speed: "مباشر فوري",
    badgeClass: "badge-info text-info-content",
    bgClass: "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10",
    categoryGroup: "live_media",
    description: "تفاعل حي منخفض الكمون للحوارات الصوتية والأوامر المباشرة للمكتب الافتراضي.",
  },
  {
    id: "gemini-3.8-live-extended-thinking",
    name: "Gemini 3.8 Live Thinking",
    tag: "🎙️ تفكير صوتي حي",
    rpm: 999,
    rpd: 99999,
    tpm: "500K",
    speed: "مباشر استدلالي",
    badgeClass: "badge-info text-info-content",
    bgClass: "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10",
    categoryGroup: "live_media",
    description: "تفكير واستدلال حي موسع أثناء البث الصوتي المباشر للمكالمات والاجتماعات.",
  },
  {
    id: "gemini-embedding-1",
    name: "Gemini Embedding 1",
    tag: "📐 تضمين دلالي (1000/يوم)",
    rpm: 100,
    rpd: 1000,
    tpm: "100K",
    speed: "100 RPM",
    badgeClass: "badge-neutral text-neutral-content",
    bgClass: "border-slate-500/30 bg-slate-500/5 hover:bg-slate-500/10",
    categoryGroup: "live_media",
    description: "تحويل النصوص إلى متجهات دلالية لبناء عناقيد الكلمات وحساب التشابه الدلالي لـ 485 مصطلحاً.",
  },
  {
    id: "gemini-embedding-2",
    name: "Gemini Embedding 2",
    tag: "📐 تضمين متقدم (1000/يوم)",
    rpm: 100,
    rpd: 1000,
    tpm: "100K",
    speed: "100 RPM",
    badgeClass: "badge-neutral text-neutral-content",
    bgClass: "border-slate-500/30 bg-slate-500/5 hover:bg-slate-500/10",
    categoryGroup: "live_media",
    description: "تضمين دلالي فائق الأبعاد للبحث المتجهي وقواعد بيانات الفهرسة الدلالية.",
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1.5 pt-2 scrollbar-none">
              {MODEL_CATEGORY_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap transition-colors font-medium cursor-pointer ${
                    selectedCategory === pill.id
                      ? "bg-primary text-primary-content shadow-xs"
                      : "bg-base-200/80 text-base-content/70 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model Options List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5">
            {(selectedCategory === "all"
              ? AVAILABLE_MODELS
              : AVAILABLE_MODELS.filter((m) => m.categoryGroup === selectedCategory)
            ).map((model) => {
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
