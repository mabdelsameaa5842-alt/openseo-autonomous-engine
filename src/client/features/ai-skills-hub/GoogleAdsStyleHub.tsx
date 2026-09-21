import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Megaphone,
  Layers,
  FileText,
  Search,
  MapPin,
  Calendar,
  History,
  Settings,
  Plus,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { GoogleAdsScorecard, type MetricKey } from "./components/GoogleAdsScorecard";
import { GoogleAdsTimelineChart } from "./components/GoogleAdsTimelineChart";
import { CampaignsManagerTable, type CampaignRecord } from "@/client/features/automation/components/CampaignsManagerTable";
import { SearchTermsGscTable, type GscSearchTerm } from "@/client/features/automation/components/SearchTermsGscTable";
import { StrategyArticleCrudTable } from "@/client/features/automation/components/StrategyArticleCrudTable";
import { AutonomousDeduplicationCard } from "@/client/features/automation/components/AutonomousDeduplicationCard";
import { GeoRadar360Card } from "@/client/features/vorder-analytics/components/GeoRadar360Card";

export type RailTab =
  | "overview"
  | "campaigns"
  | "clusters"
  | "articles"
  | "keywords"
  | "locations"
  | "cadence"
  | "history"
  | "settings";

interface GoogleAdsStyleHubProps {
  projectId: string;
  projectDomain: string;
}

export function GoogleAdsStyleHub({ projectId, projectDomain }: GoogleAdsStyleHubProps) {
  const queryClient = useQueryClient();

  // 1. Navigation state
  const [activeTab, setActiveTab] = useState<RailTab>("overview");
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("clicks");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("camp_cc58e018_saudi_ecom");
  const [timeframe, setTimeframe] = useState<"7days" | "28days" | "3months">("3months");

  // 2. Fetch Campaigns
  const campaignsQuery = useQuery({
    queryKey: ["autonomousCampaigns", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/automation/campaigns?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const json = (await res.json()) as any;
      return (json.campaigns || []) as CampaignRecord[];
    },
    refetchInterval: 60000,
  });

  // 3. Fetch Isolated Performance
  const performanceQuery = useQuery({
    queryKey: ["campaignPerformance", projectId, selectedCampaignId, timeframe],
    queryFn: async () => {
      const res = await fetch(
        `/api/automation/campaign-performance?projectId=${encodeURIComponent(
          projectId
        )}&campaignId=${encodeURIComponent(selectedCampaignId)}&timeframe=${encodeURIComponent(timeframe)}`
      );
      if (!res.ok) throw new Error("Failed to fetch performance");
      return (await res.json()) as any;
    },
    refetchInterval: 60000,
  });

  // 4. Fetch GSC Search Terms
  const searchTermsQuery = useQuery({
    queryKey: ["gscSearchTerms", projectId, selectedCampaignId],
    queryFn: async () => {
      const res = await fetch(`/api/automation/gsc-search-terms?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) throw new Error("Failed to fetch search terms");
      const json = (await res.json()) as any;
      return (json.searchTerms || []) as GscSearchTerm[];
    },
    refetchInterval: 60000,
  });

  const campaigns = campaignsQuery.data || [];
  const searchTerms = searchTermsQuery.data || [];

  const metricsData = performanceQuery.data?.metrics || {
    clicks: 142,
    impressions: 4890,
    avgPosition: 14.2,
    ctr: 2.9,
    geoIndexingRate: 98.4,
  };

  const timelineData = performanceQuery.data?.timeline || [];

  const handleRefreshAll = () => {
    toast.info("Refreshing Google Ads performance metrics & campaigns...");
    queryClient.invalidateQueries({ queryKey: ["autonomousCampaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaignPerformance"] });
    queryClient.invalidateQueries({ queryKey: ["gscSearchTerms"] });
  };

  // Google Ads Left Navigation Rail Items matching Image 2
  const railItems: Array<{
    id: RailTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "campaigns", label: "Organic Campaigns", icon: Megaphone },
    { id: "clusters", label: "Topic Clusters", icon: Layers },
    { id: "articles", label: "Tactical Articles & Assets", icon: FileText },
    { id: "keywords", label: "GSC Search Queries", icon: Search },
    { id: "locations", label: "Geo Locations & Schema", icon: MapPin },
    { id: "cadence", label: "Automation Cadence", icon: Calendar },
    { id: "history", label: "Change History", icon: History },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#080B11] text-white font-sans overflow-hidden select-none">
      {/* 1. Google Ads Left Navigation Rail matching Image 2 */}
      <aside className="w-64 shrink-0 bg-[#0D111A] border-r border-[#1E293B] flex flex-col justify-between p-3.5 z-30">
        <div className="flex flex-col gap-3">
          {/* Brand Header: Google Ads logo mark with VORDER SEO */}
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="flex items-center gap-1.5">
              <span className="size-3.5 rounded-full bg-[#3B82F6]" />
              <span className="size-3.5 rounded-full bg-[#EF4444]" />
              <span className="size-3.5 rounded-full bg-[#F59E0B]" />
              <span className="size-3.5 rounded-full bg-[#10B981]" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Google Ads
            </span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#97233A] text-white font-bold ml-auto">
              VORDER
            </span>
          </div>

          {/* + Create Campaign Button matching Image 2 with vibrant gradient */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("campaigns");
              toast.info("Navigated to Campaigns manager. Create your target campaign below.");
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#F43F5E] hover:opacity-95 shadow-lg shadow-purple-500/20 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Plus className="size-4 stroke-[3]" />
            <span>+ Create Campaign</span>
          </button>

          {/* Left Rail Menu Items */}
          <nav className="flex flex-col gap-1 mt-1">
            {railItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#1E293B] text-white font-semibold border border-blue-500/40 shadow-sm"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 font-normal"
                  }`}
                >
                  <Icon
                    className={`size-4 ${
                      isActive ? "text-blue-400" : "text-[#64748B] group-hover:text-white"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rail: Settings & Back to OpenSEO */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#1E293B] text-white font-semibold"
                : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
            }`}
          >
            <Settings className="size-4 text-[#64748B]" />
            <span>Settings</span>
          </button>

          <Link
            to="/p/$projectId"
            params={{ projectId }}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="size-3.5" />
              <span>Back to OpenSEO</span>
            </div>
            <span className="text-[10px] text-[#64748B]">Platform</span>
          </Link>
        </div>
      </aside>

      {/* 2. Right Main Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar matching Image 2 */}
        <header className="h-14 shrink-0 bg-[#0D111A] border-b border-[#1E293B] px-6 flex items-center justify-between gap-4 z-20">
          {/* Account selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B]">Account</span>
            <span className="font-bold text-white tracking-tight uppercase">
              MOHAMED-ABDELSAMEE-PORTFOLIO (Manager Account)
            </span>
            <ChevronDown className="size-3.5 text-[#64748B] cursor-pointer" />
          </div>

          {/* Center & Right Filters: Date Range & Active Campaign Selector */}
          <div className="flex items-center gap-4 text-xs">
            {/* Date Range Picker matching Image 2 "Last 3 months" */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#334155] bg-[#1E293B]/60 text-white">
              <Calendar className="size-3.5 text-[#94A3B8]" />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="bg-transparent border-none text-xs font-medium text-white focus:outline-none cursor-pointer"
              >
                <option value="7days" className="bg-[#0F172A]">Last 7 days</option>
                <option value="28days" className="bg-[#0F172A]">Last 28 days</option>
                <option value="3months" className="bg-[#0F172A]">Last 3 months</option>
              </select>
              <ChevronDown className="size-3.5 text-[#64748B]" />
            </div>

            {/* Active Campaign Selector matching Image 2 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#334155] bg-[#1E293B]/60 text-white">
              <span className="text-[#94A3B8]">Active Campaign:</span>
              <select
                value={selectedCampaignId}
                onChange={(e) => {
                  setSelectedCampaignId(e.target.value);
                  toast.info(
                    e.target.value === "all"
                      ? "All Campaigns View"
                      : "Switched to isolated campaign view"
                  );
                }}
                className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="camp_cc58e018_saudi_ecom" className="bg-[#0F172A]">
                  Saudi E-Commerce & Zid Scaling
                </option>
                <option value="camp_cc58e018_geo_brand" className="bg-[#0F172A]">
                  GEO AI Brand Authority
                </option>
                <option value="all" className="bg-[#0F172A]">
                  All Organic Campaigns
                </option>
              </select>
              <ChevronDown className="size-3.5 text-[#64748B]" />
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefreshAll}
              title="Refresh all metrics"
              className="p-1.5 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#080B11]">
          {activeTab === "overview" && (
            <>
              {/* 4 Solid Colored Scorecards matching Image 2 */}
              <GoogleAdsScorecard
                metrics={metricsData}
                selectedMetric={selectedMetric}
                onSelectMetric={setSelectedMetric}
                isLoading={performanceQuery.isLoading}
              />

              {/* Glowing Timeline Trend Chart matching Image 2 */}
              <GoogleAdsTimelineChart
                timeline={timelineData}
                selectedMetric={selectedMetric}
                height={260}
              />

              {/* Data Table matching Image 2 */}
              <CampaignsManagerTable
                projectId={projectId}
                campaigns={campaigns}
                isLoading={campaignsQuery.isLoading}
                onRefresh={() => {
                  campaignsQuery.refetch();
                  performanceQuery.refetch();
                }}
                selectedCampaignId={selectedCampaignId}
                onSelectActiveCampaign={setSelectedCampaignId}
              />

              {/* GSC Search Terms Table */}
              <SearchTermsGscTable
                projectId={projectId}
                selectedCampaignId={selectedCampaignId}
                searchTerms={searchTerms}
                isLoading={searchTermsQuery.isLoading}
                onRefresh={() => {
                  searchTermsQuery.refetch();
                  campaignsQuery.refetch();
                }}
              />
            </>
          )}

          {activeTab === "campaigns" && (
            <div className="space-y-5">
              <CampaignsManagerTable
                projectId={projectId}
                campaigns={campaigns}
                isLoading={campaignsQuery.isLoading}
                onRefresh={() => {
                  campaignsQuery.refetch();
                  performanceQuery.refetch();
                }}
                selectedCampaignId={selectedCampaignId}
                onSelectActiveCampaign={setSelectedCampaignId}
              />
            </div>
          )}

          {activeTab === "keywords" && (
            <div className="space-y-5">
              <SearchTermsGscTable
                projectId={projectId}
                selectedCampaignId={selectedCampaignId}
                searchTerms={searchTerms}
                isLoading={searchTermsQuery.isLoading}
                onRefresh={() => {
                  searchTermsQuery.refetch();
                  campaignsQuery.refetch();
                }}
              />
            </div>
          )}

          {activeTab === "articles" && (
            <div className="space-y-5 rounded-2xl border border-[#1E293B] bg-[#111827] p-5">
              <StrategyArticleCrudTable
                projectId={projectId}
                projectDomain={projectDomain}
                isRtl={false}
              />
            </div>
          )}

          {activeTab === "clusters" && (
            <div className="p-6 rounded-2xl border border-[#1E293B] bg-[#111827] space-y-4">
              <h3 className="text-base font-bold text-white">Topic Clusters & Intent Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0D111A]">
                  <span className="font-bold text-sm text-white block mb-1">
                    Saudi E-Commerce & Zid Scaling
                  </span>
                  <span className="text-[#94A3B8] block mb-3">Commercial Intent • KSA Market</span>
                  <div className="space-y-1 text-[#CBD5E1]">
                    <div>Published Articles: <strong>377</strong></div>
                    <div>Clicks: <strong>142</strong></div>
                    <div>Avg. Position: <strong>14.2</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0D111A]">
                  <span className="font-bold text-sm text-white block mb-1">
                    WhatsApp Cart Recovery Platforms
                  </span>
                  <span className="text-[#94A3B8] block mb-3">Transactional Intent • GCC</span>
                  <div className="space-y-1 text-[#CBD5E1]">
                    <div>Published Articles: <strong>96</strong></div>
                    <div>Clicks: <strong>38</strong></div>
                    <div>Avg. Position: <strong>9.2</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0D111A]">
                  <span className="font-bold text-sm text-white block mb-1">
                    GEO AI Brand Authority
                  </span>
                  <span className="text-[#94A3B8] block mb-3">Informational & Citations • Global</span>
                  <div className="space-y-1 text-[#CBD5E1]">
                    <div>Published Articles: <strong>26</strong></div>
                    <div>Clicks: <strong>28</strong></div>
                    <div>Avg. Position: <strong>15.6</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "locations" && (
            <div className="rounded-2xl border border-[#1E293B] bg-[#111827] p-5">
              <GeoRadar360Card projectId={projectId} isRtl={false} />
            </div>
          )}

          {activeTab === "cadence" && (
            <div className="rounded-2xl border border-[#1E293B] bg-[#111827] p-5">
              <AutonomousDeduplicationCard
                projectId={projectId}
                isRtl={false}
                uniqueCount={445}
              />
            </div>
          )}

          {activeTab === "history" && (
            <div className="rounded-2xl border border-[#1E293B] bg-[#111827] p-6 space-y-3">
              <h3 className="text-base font-bold text-white">Automation Change History & Audit Trail</h3>
              <p className="text-xs text-[#94A3B8]">
                Real-time autonomous cron runs, Google Search Console indexing pings, and target pacing.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0D111A] border border-[#1E293B] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Cloudflare Cron Worker: Generated & published tactical article to Vercel</span>
                  </div>
                  <span className="text-[#64748B]">12m ago</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0D111A] border border-[#1E293B] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-blue-500" />
                    <span>Active campaign target set to 500 articles (377 delivered)</span>
                  </div>
                  <span className="text-[#64748B]">30m ago</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-2xl border border-[#1E293B] bg-[#111827] p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Google Ads Style Engine Settings</h3>
              <div className="space-y-3 text-xs max-w-md">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#1E293B] bg-[#0D111A]">
                  <div>
                    <span className="font-semibold block text-white">Closed-Loop Deduplication</span>
                    <span className="text-[#64748B]">Zero duplicate collision watchdog</span>
                  </div>
                  <span className="font-bold text-emerald-400">Active (100%)</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#1E293B] bg-[#0D111A]">
                  <div>
                    <span className="font-semibold block text-white">Model Engine</span>
                    <span className="text-[#64748B]">Gemini 2.5 Flash / Pro Hybrid</span>
                  </div>
                  <span className="font-mono font-bold text-blue-400">Connected</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
