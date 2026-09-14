import React, { useState, useEffect } from "react";
import {
  Zap,
  Play,
  Save,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronDown,
  Layers,
  Settings2,
  TrendingUp,
  Search,
  MapPin,
  Flame,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { FlowGraph, WorkflowType } from "@/server/features/automation/flowEngine";

interface WorkflowManagerBarProps {
  projectId: string;
  workflows: FlowGraph[];
  selectedWorkflowId: string;
  onSelectWorkflow: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onSaveWorkflow: () => Promise<void>;
  onRunTest: () => Promise<void>;
  onOpenAiChat: () => void;
  onOpenAddNode?: () => void;
  onCreateWorkflow: (type?: WorkflowType) => void;
  onDeleteWorkflow?: (id: string) => Promise<void>;
  isSaving?: boolean;
  isRunning?: boolean;
  isRtl?: boolean;
}

const getWorkflowIcon = (type?: WorkflowType) => {
  switch (type) {
    case "rank_auditor":
      return <TrendingUp className="h-4 w-4 text-amber-400" />;
    case "competitor_spy":
      return <Search className="h-4 w-4 text-purple-400" />;
    case "local_booster":
      return <MapPin className="h-4 w-4 text-sky-400" />;
    case "continuous_publishing":
    default:
      return <Flame className="h-4 w-4 text-emerald-400" />;
  }
};

export const WorkflowManagerBar: React.FC<WorkflowManagerBarProps> = ({
  projectId,
  workflows,
  selectedWorkflowId,
  onSelectWorkflow,
  onToggleActive,
  onSaveWorkflow,
  onRunTest,
  onOpenAiChat,
  onOpenAddNode,
  onCreateWorkflow,
  onDeleteWorkflow,
  isSaving = false,
  isRunning = false,
  isRtl = true,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsNewMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentWorkflow =
    workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const handleToggle = async () => {
    if (!currentWorkflow || isToggling) return;
    setIsToggling(true);
    try {
      const nextActive = !currentWorkflow.isActive;
      await onToggleActive(currentWorkflow.id, nextActive);
      toast.success(
        nextActive
          ? isRtl
            ? `تم تنشيط مسار "${currentWorkflow.name}" بنجاح 🟢`
            : `Activated "${currentWorkflow.name}" successfully 🟢`
          : isRtl
          ? `تم تعطيل مسار "${currentWorkflow.name}" مؤقتاً ⚪`
          : `Deactivated "${currentWorkflow.name}" ⚪`
      );
    } catch {
      toast.error(isRtl ? "تعذر تغيير حالة التدفق" : "Failed to toggle workflow");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      {/* Invisible Global Backdrop to dismiss menus when clicking outside */}
      {(isDropdownOpen || isNewMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsNewMenuOpen(false);
          }}
        />
      )}

      <div
        className={`relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3 sm:p-4 shadow-sm backdrop-blur-md mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          isDropdownOpen || isNewMenuOpen ? "z-50" : "z-30"
        }`}
      >
        {/* Left: Workflow Switcher Dropdown & Active Switch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNewMenuOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90 px-3.5 py-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition shadow-sm cursor-pointer"
            >
              <div className="h-6 w-6 rounded-lg bg-zinc-900 dark:bg-zinc-950 flex items-center justify-center border border-zinc-700/50 shrink-0">
                {getWorkflowIcon(currentWorkflow?.workflowType)}
              </div>
              <span
                className="truncate max-w-[200px] sm:max-w-[320px] md:max-w-[420px]"
                title={currentWorkflow?.name}
              >
                {currentWorkflow?.name || (isRtl ? "اختر التدفق" : "Select Flow")}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                  currentWorkflow?.isActive
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    : "bg-zinc-400"
                }`}
              />
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-indigo-500" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu - Highest Z-Index (z-50) & Clean Elevation */}
            {isDropdownOpen && (
              <div
                className={`absolute top-full mt-2 w-84 sm:w-96 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 ${
                  isRtl ? "right-0" : "left-0"
                }`}
                style={{ filter: "drop-shadow(0 20px 25px rgb(0 0 0 / 0.25))" }}
              >
                <div className="px-3 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span>{isRtl ? "مسارات الأتمتة المتاحة" : "Available Workflows"}</span>
                  <span className="font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {workflows.length} {isRtl ? "مسارات" : "flows"}
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto py-1 space-y-1">
                  {workflows.map((flow) => (
                    <div
                      key={flow.id}
                      onClick={() => {
                        onSelectWorkflow(flow.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition text-xs ${
                        flow.id === currentWorkflow?.id
                          ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                          {getWorkflowIcon(flow.workflowType)}
                        </div>
                        <div className="truncate">
                          <div className="truncate font-bold text-xs sm:text-sm">{flow.name}</div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{flow.cronExpression || "*/30 * * * *"}</span>
                            <span>•</span>
                            <span>
                              {flow.nodes?.length || 0} {isRtl ? "عقد" : "nodes"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`h-3 w-3 rounded-full shrink-0 ${
                          flow.isActive
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                            : "bg-zinc-400 dark:bg-zinc-600"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Independent Activation Toggle Switch */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              dir="ltr"
              onClick={handleToggle}
              disabled={isToggling}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                currentWorkflow?.isActive
                  ? "bg-emerald-500"
                  : "bg-zinc-400 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  currentWorkflow?.isActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 select-none">
              {currentWorkflow?.isActive
                ? isRtl
                  ? "نشط 🟢"
                  : "Active"
                : isRtl
                ? "معطل ⚪"
                : "Inactive"}
            </span>
          </div>

          {/* Schedule Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>{currentWorkflow?.cronExpression || "*/30 * * * *"}</span>
          </div>
        </div>

        {/* Right: Actions (Gemini Co-Pilot, Add Node, Add Flow, Run Test, Save) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Gemini AI Co-Pilot Button (Hero) */}
          <button
            type="button"
            onClick={onOpenAiChat}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white px-3.5 py-2 text-xs font-bold shadow-md hover:opacity-95 transition transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: "8s" }} />
            <span>{isRtl ? "مساعد Gemini AI" : "Gemini AI Co-Pilot"}</span>
          </button>

          {/* Manual Add Node Button */}
          {onOpenAddNode && (
            <button
              type="button"
              onClick={onOpenAddNode}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isRtl ? "إضافة عقدة" : "Add Node"}</span>
            </button>
          )}

          {/* New Workflow Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNewMenuOpen(!isNewMenuOpen);
                setIsDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-500" />
              <span>{isRtl ? "مسار جديد" : "New Flow"}</span>
            </button>

            {isNewMenuOpen && (
              <div
                className={`absolute top-full mt-2 w-72 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 ${
                  isRtl ? "left-0" : "right-0"
                }`}
                style={{ filter: "drop-shadow(0 20px 25px rgb(0 0 0 / 0.25))" }}
              >
                <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {isRtl ? "إنشاء مسار أتمتة" : "Create Workflow"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onOpenAiChat();
                  }}
                  className="w-full text-right flex items-center gap-2.5 p-2 rounded-xl hover:bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400 transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isRtl ? "🤖 توليد ذكي عبر Gemini AI" : "Generate with Gemini AI"}</span>
                </button>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onCreateWorkflow("rank_auditor");
                  }}
                  className="w-full text-right flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                  <span>{isRtl ? "قالب: مراقب ترتيب GSC اليومي" : "Template: Rank Auditor"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onCreateWorkflow("competitor_spy");
                  }}
                  className="w-full text-right flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition"
                >
                  <Search className="h-3.5 w-3.5 text-purple-500" />
                  <span>{isRtl ? "قالب: قناص المنافسين الأسبوعي" : "Template: Competitor Spy"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onCreateWorkflow("local_booster");
                  }}
                  className="w-full text-right flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition"
                >
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  <span>{isRtl ? "قالب: سيو الخرائط المحلي" : "Template: Local Maps Booster"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Run Test Button */}
          <button
            type="button"
            onClick={onRunTest}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRtl ? "تشغيل تجريبي" : "Run Test"}</span>
          </button>

          {/* Save Workflow Button */}
          <button
            type="button"
            onClick={onSaveWorkflow}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            <Save className={`h-3.5 w-3.5 text-indigo-500 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isRtl ? "حفظ التدفق" : "Save"}</span>
          </button>

          {/* Delete Workflow (if > 1 workflow) */}
          {workflows.length > 1 && onDeleteWorkflow && (
            <button
              type="button"
              onClick={async () => {
                if (
                  window.confirm(
                    isRtl
                      ? `هل أنت متأكد من حذف مسار "${currentWorkflow?.name}"؟`
                      : `Are you sure you want to delete "${currentWorkflow?.name}"?`
                  )
                ) {
                  await onDeleteWorkflow(currentWorkflow.id);
                }
              }}
              title={isRtl ? "حذف المسار" : "Delete workflow"}
              className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
