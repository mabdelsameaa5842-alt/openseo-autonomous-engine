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
  Trash2,
  ArrowRight,
  Plus,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import type { CanvasNode, CanvasEdge } from "./AutomationFlowCanvas";

interface NodeInspectorDrawerProps {
  node: CanvasNode | null;
  allNodes?: CanvasNode[];
  edges?: CanvasEdge[];
  onClose: () => void;
  onSaveNode: (updatedNode: CanvasNode) => void;
  onDeleteNode?: (nodeId: string) => void;
  onAddEdge?: (from: string, to: string) => void;
  onRemoveEdge?: (edgeId: string) => void;
  isRtl?: boolean;
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  allNodes = [],
  edges = [],
  onClose,
  onSaveNode,
  onDeleteNode,
  onAddEdge,
  onRemoveEdge,
  isRtl = true,
}) => {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<CanvasNode["category"]>("engine");
  const [dataFields, setDataFields] = useState<Record<string, any>>({});
  const [targetNodeIdToConnect, setTargetNodeIdToConnect] = useState("");

  useEffect(() => {
    if (node) {
      setLabel(node.label || "");
      setCategory(node.category || "engine");
      setDataFields(node.data || {});
      setTargetNodeIdToConnect("");
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
      category,
      data: dataFields,
    });
    toast.success(isRtl ? "تم حفظ تعديلات العقدة بنجاح" : "Node parameters saved");
    onClose();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        isRtl
          ? `هل أنت متأكد من حذف العقدة "${node.label}"؟`
          : `Are you sure you want to delete "${node.label}"?`
      )
    ) {
      if (onDeleteNode) {
        onDeleteNode(node.id);
        toast.success(isRtl ? "تم حذف العقدة" : "Node deleted");
      }
      onClose();
    }
  };

  const handleConnectToTarget = () => {
    if (!targetNodeIdToConnect || !onAddEdge) return;
    onAddEdge(node.id, targetNodeIdToConnect);
    toast.success(isRtl ? "تم إنشاء الرابط بنجاح" : "Edge connected successfully");
    setTargetNodeIdToConnect("");
  };

  const outgoingEdges = edges.filter((e) => e.from === node.id);
  const incomingEdges = edges.filter((e) => e.to === node.id);
  const potentialTargets = allNodes.filter((n) => n.id !== node.id);

  return (
    <>
      {/* Drawer Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 z-50 w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in duration-300 ${
          isRtl
            ? "left-0 border-r slide-in-from-left"
            : "right-0 border-l slide-in-from-right"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {isRtl ? "تخصيص العقدة (Node Inspector)" : "Node Inspector"}
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">
                ID: {node.id} • {category}
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
              {isRtl ? "اسم وتسمية العقدة" : "Node Label"}
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
            />
          </div>

          {/* Node Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {isRtl ? "تصنيف العقدة (Category)" : "Category"}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
            >
              <option value="trigger">محفز تشغيل (Trigger)</option>
              <option value="source">مصدر بيانات سيو (SEO Source)</option>
              <option value="engine">محرك أتمتة (Automation Engine)</option>
              <option value="ai">ذكاء اصطناعي وتوليد (AI Model)</option>
              <option value="output">ناشر ومخرج (Publisher/Output)</option>
              <option value="audit">تدقيق وفحص (SEO Audit)</option>
            </select>
          </div>

          {/* Dynamic Category Specific Fields */}
          {category === "trigger" && (
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
            </div>
          )}

          {category === "ai" && (
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
                  {isRtl ? "التعليمات والتوجيه (Prompt Directive)" : "Prompt Directive"}
                </label>
                <textarea
                  rows={3}
                  value={dataFields.promptDirective || dataFields.promptFocus || ""}
                  onChange={(e) => handleFieldChange("promptDirective", e.target.value)}
                  placeholder={isRtl ? "أدخل توجيهات صياغة المحتوى..." : "Custom guidelines..."}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {category === "output" && (
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span>{isRtl ? "إعدادات النشر" : "Publishing Settings"}</span>
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

          {/* Connections Section */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <Link2 className="h-4 w-4 text-indigo-400" />
              <span>{isRtl ? "الربط ومسارات التدفق (DAG Connections)" : "Connections"}</span>
            </div>

            {/* Outgoing Edges List */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-500 block">
                {isRtl ? "ترسل مخرجاتها إلى (Outgoing):" : "Connects to (Outgoing):"}
              </span>
              {outgoingEdges.length === 0 ? (
                <p className="text-[11px] text-zinc-400 italic">
                  {isRtl ? "لا توجد عقد مرتبطة بعد" : "No outgoing connections"}
                </p>
              ) : (
                <div className="space-y-1">
                  {outgoingEdges.map((e) => {
                    const targetNode = allNodes.find((n) => n.id === e.to);
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ArrowRight className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {targetNode?.label || e.to}
                          </span>
                        </div>
                        {onRemoveEdge && (
                          <button
                            type="button"
                            onClick={() => onRemoveEdge(e.id)}
                            className="text-zinc-400 hover:text-red-500 p-1 transition"
                            title={isRtl ? "إلغاء الربط" : "Disconnect"}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Connection */}
            {onAddEdge && potentialTargets.length > 0 && (
              <div className="pt-2 flex items-center gap-2">
                <select
                  value={targetNodeIdToConnect}
                  onChange={(e) => setTargetNodeIdToConnect(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="">{isRtl ? "اختر عقدة للربط معها..." : "Select node to connect..."}</option>
                  {potentialTargets
                    .filter((t) => !outgoingEdges.some((e) => e.to === t.id))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} ({t.category})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!targetNodeIdToConnect}
                  onClick={handleConnectToTarget}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-40 transition"
                >
                  {isRtl ? "ربط +" : "Connect"}
                </button>
              </div>
            )}
          </div>

          {/* Raw Parameters */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              {isRtl ? "معايير العقدة (Raw Data)" : "Parameters"}
            </label>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-2.5 space-y-1.5 max-h-36 overflow-y-auto">
              {Object.entries(dataFields).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">{k}:</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-[160px]">
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Save and Delete Node */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
          {onDeleteNode && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isRtl ? "حذف العقدة" : "Delete"}</span>
            </button>
          )}
          <div className="flex items-center gap-2">
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
              <span>{isRtl ? "حفظ التعديلات" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
