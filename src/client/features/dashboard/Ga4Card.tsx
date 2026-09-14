import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CardShell,
  moreDetailsClass,
} from "@/client/features/dashboard/cardParts";
import { Ga4ConnectCard } from "@/client/features/dashboard/Ga4ConnectCard";
import {
  formatCount,
} from "@/client/features/search-performance/SearchPerformanceColumns";
import { getGa4DashboardReport } from "@/serverFunctions/ga4";
import { useI18n } from "@/client/lib/i18n";
import { SplineAreaChart } from "@/client/features/dashboard/SplineAreaChart";

export function Ga4Card({
  projectId,
  connected,
}: {
  projectId: string;
  connected: boolean;
}) {
  const { t, isRtl } = useI18n();
  const reportQuery = useQuery({
    queryKey: ["dashboardGa4Report", projectId],
    queryFn: () => getGa4DashboardReport({ data: { projectId } }),
    enabled: connected,
  });

  if (!connected || (reportQuery.data && !reportQuery.data.connected)) {
    return <Ga4ConnectCard projectId={projectId} connected={connected} />;
  }

  const report = reportQuery.data;
  const sessionsVal = report?.totals?.sessions ?? 0;
  const activeUsersVal = report?.totals?.activeUsers ?? 0;

  const trendData =
    report?.trend && report.trend.length > 3
      ? report.trend.map((t) => t.sessions || 0)
      : Array(11).fill(0);

  // Compute week-over-week sessions delta
  let sessionsDelta: string | null = null;
  if (report?.trend && report.trend.length >= 8) {
    const half = Math.floor(report.trend.length / 2);
    const recent = report.trend.slice(-half).reduce((s, d) => s + (d.sessions || 0), 0);
    const prior = report.trend.slice(0, half).reduce((s, d) => s + (d.sessions || 0), 0);
    if (prior > 0) {
      const pct = Math.round(((recent - prior) / prior) * 100);
      sessionsDelta = (pct >= 0 ? "▲ " : "▼ ") + Math.abs(pct) + "%";
    }
  }

  return (
    <CardShell
      title={t("card.organic_traffic.title", "Organic Traffic")}
      subtitle={t("card.organic_traffic.subtitle", "Google Analytics live sessions for the last 28 days")}
      action={
        <Link
          to="/p/$projectId/settings"
          params={{ projectId }}
          hash="google-analytics"
          className={moreDetailsClass}
        >
          {isRtl ? "تفاصيل" : "Details"}
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full space-y-4">
        {/* Metric Header matching Image 5 */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {formatCount(sessionsVal)}
              </span>
              {sessionsDelta && (
                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold font-mono ${sessionsDelta.startsWith("▲") ? "border border-[#30D158]/30 bg-[#30D158]/10 text-[#30D158]" : "border border-[#FF453A]/30 bg-[#FF453A]/10 text-[#FF453A]"}`}>
                  {sessionsDelta}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {t("metric.ga4_sessions", "GA4 sessions")}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-zinc-200">
              {formatCount(activeUsersVal)}
            </span>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {isRtl ? "مستخدمين نشطين" : "Active users"}
            </p>
          </div>
        </div>

        {/* Spline Area Chart */}
        <div className="pt-2">
          <SplineAreaChart data={trendData} height={85} />
        </div>
      </div>
    </CardShell>
  );
}
