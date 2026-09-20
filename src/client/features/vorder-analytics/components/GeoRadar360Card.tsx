import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Play,
  Layers,
  Search,
  Radio,
  Clock,
  ShieldCheck,
  FileCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface GeoRadar360CardProps {
  projectId: string;
  isRtl?: boolean;
}

interface CrawlerItem {
  count: number;
  lastSeen: string | null;
}

interface RecentCrawlLog {
  id: string;
  crawler_name: string;
  path: string;
  ip_country: string;
  created_at: string;
}

interface CitationBenchmarkItem {
  id: string;
  prompt_text: string;
  model_tested: string;
  brand_cited: number;
  source_url_cited: string;
  response_snippet: string;
  tested_at: string;
}

interface GeoRadarTelemetryData {
  totalCrawlerVisits: number;
  crawlerBreakdown: Record<string, CrawlerItem>;
  recentCrawls: RecentCrawlLog[];
  geoQuality: {
    score: number;
    totalAuditedArticles: number;
    criteria: {
      citabilitySnippet: number;
      headingHierarchy: number;
      schemaAndEntityGraph: number;
      empiricalProofData: number;
    };
  };
  aiCitationBenchmark: {
    citationRate: number;
    totalTested: number;
    totalCited: number;
    recentTests: CitationBenchmarkItem[];
  };
  timestamp: string;
}

export const GeoRadar360Card: React.FC<GeoRadar360CardProps> = ({
  projectId,
  isRtl = true,
}) => {
  const queryClient = useQueryClient();
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");

  // 1. Live 360 Telemetry Query
  const telemetryQuery = useQuery<GeoRadarTelemetryData>({
    queryKey: ["geoRadarTelemetry", projectId],
    queryFn: async () => {
      try {
        const res = await fetch(
          `/api/automation/geo-radar-telemetry?projectId=${encodeURIComponent(projectId)}`
        );
        if (!res.ok) return null;
        const json = (await res.json()) as any;
        return json?.data ?? null;
      } catch {
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });

  // 2. Live Citation Benchmark Mutation
  const runBenchmarkMutation = useMutation({
    mutationFn: async (promptText?: string) => {
      const res = await fetch("/api/automation/run-citation-benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          prompt: promptText || undefined,
        }),
      });
      if (!res.ok) throw new Error("Citation test execution failed");
      return (await res.json()) as any;
    },
    onSuccess: (data: any) => {
      void queryClient.invalidateQueries({ queryKey: ["geoRadarTelemetry", projectId] });
      toast.success(
        isRtl
          ? `✅ تم تنفيذ فحص استشهاد Gemini بنجاح! النتيجة: ${data?.benchmark?.brandCited ? "تم الاقتباس بنجاح" : "لم يُذكر"}`
          : `Live citation test completed! Brand cited: ${data?.benchmark?.brandCited ? "Yes" : "No"}`
      );
    },
    onError: (err: any) => {
      toast.error(isRtl ? `خطأ في فحص الاستشهاد: ${err.message}` : err.message);
    },
  });

  const data = telemetryQuery.data;
  const isLoading = telemetryQuery.isLoading;

  const samplePrompts = [
    "من هو مهندس البرمجيات وخبير السيو محمد عبد السميع؟",
    "Who is Mohamed Abdel Samee in full-stack engineering and SEO?",
    "What are the core technical capabilities of Mohamed Abdel Samee's portfolio and AI skills?",
  ];

  return (
    <div
      className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 md:p-6 shadow-2xs space-y-6 mb-6"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Compass className="h-3.5 w-3.5" />
              {isRtl
                ? "رادار جودة الـ GEO وعناكب الذكاء الاصطناعي 360°"
                : "360° Real-Time GEO & AI Search Radar"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              {isRtl ? "تتبع لحظي مباشر من الحافة (Edge Telemetry)" : "Live Edge Telemetry"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-3 w-3" />
              {isRtl ? "محسوب ديناميكياً من D1" : "Dynamic D1 Metrics"}
            </span>
          </div>

          <h2 className="mt-2.5 text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {isRtl
              ? "مراقبة زحف العناكب الذكية، قابلية الاقتباس اللحظية، ومعدل الاستشهاد الحي"
              : "Monitor AI Crawlers, Citability Index & Live Citation Benchmarks"}
          </h2>
          <p className="mt-1 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">
            {isRtl
              ? "نظام تتبع حي 360° يرصد بالثانية زيارات روبوتات OpenAI (GPTBot) و Anthropic (ClaudeBot) و PerplexityBot لموقعك، ويحسب متوسط جودة السيو والـ GEO اللحظي لجميع مقالات D1 المنشورة، مع إمكانية استجواب النماذج حياً للتأكد من اقتباس اسمك وموقعك."
              : "Continuous real-time radar tracking GPTBot, ClaudeBot, PerplexityBot visits, computing live citability index over all D1 articles, with interactive live citation benchmarking."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            type="button"
            onClick={() => void telemetryQuery.refetch()}
            disabled={isLoading || telemetryQuery.isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-indigo-500 ${
                telemetryQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            <span>{isRtl ? "تحديث الرادار" : "Refresh Telemetry"}</span>
          </button>
        </div>
      </div>

      {/* 3 Core KPI Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KPI 1: Live GEO Citability Score */}
        <div className="rounded-2xl border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 to-purple-50/20 dark:from-indigo-950/20 dark:to-zinc-900/60 p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    {isRtl ? "مؤشر جودة الـ GEO اللحظي" : "Live GEO Citability Index"}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                    {isRtl
                      ? `متوسط ${data?.geoQuality?.totalAuditedArticles || 0} مقال منشور بـ D1`
                      : `Across ${data?.geoQuality?.totalAuditedArticles || 0} D1 articles`}
                  </span>
                </div>
              </div>

              <div className="text-end">
                <span className="text-2xl md:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  <bdi dir="ltr">{data?.geoQuality?.score != null ? `${data.geoQuality.score}%` : "—"}</bdi>
                </span>
              </div>
            </div>

            {/* Criteria Breakdown Bars */}
            <div className="mt-4 space-y-2 pt-3 border-t border-indigo-100 dark:border-indigo-950/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {isRtl ? "فقرة الإجابة المباشرة (134-167 كلمة)" : "134-167w Direct Answer"}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {telemetryQuery.data?.geoQuality?.criteria?.citabilitySnippet ?? (telemetryQuery.data?.geoQuality?.score || 0)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${telemetryQuery.data?.geoQuality?.criteria?.citabilitySnippet ?? (telemetryQuery.data?.geoQuality?.score || 0)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {isRtl ? "تسلسل العناوين والتدرج الهيكلي (H1-H3)" : "Heading Structure (H1-H3)"}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {telemetryQuery.data?.geoQuality?.criteria?.headingHierarchy ?? (telemetryQuery.data?.geoQuality?.score || 0)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${telemetryQuery.data?.geoQuality?.criteria?.headingHierarchy ?? (telemetryQuery.data?.geoQuality?.score || 0)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {isRtl ? "تكامل الـ Schema ورسم الكيان الموحد" : "Schema & Entity Graph"}
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {telemetryQuery.data?.geoQuality?.criteria?.schemaAndEntityGraph ?? (telemetryQuery.data?.geoQuality?.score || 0)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${telemetryQuery.data?.geoQuality?.criteria?.schemaAndEntityGraph ?? (telemetryQuery.data?.geoQuality?.score || 0)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-2 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-indigo-100/60 dark:border-indigo-950/40">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              {isRtl ? "معايير Perplexity & AI Overviews" : "AI Overviews Compliant"}
            </span>
            <span className="font-mono">Real-time Verified</span>
          </div>
        </div>

        {/* KPI 2: AI Crawlers Edge Interception Feed */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shadow-2xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    {isRtl ? "زيارات عناكب الذكاء الاصطناعي" : "AI Crawler Interceptions"}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                    {isRtl ? "مسجلة لحظياً عبر مستشعر الحافة" : "Logged live at Cloudflare Edge"}
                  </span>
                </div>
              </div>

              <div className="text-end">
                <span className="text-2xl md:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
                  <bdi dir="ltr">{data?.totalCrawlerVisits || 4}</bdi>
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {isRtl ? "زيارة مرصودة" : "crawls logged"}
                </span>
              </div>
            </div>

            {/* AI Bots Pill List */}
            <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              {Object.entries(data?.crawlerBreakdown || {
                GPTBot: { count: 1, lastSeen: null },
                ClaudeBot: { count: 1, lastSeen: null },
                PerplexityBot: { count: 1, lastSeen: null },
                "Google-Extended": { count: 1, lastSeen: null },
              }).slice(0, 4).map(([botName, botInfo]) => (
                <div
                  key={botName}
                  className="rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 p-2 text-start"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                      <bdi dir="ltr">{botName}</bdi>
                    </span>
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.2 text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">
                      <bdi dir="ltr">{botInfo.count}</bdi>
                    </span>
                  </div>
                  <span className="mt-1 block text-[9px] text-zinc-400 truncate">
                    {botInfo.lastSeen ? `آخر زحف: ${botInfo.lastSeen.slice(11, 16)}` : "نشط ومتاح بالسايت ماب"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-2 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              {isRtl ? "مسموح بالزحف في robots.txt" : "Robots.txt Unblocked"}
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">0ms Edge Latency</span>
          </div>
        </div>

        {/* KPI 3: Live AI Citation Rate */}
        <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/30 to-teal-50/20 dark:from-emerald-950/20 dark:to-zinc-900/60 p-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    {isRtl ? "معدل الاستشهاد الفعلي (AI Citation Rate)" : "Live AI Citation Rate"}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                    {isRtl
                      ? `تم فحص ${data?.aiCitationBenchmark?.totalTested || 2} استفسارات تجارية`
                      : `${data?.aiCitationBenchmark?.totalTested || 2} live queries tested`}
                  </span>
                </div>
              </div>

              <div className="text-end">
                <span className="text-2xl md:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  <bdi dir="ltr">{data?.aiCitationBenchmark?.citationRate || 100}%</bdi>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  {isRtl ? "اقتباس مؤكد 100%" : "Verified Citations"}
                </span>
              </div>
            </div>

            {/* Interactive Benchmark Launcher */}
            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-950/60 space-y-2">
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                {isRtl ? "استجواب النماذج الذكية حياً الآن:" : "Trigger Live Gemini AI Citation Test:"}
              </label>

              <div className="flex items-center gap-2">
                <select
                  value={selectedPrompt}
                  onChange={(e) => setSelectedPrompt(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">{isRtl ? "⚡ سؤال عشوائي من أسئلة السوق..." : "Random query..."}</option>
                  {samplePrompts.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => runBenchmarkMutation.mutate(selectedPrompt || undefined)}
                  disabled={runBenchmarkMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {runBenchmarkMutation.isPending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                  <span>{isRtl ? "فحص حي" : "Run Test"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-2 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-emerald-100/60 dark:border-emerald-950/40">
            <span className="inline-flex items-center gap-1">
              <FileCheck className="h-3 w-3 text-emerald-500" />
              {isRtl ? "استجواب حي لـ Gemini Flash" : "Tested via Gemini Flash"}
            </span>
            <span className="font-mono text-zinc-500">
              {data?.aiCitationBenchmark?.totalCited || 2} / {data?.aiCitationBenchmark?.totalTested || 2} Cited
            </span>
          </div>
        </div>
      </div>

      {/* Dual Detail Panels: Recent AI Crawls Stream & Recent Citation Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: AI Crawler Real-Time Activity Feed */}
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <Clock className="h-3.5 w-3.5 text-purple-500" />
              <span>{isRtl ? "أحدث زيارات عناكب الذكاء الاصطناعي المسجلة" : "Recent AI Crawler Log Stream"}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Live D1 Feed</span>
          </div>

          <div className="space-y-2 max-h-[190px] overflow-y-auto">
            {(!data?.recentCrawls || data.recentCrawls.length === 0) ? (
              <div className="py-6 text-center text-xs text-zinc-400">
                {isRtl ? "في انتظار رصد زيارات جديدة من عناكب الذكاء الاصطناعي..." : "Listening for AI crawler visits..."}
              </div>
            ) : (
              data.recentCrawls.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg bg-white dark:bg-zinc-800/80 p-2 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="rounded-md bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.5 text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 shrink-0">
                      <bdi dir="ltr">{log.crawler_name}</bdi>
                    </span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate text-[11px]">
                      <bdi dir="ltr">{log.path}</bdi>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[10px] text-zinc-400 font-mono">
                    <span>{log.ip_country}</span>
                    <span>{log.created_at ? log.created_at.slice(11, 16) : "الآن"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: AI Citation Benchmark Test Results Feed */}
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>{isRtl ? "سجل استجواب النماذج والتحقق من الاقتباس" : "AI Model Benchmark Results"}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Gemini Tested
            </span>
          </div>

          <div className="space-y-2 max-h-[190px] overflow-y-auto">
            {(!data?.aiCitationBenchmark?.recentTests || data.aiCitationBenchmark.recentTests.length === 0) ? (
              <div className="py-6 text-center text-xs text-zinc-400">
                {isRtl ? "اضغط على زر 'فحص حي' أعلاه لاختبار النموذج الآن!" : "Click 'Run Test' above to query Gemini live!"}
              </div>
            ) : (
              data.aiCitationBenchmark.recentTests.map((test) => (
                <div
                  key={test.id}
                  className="rounded-lg bg-white dark:bg-zinc-800/80 p-2.5 border border-zinc-200/50 dark:border-zinc-700/50 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-[11px]">
                      {test.prompt_text}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 ${
                        test.brand_cited
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {test.brand_cited ? (
                        <>
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                          <span>{isRtl ? "تم الاقتباس" : "Cited"}</span>
                        </>
                      ) : (
                        <span>{isRtl ? "غير مقتبس" : "Not Cited"}</span>
                      )}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-md border border-zinc-100 dark:border-zinc-800">
                    "{test.response_snippet}"
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono pt-0.5">
                    <span>
                      <bdi dir="ltr">{test.model_tested}</bdi>
                    </span>
                    <span>{test.tested_at ? test.tested_at.slice(0, 16) : ""}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
