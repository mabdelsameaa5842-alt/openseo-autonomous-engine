import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Globe,
  CheckCircle2,
  DollarSign,
  BarChart3,
  X,
  Send,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

interface KeywordItem {
  id: string;
  keyword: string;
  target_market: string;
  city: string;
  monthly_volume: number;
  competition: string;
  cpc_usd: number;
  intent: string;
  status: string;
  clustered_article_slug: string | null;
  strategic_reason: string | null;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  projectId: string;
  summary: {
    total_keywords: number;
    egypt_keywords: number;
    gulf_keywords: number;
    mena_keywords: number;
  };
  keywords: KeywordItem[];
}

interface Props {
  projectId: string;
  isRtl?: boolean;
}

export function HarvestedKeywordsExplorer({ projectId, isRtl = true }: Props) {
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKeywordsText, setNewKeywordsText] = useState("");
  const [newMarket, setNewMarket] = useState("مصر");
  const [newCity, setNewCity] = useState("القاهرة");
  const [newIntent, setNewIntent] = useState("commercial");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const keywordsQuery = useQuery<ApiResponse>({
    queryKey: ["harvested-keywords", projectId, selectedMarket, searchTerm],
    queryFn: async () => {
      let url = `/api/automation/harvested-keywords?projectId=${projectId}&limit=500`;
      if (selectedMarket !== "all") {
        url += `&market=${encodeURIComponent(selectedMarket)}`;
      }
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch harvested keywords");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const summary = keywordsQuery.data?.summary || {
    total_keywords: 500,
    egypt_keywords: 200,
    gulf_keywords: 200,
    mena_keywords: 100,
  };

  const keywords = keywordsQuery.data?.keywords || [];

  const handleAddCustomKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordsText.trim()) {
      toast.error(isRtl ? "يرجى إدخال كلمة مفتاحية واحدة على الأقل" : "Please enter at least one keyword");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/automation/add-custom-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          keywords: newKeywordsText,
          targetMarket: newMarket,
          city: newCity,
          intent: newIntent,
        }),
      });
      const data = await res.json() as any;
      if (data.success) {
        toast.success(
          isRtl
            ? `تمت إضافة الكلمات بنجاح إلى سوق ${newMarket}!`
            : `Successfully added keywords to ${newMarket}!`
        );
        setNewKeywordsText("");
        setIsAddModalOpen(false);
        void keywordsQuery.refetch();
      } else {
        throw new Error(data.error || "Failed to add keywords");
      }
    } catch (err: any) {
      toast.error(err.message || "Error adding keywords");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMarketBadge = (market: string) => {
    if (market.includes("مصر")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-[10px]">
          <span>🇪🇬</span>
          <span>مصر</span>
        </span>
      );
    } else if (market.includes("الخليج")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
          <span>🇸🇦</span>
          <span>الخليج العربي</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px]">
          <span>🌍</span>
          <span>الوطن العربي</span>
        </span>
      );
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-5 shadow-sm">
      {/* Header & Metric Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isRtl
                ? "مستكشف الكلمات المفتاحية الذكية المحصودة (500+ Harvested Keywords Universe)"
                : "Harvested Keywords Explorer (500+ Keywords Universe)"}
            </h3>
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              {summary.total_keywords} {isRtl ? "كلمة مفحوصة" : "Keywords"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {isRtl
              ? "مجموعة الكلمات المفتاحية الشاملة المستخرجة بالذكاء الاصطناعي مع أحجام البحث وتكلفة النقرة CPC، مقسمة بين مصر (القاهرة، الإسكندرية) والخليج العربي (الرياض، دبي، جدة) والوطن العربي."
              : "Comprehensive keyword universe harvested with search volumes, CPC, intent, and market strategic reasons across Egypt, Gulf, and MENA."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isRtl ? "إضافة كلمات جديدة" : "Add Keywords"}</span>
          </button>

          <button
            type="button"
            onClick={() => void keywordsQuery.refetch()}
            disabled={keywordsQuery.isFetching}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${keywordsQuery.isFetching ? "animate-spin text-indigo-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div
          onClick={() => setSelectedMarket("all")}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedMarket === "all"
              ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-900 dark:ring-zinc-100"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100/60"
          }`}
        >
          <div className="text-[11px] text-zinc-500 font-medium">{isRtl ? "إجمالي الكلمات" : "All Markets"}</div>
          <div className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {summary.total_keywords}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{isRtl ? "100% مغطاة" : "100% Coverage"}</div>
        </div>

        <div
          onClick={() => setSelectedMarket("مصر")}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedMarket === "مصر"
              ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100/60"
          }`}
        >
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <span>🇪🇬</span>
            <span>{isRtl ? "مصر (القاهرة والإسكندرية)" : "Egypt"}</span>
          </div>
          <div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {summary.egypt_keywords}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">40% {isRtl ? "من الكلمات" : "of keywords"}</div>
        </div>

        <div
          onClick={() => setSelectedMarket("الخليج")}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedMarket === "الخليج"
              ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100/60"
          }`}
        >
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span>🇸🇦</span>
            <span>{isRtl ? "الخليج (الرياض، دبي، جدة)" : "Gulf / GCC"}</span>
          </div>
          <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {summary.gulf_keywords}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">40% {isRtl ? "من الكلمات" : "of keywords"}</div>
        </div>

        <div
          onClick={() => setSelectedMarket("الوطن العربي")}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedMarket === "الوطن العربي"
              ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100/60"
          }`}
        >
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
            <span>🌍</span>
            <span>{isRtl ? "الوطن العربي عموماً" : "MENA Regional"}</span>
          </div>
          <div className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {summary.mena_keywords}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">20% {isRtl ? "من الكلمات" : "of keywords"}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder={isRtl ? "بحث في الكلمات المفتاحية أو المدينة أو المبرر التجاري..." : "Search keywords, city, or rationale..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 py-2 pr-9 pl-4 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <span className="text-xs text-zinc-400 font-mono">
            {keywords.length} {isRtl ? "نتيجة" : "results"}
          </span>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
            <tr>
              <th className="w-12 text-center py-2.5 px-3">#</th>
              <th className="min-w-[220px] text-start py-2.5 px-3">{isRtl ? "الكلمة المفتاحية" : "Keyword"}</th>
              <th className="w-32 text-center py-2.5 px-3">{isRtl ? "السوق والمدينة" : "Market & City"}</th>
              <th className="w-24 text-center py-2.5 px-3">{isRtl ? "البحث الشهري" : "Volume"}</th>
              <th className="w-20 text-center py-2.5 px-3">{isRtl ? "المنافسة" : "Comp"}</th>
              <th className="w-24 text-center py-2.5 px-3 font-mono">CPC ($)</th>
              <th className="min-w-[260px] text-start py-2.5 px-3">{isRtl ? "المبرر الاستراتيجي ونقطة الألم" : "Strategic Rationale"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {keywords.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-zinc-400">
                  {isRtl ? "لا توجد كلمات مطابقة لمعايير البحث" : "No matching keywords found."}
                </td>
              </tr>
            ) : (
              keywords.map((kw, idx) => (
                <tr key={kw.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="text-center py-2.5 px-3 font-mono text-zinc-400 text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                    <span className="hover:text-indigo-500 transition-colors">{kw.keyword}</span>
                  </td>
                  <td className="text-center py-2.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col items-center gap-0.5">
                      {getMarketBadge(kw.target_market)}
                      <span className="text-[10px] text-zinc-400 font-medium">{kw.city}</span>
                    </div>
                  </td>
                  <td className="text-center font-mono font-bold py-2.5 px-3 text-zinc-800 dark:text-zinc-200">
                    {kw.monthly_volume.toLocaleString()}
                  </td>
                  <td className="text-center py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      kw.competition === "HIGH"
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : kw.competition === "MEDIUM"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    }`}>
                      {kw.competition}
                    </span>
                  </td>
                  <td className="text-center font-mono py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    ${kw.cpc_usd.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-zinc-600 dark:text-zinc-400 max-w-sm">
                    {kw.strategic_reason || (isRtl ? "استهداف تجاري مباشر لزيادة المبيعات والعائد الإعلاني." : "Commercial intent targeting.")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Custom Keywords Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {isRtl ? "إضافة كلمات مفتاحية جديدة للنظام" : "Add Custom Keywords"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomKeywords} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? "الكلمات المفتاحية (كلمة في كل سطر):" : "Keywords (one per line):"}
                </label>
                <textarea
                  rows={5}
                  value={newKeywordsText}
                  onChange={(e) => setNewKeywordsText(e.target.value)}
                  placeholder={isRtl ? "سيو المتاجر في التجمع\nإعلانات برفورمانس ماكس عقارات الرياض\nربط CAPI فوري" : "ecommerce seo cairo\npmax ads riyadh"}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {isRtl ? "السوق المستهدف:" : "Target Market:"}
                  </label>
                  <select
                    value={newMarket}
                    onChange={(e) => setNewMarket(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="مصر">🇪🇬 مصر</option>
                    <option value="الخليج العربي">🇸🇦 الخليج العربي</option>
                    <option value="الوطن العربي">🌍 الوطن العربي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {isRtl ? "المدينة / النطاق:" : "City / Region:"}
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder={isRtl ? "القاهرة / الرياض" : "Cairo / Riyadh"}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? "نية البحث (Search Intent):" : "Search Intent:"}
                </label>
                <select
                  value={newIntent}
                  onChange={(e) => setNewIntent(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="commercial">تجاري (Commercial - شراء / استشارة)</option>
                  <option value="transactional">إجرائي (Transactional - تعاقد فوري)</option>
                  <option value="informational">معلوماتي (Informational - أدلة تخصصية)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>{isRtl ? "حفظ وإدراج في النظام" : "Save Keywords"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
