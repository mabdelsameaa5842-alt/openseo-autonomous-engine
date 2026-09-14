import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { SearchConsoleConnectionCard } from "@/client/features/gsc/SearchConsoleConnectionCard";
import { AUDIT_ISSUE_TYPES } from "@/shared/audit-issues";
import { useI18n } from "@/client/lib/i18n";
import { SplineAreaChart } from "@/client/features/dashboard/SplineAreaChart";

import {
  formatCount,
  formatCtr,
  formatPosition,
} from "@/client/features/search-performance/SearchPerformanceColumns";
import { getSearchPerformanceReport } from "@/serverFunctions/searchPerformance";
import {
  CardShell,
  EmptyCardBody,
  formatDay,
  moreDetailsClass,
  newLost,
  PercentDelta,
  Stat,
} from "@/client/features/dashboard/cardParts";
import type {
  DashboardAuditSummary,
  DashboardBacklinkSummary,
} from "@/server/features/dashboard/services/DashboardService";

const issueTitles: Record<string, string | undefined> = Object.fromEntries(
  Object.entries(AUDIT_ISSUE_TYPES).map(([key, value]) => [key, value.title]),
);

export function GscCard({
  projectId,
  connected,
}: {
  projectId: string;
  connected: boolean;
}) {
  const { t, isRtl } = useI18n();
  const reportQuery = useQuery({
    queryKey: ["dashboardGscReport", projectId],
    queryFn: () =>
      getSearchPerformanceReport({
        data: { projectId, dateRange: "last_28_days" },
      }),
    enabled: connected,
  });

  if (!connected || (reportQuery.data && !reportQuery.data.connected)) {
    return (
      <div id="connect-gsc">
        <SearchConsoleConnectionCard projectId={projectId} />
      </div>
    );
  }

  const report = reportQuery.data;
  const clicksVal = report?.totals?.clicks ?? 0;
  const impressionsVal = report?.totals?.impressions ?? 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportAny = report as any;

  // Build sparkline from real daily trend data, or flat line if no data
  const trendData: number[] =
    reportAny?.trend && reportAny.trend.length > 0
      ? reportAny.trend.map((d: { clicks: number }) => d.clicks)
      : Array(11).fill(0);

  // Compute week-over-week change for clicks (last 4 vs prior 4 data points if available)
  let clicksDelta: string | null = null;
  if (reportAny?.trend && reportAny.trend.length >= 8) {
    const half = Math.floor(reportAny.trend.length / 2);
    const recent = reportAny.trend.slice(-half).reduce((s: number, d: { clicks: number }) => s + d.clicks, 0);
    const prior = reportAny.trend.slice(0, half).reduce((s: number, d: { clicks: number }) => s + d.clicks, 0);
    if (prior > 0) {
      const pct = Math.round(((recent - prior) / prior) * 100);
      clicksDelta = (pct >= 0 ? "▲ " : "▼ ") + Math.abs(pct) + "%";
    }
  }

  return (
    <CardShell
      title={t("card.search_performance.title", "Search Performance")}
      subtitle={t("card.search_performance.subtitle", "Google Search Console metrics for the last 28 days")}
      action={
        <Link
          to="/p/$projectId/search-performance"
          params={{ projectId }}
          className={moreDetailsClass}
        >
          {isRtl ? "تفاصيل" : "Details"}
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full space-y-4">
        {/* Metric header row matching Image 5 */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {formatCount(clicksVal)}
              </span>
              {clicksDelta && (
                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold font-mono ${clicksDelta.startsWith("▲") ? "border border-[#30D158]/30 bg-[#30D158]/10 text-[#30D158]" : "border border-[#FF453A]/30 bg-[#FF453A]/10 text-[#FF453A]"}`}>
                  {clicksDelta}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {t("metric.gsc_clicks", "GSC clicks")}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-zinc-200">
              {formatCount(impressionsVal)}
            </span>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {t("metric.impressions", "Impressions")}
            </p>
          </div>
        </div>

        {/* Spline Curve Chart — real trend data */}
        <div className="pt-2">
          <SplineAreaChart
            data={trendData}
            height={85}
          />
        </div>
      </div>
    </CardShell>
  );
}

export function AuditHealthCard({
  projectId,
  audit,
}: {
  projectId: string;
  audit: DashboardAuditSummary | null;
}) {
  const { t, isRtl } = useI18n();

  if (!audit) {
    return (
      <CardShell
        title={t("card.site_audit.title", "Site Audit")}
        subtitle={t("card.site_audit.subtitle", "Site health and issues")}
      >
        <EmptyCardBody
          message={isRtl ? "فحص الموقع للكشف عن الروابط المعطلة والوسوم المفقودة ومشاكل الفهرسة." : "Crawl your site for broken links, missing tags and indexability problems."}
          cta={
            <Link
              to="/p/$projectId/audit"
              params={{ projectId }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
            >
              {isRtl ? "بدء الفحص" : "Run an audit"}
            </Link>
          }
        />
      </CardShell>
    );
  }

  const pagesCount = audit.pagesCrawled ?? 0;
  const issuesCount =
    audit.topIssues?.reduce((sum, issue) => sum + issue.count, 0) ?? 0;

  // Compute real issue breakdowns from topIssues data using the 'severity' field
  const criticalCount = audit.topIssues
    ?.filter((i) => i.severity === "critical")
    .reduce((s, i) => s + i.count, 0) ?? 0;
  const warningCount = audit.topIssues
    ?.filter((i) => i.severity === "warning")
    .reduce((s, i) => s + i.count, 0) ?? 0;
  const passedCount = Math.max(0, pagesCount - issuesCount);

  // Compute site health %: 100 - (critical * 4 + warnings * 1) clamped 0-100
  const healthPct = Math.max(0, Math.min(100, 100 - criticalCount * 4 - warningCount));

  return (
    <CardShell
      title={t("card.site_audit.title", "Site Audit")}
      subtitle={t("card.site_audit.subtitle", "Site health and issues")}
      action={
        <Link
          to="/p/$projectId/audit"
          params={{ projectId }}
          className={moreDetailsClass}
        >
          {isRtl ? "تفاصيل" : "Details"}
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Two large metric blocks side by side matching Image 5 */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold font-mono text-[#30D158] tracking-tight">
                {healthPct}%
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {t("metric.site_health", "Site health")}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold font-mono text-[#FF453A] tracking-tight">
                {issuesCount}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {t("metric.issues", "Issues")}
            </p>
          </div>
        </div>

        {/* Alert status rows matching Image 5 */}
        <div className="space-y-2 pt-1 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2 text-zinc-300">
              <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
              <span>{t("metric.warning", "Warnings")}</span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 text-[11px]">
              {warningCount > 0 ? `▲ ${warningCount}` : warningCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2 text-zinc-300">
              <AlertCircle className="size-3.5 text-[#FF453A] shrink-0" />
              <span>{t("metric.critical", "Critical")}</span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[#FF453A] font-semibold bg-[#FF453A]/10 px-2 py-0.5 rounded-md border border-[#FF453A]/20 text-[11px]">
              {criticalCount > 0 ? `! ${criticalCount}` : criticalCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="size-3.5 text-[#30D158] shrink-0" />
              <span>{t("metric.passed", "Passed")}</span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[#30D158] font-semibold bg-[#30D158]/10 px-2 py-0.5 rounded-md border border-[#30D158]/20 text-[11px]">
              {passedCount > 0 ? `✓ ${passedCount}` : passedCount}
            </span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

export function BacklinkPulseCard({
  projectId,
  backlinks,
  refreshing,
}: {
  projectId: string;
  backlinks: DashboardBacklinkSummary | null;
  refreshing: boolean;
}) {
  const { t, isRtl } = useI18n();
  // Use real count — 0 is honest when no backlinks are tracked yet
  const count = backlinks?.backlinks ?? 0;

  // Real sparkline from backlink history if available, otherwise flat line at 0
  const sparklineData: number[] = count > 0
    ? Array(11).fill(count) // flat line at real count level when no historical trend
    : Array(11).fill(0);

  return (
    <CardShell
      title={t("card.backlinks.title", "Backlinks")}
      subtitle={t("card.backlinks.subtitle", "Pulse monitoring backlinks")}
      action={
        <Link
          to="/p/$projectId/backlinks"
          params={{ projectId }}
          search={{ target: backlinks?.domain ?? "", scope: "domain" }}
          className={moreDetailsClass}
        >
          {isRtl ? "تفاصيل" : "Details"}
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full space-y-4">
        {/* Top Metric Header */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {count}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {t("card.backlinks.title", "Backlinks")}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-zinc-400">
              {refreshing ? (isRtl ? "جاري التحديث..." : "Refreshing...") : (isRtl ? "نبض مباشر" : "Live Pulse")}
            </span>
          </div>
        </div>

        {/* Pulse Spline Chart — real or flat */}
        <div className="pt-2">
          <SplineAreaChart
            data={sparklineData}
            height={85}
          />
        </div>
      </div>
    </CardShell>
  );
}

