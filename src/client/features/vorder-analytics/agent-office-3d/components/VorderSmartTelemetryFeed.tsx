import React, { useState } from "react";
import {
  Clock,
  Activity,
  Users,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Coffee,
  Zap,
} from "lucide-react";

export interface SmartFeedItem {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  role: string;
  badgeColor?: string;
  actionType: "work" | "rest" | "meeting" | "audit";
  actionDescription: string;
  durationSeconds?: number;
  status: "completed" | "in_progress";
}

export interface RestPeriodStatus {
  isResting: boolean;
  phase: string;
  startedAt: string;
  durationMinutes: number;
  minutesRemaining: number;
  meetingChamberActive: boolean;
}

interface VorderSmartTelemetryFeedProps {
  telemetryData?: {
    smartActivityFeed?: SmartFeedItem[];
    restPeriodStatus?: RestPeriodStatus;
  };
  onOpenMeetingChamber?: () => void;
  isRtl?: boolean;
}

export function VorderSmartTelemetryFeed({
  telemetryData,
  onOpenMeetingChamber,
  isRtl = true,
}: VorderSmartTelemetryFeedProps) {
  const [filter, setFilter] = useState<"all" | "work" | "rest">("all");
  const [isExpanded, setIsExpanded] = useState(true);

  const restStatus = telemetryData?.restPeriodStatus || {
    isResting: true,
    phase: "استراحة الدورة التكتيكية وعقد اجتماع التطوير الذاتي",
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    durationMinutes: 25,
    minutesRemaining: 15,
    meetingChamberActive: true,
  };

  const defaultFeed: SmartFeedItem[] = [
    {
      id: "act_1",
      timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      agentId: "vorder-tariq",
      agentName: "طارق العبدلي",
      role: "المدير التنفيذي وقائد التكتيكات (Tier 1)",
      badgeColor: "purple",
      actionType: "meeting",
      actionDescription: "افتتاح اجتماع المتابعة الهرمية الشاملة وطلب تقارير الإنجاز من المستويات الأربعة لـ 742 مقالاً و8 منصات",
      durationSeconds: 1500,
      status: "in_progress",
    },
    {
      id: "act_2",
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      agentId: "vorder-sara",
      agentName: "سارة المهندس",
      role: "قائدة الإعلانات والأورجانيك والمزايدات (Tier 2)",
      badgeColor: "rose",
      actionType: "work",
      actionDescription: "إعداد حملة هجينة (أورجانيك + إعلانات جوجل) بالذكاء الاصطناعي وتوجيه كل نوع حملة للمحتوى المطابق",
      durationSeconds: 38,
      status: "completed",
    },
    {
      id: "act_3",
      timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      agentId: "vorder-yasmine",
      agentName: "ياسمين الشريف",
      role: "حصاد الكلمات وتصنيف النوايا (Tier 2)",
      badgeColor: "emerald",
      actionType: "work",
      actionDescription: "حصاد وفرز 485 كلمة دلالية واستخراج 18 فرصة قريبة من الصفحة الأولى (Striking Distance) من كونسول",
      durationSeconds: 42,
      status: "completed",
    },
    {
      id: "act_4",
      timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
      agentId: "vorder-karim",
      agentName: "كريم الدسوقي",
      role: "مهندس المحتوى العضوي والفهرسة الفورية (Tier 3)",
      badgeColor: "cyan",
      actionType: "work",
      actionDescription: "نشر المقال التكتيكي رقم 742 وتحديث خريطة الموقع (740 رابطاً) وإطلاق إشارة IndexNow الفورية",
      durationSeconds: 51,
      status: "completed",
    },
    {
      id: "act_5",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      agentId: "vorder-nour",
      agentName: "نور المرشدي",
      role: "مهندسة محركات الذكاء الاصطناعي GEO (Tier 3)",
      badgeColor: "indigo",
      actionType: "work",
      actionDescription: "حقن فقرات الإجابة المباشرة (Direct Answer Blocks) وجداول المقارنة لاقتباسات ChatGPT وPerplexity",
      durationSeconds: 33,
      status: "completed",
    },
    {
      id: "act_6",
      timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
      agentId: "vorder-ziad",
      agentName: "زياد عمران",
      role: "المشرف العام وحارس الجودة وسجل المهام (Tier 4)",
      badgeColor: "blue",
      actionType: "audit",
      actionDescription: "تأكيد 0.0% تصادم دلالي وتوثيق قواعد تفضيلات المالك المستخلصة من الاستماع النشط للوكلاء الـ 9",
      durationSeconds: 18,
      status: "completed",
    },
  ];

  const feedItems = (telemetryData?.smartActivityFeed && telemetryData.smartActivityFeed.length > 0)
    ? telemetryData.smartActivityFeed
    : defaultFeed;

  const filteredItems = feedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "work") return item.actionType === "work";
    if (filter === "rest") return item.actionType === "rest" || item.actionType === "meeting";
    return true;
  });

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] p-4 sm:p-5 shadow-xs overflow-hidden ${
        isRtl ? "rtl text-right" : "ltr text-left"
      }`}
    >
      {/* 1. Header Card: Rest/Work Status & Meeting Chamber Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--apple-border)]">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
              restStatus.isResting
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {restStatus.isResting ? (
              <Coffee className="size-5 animate-pulse" />
            ) : (
              <Zap className="size-5 animate-bounce" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[var(--apple-text-primary)]">
                سجل الحضور الذكي والعمليات (Smart Telemetry & Rest Logger)
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  restStatus.isResting
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                {restStatus.isResting ? "فترة استراحة وتطوير" : "فترة عمل نشطة"}
              </span>
            </div>
            <p className="text-xs text-[var(--apple-text-secondary)] mt-0.5">
              تسجيل زمني دقيق بالثواني لمهام كل وكيل، وفترات الراحة المخصصة لاجتماعات العصف والتطوير الذاتي
            </p>
          </div>
        </div>

        {/* Action Button: Open Meeting Chamber */}
        <div className="flex items-center gap-2">
          {onOpenMeetingChamber && (
            <button
              type="button"
              onClick={onOpenMeetingChamber}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Users className="size-4 animate-pulse" />
              <span>دخول جروب الميتينج 🎙️</span>
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl border border-[var(--apple-border)] hover:bg-[var(--apple-pill)] text-[var(--apple-text-secondary)] transition-all cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {/* 2. Rest Status Pill Strip */}
      {restStatus.isResting && (
        <div className="mt-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-indigo-500"></span>
            </span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300">
              الوكلاء مجتمعون الآن في غرفة الميتينج لمناقشة التقرير الميداني وتوسيع الصلاحيات:
            </span>
            <span className="text-[var(--apple-text-secondary)]">
              مدة الاستراحة الكلية: {restStatus.durationMinutes} دقيقة
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            <Clock className="size-3.5" />
            <span>متبقي: {restStatus.minutesRemaining} دقيقة</span>
          </div>
        </div>
      )}

      {/* 3. Filterable Smart Feed */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Controls row */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--apple-text-secondary)]">
              أحدث العمليات المسجلة بالثواني:
            </span>

            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--apple-canvas)] border border-[var(--apple-border)]">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-xs"
                    : "text-[var(--apple-text-secondary)]"
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setFilter("work")}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filter === "work"
                    ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-xs"
                    : "text-[var(--apple-text-secondary)]"
                }`}
              >
                فترات العمل
              </button>
              <button
                type="button"
                onClick={() => setFilter("rest")}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filter === "rest"
                    ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-xs"
                    : "text-[var(--apple-text-secondary)]"
                }`}
              >
                الاستراحة والميتينج
              </button>
            </div>
          </div>

          {/* Activity items list */}
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isWork = item.actionType === "work";
              const isMeeting = item.actionType === "meeting";

              let badgeClasses = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
              if (item.badgeColor === "emerald") badgeClasses = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
              if (item.badgeColor === "blue") badgeClasses = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
              if (item.badgeColor === "rose") badgeClasses = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
              if (item.badgeColor === "cyan") badgeClasses = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-[var(--apple-border)] bg-[var(--apple-canvas)]/40 hover:bg-[var(--apple-canvas)] transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`size-2 rounded-full shrink-0 ${
                        isMeeting
                          ? "bg-purple-500 animate-pulse"
                          : isWork
                          ? "bg-emerald-500"
                          : "bg-indigo-500"
                      }`}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--apple-text-primary)]">
                          {item.agentName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClasses}`}>
                          {item.role}
                        </span>
                        {item.durationSeconds && (
                          <span className="text-[10px] font-mono text-[var(--apple-text-secondary)]">
                            (المدة: {item.durationSeconds} ثانية)
                          </span>
                        )}
                      </div>

                      <p className="text-[var(--apple-text-secondary)] mt-0.5 text-xs">
                        {item.actionDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center font-mono text-[11px] text-[var(--apple-text-secondary)] shrink-0">
                    <Clock className="size-3" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
