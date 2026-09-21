import React from "react";

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
  const cards: Array<{
    key: MetricKey;
    label: string;
    value: string | number;
    subtext?: string;
    bgColor: string;
    borderColor: string;
    activeRing: string;
  }> = [
    {
      key: "clicks",
      label: "Clicks:",
      value: metrics.clicks.toLocaleString(),
      bgColor: "bg-[#1E60D5]",
      borderColor: "border-[#2563EB]",
      activeRing: "ring-4 ring-blue-400/40 shadow-xl shadow-blue-600/30 scale-[1.02]",
    },
    {
      key: "impressions",
      label: "Impressions:",
      value:
        metrics.impressions >= 1000
          ? `${metrics.impressions.toLocaleString()}`
          : metrics.impressions.toLocaleString(),
      bgColor: "bg-[#D93829]",
      borderColor: "border-[#DC2626]",
      activeRing: "ring-4 ring-red-400/40 shadow-xl shadow-red-600/30 scale-[1.02]",
    },
    {
      key: "position",
      label: "Avg. Position:",
      value: metrics.avgPosition.toFixed(1),
      subtext: `(CTR: ${metrics.ctr.toFixed(1)}%)`,
      bgColor: "bg-[#D98200]",
      borderColor: "border-[#D97706]",
      activeRing: "ring-4 ring-amber-400/40 shadow-xl shadow-amber-600/30 scale-[1.02]",
    },
    {
      key: "citations",
      label: "GEO AI Citations & Indexing:",
      value: `${metrics.geoIndexingRate.toFixed(1)}%`,
      subtext: "(No Cost - 100% Organic)",
      bgColor: "bg-[#1E8E3E]",
      borderColor: "border-[#16A34A]",
      activeRing: "ring-4 ring-emerald-400/40 shadow-xl shadow-emerald-600/30 scale-[1.02]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {cards.map((card) => {
        const isSelected = selectedMetric === card.key;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectMetric(card.key)}
            className={`group text-start p-5 rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden border text-white ${
              card.bgColor
            } ${card.borderColor} ${
              isSelected ? card.activeRing : "hover:brightness-105 hover:shadow-lg"
            }`}
          >
            {/* Top Label */}
            <div className="text-white/90 text-sm font-medium tracking-tight">
              {card.label}
            </div>

            {/* Main Value */}
            <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight font-sans">
              {isLoading ? (
                <div className="h-10 w-24 rounded-lg bg-white/20 animate-pulse" />
              ) : (
                card.value
              )}
            </div>

            {/* Subtext */}
            {card.subtext && (
              <div className="mt-2 text-white/90 text-xs font-medium">
                {card.subtext}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
