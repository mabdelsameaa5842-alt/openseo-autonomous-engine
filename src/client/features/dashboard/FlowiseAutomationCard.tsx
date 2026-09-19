import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Play,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { CardShell, moreDetailsClass } from "@/client/features/dashboard/cardParts";
import { useI18n } from "@/client/lib/i18n";

export function FlowiseAutomationCard({
  projectId,
}: {
  projectId: string;
}) {
  const { t, isRtl } = useI18n();
  const [triggering, setTriggering] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [flowiseCountdown, setFlowiseCountdown] = useState<number>(1800);

  useEffect(() => {
    fetch(`/api/automation/dual-pipelines-telemetry?projectId=${encodeURIComponent(projectId)}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data?.success) {
          setTelemetry(data);
          if (data?.flowisePipeline?.nextRunSecondsRemaining !== undefined) {
            setFlowiseCountdown(data.flowisePipeline.nextRunSecondsRemaining);
          }
        }
      })
      .catch(() => {});
  }, [projectId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlowiseCountdown((prev) => (prev > 0 ? prev - 1 : 1800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const handleInstantTrigger = async () => {
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
            ? "تم إطلاق دورة Flowise الذاتية بنجاح!"
            : "Flowise autonomous cycle triggered successfully!"
        );
        setFlowiseCountdown(1800);
      } else {
        toast.info(
          isRtl
            ? "دورة Flowise قيد التشغيل التلقائي"
            : "Flowise cycle is running autonomously"
        );
      }
    } catch {
      toast.info(
        isRtl
          ? "دورة Flowise تعمل تلقائياً في الخلفية"
          : "Flowise is operating in the background"
      );
    } finally {
      setTriggering(false);
    }
  };

  const harvestedKeywords = telemetry?.flowisePipeline?.harvestedKeywords ?? 0;
  const queuedArticles = telemetry?.flowisePipeline?.totalQueued ?? 0;
  const publishedArticles = telemetry?.flowisePipeline?.totalPublished ?? 0;

  return (
    <CardShell
      title={isRtl ? "محرك Flowise الذاتي الموحد" : "Flowise Autonomous Engine"}
      subtitle={isRtl ? "نظام الأتمتة المستقل (100% مجاني)" : "Native Multi-Agent Core (100% Free)"}
      action={
        <Link
          to="/p/$projectId/vorder-studio"
          params={{ projectId }}
          className={moreDetailsClass}
        >
          <span>{isRtl ? "فتح الاستوديو" : "Open Studio"}</span>
          <ArrowRight className={`size-3.5 ${isRtl ? "rotate-180" : ""}`} />
        </Link>
      }
    >
      <div className="space-y-4 pt-1 text-xs">
        {/* Flowise Engine Status Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                <span>{isRtl ? "محرك Flowise المستقل" : "Flowise Native AI"}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.2 rounded font-mono">
                  $0.00
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {isRtl ? "دورة مستمرة كل 30 دقيقة (48 دورة/يوم)" : "Continuous 30m cycles (48 runs/day)"}
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            {isRtl ? "نشط" : "Active"}
          </span>
        </div>

        {/* Real-time Countdown Box */}
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-medium">
            <Clock className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>{isRtl ? "الدورة القادمة بعد:" : "Next cycle in:"}</span>
          </div>
          <div className="font-mono font-bold text-emerald-400 bg-zinc-900 px-2.5 py-0.5 rounded border border-emerald-500/20">
            {formatCountdown(flowiseCountdown)}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
            <div className="text-[10px] text-zinc-400">{isRtl ? "الكلمات المفتاحية" : "Keywords"}</div>
            <div className="mt-1 font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
              {harvestedKeywords.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
            <div className="text-[10px] text-zinc-400">{isRtl ? "طابور المحتوى" : "In Queue"}</div>
            <div className="mt-1 font-bold text-sm text-indigo-400 font-mono">
              {queuedArticles}
            </div>
          </div>
          <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
            <div className="text-[10px] text-zinc-400">{isRtl ? "المقالات الحية" : "Published"}</div>
            <div className="mt-1 font-bold text-sm text-emerald-400 font-mono">
              {publishedArticles}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleInstantTrigger}
          disabled={triggering}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-95"
        >
          {triggering ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>{isRtl ? "جاري تشغيل دورة Flowise..." : "Triggering Cycle..."}</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isRtl ? "تشغيل دورة Flowise فوراً (مجانية)" : "Run Instant Cycle (Free)"}</span>
            </>
          )}
        </button>
      </div>
    </CardShell>
  );
}
