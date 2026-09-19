import React, { useState, useEffect } from "react";
import { X, Sparkles, Check, Globe, Tag, Compass, FileText, BarChart2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export interface ArticleCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    focusKeyword?: string;
    secondaryKeywords?: string[];
    targetMarket?: string;
    intent?: string;
    category?: string;
    strategicRationale?: string;
    monthlyVolume?: number;
    briefOutline?: string[];
    status?: string;
  };
  onSuccess?: () => void;
  isRtl?: boolean;
}

const MARKET_OPTIONS = [
  "مصر والخليج (B2B & CAPI)",
  "المملكة العربية السعودية 🇸🇦",
  "الإمارات العربية المتحدة 🇦🇪",
  "جمهورية مصر العربية 🇪🇬",
  "الوطن العربي (MENA)",
  "سوق عالمي (International)",
];

const INTENT_OPTIONS = [
  { value: "commercial", label: "تجاري (Commercial Intent - استفسارات الشراء والتعاقد)" },
  { value: "transactional", label: "تحويلي (Transactional - دفع فوري أو تواصل مباشر)" },
  { value: "informational", label: "معلوماتي (Informational - أدلة شاملة وشروحات)" },
  { value: "navigational", label: "ملاحي (Navigational - براند ومقارنات)" },
];

export const ArticleCrudModal: React.FC<ArticleCrudModalProps> = ({
  isOpen,
  onClose,
  projectId,
  mode,
  initialData,
  onSuccess,
  isRtl = true,
}) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [targetMarket, setTargetMarket] = useState(MARKET_OPTIONS[0]);
  const [intent, setIntent] = useState("commercial");
  const [category, setCategory] = useState("سيو وتجارة إلكترونية");
  const [strategicRationale, setStrategicRationale] = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("1200");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setTitle(initialData.title || "");
        setSlug(initialData.slug || "");
        setFocusKeyword(initialData.focusKeyword || "");
        setSecondaryKeywords(
          Array.isArray(initialData.secondaryKeywords)
            ? initialData.secondaryKeywords.join(", ")
            : ""
        );
        setTargetMarket(initialData.targetMarket || MARKET_OPTIONS[0]);
        setIntent(initialData.intent || "commercial");
        setCategory(initialData.category || "سيو وتجارة إلكترونية");
        setStrategicRationale(initialData.strategicRationale || "");
        setMonthlyVolume(String(initialData.monthlyVolume || 1200));
      } else {
        // Create Mode defaults
        setTitle("");
        setSlug("");
        setFocusKeyword("");
        setSecondaryKeywords("");
        setTargetMarket(MARKET_OPTIONS[0]);
        setIntent("commercial");
        setCategory("سيو وتجارة إلكترونية");
        setStrategicRationale("");
        setMonthlyVolume("1200");
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  // Auto slug generation on title change in create mode
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (mode === "create" && !slug) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\u0621-\u064A]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(autoSlug);
    }
    if (mode === "create" && !focusKeyword) {
      setFocusKeyword(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(isRtl ? "يرجى كتابة عنوان المقال" : "Article title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint =
        mode === "create"
          ? "/api/automation/create-custom-article"
          : "/api/automation/update-article";

      const lsiList = secondaryKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        id: initialData?.id,
        projectId,
        title: title.trim(),
        slug: slug.trim(),
        focusKeyword: focusKeyword.trim() || title.trim(),
        primaryKeyword: focusKeyword.trim() || title.trim(),
        secondaryKeywords: lsiList,
        targetMarket,
        intent,
        category,
        strategicRationale:
          strategicRationale.trim() ||
          `مقال استراتيجي مخصص لاقتناص استعلامات ${focusKeyword} في سوق ${targetMarket}`,
        monthlyVolume: Number(monthlyVolume) || 1200,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save article");
      }

      toast.success(
        mode === "create"
          ? isRtl
            ? "تم إنشاء المقال وإضافته لطابور الأتمتة بنجاح 🚀"
            : "Article created & queued successfully!"
          : isRtl
          ? "تم تحديث بيانات المقال بنجاح ✨"
          : "Article updated successfully!"
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl backdrop-blur-3xl bg-white/95 dark:bg-[#18181b]/95 border border-zinc-200/90 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-150"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {mode === "create"
                  ? isRtl
                    ? "إنشاء مقال استراتيجي جديد"
                    : "Create Custom Article"
                  : isRtl
                  ? "تعديل بيانات المقال"
                  : "Edit Article Details"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {mode === "create"
                  ? isRtl
                    ? "إضافة مقال مخصص إلى طابور الأتمتة والاستهداف الذكي"
                    : "Add custom structured article to the autonomous queue"
                  : isRtl
                  ? "تحديث الكلمات المستهدفة، السوق، ونية البحث"
                  : "Update target keyword, market, and search intent"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
              {isRtl ? "عنوان المقال *" : "Article Title *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={isRtl ? "مثال: استراتيجيات تحسين السيو للمتاجر الإلكترونية في 2026" : "e.g. SEO Strategies for Stores in 2026"}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Slug & Monthly Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                {isRtl ? "السلاغ الرابط (Slug)" : "URL Slug"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono text-[11px] text-zinc-400 rtl:right-auto rtl:left-3 ltr:left-3">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="article-slug"
                  dir="ltr"
                  className="w-full pl-14 pr-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                {isRtl ? "حجم البحث الشهري المقدر" : "Est. Monthly Volume"}
              </label>
              <input
                type="number"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(e.target.value)}
                placeholder="1200"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Focus Keyword & LSI Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-indigo-500" />
                <span>{isRtl ? "الكلمة المفتاحية البؤرية" : "Primary Focus Keyword"}</span>
              </label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder={isRtl ? "الكلمة الأساسية" : "Main keyword"}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-purple-500" />
                <span>{isRtl ? "الكلمات الفرعية LSI (مفصولة بفاصلة)" : "LSI Keywords (comma separated)"}</span>
              </label>
              <input
                type="text"
                value={secondaryKeywords}
                onChange={(e) => setSecondaryKeywords(e.target.value)}
                placeholder={isRtl ? "كلمة 1, كلمة 2, كلمة 3" : "keyword 1, keyword 2"}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Market & Intent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                <span>{isRtl ? "السوق المستهدف" : "Target Market"}</span>
              </label>
              <select
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition"
              >
                {MARKET_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-amber-500" />
                <span>{isRtl ? "نية البحث (Search Intent)" : "Search Intent"}</span>
              </label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition"
              >
                {INTENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Strategic Rationale */}
          <div>
            <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <span>{isRtl ? "المبرر الاستراتيجي ومحفز التحويل" : "Strategic Rationale & Conversion Angle"}</span>
            </label>
            <textarea
              rows={2}
              value={strategicRationale}
              onChange={(e) => setStrategicRationale(e.target.value)}
              placeholder={isRtl ? "لماذا نكتب هذا المقال؟ وما هي نقطة التحويل المباشر؟" : "Why are we writing this article and what is the primary CTA?"}
              className="w-full px-3.5 py-2 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold transition cursor-pointer"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Check className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? isRtl
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : mode === "create"
                  ? isRtl
                    ? "إضافة المقال للطابور"
                    : "Add Article to Queue"
                  : isRtl
                  ? "حفظ التعديلات"
                  : "Save Changes"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
