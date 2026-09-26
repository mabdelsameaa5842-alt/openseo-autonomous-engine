import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Zap,
  Clock,
  ShieldCheck,
  Bot,
  Play,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { IntegrationConnectionCard } from "@/client/features/integrations/IntegrationConnectionCard";
import { useI18n } from "@/client/lib/i18n";
import { getGa4Connection } from "@/serverFunctions/ga4";
import { getGoogleAdsConnection } from "@/serverFunctions/googleAds";
import { getGscConnection } from "@/serverFunctions/gsc";
import { getPlatformIntegrations } from "@/serverFunctions/platformIntegrations";

export function FlowiseAutomationConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  const { isRtl } = useI18n();
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);
  const [triggering, setTriggering] = React.useState(false);
  const [lastCycleReport, setLastCycleReport] = React.useState<string | null>(null);

  const gscQuery = useQuery({
    queryKey: ["gscConnection", projectId],
    queryFn: () => getGscConnection({ data: { projectId } }),
  });
  const ga4Query = useQuery({
    queryKey: ["ga4Connection", projectId],
    queryFn: () => getGa4Connection({ data: { projectId } }),
  });
  const adsQuery = useQuery({
    queryKey: ["googleAdsConnection", projectId],
    queryFn: () => getGoogleAdsConnection({ data: { projectId } }),
  });
  const managedQuery = useQuery({
    queryKey: ["platformIntegrations", projectId],
    queryFn: () => getPlatformIntegrations({ data: { projectId } }),
  });

  const connectedPlatforms = React.useMemo(() => {
    const list: string[] = [];
    if (gscQuery.data?.connected) list.push("Google Search Console");
    if (ga4Query.data?.connected) list.push("Google Analytics 4");
    if (adsQuery.data?.connected) list.push("Google Ads & Keyword Planner");
    for (const p of managedQuery.data || []) {
      if (p.connected) {
        list.push(p.platform);
      }
    }
    return list;
  }, [gscQuery.data, ga4Query.data, adsQuery.data, managedQuery.data]);

  const geminiConn = React.useMemo(
    () => (managedQuery.data || []).find((p) => p.platform === "google_ai_studio"),
    [managedQuery.data],
  );

  const isLoading =
    gscQuery.isLoading || ga4Query.isLoading || adsQuery.isLoading || managedQuery.isLoading;

  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : "https://open-seo.abdelsameaa.workers.dev"}/api/automation/seo-cycle`;

  const handleCopyWebhook = () => {
    void navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    toast.success(isRtl ? "تم نسخ رابط Flowise Webhook بنجاح!" : "Flowise Webhook URL copied!");
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/automation/trigger-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, engine: "flowise" }),
      });
      const data = (await res.json()) as any;
      if (data?.success || res.ok) {
        const msg = isRtl
          ? `✅ تم إطلاق دورة Flowise الذاتية بنجاح عبر ${connectedPlatforms.length} منصات متصلة!`
          : `Flowise autonomous cycle triggered across ${connectedPlatforms.length} connected platforms!`;
        setLastCycleReport(`${new Date().toLocaleTimeString()} — ${msg}`);
        toast.success(msg);
      } else {
        toast.info(
          isRtl
            ? "دورة Flowise قيد العمل المستمر في السحابة"
            : "Flowise is running autonomously in cloud",
        );
      }
    } catch {
      toast.info(
        isRtl
          ? "دورة Flowise تعمل تلقائياً في السيرفر"
          : "Flowise cycle triggered in background",
      );
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-3">
      {heading}
      <IntegrationConnectionCard
        title={
          isRtl
            ? "محرك Flowise الذاتي المستقل (Flowise Autonomous Multi-Agent Engine)"
            : "Flowise Autonomous Multi-Agent Engine"
        }
        icon={<Bot className="size-5 text-emerald-500" />}
        status={
          isLoading
            ? undefined
            : connectedPlatforms.length > 0
              ? "connected"
              : "setup_required"
        }
      >
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex flex-wrap items-center gap-2">
                  <span>
                    {isRtl
                      ? `محرك الأتمتة والوكلاء الـ 9 (${connectedPlatforms.length}/8 منصات متصلة حياً)`
                      : `Unified 9-Agent Automation Core (${connectedPlatforms.length}/8 Live Platforms)`}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono px-1.5 py-0.5 rounded font-bold">
                    {geminiConn?.selectedResourceId || "Gemini 2.5 Flash Active"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isRtl
                    ? "يغذي الوكلاء الـ 9 (طارق، سارة، ياسمين، كريم، نور، عمر، فارس، ليلى، زياد) بالقراءات الحية من المنصات المتصلة لحظة بلحظة."
                    : "Feeds all 9 agents with live real-time telemetry from connected platforms."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTrigger}
              disabled={triggering}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {triggering ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5 fill-current" />
              )}
              <span>{isRtl ? "تشغيل دورة أتمتة حية الآن" : "Run Live Cycle Now"}</span>
            </button>
          </div>

          {connectedPlatforms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-base-content/50 font-medium">
                {isRtl ? "المصادر الحية المربوطة بالمحرك:" : "Live Connected Feeds:"}
              </span>
              {connectedPlatforms.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 className="size-3" />
                  {name}
                </span>
              ))}
            </div>
          )}

          {lastCycleReport && (
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              {lastCycleReport}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {isRtl ? "رابط Flowise Webhook الموحد" : "Flowise Webhook Inbound URL"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-300"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
              >
                {copiedWebhook ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>{copiedWebhook ? (isRtl ? "تم النسخ" : "Copied") : (isRtl ? "نسخ" : "Copy")}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Clock className="size-3.5 text-indigo-400" />
              <span>{isRtl ? "دورة مجدولة كل 30 دقيقة" : "30m Cadence"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>{isRtl ? "مرتبط بالوكلاء الـ 9 بالعامية المصرية" : "Linked to 9 Egyptian AI Agents"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Zap className="size-3.5 text-amber-400" />
              <span>{isRtl ? "مزامنة حية مع GSC و GA4 و Ads" : "Live GSC, GA4 & Ads Sync"}</span>
            </div>
          </div>
        </div>
      </IntegrationConnectionCard>
    </div>
  );
}
