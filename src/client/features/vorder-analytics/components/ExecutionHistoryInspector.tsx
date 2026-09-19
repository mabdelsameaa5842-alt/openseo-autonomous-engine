import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  Play,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  Clock,
  Radio,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";
import { type StepLog } from "./SteppedAiTasksWorkflow";

interface TaskExecution {
  id: string;
  project_id: string;
  cycle_id: string;
  task_name: string;
  task_type: string;
  current_step: number;
  total_steps: number;
  status: "completed" | "running" | "failed" | "fallback_active";
  has_fallbacks: boolean;
  steps_summary_json?: string;
  created_at: string;
  updated_at: string;
  steps: StepLog[];
}

interface Props {
  projectId: string;
  isRtl?: boolean;
}

export function ExecutionHistoryInspector({ projectId, isRtl = true }: Props) {
  const [activeFilter, setActiveFilter] = useState<"all" | "success" | "processing" | "fallback" | "failed">("all");
  const [selectedExecution, setSelectedExecution] = useState<TaskExecution | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<number>(1);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [reRunningStep, setReRunningStep] = useState<number | null>(null);

  const historyQuery = useQuery<{
    success: boolean;
    projectId: string;
    executions: TaskExecution[];
  }>({
    queryKey: ["autonomous-task-executions", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/automation/task-executions?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch task executions history");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const executions = historyQuery.data?.executions || [];

  // Categorize executions
  const filteredExecutions = executions.filter((exec) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "processing") return exec.status === "running";
    if (activeFilter === "failed") {
      return exec.status === "failed" || exec.steps.some((s) => s.status === "failed");
    }
    if (activeFilter === "fallback") {
      return (
        exec.has_fallbacks ||
        exec.status === "fallback_active" ||
        exec.steps.some((s) => s.status === "fallback_active")
      );
    }
    if (activeFilter === "success") {
      return (
        exec.status === "completed" &&
        !exec.has_fallbacks &&
        exec.steps.every((s) => s.status === "success")
      );
    }
    return true;
  });

  const counts = {
    all: executions.length,
    success: executions.filter(
      (e) => e.status === "completed" && !e.has_fallbacks && e.steps.every((s) => s.status === "success")
    ).length,
    processing: executions.filter((e) => e.status === "running").length,
    fallback: executions.filter(
      (e) => e.has_fallbacks || e.status === "fallback_active" || e.steps.some((s) => s.status === "fallback_active")
    ).length,
    failed: executions.filter((e) => e.status === "failed" || e.steps.some((s) => s.status === "failed")).length,
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    toast.success(isRtl ? "تم نسخ اللوج بنجاح" : "Log copied to clipboard");
    setTimeout(() => setCopiedLogId(null), 2500);
  };

  const handleReRunStepCustom = async (stepNum: number, mode: "normal" | "forceFallback" | "simulateFailure") => {
    if (!selectedExecution) return;
    setReRunningStep(stepNum);
    try {
      const res = await fetch("/api/automation/run-task-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          executionId: selectedExecution.id,
          stepNumber: stepNum,
          forceFallback: mode === "forceFallback",
          simulateFailure: mode === "simulateFailure",
        }),
      });
      const data = (await res.json()) as any;
      if (data.success || data.status) {
        toast.success(
          isRtl
            ? `تم تحديث الخطوة ${stepNum} بنجاح (${data.status})`
            : `Step ${stepNum} updated: ${data.status}`
        );
        await historyQuery.refetch();
        // Update local modal state
        if (data.step) {
          const updatedSteps = selectedExecution.steps.map((s) =>
            s.step_number === stepNum ? { ...s, ...data.step } : s
          );
          setSelectedExecution({
            ...selectedExecution,
            steps: updatedSteps,
            has_fallbacks: data.status === "fallback_active" || selectedExecution.has_fallbacks,
          });
        }
      } else {
        throw new Error(data.error || "Execution failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to run step");
    } finally {
      setReRunningStep(null);
    }
  };

  const openInspector = (exec: TaskExecution, stepNumber = 1) => {
    setSelectedExecution(exec);
    setActiveStepTab(stepNumber);
    setInspectModalOpen(true);
  };

  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-5 shadow-xl transition-all duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {isRtl ? "سجل العمليات الشامل وفاحص أخطاء اللوج (History & Log Inspector)" : "Execution History & Log Inspector"}
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                360° Telemetry
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isRtl
                ? "تتبع مباشر للعمليات الناجحة، الجارية، والمسارات البديلة مع إمكانية قراءة الخطأ الخام والـ Stack Trace."
                : "Real-time tracking of successful, processing, fallback and failed runs with raw stack trace inspection."}
            </p>
          </div>
        </div>

        {/* Refresh & Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => void historyQuery.refetch()}
            disabled={historyQuery.isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${historyQuery.isFetching ? "animate-spin text-emerald-500" : ""}`} />
            <span>{isRtl ? "تحديث السجل" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs (Apple HIG Segmented Control Style) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
        {[
          { key: "all", label: isRtl ? "الكل" : "All", count: counts.all, icon: Layers },
          { key: "success", label: isRtl ? "ناجحة أصلي" : "Primary OK", count: counts.success, icon: CheckCircle2, color: "text-emerald-500" },
          { key: "processing", label: isRtl ? "قيد المعالجة" : "Processing", count: counts.processing, icon: Radio, color: "text-blue-500 animate-pulse" },
          { key: "fallback", label: isRtl ? "مسار بديل" : "Fallback Active", count: counts.fallback, icon: AlertTriangle, color: "text-amber-500" },
          { key: "failed", label: isRtl ? "فاشلة / أخطاء" : "Failed", count: counts.failed, icon: XCircle, color: "text-red-500" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md scale-102 font-bold"
                  : "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${tab.color || ""}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive
                    ? "bg-white/20 dark:bg-zinc-900/20 text-current"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Execution List */}
      <div className="space-y-3 mt-1">
        {filteredExecutions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Info className="h-6 w-6 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {isRtl ? "لا توجد عمليات تطابق هذا التصنيف حالياً." : "No task executions found for this filter."}
            </p>
          </div>
        ) : (
          filteredExecutions.map((exec) => {
            const hasFailedStep = exec.steps.some((s) => s.status === "failed");
            const hasFallbackStep = exec.steps.some((s) => s.status === "fallback_active");
            const isProcessing = exec.status === "running";

            let statusBadge = (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 className="h-3 w-3" />
                {isRtl ? "ناجحة أصلي (9/9 OK)" : "9/9 Primary OK"}
              </span>
            );

            if (isProcessing) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 animate-pulse font-bold">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {isRtl ? "جاري المعالجة الحية..." : "Processing Live..."}
                </span>
              );
            } else if (hasFailedStep || exec.status === "failed") {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 shadow-sm shadow-red-500/10">
                  <XCircle className="h-3 w-3" />
                  {isRtl ? "فشل التنفيذ (خطأ باللوج)" : "Failed (See Logs)"}
                </span>
              );
            } else if (hasFallbackStep || exec.has_fallbacks) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 shadow-sm shadow-amber-500/10">
                  <AlertTriangle className="h-3 w-3" />
                  {isRtl ? "مسار بديل مفعّل (Fallback Active)" : "Fallback Active"}
                </span>
              );
            }

            return (
              <div
                key={exec.id}
                className={`rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                  hasFailedStep
                    ? "border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10"
                    : hasFallbackStep
                    ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10"
                    : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {exec.cycle_id}
                      </span>
                      {statusBadge}
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(exec.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1">
                      {exec.task_name}
                    </p>
                  </div>

                  {/* Right Action Button */}
                  <button
                    onClick={() => openInspector(exec, hasFailedStep ? exec.steps.find((s) => s.status === "failed")?.step_number || 1 : 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
                  >
                    <Terminal className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isRtl ? "فحص اللوج والمشكلة" : "Inspect Error Log"}</span>
                  </button>
                </div>

                {/* 9 Steps Mini Pills */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-zinc-400 font-medium ml-1">
                    {isRtl ? "الخطوات:" : "Steps:"}
                  </span>
                  {exec.steps.map((step) => {
                    let pillColor = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
                    let pillLabel = `${step.step_number}. OK`;

                    if (step.status === "failed") {
                      pillColor = "bg-red-500 text-white font-bold animate-pulse border-red-600 shadow-sm shadow-red-500/30";
                      pillLabel = `${step.step_number}. فشلت`;
                    } else if (step.status === "fallback_active") {
                      pillColor = "bg-amber-500 text-white font-bold border-amber-600 shadow-sm shadow-amber-500/30";
                      pillLabel = `${step.step_number}. بديل`;
                    } else if (step.status === "pending" || step.status === "running") {
                      pillColor = "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 animate-pulse";
                      pillLabel = `${step.step_number}. جاري`;
                    }

                    return (
                      <button
                        key={step.id || step.step_number}
                        onClick={() => openInspector(exec, step.step_number)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono transition-transform hover:scale-105 cursor-pointer ${pillColor}`}
                        title={`${step.step_name}: ${step.status}`}
                      >
                        {pillLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Log Inspector Modal (Apple HIG Liquid Glass) */}
      {inspectModalOpen && selectedExecution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900">
                  <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      {isRtl ? "نافذة فحص اللوج وتشخيص المسارات" : "Step Log & Fallback Inspector"}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {selectedExecution.cycle_id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedExecution.task_name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step Selection Tabs */}
            <div className="flex items-center gap-1.5 p-3 overflow-x-auto bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-200/60 dark:border-zinc-800/60 no-scrollbar">
              {selectedExecution.steps.map((s) => {
                const isSelected = activeStepTab === s.step_number;
                let dot = "bg-emerald-500";
                if (s.status === "failed") dot = "bg-red-500 animate-pulse";
                else if (s.status === "fallback_active") dot = "bg-amber-500";
                else if (s.status === "running") dot = "bg-blue-500 animate-spin";

                return (
                  <button
                    key={s.step_number}
                    onClick={() => setActiveStepTab(s.step_number)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer border shrink-0 ${
                      isSelected
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600 shadow-sm font-bold"
                        : "bg-transparent text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span>Step {s.step_number}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content */}
            {(() => {
              const currentStep = selectedExecution.steps.find((s) => s.step_number === activeStepTab) || selectedExecution.steps[0];
              if (!currentStep) return null;

              const isFailed = currentStep.status === "failed";
              const isFallback = currentStep.status === "fallback_active";
              const isSuccess = currentStep.status === "success";

              return (
                <div className="p-6 overflow-y-auto space-y-5 flex-1 text-right" dir={isRtl ? "rtl" : "ltr"}>
                  {/* Step Title & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        الخطوة {currentStep.step_number} من 9 • {currentStep.step_name}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        {currentStep.step_label_ar}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isSuccess && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          نجاح أصلي (Primary OK)
                        </span>
                      )}
                      {isFallback && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          مسار بديل مفعّل (Fallback Active)
                        </span>
                      )}
                      {isFailed && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5" />
                          فشل التنفيذ (Failed)
                        </span>
                      )}
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-200/60 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                        {currentStep.execution_time_ms}ms
                      </span>
                    </div>
                  </div>

                  {/* Primary vs Fallback Source Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        المسار الأساسي (Primary Source)
                      </span>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 font-mono">
                        {currentStep.primary_source}
                      </p>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${
                      isFallback
                        ? "border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20"
                        : "border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60"
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        المسار البديل (Fallback Source)
                      </span>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 font-mono">
                        {currentStep.fallback_source || "لا يوجد مسار بديل مفعل (Primary Mode)"}
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic Explanation */}
                  {currentStep.why_failed ? (
                    <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>سبب الفشل / التحويل للمسار البديل:</span>
                      </div>
                      <p className="text-xs text-red-800 dark:text-red-200 mt-1.5 leading-relaxed">
                        {currentStep.why_failed}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>سبب نجاح الخطوة:</span>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1.5 leading-relaxed">
                        {currentStep.why_succeeded || "تم التنفيذ عبر المسار الأساسي بنجاح."}
                      </p>
                    </div>
                  )}

                  {/* Raw Error Trace / Monospace Terminal */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <FileCode className="h-4 w-4 text-amber-500" />
                        <span>سجل اللوج الخام والـ Stack Trace (Raw Error Log):</span>
                      </span>
                      {currentStep.raw_error_message && (
                        <button
                          onClick={() => handleCopy(currentStep.raw_error_message || "", currentStep.id)}
                          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          {copiedLogId === currentStep.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>نسخ اللوج</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="relative rounded-2xl bg-zinc-950 p-4 border border-zinc-800 text-left font-mono text-xs overflow-x-auto text-zinc-300 leading-relaxed shadow-inner" dir="ltr">
                      {currentStep.raw_error_message ? (
                        <pre className="text-red-400 whitespace-pre-wrap break-all">
                          {currentStep.raw_error_message}
                        </pre>
                      ) : (
                        <div className="text-emerald-400/90 font-mono">
                          {`// [OpenSEO Ledger Diagnostics] Step ${currentStep.step_number} OK\n` +
                            `Status: 200 OK | Duration: ${currentStep.execution_time_ms}ms\n` +
                            `Primary Engine: ${currentStep.primary_source}\n` +
                            `Zero exceptions recorded. Pipeline stable.`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Re-Run Controls */}
                  <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-zinc-500">
                      إعادة اختبار هذه الخطوة مع خيارات المحاكاة:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReRunStepCustom(currentStep.step_number, "simulateFailure")}
                        disabled={reRunningStep !== null}
                        className="px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                      >
                        🔴 محاكاة فشل (Test Red Error)
                      </button>

                      <button
                        onClick={() => handleReRunStepCustom(currentStep.step_number, "forceFallback")}
                        disabled={reRunningStep !== null}
                        className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                      >
                        🟡 تشغيل بالمسار البديل (Force Fallback)
                      </button>

                      <button
                        onClick={() => handleReRunStepCustom(currentStep.step_number, "normal")}
                        disabled={reRunningStep !== null}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {reRunningStep === currentStep.step_number ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3 fill-current" />
                        )}
                        <span>🟢 إعادة تشغيل أصلي (Primary)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
