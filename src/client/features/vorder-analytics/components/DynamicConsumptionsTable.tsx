import React from "react";
import {
  Database,
  Layers,
  Cpu,
  Globe,
  Users,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Sparkles,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export interface DynamicConsumptionItem {
  id: string;
  resourceNameAr: string;
  resourceNameEn: string;
  platform: string;
  category: "database" | "kv_store" | "ai_llm" | "hosting_seo" | "multi_agent";
  maxLimitDisplay: string;
  maxLimitRaw: number | null;
  consumedDisplay: string;
  consumedRaw: number;
  percentage: number;
  statusType: "healthy" | "warning_circuit_open" | "throttled";
  statusBadgeAr: string;
  statusDetailsAr: string;
  isHealthy: boolean;
  isCircuitOpen: boolean;
}

interface DynamicConsumptionsTableProps {
  items?: DynamicConsumptionItem[];
  isRtl?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  resetCountdown?: { hours: number; minutes: number; seconds: number };
}

export const DynamicConsumptionsTable: React.FC<DynamicConsumptionsTableProps> = ({
  items = [],
  isRtl = true,
  isLoading = false,
  onRefresh,
  resetCountdown,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="size-4 text-amber-500 shrink-0" />;
      case "kv_store":
        return <Layers className="size-4 text-blue-500 shrink-0" />;
      case "ai_llm":
        return <Cpu className="size-4 text-purple-500 shrink-0" />;
      case "hosting_seo":
        return <Globe className="size-4 text-emerald-500 shrink-0" />;
      case "multi_agent":
        return <Users className="size-4 text-indigo-500 shrink-0" />;
      default:
        return <Activity className="size-4 text-zinc-500 shrink-0" />;
    }
  };

  const getProgressColor = (item: DynamicConsumptionItem) => {
    if (item.isCircuitOpen || item.statusType === "warning_circuit_open") {
      return "bg-rose-500 dark:bg-rose-400";
    }
    if (item.statusType === "throttled" || item.percentage > 85) {
      return "bg-amber-500 dark:bg-amber-400";
    }
    return "bg-emerald-500 dark:bg-emerald-400";
  };

  const getStatusBadgeStyle = (item: DynamicConsumptionItem) => {
    if (item.isCircuitOpen || item.statusType === "warning_circuit_open") {
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
    }
    if (item.statusType === "throttled") {
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    }
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  };

  const format2Digits = (n?: number) => String(n ?? 0).padStart(2, "0");

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="mt-6 rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-sm"
    >
      {/* Table Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-200/60 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-800/40">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
          </span>
          <h4 className="text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{isRtl ? "جدول الاستهلاكات اللحظي ونسب التشغيل (Dynamic Live Quotas)" : "Dynamic Consumption & Operation Rates"}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-bold">
              SSOT Live
            </span>
          </h4>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
          {resetCountdown && (
            <span className="flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-white/5">
              <Clock className="size-3 text-zinc-400" />
              <span>{isRtl ? "تصفير الكوتا خلال:" : "Reset in:"}</span>
              <strong className="text-zinc-800 dark:text-zinc-200 font-bold">
                {format2Digits(resetCountdown.hours)}:{format2Digits(resetCountdown.minutes)}:{format2Digits(resetCountdown.seconds)} UTC
              </strong>
            </span>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title={isRtl ? "تحديث مؤشرات الاستهلاك لحظياً" : "Refresh Telemetry"}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold border border-zinc-200 dark:border-white/10 transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`size-3 ${isLoading ? "animate-spin text-indigo-500" : ""}`} />
              <span>{isRtl ? "تحديث" : "Refresh"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-white/5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100/40 dark:bg-zinc-800/20">
              <th className="py-2.5 px-4 font-bold whitespace-nowrap">{isRtl ? "المورد / المنصة" : "Resource / Platform"}</th>
              <th className="py-2.5 px-4 font-bold whitespace-nowrap">{isRtl ? "الحد الأقصى المسموح (Daily Quota)" : "Max Daily Quota"}</th>
              <th className="py-2.5 px-4 font-bold whitespace-nowrap">{isRtl ? "المستهلك الفعلي الآن" : "Live Consumed"}</th>
              <th className="py-2.5 px-4 font-bold whitespace-nowrap w-44">{isRtl ? "نسبة الاستهلاك (%)" : "Consumption Rate (%)"}</th>
              <th className="py-2.5 px-4 font-bold min-w-[300px]">{isRtl ? "الحالة التشغيلية الحالية" : "Current Operational Status"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/40 dark:divide-white/5">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {/* 1. Resource / Platform */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/60 dark:border-white/5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                        {isRtl ? item.resourceNameAr : item.resourceNameEn}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {item.platform}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Max Quota */}
                <td className="py-3 px-4 font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                  {item.maxLimitDisplay}
                </td>

                {/* 3. Consumed Display */}
                <td className="py-3 px-4 font-mono text-[11px] font-black text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  {item.consumedDisplay}
                </td>

                {/* 4. Percentage Bar */}
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                        {item.percentage}%
                      </span>
                      {item.isCircuitOpen && (
                        <span className="text-[9px] text-rose-500 font-bold">Trip 7500</span>
                      )}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item)}`}
                        style={{ width: `${Math.max(4, Math.min(100, item.percentage))}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* 5. Operational Status */}
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(item)}`}
                    >
                      {item.statusBadgeAr}
                    </span>
                    <p className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {item.statusDetailsAr}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
