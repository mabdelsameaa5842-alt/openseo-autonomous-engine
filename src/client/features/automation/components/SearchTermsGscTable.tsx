import React, { useState } from "react";
import {
  Search,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Loader2,
  ExternalLink,
  Target,
} from "lucide-react";
import { toast } from "sonner";

export interface GscSearchTerm {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  intent: string;
  targetMarket: string;
  status: "published" | "queued" | "unharvested";
  campaignId: string;
  suggestedSlug: string;
}

interface SearchTermsGscTableProps {
  projectId: string;
  selectedCampaignId: string;
  searchTerms: GscSearchTerm[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function SearchTermsGscTable({
  projectId,
  selectedCampaignId,
  searchTerms,
  isLoading,
  onRefresh,
}: SearchTermsGscTableProps) {
  const [convertingQuery, setConvertingQuery] = useState<string | null>(null);

  const handleConvert = async (item: GscSearchTerm) => {
    setConvertingQuery(item.query);
    try {
      const res = await fetch("/api/automation/gsc-search-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          query: item.query,
          campaignId: selectedCampaignId !== "all" ? selectedCampaignId : item.campaignId,
          targetMarket: item.targetMarket,
          intent: item.intent,
        }),
      });

      if (!res.ok) throw new Error("Failed to convert search term");

      toast.success(`تم تحويل استعلام "${item.query}" فورياً إلى مقال تكتيكي في طابور النشر!`);
      onRefresh();
    } catch (err: any) {
      toast.error(`تعذر تحويل الاستعلام: ${err.message}`);
    } finally {
      setConvertingQuery(null);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#161618] overflow-hidden shadow-sm select-none">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <Search className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>استعلامات بحث كونسول الحقيقية (GSC Harvested Search Terms)</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                {searchTerms.length} استعلام
              </span>
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              كلمات بحث حقيقية أدت لظهور الموقع مع إمكانية تحويل أي استعلام إلى مقال تكتيكي بنقرة واحدة
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] text-zinc-400 dark:text-zinc-500 font-medium">
              <th className="py-3 px-4 text-start">استعلام البحث (Search Query)</th>
              <th className="py-3 px-4 text-start">النقرات (Clicks)</th>
              <th className="py-3 px-4 text-start">الظهور (Impressions)</th>
              <th className="py-3 px-4 text-start">نسبة النقر (CTR)</th>
              <th className="py-3 px-4 text-start">متوسط الترتيب (Pos)</th>
              <th className="py-3 px-4 text-start">نية البحث والسوق</th>
              <th className="py-3 px-4 text-start">الحالة</th>
              <th className="py-3 px-4 text-end">إجراء التحويل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-400">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-[var(--apple-accent)]" />
                  <span>جاري قراءة استعلامات Google Search Console...</span>
                </td>
              </tr>
            ) : searchTerms.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-400">
                  <span>لا توجد استعلامات بحث حالياً</span>
                </td>
              </tr>
            ) : (
              searchTerms.map((term, idx) => {
                const isConverting = convertingQuery === term.query;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Search Query */}
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{term.query}</span>
                        {term.query.includes("واتساب") && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-500/20">
                            High Intent
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {term.clicks}
                    </td>

                    {/* Impressions */}
                    <td className="py-3.5 px-4 font-mono font-bold text-red-500">
                      {term.impressions}
                    </td>

                    {/* CTR */}
                    <td className="py-3.5 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                      {term.ctr.toFixed(1)}%
                    </td>

                    {/* Avg Position */}
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {term.position.toFixed(1)}
                    </td>

                    {/* Intent & Market */}
                    <td className="py-3.5 px-4 text-zinc-500">
                      <div className="flex flex-col text-[11px]">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {term.intent}
                        </span>
                        <span className="text-[10px] text-zinc-400">{term.targetMarket}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {term.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          <span>منشورة</span>
                        </span>
                      ) : term.status === "queued" ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/20 border border-blue-500/20">
                          <Clock className="size-3" />
                          <span>في الطابور</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10">
                          <span>غير مستغلة</span>
                        </span>
                      )}
                    </td>

                    {/* Action: 1-Click Convert */}
                    <td className="py-3.5 px-4 text-end whitespace-nowrap">
                      {term.status === "published" ? (
                        <span className="text-[11px] text-zinc-400">مكتملة الاستهداف</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConvert(term)}
                          disabled={isConverting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-[#97233A] to-[#7F1C2F] hover:from-[#A82741] hover:to-[#8F1F35] shadow-sm shadow-[#97233A]/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          {isConverting ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Zap className="size-3" />
                          )}
                          <span>تحويل لمقال تكتيكي</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
