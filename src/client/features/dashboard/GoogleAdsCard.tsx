import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { CardShell, moreDetailsClass, Stat } from "@/client/features/dashboard/cardParts";
import { GoogleAdsConnectionCard } from "@/client/features/google-ads/GoogleAdsConnectionCard";
import {
  getGoogleAdsConnection,
  searchKeywordPlanner,
} from "@/serverFunctions/googleAds";
import { formatCount } from "@/client/features/search-performance/SearchPerformanceColumns";
import { useI18n } from "@/client/lib/i18n";

export function GoogleAdsCard({
  projectId,
}: {
  projectId: string;
}) {
  const { t, isRtl } = useI18n();
  const navigate = useNavigate();
  const [adsQuery, setAdsQuery] = useState("");
  const [plannerQuery, setPlannerQuery] = useState("");

  const connectionQuery = useQuery({
    queryKey: ["googleAdsConnection", projectId],
    queryFn: () => getGoogleAdsConnection({ data: { projectId } }),
  });

  const connection = connectionQuery.data;
  const connected = Boolean(connection?.connected);

  const searchMutation = useMutation({
    mutationFn: (keyword: string) =>
      searchKeywordPlanner({
        data: {
          projectId,
          keywords: [keyword],
        },
      }),
  });

  if (!connected) {
    return (
      <div id="connect-google-ads">
        <GoogleAdsConnectionCard projectId={projectId} />
      </div>
    );
  }

  const handleSearchPlanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerQuery.trim()) return;
    searchMutation.mutate(plannerQuery.trim());
  };

  const handleSearchAds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adsQuery.trim()) return;
    void navigate({
      to: "/p/$projectId/keywords",
      params: { projectId },
      search: { q: adsQuery.trim() },
    });
  };

  const searchedMetric = searchMutation.data?.metrics?.[0];

  return (
    <CardShell
      title={t("card.google_ads.title", "Google Ads & Keyword Planner")}
      subtitle={
        connection?.customerDescriptiveName
          ? `${connection.customerDescriptiveName} (${connection.connectedByEmail || connection.customerId})`
          : t("card.google_ads.subtitle", "Live Keyword Planner lookup")
      }
      action={
        <Link
          to="/p/$projectId/settings/integrations"
          params={{ projectId }}
          hash="google-ads"
          className={moreDetailsClass}
        >
          {isRtl ? "إدارة" : "Manage"}
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full space-y-4">
        <div className="space-y-3 pt-1">
          {/* Input 1: Lookup Ads */}
          <form onSubmit={handleSearchAds} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                className="w-full rounded-full border border-white/10 bg-black/40 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/25"
                placeholder={t("input.lookup_ads", "Lookup Ads")}
                value={adsQuery}
                onChange={(e) => setAdsQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              {t("input.check", "Check")}
            </button>
          </form>

          {/* Input 2: Keyword Planner */}
          <form onSubmit={handleSearchPlanner} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                className="w-full rounded-full border border-white/10 bg-black/40 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/25"
                placeholder={t("input.keyword_planner", "Keyword Planner")}
                value={plannerQuery}
                onChange={(e) => setPlannerQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
              disabled={searchMutation.isPending || !plannerQuery.trim()}
            >
              {searchMutation.isPending ? (isRtl ? "جاري الفحص..." : "Checking...") : t("input.check", "Check")}
            </button>
          </form>
        </div>

        {/* Results / Status Display */}
        {searchedMetric ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
              <span className="text-xs font-medium text-white truncate">
                &ldquo;{searchedMetric.keyword}&rdquo;
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                {searchedMetric.competition}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat
                label={isRtl ? "البحث الشهري" : "Monthly Searches"}
                value={searchedMetric.searchVolume !== null ? formatCount(searchedMetric.searchVolume) : "—"}
              />
              <Stat
                label={isRtl ? "سعر النقرة التقديري" : "Est. CPC"}
                value={searchedMetric.cpc !== null ? `$${searchedMetric.cpc.toFixed(2)}` : "—"}
              />
              <Stat
                label={isRtl ? "مؤشر المنافسة" : "Comp. Index"}
                value={searchedMetric.competitionIndex !== null ? `${Math.round(searchedMetric.competitionIndex * 100)}%` : "—"}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="size-1.5 rounded-full bg-[#30D158]" />
              <span>ID:</span>
              <span className="font-semibold text-white font-mono">
                {connection?.customerId ?? "Connected"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="size-1.5 rounded-full bg-[#30D158]" />
              <span>Account:</span>
              <span className="font-semibold text-[#30D158] font-mono truncate max-w-[140px]">
                {connection?.connectedByEmail ?? "Active"}
              </span>
            </div>
          </div>
        )}
      </div>
    </CardShell>
  );
}
