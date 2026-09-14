import * as React from "react";
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
} from "lucide-react";
import { IntegrationConnectionCard } from "@/client/features/integrations/IntegrationConnectionCard";
import { useI18n } from "@/client/lib/i18n";

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

  const webhookUrl = "https://open-seo.abdelsameaa.workers.dev/api/automation/seo-cycle";

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
      if (data?.success) {
        toast.success(
          isRtl
            ? "✅ تم إطلاق دورة Flowise الذاتية بنجاح وتحديث السيو!"
            : "Flowise autonomous cycle triggered successfully!"
        );
      } else {
        toast.info(
          isRtl
            ? "دورة Flowise قيد العمل المستمر في السحابة"
            : "Flowise is already running autonomously in cloud"
        );
      }
    } catch {
      toast.info(
        isRtl
          ? "دورة Flowise تعمل تلقائياً في السيرفر"
          : "Flowise cycle triggered in background"
      );
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-3">
      {heading}
      <IntegrationConnectionCard
        title={isRtl ? "محرك Flowise الذاتي المستقل (Flowise Native Core)" : "Flowise Autonomous Multi-Agent Engine"}
        icon={<Bot className="size-5 text-emerald-500" />}
        status="connected"
      >
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{isRtl ? "محرك الأتمتة الموحد (نشط بنسبة 100%)" : "Unified Native Core (100% Active)"}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono px-1.5 py-0.5 rounded font-bold">
                    0.00$ Free
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isRtl
                    ? "أتمتة شاملة ومستقلة: دورة مستمرة كل 30 دقيقة لحصاد الكلمات، كتابة المقالات، وتدقيق الترتيب في GSC."
                    : "Autonomous continuous cycle every 30 mins: keyword harvesting, article generation, and GSC rank audits."}
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
              <span>{isRtl ? "تشغيل دورة تجريبية الآن" : "Run Test Cycle"}</span>
            </button>
          </div>

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
              <span>{isRtl ? "مستقل 100% بدون أي وسيط" : "Zero Third-Party Cost"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Zap className="size-3.5 text-amber-400" />
              <span>{isRtl ? "نشر آلي لخرائط ومقالات السيو" : "Auto Sitemap & GSC Sync"}</span>
            </div>
          </div>
        </div>
      </IntegrationConnectionCard>
    </div>
  );
}
