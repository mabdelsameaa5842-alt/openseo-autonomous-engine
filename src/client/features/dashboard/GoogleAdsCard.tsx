import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";
import { CardShell, moreDetailsClass, Stat } from "@/client/features/dashboard/cardParts";
import { GoogleAdsLogo } from "@/client/features/integrations/GoogleProductLogos";
import { GoogleGlyph } from "@/client/features/gsc/GoogleGlyph";
import { startGoogleLink } from "@/client/features/integrations/startGoogleLink";
import {
  getGoogleAdsConnection,
  searchKeywordPlanner,
} from "@/serverFunctions/googleAds";
import { formatCount } from "@/client/features/search-performance/SearchPerformanceColumns";

export function GoogleAdsCard({
  projectId,
}: {
  projectId: string;
}) {
  const [queryKeyword, setQueryKeyword] = useState("");
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryKeyword.trim()) return;
    searchMutation.mutate(queryKeyword.trim());
  };

  const searchedMetric = searchMutation.data?.metrics?.[0];

  return (
    <CardShell
      title="Google Ads & Keyword Planner"
      stamp="Google Ads API · Keyword Planner"
      action={
        <Link
          to="/p/$projectId/settings/integrations"
          params={{ projectId }}
          hash="google-ads"
          className={moreDetailsClass}
        >
          {connected ? "Manage" : "Settings"}
        </Link>
      }
    >
      <div className="space-y-3">
        {/* Header status bar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <GoogleAdsLogo className="size-4 shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-tight">
                {connected
                  ? connection?.customerDescriptiveName ?? "Connected Account"
                  : "Google Keyword Planner (مخطط الكلمات)"}
              </p>
              <p className="text-[11px] font-mono text-zinc-500">
                {connected
                  ? `ID: ${connection?.customerId ?? "Active"}`
                  : "Direct volume & CPC from Google"}
              </p>
            </div>
          </div>
          {connected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#30D158]/30 bg-[#30D158]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#30D158]">
              <span className="size-1.5 rounded-full bg-[#30D158]" />
              Connected
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void startGoogleLink("googleAds", window.location.href)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
            >
              <GoogleGlyph className="size-3" />
              <span>Connect Ads</span>
            </button>
          )}
        </div>

        {/* Quick Keyword Planner lookup tool */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              className="w-full rounded-lg border border-white/10 bg-black/40 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
              placeholder="Search volume & CPC in Keyword Planner…"
              value={queryKeyword}
              onChange={(e) => setQueryKeyword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            disabled={searchMutation.isPending || !queryKeyword.trim()}
          >
            {searchMutation.isPending ? "Checking…" : "Check"}
          </button>
        </form>

        {/* Results / Stats */}
        {searchedMetric ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
              <span className="text-xs font-medium text-white truncate">
                &ldquo;{searchedMetric.keyword}&rdquo;
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                Comp: {searchedMetric.competition}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat
                label="Monthly Searches"
                value={searchedMetric.searchVolume !== null ? formatCount(searchedMetric.searchVolume) : "—"}
              />
              <Stat
                label="Est. CPC"
                value={searchedMetric.cpc !== null ? `$${searchedMetric.cpc.toFixed(2)}` : "—"}
              />
              <Stat
                label="Comp. Index"
                value={searchedMetric.competitionIndex !== null ? `${Math.round(searchedMetric.competitionIndex * 100)}%` : "—"}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Keyword Planner"
              value={connected ? "Ready" : "Available"}
              sub={
                <span className="mt-1 flex items-center gap-1 text-[11px] text-[#30D158]">
                  <Sparkles className="size-3" /> No 403 blocks
                </span>
              }
            />
            <Stat
              label="Source Coverage"
              value="100%"
              sub={<span className="mt-1 block text-[11px] font-mono text-zinc-500">Google Ads API</span>}
            />
          </div>
        )}
      </div>
    </CardShell>
  );
}
