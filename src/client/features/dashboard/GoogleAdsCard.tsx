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
        <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-2.5">
          <div className="flex items-center gap-2">
            <GoogleAdsLogo className="size-5 shrink-0" />
            <div>
              <p className="text-xs font-semibold leading-tight">
                {connected
                  ? connection?.customerDescriptiveName ?? "Connected Account"
                  : "Google Keyword Planner (مخطط الكلمات)"}
              </p>
              <p className="text-[11px] text-base-content/50">
                {connected
                  ? `ID: ${connection?.customerId ?? "Active"}`
                  : "Direct volume & CPC from Google"}
              </p>
            </div>
          </div>
          {connected ? (
            <span className="badge badge-success badge-sm gap-1 text-[11px] font-medium">
              <span className="size-1.5 rounded-full bg-success-content" />
              Connected
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void startGoogleLink("googleAds", window.location.href)}
              className="btn btn-primary btn-xs gap-1.5"
            >
              <GoogleGlyph className="size-3" />
              Connect Ads
            </button>
          )}
        </div>

        {/* Quick Keyword Planner lookup tool */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              className="input input-sm input-bordered w-full pl-8 text-xs"
              placeholder="Search volume & CPC in Keyword Planner…"
              value={queryKeyword}
              onChange={(e) => setQueryKeyword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-neutral btn-sm text-xs"
            disabled={searchMutation.isPending || !queryKeyword.trim()}
          >
            {searchMutation.isPending ? "Checking…" : "Check"}
          </button>
        </form>

        {/* Results / Stats */}
        {searchedMetric ? (
          <div className="rounded-lg border border-base-200 bg-base-100 p-2.5">
            <div className="flex items-center justify-between pb-1.5">
              <span className="text-xs font-medium text-base-content/80 truncate">
                &ldquo;{searchedMetric.keyword}&rdquo;
              </span>
              <span className="badge badge-outline badge-xs">
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
                <span className="flex items-center gap-1 text-[11px] text-success">
                  <Sparkles className="size-3" /> No 403 blocks
                </span>
              }
            />
            <Stat
              label="Source Coverage"
              value="100%"
              sub={<span className="text-[11px] text-base-content/50">Google Ads API</span>}
            />
          </div>
        )}
      </div>
    </CardShell>
  );
}
