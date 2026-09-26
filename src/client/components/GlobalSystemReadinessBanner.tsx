import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ArrowUpRight, Sparkles, ChevronUp } from "lucide-react";
import { useI18n } from "@/client/lib/i18n";
import { PlatformBrandLogo } from "@/client/components/BrandLogos";
import { getPlatformIntegrations } from "@/serverFunctions/platformIntegrations";
import { getGscConnection } from "@/serverFunctions/gsc";
import { getGa4Connection } from "@/serverFunctions/ga4";
import { getGoogleAdsConnection } from "@/serverFunctions/googleAds";

interface GlobalSystemReadinessBannerProps {
  projectId: string;
}

interface PlatformReadinessItem {
  id: string;
  key: "gsc" | "ga4" | "google_ads" | "supabase" | "github" | "vercel" | "google_ai_studio" | "cloudflare";
  nameAr: string;
  nameEn: string;
  connected: boolean;
}

export function GlobalSystemReadinessBanner({ projectId }: GlobalSystemReadinessBannerProps) {
  const { isRtl } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [minimizedSuccess, setMinimizedSuccess] = React.useState(false);

  const gscQuery = useQuery({
    queryKey: ["gscConnection", projectId],
    queryFn: () => getGscConnection({ data: { projectId } }),
    enabled: Boolean(projectId),
  });
  const ga4Query = useQuery({
    queryKey: ["ga4Connection", projectId],
    queryFn: () => getGa4Connection({ data: { projectId } }),
    enabled: Boolean(projectId),
  });
  const adsQuery = useQuery({
    queryKey: ["googleAdsConnection", projectId],
    queryFn: () => getGoogleAdsConnection({ data: { projectId } }),
    enabled: Boolean(projectId),
  });
  const platformsQuery = useQuery({
    queryKey: ["platformIntegrations", projectId],
    queryFn: () => getPlatformIntegrations({ data: { projectId } }),
    enabled: Boolean(projectId),
  });

  React.useEffect(() => {
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: ["platformIntegrations", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["gscConnection", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["ga4Connection", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["googleAdsConnection", projectId] });
    };
    window.addEventListener("vorder-integrations-updated", handler);
    return () => window.removeEventListener("vorder-integrations-updated", handler);
  }, [projectId, queryClient]);

  const platformMap = React.useMemo(() => {
    const map = new Map<string, any>();
    if (platformsQuery.data) {
      for (const row of platformsQuery.data) {
        map.set(row.platform, row);
      }
    }
    return map;
  }, [platformsQuery.data]);

  const gscConnected = Boolean(gscQuery.data?.connected);
  const ga4Connected = Boolean(ga4Query.data?.connected);
  const adsConnected = Boolean(adsQuery.data?.connected);
  const supabaseConnected = platformMap.get("supabase")?.status === "connected";
  const githubConnected = platformMap.get("github")?.status === "connected";
  const vercelConnected = platformMap.get("vercel")?.status === "connected";
  const geminiConnected = platformMap.get("google_ai_studio")?.status === "connected";
  const cloudflareConnected = platformMap.get("cloudflare")?.status === "connected";

  const platforms: PlatformReadinessItem[] = [
    {
      id: "gsc",
      key: "gsc",
      nameAr: "Google Search Console",
      nameEn: "Google Search Console",
      connected: gscConnected,
    },
    {
      id: "ga4",
      key: "ga4",
      nameAr: "Google Analytics 4",
      nameEn: "Google Analytics 4",
      connected: ga4Connected,
    },
    {
      id: "google_ads",
      key: "google_ads",
      nameAr: "Google Ads",
      nameEn: "Google Ads",
      connected: adsConnected,
    },
    {
      id: "supabase",
      key: "supabase",
      nameAr: "Supabase",
      nameEn: "Supabase",
      connected: supabaseConnected,
    },
    {
      id: "github",
      key: "github",
      nameAr: "GitHub",
      nameEn: "GitHub",
      connected: githubConnected,
    },
    {
      id: "vercel",
      key: "vercel",
      nameAr: "Vercel",
      nameEn: "Vercel",
      connected: vercelConnected,
    },
    {
      id: "google_ai_studio",
      key: "google_ai_studio",
      nameAr: "Google Gemini AI Studio",
      nameEn: "Google Gemini AI Studio",
      connected: geminiConnected,
    },
    {
      id: "cloudflare",
      key: "cloudflare",
      nameAr: "Cloudflare",
      nameEn: "Cloudflare",
      connected: cloudflareConnected,
    },
  ];

  const unconnectedPlatforms = platforms.filter((p) => !p.connected);
  const connectedCount = platforms.length - unconnectedPlatforms.length;
  const isAllConnected = unconnectedPlatforms.length === 0;
  const efficiencyPercent = Math.round((connectedCount / platforms.length) * 100);

  const sectionIdMap: Record<string, string> = {
    gsc: "search-console",
    ga4: "google-analytics",
    google_ads: "google-ads",
    google_ai_studio: "google-ai-studio",
    supabase: "supabase",
    github: "github",
    vercel: "vercel",
    cloudflare: "cloudflare",
  };

  const handleGoToIntegrations = (platformKey?: string) => {
    void navigate({
      to: "/p/$projectId/settings/integrations",
      params: { projectId },
    });
    if (platformKey && typeof window !== "undefined") {
      const targetId = sectionIdMap[platformKey] || platformKey;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }
  };

  if (isAllConnected) {
    if (minimizedSuccess) {
      return (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="mx-3 mt-2 mb-1 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-3.5 py-1.5 text-xs"
        >
          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>
              {isRtl
                ? "✅ يعمل النظام والوكلاء الـ 9 والـ 50 نموذجاً بنجاح وبكفاءة 100% (8/8 منصات متصلة بـ Full Access)"
                : "✅ System, 9 Agents & 50 Models operating successfully at 100% efficiency (8/8 Connected)"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMinimizedSuccess(false)}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {isRtl ? "عرض التفاصيل" : "Details"}
          </button>
        </div>
      );
    }

    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="mx-3 mt-2.5 mb-1.5 rounded-2xl border border-emerald-500/35 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 px-4 py-3 shadow-sm transition-all"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-black text-emerald-800 dark:text-emerald-300">
                  {isRtl
                    ? "يعمل النظام والوكلاء الـ 9 بنجاح وبكفاءة كاملة (100% Full Access)"
                    : "System & All 9 Agents Operating Successfully at 100% Efficiency"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="size-2.5" /> 8/8 {isRtl ? "متصل" : "Connected"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                {isRtl
                  ? "جميع المنصات الـ 8 متصلة الآن بالوكلاء الـ 9 وماكينة Google AI Studio ذات الـ 50 نموذجاً."
                  : "All 8 platforms are live and synchronized with the 9 agents and 50-model engine."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleGoToIntegrations(p.key)}
                title={p.nameEn}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-white/80 dark:bg-zinc-900/80 px-2 py-1 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 hover:border-emerald-500 transition-all cursor-pointer"
              >
                <PlatformBrandLogo platform={p.key} className="size-3.5" />
                <span className="hidden xl:inline">{p.nameEn}</span>
                <span className="size-1.5 rounded-full bg-emerald-500" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMinimizedSuccess(true)}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-white/10 cursor-pointer"
              title={isRtl ? "طي الشريط" : "Minimize"}
            >
              <ChevronUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="mx-3 mt-2.5 mb-1.5 rounded-2xl border border-amber-500/40 dark:border-amber-500/30 bg-gradient-to-r from-amber-500/[0.12] via-rose-500/[0.08] to-amber-500/[0.12] px-4 py-3 shadow-sm transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs md:text-sm font-black text-zinc-900 dark:text-amber-200">
                {isRtl
                  ? `⚠️ تنبيه: النظام والوكلاء لن يعملوا بكفاءة كاملة قبل ربط (${unconnectedPlatforms.length} منصات متبقية من 8):`
                  : `⚠️ Warning: System & Agents will not operate at full efficiency before connecting (${unconnectedPlatforms.length} of 8 remaining):`}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                {isRtl ? `الكفاءة الحالية: ${efficiencyPercent}% (${connectedCount}/8)` : `Efficiency: ${efficiencyPercent}% (${connectedCount}/8)`}
              </span>
            </div>

            {/* Dynamic Pills of Unconnected Platforms — Disappear immediately one by one as connected */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {unconnectedPlatforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleGoToIntegrations(p.key)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-rose-500/35 bg-white/90 dark:bg-zinc-900/90 hover:bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 shadow-xs transition-all cursor-pointer"
                >
                  <PlatformBrandLogo platform={p.key} className="size-3.5 shrink-0" />
                  <span>{isRtl ? p.nameAr : p.nameEn}</span>
                  <span className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded">
                    {isRtl ? "غير مربوط" : "Unlinked"}
                  </span>
                  <ArrowUpRight className="size-3 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleGoToIntegrations()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#97233A] to-[#7A1C2E] hover:opacity-95 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
          >
            <span>{isRtl ? "استكمال ربط المنصات الآن" : "Connect Missing Platforms"}</span>
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
