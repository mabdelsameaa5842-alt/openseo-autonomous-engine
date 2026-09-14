import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
  Check,
  Clock,
  Database,
  Sparkles,
  Globe,
  Sliders,
  Shield,
  Layers,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import type { CanvasNode } from "./AutomationFlowCanvas";

interface NodeInspectorDrawerProps {
  node: CanvasNode | null;
  onClose: () => void;
  onSaveNode: (updatedNode: CanvasNode) => void;
  isRtl?: boolean;
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  onClose,
  onSaveNode,
  isRtl = true,
}) => {
  const [label, setLabel] = useState("");
  const [dataFields, setDataFields] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      setLabel(node.label || "");
      setDataFields(node.data || {});
    }
  }, [node]);

  if (!node) return null;

  const handleFieldChange = (key: string, value: any) => {
    setDataFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSaveNode({
      ...node,
      label,
      data: dataFields,
    });
    toast.success(isRtl ? "تم حفظ تعديلات العقدة بنجاح" : "Node parameters saved");
    onClose();
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {isRtl ? "تخصيص العقدة (Inspector)" : "Node Inspector"}
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              ID: {node.id} • {node.category}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body: Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {isRtl ? "اسم العقدة (Label)" : "Node Label"}
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Dynamic Category Specific Fields */}
        {node.category === "trigger" && (
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>{isRtl ? "إعدادات التردد والجدولة" : "Schedule Settings"}</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-500">
                {isRtl ? "صيغة Cron أو التردد" : "Cron Schedule Expression"}
              </label>
              <input
                type="text"
                value={dataFields.cron || dataFields.schedule || ""}
                onChange={(e) => handleFieldChange("schedule", e.target.value)}
                placeholder="*/30 * * * *"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-500">
                {isRtl ? "مهلة المراقبة (Watchdog Minutes)" : "Watchdog Timeout"}
              </label>
              <input
                type="number"
                value={dataFields.watchdogMinutes || 15}
                onChange={(e) => handleFieldChange("watchdogMinutes", Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {node.category === "ai" && (
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>{isRtl ? "إعدادات الذكاء الاصطناعي" : "AI Model Settings"}</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-500">
                {isRtl ? "النموذج (Model)" : "Model"}
              </label>
              <select
                value={dataFields.model || "gemini-2.0-flash"}
                onChange={(e) => handleFieldChange("model", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Native Speed)</option>
                <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Deep Depth)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-500">
                {isRtl ? "نبرة الصوت والهوية (Tone & Brand)" : "Tone of Voice"}
              </label>
              <input
                type="text"
                value={dataFields.brandTone || dataFields.tone || "Saudi Authority B2B"}
                onChange={(e) => handleFieldChange("brandTone", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-500">
                {isRtl ? "التعليمات والتركيز المخصص (Prompt Directive)" : "Prompt Directive"}
              </label>
              <textarea
                rows={3}
                value={dataFields.promptDirective || dataFields.promptFocus || ""}
                onChange={(e) => handleFieldChange("promptDirective", e.target.value)}
                placeholder={isRtl ? "أدخل تعليمات خاصة لتوليد المحتوى..." : "Custom guidelines..."}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {node.category === "output" && (
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span>{isRtl ? "إعدادات النشر والويب هوك" : "Publishing Webhook"}</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-500">
                {isRtl ? "الدومين المستهدف" : "Target Domain"}
              </label>
              <input
                type="text"
                value={dataFields.domain || ""}
                onChange={(e) => handleFieldChange("domain", e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* General Key-Value Inspector for other fields */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            {isRtl ? "البيانات الفنية للعقدة (Raw Data)" : "Parameters"}
          </label>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-2.5 space-y-1.5 max-h-40 overflow-y-auto">
            {Object.entries(dataFields).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">{k}:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-[150px]">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
        >
          {isRtl ? "إلغاء" : "Cancel"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-500 transition shadow-sm cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isRtl ? "حفظ التعديلات" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
};
