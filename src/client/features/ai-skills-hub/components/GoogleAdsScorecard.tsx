import React from "react";
import { MousePointerClick, Eye, Award, Sparkles } from "lucide-react";
import { useI18n } from "@/client/lib/i18n";

export type MetricKey = "clicks" | "impressions" | "position" | "citations";

export interface GoogleAdsMetrics {
  clicks: number;
  impressions: number;
  avgPosition: number;
  ctr: number;
  geoIndexingRate: number;
  adSpend?: number;
}

interface GoogleAdsScorecardProps {
  metrics: GoogleAdsMetrics;
  selectedMetric: MetricKey;
  onSelectMetric: (metric: MetricKey) => void;
  isLoading?: boolean;
}

export function GoogleAdsScorecard({
  metrics,
  selectedMetric,
  onSelectMetric,
  isLoading = false,
}: GoogleAdsScorecardProps) {
  const { language, isRtl } = useI18n();
  const isArabic = language === "ar";

  const cards: Array<{
    key: MetricKey;
    label: string;
    value: string | number;
    subtext?: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    accentBg: string;
    accentBorder: string;
  }> = [
    {
      key: "clicks",
      label: isArabic ? "النقرات العضوية" : "Organic Clicks",
      value: metrics.clicks.toLocaleString(),
      subtext: isArabic ? "زيارات مجانية 100% من محركات البحث" : "100% Free Search Traffic",
      icon: MousePointerClick,
      accentColor: "text-[#97233A] dark:text-[#E15B75]",
      accentBg: "bg-[#97233A]/10 dark:bg-[#B8324D]/20",
      accentBorder: "border-[#97233A]/30 dark:border-[#B8324D]/40",
    },
    {
      key: "impressions",
      label: isArabic ? "مرات الظهور في البحث" : "SERP Impressions",
      value: metrics.impressions.toLocaleString(),
      subtext: isArabic ? `نسبة النقر: ${metrics.ctr.toFixed(1)}%` : `CTR: ${metrics.ctr.toFixed(1)}%`,
      icon: Eye,
      accentColor: "text-blue-600 dark:text-sky-400",
      accentBg: "bg-blue-50 dark:bg-sky-500/10",
      accentBorder: "border-blue-200 dark:border-sky-500/30",
    },
    {
      key: "position",
      label: isArabic ? "متوسط الترتيب" : "Avg. Position",
      value: metrics.avgPosition.toFixed(1),
      subtext: isArabic ? "مستوى تصدر نتائج الصفحة الأولى" : "Top Page SERP Range",
      icon: Award,
      accentColor: "text-amber-600 dark:text-amber-400",
      accentBg: "bg-amber-50 dark:bg-amber-500/10",
      accentBorder: "border-amber-200 dark:border-amber-500/30",
    },
    {
      key: "citations",
      label: isArabic ? "استشهادات الذكاء الاصطناعي GEO" : "GEO AI Citations",
      value: `${metrics.geoIndexingRate.toFixed(1)}%`,
      subtext: isArabic ? "نسبة التغطية والفهرسة اللحظية" : "Live Real-Time Indexing",
      icon: Sparkles,
      accentColor: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-50 dark:bg-emerald-500/10",
      accentBorder: "border-emerald-200 dark:border-emerald-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {cards.map((card) => {
        const isSelected = selectedMetric === card.key;
        const Icon = card.icon;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectMetric(card.key)}
            className={`group text-start p-4.5 rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden relative border bg-[var(--apple-card)] ${
              isSelected
                ? "border-[#97233A] dark:border-[#B8324D] ring-2 ring-[#97233A]/30 dark:ring-[#B8324D]/40 shadow-lg shadow-[#97233A]/10 scale-[1.01]"
                : "border-[var(--apple-border)] hover:border-[var(--apple-border-hover)] hover:shadow-md"
            }`}
          >
            {/* Top row with icon & label */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[var(--apple-text-secondary)] uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`p-1.5 rounded-xl border ${card.accentBg} ${card.accentBorder} ${card.accentColor}`}
              >
                <Icon className="size-4" />
              </div>
            </div>

            {/* Main Value */}
            <div className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--apple-text-primary)] font-sans">
              {isLoading ? (
                <div className="h-9 w-24 rounded-lg bg-[var(--apple-border)] animate-pulse" />
              ) : (
                card.value
              )}
            </div>

            {/* Subtext */}
            {card.subtext && (
              <div className="mt-2 text-xs font-medium text-[var(--apple-text-secondary)] flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${isSelected ? "bg-[#97233A] dark:bg-[#B8324D]" : "bg-zinc-400"}`} />
                <span>{card.subtext}</span>
              </div>
            )}

            {/* Bottom active indicator */}
            {isSelected && (
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#97233A] to-[#6E1729] dark:from-[#B8324D] dark:to-[#97233A]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
