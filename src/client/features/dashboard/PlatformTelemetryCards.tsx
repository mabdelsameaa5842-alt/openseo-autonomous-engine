import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CardShell,
  moreDetailsClass,
} from "@/client/features/dashboard/cardParts";
import { SplineAreaChart } from "@/client/features/dashboard/SplineAreaChart";
import { PlatformAuthenticConnectionCard } from "@/client/features/integrations/PlatformAuthenticConnectionCard";
import {
  getPlatformConnection,
  getPlatformDashboardReport,
} from "@/serverFunctions/platformIntegrations";
import type { ManagedPlatformType } from "@/server/features/integrations/PlatformIntegrationsService";
import { useI18n } from "@/client/lib/i18n";

const DASHBOARD_CARD_META: Record<
  ManagedPlatformType,
  {
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    subtitleAr: string;
    hash: string;
  }
> = {
  google_ai_studio: {
    titleEn: "Gemini AI Studio",
    titleAr: "استوديو Google Gemini AI",
    subtitleEn: "Live generative models & token capacity",
    subtitleAr: "قراءات الموديلات وسعة التوكن الحية",
    hash: "google-ai-studio",
  },
  supabase: {
    titleEn: "Supabase Database & Vector",
    titleAr: "قاعدة بيانات Supabase",
    subtitleEn: "Live PostgREST schema & API telemetry",
    subtitleAr: "قراءات الجداول واستجابة القاعدة الحية",
    hash: "supabase",
  },
  github: {
    titleEn: "GitHub Repository",
    titleAr: "مستودع GitHub",
    subtitleEn: "Live commits, branches & repository activity",
    subtitleAr: "قراءات الـ Commits والفروع الحية",
    hash: "github",
  },
  vercel: {
    titleEn: "Vercel Production Cloud",
    titleAr: "سحابة Vercel للإنتاج",
    subtitleEn: "Live deployments & production domain status",
    subtitleAr: "حالة النشر والدومين الحي",
    hash: "vercel",
  },
  cloudflare: {
    titleEn: "Cloudflare Edge & DNS",
    titleAr: "شبكة Cloudflare Edge",
    subtitleEn: "Live DNS zones, Workers & edge latency",
    subtitleAr: "حالة النطاقات واستجابة الشبكة الحية",
    hash: "cloudflare",
  },
};

export function PlatformDashboardCard({
  projectId,
  platform,
}: {
  projectId: string;
  platform: ManagedPlatformType;
}) {
  const { isRtl } = useI18n();
  const meta = DASHBOARD_CARD_META[platform];

  const connectionQuery = useQuery({
    queryKey: ["platformConnection", projectId, platform],
    queryFn: () => getPlatformConnection({ data: { projectId, platform } }),
  });

  const connected = Boolean(connectionQuery.data?.connected);

  const reportQuery = useQuery({
    queryKey: ["platformDashboardReport", projectId, platform],
    queryFn: () => getPlatformDashboardReport({ data: { projectId, platform } }),
    enabled: connected,
  });

  // Before connecting (or while in setup_required before selecting a property),
  // render the exact same Connection Card right on the Dashboard (matching GscCard & Ga4Card)
  if (!connected || (reportQuery.data && !reportQuery.data.connected)) {
    return (
      <div id={`connect-${platform}`}>
        <PlatformAuthenticConnectionCard projectId={projectId} platform={platform} />
      </div>
    );
  }

  const report = reportQuery.data;
  const trendData =
    report?.trendData && report.trendData.length > 0
      ? report.trendData
      : [1, 2, 2, 3, 3, 4, 4, 5];

  const detailEntries = Object.entries(report?.details ?? {}).slice(0, 3);

  return (
    <CardShell
      title={isRtl ? meta.titleAr : meta.titleEn}
      subtitle={
        report?.selectedResourceName
          ? `${report.selectedResourceName}`
          : isRtl
            ? meta.subtitleAr
            : meta.subtitleEn
      }
      action={
        <Link
          to="/p/$projectId/settings/integrations"
          params={{ projectId }}
          hash={meta.hash}
          className={moreDetailsClass}
        >
          {isRtl ? "تفاصيل" : "Details"}
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full space-y-4">
        {/* Top live readings row matching GscCard & Ga4Card */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {reportQuery.isLoading ? "…" : (report?.primaryMetricValue ?? "—")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#30D158]/30 bg-[#30D158]/10 px-2 py-0.5 text-[10px] font-semibold font-mono text-[#30D158]">
                {report?.latencyMs ? `${report.latencyMs}ms` : "LIVE"}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {report?.primaryMetricLabel ?? "Live Metric"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-zinc-200">
              {reportQuery.isLoading ? "…" : (report?.secondaryMetricValue ?? "—")}
            </span>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {report?.secondaryMetricLabel ?? "Status"}
            </p>
          </div>
        </div>

        {/* Live property metadata rows */}
        {detailEntries.length > 0 ? (
          <div className="space-y-1.5 border-t border-white/[0.06] pt-2.5 text-xs">
            {detailEntries.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2">
                <span className="text-zinc-400">{k}</span>
                <span className="font-mono font-medium text-zinc-200 truncate max-w-[180px]">
                  {String(v ?? "—")}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Spline Area Chart */}
        <div className="pt-1">
          <SplineAreaChart data={trendData} height={68} />
        </div>
      </div>
    </CardShell>
  );
}
