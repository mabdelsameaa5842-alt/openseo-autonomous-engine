import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
  Search,
  CheckSquare,
  Square,
  FileText,
  Sliders,
  Send,
  Cpu,
} from "lucide-react";
import { useI18n } from "@/client/lib/i18n";
import type { StudioKeyword, GeneratedArticleCluster } from "@/server/features/automation/geminiArticleStudio";

interface AiArticleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}

export function AiArticleGeneratorModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
}: AiArticleGeneratorModalProps) {
  const { t, isRtl } = useI18n();

  // Wizard Steps: 1: Prompt & Harvest, 2: Select Keywords & Pick Article Count, 3: Clusters Preview & Complete
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [prompt, setPrompt] = useState(
    isRtl
      ? "استراتيجيات إعلانات سناب شات وتيك توك وسيو المتاجر الإلكترونية في السعودية لعام 2026"
      : "Snapchat & TikTok Ads strategies with e-commerce SEO in Saudi Arabia 2026"
  );
  const [market, setMarket] = useState("sa");
  const [targetCount, setTargetCount] = useState(250);
  const [harvesting, setHarvesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 State
  const [keywords, setKeywords] = useState<StudioKeyword[]>([]);
  const [selectedKwIndices, setSelectedKwIndices] = useState<Set<number>>(new Set());
  const [articleCount, setArticleCount] = useState(20);
  const [filterQuery, setFilterQuery] = useState("");
  const [clustering, setClustering] = useState(false);

  // Step 3 State
  const [generatedClusters, setGeneratedClusters] = useState<GeneratedArticleCluster[]>([]);
  const [savingQueue, setSavingQueue] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Harvest Keywords via Gemini
  const handleHarvestKeywords = async () => {
    if (!prompt.trim()) {
      setError(isRtl ? "يرجى كتابة فكرة المحتوى أو المجال المطلوب." : "Please enter a topic or prompt.");
      return;
    }

    setHarvesting(true);
    setError(null);

    try {
      const res = await fetch("/api/automation/ai-harvest-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, market, targetCount }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success || !Array.isArray(data.keywords)) {
        throw new Error(data.error || "Failed to harvest keywords.");
      }

      setKeywords(data.keywords);
      // Select all by default
      setSelectedKwIndices(new Set(data.keywords.map((_: any, i: number) => i)));
      setStep(2);
    } catch (err: any) {
      setError(err.message || (isRtl ? "تعذر استدعاء الذكاء الاصطناعي." : "Failed connecting to AI service."));
    } finally {
      setHarvesting(false);
    }
  };

  // Toggle Single Keyword Selection
  const toggleKeyword = (idx: number) => {
    const next = new Set(selectedKwIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedKwIndices(next);
  };

  // Select/Deselect All
  const toggleSelectAll = () => {
    if (selectedKwIndices.size === keywords.length) {
      setSelectedKwIndices(new Set());
    } else {
      setSelectedKwIndices(new Set(keywords.map((_, i) => i)));
    }
  };

  // 2. Cluster Keywords into N Articles
  const handleClusterAndQueue = async () => {
    const selectedList = keywords.filter((_, i) => selectedKwIndices.has(i));
    if (selectedList.length === 0) {
      setError(isRtl ? "يرجى تحديد كلمة مفتاحية واحدة على الأقل." : "Please select at least one keyword.");
      return;
    }

    setClustering(true);
    setError(null);

    try {
      const res = await fetch("/api/automation/ai-cluster-and-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          prompt,
          market,
          articleCount,
          selectedKeywords: selectedList,
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success || !Array.isArray(data.clusters)) {
        throw new Error(data.error || "Failed clustering articles.");
      }

      setGeneratedClusters(data.clusters);
      setSuccessMessage(
        isRtl
          ? `تم بنجاح عنقدة وتوزيع ${data.totalClusters} مقالاً دون تكرار وإدراجها في طابور الأتمتة!`
          : `Successfully clustered and queued ${data.totalClusters} deduplicated articles!`
      );
      setStep(3);
    } catch (err: any) {
      setError(err.message || (isRtl ? "تعذر توزيع المقالات." : "Failed to cluster articles."));
    } finally {
      setClustering(false);
    }
  };

  const filteredKeywords = keywords.filter((k) =>
    k.keyword.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isRtl ? "rtl" : "ltr"}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141416] p-6 shadow-2xl text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Cpu className="h-3.5 w-3.5" />
                {t("studio.badge", "استوديو مقالات الذكاء الاصطناعي (Gemini)")}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {isRtl ? `الخطوة ${step} من 3` : `Step ${step} of 3`}
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold">
              {step === 1 && (isRtl ? "توليد الكلمات المفتاحية بالذكاء الاصطناعي" : "Generate Keyword Universe via AI")}
              {step === 2 && (isRtl ? "تحديد الكلمات وتوزيع المقالات دون تكرار" : "Filter Keywords & Allocate Articles")}
              {step === 3 && (isRtl ? "المعاينة واعتماد طابور النشر" : "Review & Confirm Publication Queue")}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* STEP 1: Prompt & Target Harvest */}
        {step === 1 && (
          <div className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                {isRtl ? "ما هو موضوع أو مجال المقالات المراد توليدها؟" : "What is the topic or scope for the new articles?"}
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isRtl ? "مثال: ميديا باينج وإعلانات سناب شات في السعودية 2026..." : "e.g. B2B Performance SEO & Paid Ads in Saudi Arabia..."}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  {isRtl ? "السوق والجمهور المستهدف:" : "Target Market & Audience:"}
                </label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="sa">🇸🇦 المملكة العربية السعودية والخليج العربي</option>
                  <option value="eg">🇪🇬 مصر والشرق الأوسط</option>
                  <option value="gcc">🌐 الخليج العربي (الإمارات، الكويت، قطر)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  {isRtl ? "عدد الكلمات المفتاحية المستهدفة:" : "Target Keyword Volume:"}
                </label>
                <select
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value={200}>200 كلمة مفتاحية تكتيكية</option>
                  <option value={300}>300 كلمة مفتاحية تكتيكية (مستحسن)</option>
                  <option value={400}>400 كلمة مفتاحية تكتيكية</option>
                  <option value={500}>500 كلمة مفتاحية تكتيكية (تغطية كاملة)</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 space-y-1 text-indigo-700 dark:text-indigo-300">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {isRtl ? "محرك Gemini 2026 للتوسع الدلالي الذاتي" : "Gemini 2026 Semantic Expansion"}
              </div>
              <p className="text-[11px] leading-relaxed">
                {isRtl
                  ? "سيقوم الذكاء الاصطناعي بفحص نية البحث الشرائية (Commercial / Transactional) وتوليد مئات الكلمات المتخصصة لضمان تصدر محركات البحث واقتباسات الذكاء الاصطناعي (GEO)."
                  : "AI will analyze commercial and transactional search intents, generating hundreds of niche keywords for SERP dominance and Generative Engine Optimization (GEO)."}
              </p>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                disabled={harvesting}
                onClick={handleHarvestKeywords}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
              >
                {harvesting ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {isRtl ? "جاري استخراج وتحليل 200-500 كلمة..." : "Harvesting 200-500 keywords..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {isRtl ? "استخراج الكلمات المفتاحية بالـ AI ←" : "Generate Keywords with AI →"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Review Keywords & Select Article Count */}
        {step === 2 && (
          <div className="mt-5 space-y-4 text-xs">
            {/* Allocation Controls */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {isRtl ? "كم مقالاً تريد توليده من هذه الكلمات؟" : "How many articles do you want to generate?"}
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    {isRtl
                      ? "سيتم توزيع الكلمات المختارة على المقالات دون أي تكرار بين مقال وآخر."
                      : "Selected keywords will be evenly distributed with zero overlap."}
                  </p>
                </div>

                {/* Article Count Quick Buttons */}
                <div className="flex items-center gap-1.5">
                  {[10, 20, 30, 40, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setArticleCount(num)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        articleCount === num
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                      }`}
                    >
                      {num} {isRtl ? "مقال" : "articles"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                <div>
                  {isRtl ? "الكلمات المحددة:" : "Selected:"}{" "}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedKwIndices.size} / {keywords.length}
                  </span>
                </div>
                <div>
                  {isRtl ? "معدل الكلمات لكل مقال:" : "Avg keywords per article:"}{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    ~{Math.max(1, Math.floor(selectedKwIndices.size / articleCount))} {isRtl ? "كلمة" : "kws"}
                  </span>
                </div>
              </div>
            </div>

            {/* Keyword Search & Bulk Selection */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-2.5 h-3.5 w-3.5 text-zinc-400`} />
                <input
                  type="text"
                  placeholder={isRtl ? "فلترة في الكلمات المستخرجة..." : "Filter harvested keywords..."}
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className={`w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 ${isRtl ? "pr-8 pl-3" : "pl-8 pr-3"} py-1.5 text-xs text-zinc-900 dark:text-zinc-100`}
                />
              </div>

              <button
                type="button"
                onClick={toggleSelectAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
              >
                {selectedKwIndices.size === keywords.length ? (
                  <>
                    <Square className="h-3.5 w-3.5" />
                    {isRtl ? "إلغاء التحديد" : "Deselect All"}
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3.5 w-3.5" />
                    {isRtl ? "تحديد الكل" : "Select All"}
                  </>
                )}
              </button>
            </div>

            {/* Keywords Table List */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-2 space-y-1">
              {filteredKeywords.map((kw, idx) => {
                const originalIdx = keywords.indexOf(kw);
                const isChecked = selectedKwIndices.has(originalIdx);

                return (
                  <div
                    key={idx}
                    onClick={() => toggleKeyword(originalIdx)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-500/20"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {kw.keyword}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                        {kw.intent}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {kw.monthlyVolume.toLocaleString()} {isRtl ? "بحث" : "searches"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {isRtl ? "→ رجوع للفكرة" : "← Back to Topic"}
              </button>

              <button
                type="button"
                disabled={clustering || selectedKwIndices.size === 0}
                onClick={handleClusterAndQueue}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
              >
                {clustering ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {isRtl ? `جاري توزيع وعنقدة ${articleCount} مقالاً...` : `Clustering ${articleCount} articles...`}
                  </>
                ) : (
                  <>
                    <Layers className="h-3.5 w-3.5" />
                    {isRtl
                      ? `عنقدة وتوزيع ${articleCount} مقالاً دون تكرار ←`
                      : `Cluster & Distribute ${articleCount} Articles →`}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Clusters Preview & Final Insertion */}
        {step === 3 && (
          <div className="mt-5 space-y-4 text-xs">
            {successMessage && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            <div className="text-zinc-500 dark:text-zinc-400">
              {isRtl
                ? "تم إدراج العناقيد الدلالية في طابور الأتمتة السحابي بنجاح، وستقوم دورات Make.com بمزامنتها ونشرها تلقائياً، أو يمكنك نشرها فوراً."
                : "Articles are queued in Cloudflare D1 and will be published via Make.com scheduled cycles or on-demand."}
            </div>

            {/* Clusters List Preview */}
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {generatedClusters.map((c, i) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 text-xs">#{i + 1}</span>
                      <span>{c.articleTitle}</span>
                    </div>
                    <span className="rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {c.intent}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {isRtl ? "الكلمة الأساسية:" : "Primary:"}{" "}
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{c.primaryKeyword}</span>
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {isRtl ? "الكلمات المكملة:" : "Secondary:"}{" "}
                      <span className="text-zinc-700 dark:text-zinc-300">{c.secondaryKeywords.length} kws</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 text-[11px]">
                {isRtl ? "المقالات مجهزة بالكامل ومطابقة لمعايير E-E-A-T." : "E-E-A-T compliant tactical articles."}
              </span>

              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isRtl ? "إتمام وعرض طابور المقالات الآن" : "Done & View Content Queue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
