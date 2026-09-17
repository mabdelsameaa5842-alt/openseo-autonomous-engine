import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  RefreshCw,
  Eye,
  Shield,
  Zap,
  Layers,
  ArrowRight,
  ExternalLink,
  X,
  Sparkles,
  Search,
  Database,
  Globe,
  TrendingUp,
  GitBranch
} from "lucide-react";
import { toast } from "sonner";

export interface StepLog {
  id: string;
  execution_id: string;
  step_number: number;
  step_name: string;
  step_label_ar: string;
  status: "success" | "fallback_active" | "failed" | "running" | "pending";
  primary_source: string;
  fallback_source: string | null;
  why_succeeded: string | null;
  why_failed: string | null;
  raw_error_message: string | null;
  execution_time_ms: number | null;
  payload_preview: string | null;
  created_at: string;
}

export interface TaskExecution {
  id: string;
  project_id: string;
  cycle_id: string;
  task_name: string;
  task_type: string;
  current_step: number;
  total_steps: number;
  status: string;
  has_fallbacks: boolean;
  steps_summary_json: string;
  created_at: string;
  steps: StepLog[];
}

interface Props {
  projectId: string;
  isRtl?: boolean;
}

export function SteppedAiTasksWorkflow({ projectId, isRtl = true }: Props) {
  const [selectedStep, setSelectedStep] = useState<StepLog | null>(null);
  const [reRunningStep, setReRunningStep] = useState<number | null>(null);

  const taskQuery = useQuery<{ success: boolean; executions: TaskExecution[] }>({
    queryKey: ["autonomous-task-executions", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/automation/task-executions?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch task executions");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const latestExecution = taskQuery.data?.executions?.[0];
  const steps = latestExecution?.steps || [];

  const handleReRunStep = async (stepNumber: number) => {
    setReRunningStep(stepNumber);
    try {
      const res = await fetch("/api/automation/run-task-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          executionId: latestExecution?.id,
          stepNumber,
        }),
      });
      const data = await res.json() as any;
      if (data.success) {
        toast.success(
          isRtl
            ? `تمت إعادة اختبار الخطوة ${stepNumber} بنجاح (${data.execution_time_ms}ms)`
            : `Step ${stepNumber} re-executed successfully (${data.execution_time_ms}ms)`
        );
        void taskQuery.refetch();
        if (selectedStep && selectedStep.step_number === stepNumber) {
          setSelectedStep({
            ...selectedStep,
            execution_time_ms: data.execution_time_ms,
          });
        }
      } else {
        throw new Error(data.error || "Failed to re-run step");
      }
    } catch (err: any) {
      toast.error(err.message || "Error running step");
    } finally {
      setReRunningStep(null);
    }
  };

  const getStepIcon = (stepNum: number) => {
    switch (stepNum) {
      case 1: return <Globe className="h-4 w-4" />;
      case 2: return <Search className="h-4 w-4" />;
      case 3: return <Layers className="h-4 w-4" />;
      case 4: return <Sparkles className="h-4 w-4" />;
      case 5: return <Database className="h-4 w-4" />;
      case 6: return <Globe className="h-4 w-4" />;
      case 7: return <ExternalLink className="h-4 w-4" />;
      case 8: return <TrendingUp className="h-4 w-4" />;
      case 9: return <GitBranch className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-5 shadow-sm mt-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isRtl
                ? "تاسكات الذكاء الاصطناعي المتدرجة الحقيقية (Flowise Stepped Workflows 1–9)"
                : "Stepped Autonomous AI Tasks (Flowise Workflows 1–9)"}
            </h3>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {isRtl ? "دورة الـ 30 دقيقة الذاتية" : "30m Autonomous Cadence"}
            </span>
            {latestExecution?.has_fallbacks && (
              <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                <span>{isRtl ? "مسار بديل نشط (Fallback Active)" : "Fallback Active"}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {isRtl
              ? "تدفق هندسي حقيقي يتدرج عبر 9 خطوات، موثق بأسباب النجاح أو الفشل. أي خطوة تفشل أو تستخدم مساراً بديلاً تُعلم بالأحمر الفاقع فورياً مع فتح سجل تشريحي كامل."
              : "Real 9-step execution pipeline with complete diagnostics. Any step utilizing fallback is clearly highlighted in RED with clickable autopsy logs."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => void taskQuery.refetch()}
            disabled={taskQuery.isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${taskQuery.isFetching ? "animate-spin text-emerald-500" : ""}`} />
            <span>{isRtl ? "تحديث السجلات" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Stepper Pipeline Grid (1 to 9) */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((step) => {
          const isFallback = step.status === "fallback_active";
          const isSuccess = step.status === "success";
          const isFailed = step.status === "failed";
          const isRunning = step.status === "running";

          let borderStyle = "border-zinc-200 dark:border-zinc-800";
          let bgStyle = "bg-zinc-50 dark:bg-zinc-900/40";
          let badgeBg = "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
          let statusText = isRtl ? "في الانتظار" : "Pending";

          if (isFallback) {
            borderStyle = "border-red-500 dark:border-red-600 ring-2 ring-red-500/20";
            bgStyle = "bg-red-50/50 dark:bg-red-950/20";
            badgeBg = "bg-red-600 text-white font-bold shadow-sm shadow-red-500/30";
            statusText = isRtl ? "مسار بديل (Fallback)" : "Fallback Active";
          } else if (isSuccess) {
            borderStyle = "border-emerald-500/40 dark:border-emerald-500/30";
            bgStyle = "bg-emerald-50/20 dark:bg-emerald-950/10";
            badgeBg = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
            statusText = isRtl ? "نجاح أصلي" : "Primary OK";
          } else if (isFailed) {
            borderStyle = "border-red-700 bg-red-950/40";
            badgeBg = "bg-red-700 text-white";
            statusText = isRtl ? "فشلت" : "Failed";
          } else if (isRunning) {
            borderStyle = "border-blue-500 animate-pulse";
            badgeBg = "bg-blue-600 text-white";
            statusText = isRtl ? "قيد التنفيذ" : "Running";
          }

          return (
            <div
              key={step.id || step.step_number}
              onClick={() => setSelectedStep(step)}
              className={`rounded-xl border ${borderStyle} ${bgStyle} p-3.5 transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      isFallback
                        ? "bg-red-600 text-white"
                        : isSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                    }`}>
                      {step.step_number}
                    </span>
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                      {isRtl ? step.step_label_ar : step.step_name}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${badgeBg}`}>
                    {isFallback && <AlertTriangle className="h-3 w-3" />}
                    {isSuccess && <CheckCircle2 className="h-3 w-3" />}
                    <span>{statusText}</span>
                  </span>
                </div>

                <div className="mt-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {isFallback
                    ? (step.why_failed || step.why_succeeded)
                    : (step.why_succeeded || step.step_name)}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400">
                  {step.execution_time_ms ? `${step.execution_time_ms}ms` : "—"}
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-sans font-medium text-[11px] group-hover:underline">
                  <Eye className="h-3 w-3" />
                  <span>{isRtl ? "تشريح السجل" : "Inspect"}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Inspector Modal Drawer */}
      {selectedStep && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold font-mono text-sm ${
                  selectedStep.status === "fallback_active"
                    ? "bg-red-600 text-white"
                    : "bg-emerald-600 text-white"
                }`}>
                  {selectedStep.step_number}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {isRtl ? selectedStep.step_label_ar : selectedStep.step_name}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono" dir="ltr">
                    Step {selectedStep.step_number} · {selectedStep.step_name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Fallback Warning Box (RED) */}
            {selectedStep.status === "fallback_active" && (
              <div className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 p-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {isRtl
                      ? "تنبيه الفول باك: تم تحويل هذه الخطوة تلقائياً إلى المسار البديل (Fallback Triggered)"
                      : "Fallback Alert: Step automatically switched to secondary model"}
                  </span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                  {selectedStep.why_failed}
                </p>
              </div>
            )}

            {/* Success Box */}
            {selectedStep.status === "success" && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {isRtl ? "نجحت الخطوة عبر المسار الأساسي الأصلي بنسبة 100%" : "Step Succeeded via Primary Path (100%)"}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  {selectedStep.why_succeeded}
                </p>
              </div>
            )}

            {/* Diagnostic Details Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 p-3">
                <div className="text-zinc-500 font-medium">
                  {isRtl ? "المسار الأساسي (Primary)" : "Primary Source"}
                </div>
                <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                  {selectedStep.primary_source}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 p-3">
                <div className="text-zinc-500 font-medium">
                  {isRtl ? "المسار البديل (Fallback)" : "Fallback Source"}
                </div>
                <div className={`mt-1 font-semibold font-mono ${selectedStep.fallback_source ? "text-amber-500" : "text-zinc-400"}`}>
                  {selectedStep.fallback_source || (isRtl ? "غير مفعل (المسار الأساسي نجح)" : "Not needed")}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 p-3">
                <div className="text-zinc-500 font-medium">
                  {isRtl ? "زمن التنفيذ الفعلي" : "Execution Time"}
                </div>
                <div className="mt-1 font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {selectedStep.execution_time_ms ? `${selectedStep.execution_time_ms} ms` : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 p-3">
                <div className="text-zinc-500 font-medium">
                  {isRtl ? "حالة الخطوة البرمجية" : "Step Status"}
                </div>
                <div className={`mt-1 font-bold uppercase font-mono ${
                  selectedStep.status === "fallback_active" ? "text-red-500" : "text-emerald-500"
                }`}>
                  {selectedStep.status}
                </div>
              </div>
            </div>

            {/* Raw Error / Diagnostic Trace if any */}
            {selectedStep.raw_error_message && (
              <div className="mt-4">
                <div className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{isRtl ? "كود الخطأ البرمجي وسجل الـ API (Raw Error Trace):" : "Raw Error Trace:"}</span>
                </div>
                <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-red-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap" dir="ltr">
                  {selectedStep.raw_error_message}
                </pre>
              </div>
            )}

            {/* Payload Preview */}
            {selectedStep.payload_preview && (
              <div className="mt-4">
                <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                  {isRtl ? "مخرجات وبيانات الخطوة (Output Payload Preview):" : "Output Payload Preview:"}
                </div>
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] overflow-x-auto" dir="ltr">
                  {selectedStep.payload_preview}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={reRunningStep === selectedStep.step_number}
                onClick={() => handleReRunStep(selectedStep.step_number)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {reRunningStep === selectedStep.step_number ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                <span>{isRtl ? "إعادة فحص واختبار الخطوة فوراً" : "Re-run / Test Step Now"}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {isRtl ? "إغلاق النافذة" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
