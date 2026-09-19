import React from "react";
import { Zap, Trash2, Download, X, CheckSquare } from "lucide-react";

export interface BatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkPublish?: () => void;
  onBulkDelete?: () => void;
  onBulkExportCsv?: () => void;
  isPublishing?: boolean;
  isDeleting?: boolean;
  isRtl?: boolean;
  itemLabel?: string;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkPublish,
  onBulkDelete,
  onBulkExportCsv,
  isPublishing = false,
  isDeleting = false,
  isRtl = true,
  itemLabel = "مقال",
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed bottom-6 inset-x-0 mx-auto w-fit max-w-xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-200"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-3xl bg-zinc-900/90 dark:bg-zinc-800/90 text-white border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)] text-xs">
        {/* Count badge */}
        <div className="flex items-center gap-2 pr-2 rtl:pr-0 rtl:pl-2 border-r rtl:border-r-0 rtl:border-l border-white/15">
          <CheckSquare className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="font-semibold whitespace-nowrap">
            {isRtl ? (
              <>
                تم تحديد <strong className="font-mono text-indigo-300 font-bold">{selectedCount}</strong> {itemLabel}
              </>
            ) : (
              <>
                <strong className="font-mono text-indigo-300 font-bold">{selectedCount}</strong> {itemLabel}s selected
              </>
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onBulkPublish && (
            <button
              type="button"
              onClick={onBulkPublish}
              disabled={isPublishing || isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold transition disabled:opacity-50 cursor-pointer shadow-sm"
              title={isRtl ? "نشر المقالات المحددة فورياً" : "Publish Selected Articles"}
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>{isPublishing ? (isRtl ? "جاري النشر..." : "Publishing...") : isRtl ? "نشر فوري" : "Publish"}</span>
            </button>
          )}

          {onBulkExportCsv && (
            <button
              type="button"
              onClick={onBulkExportCsv}
              disabled={isPublishing || isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-100 font-medium transition disabled:opacity-50 cursor-pointer"
              title={isRtl ? "تصدير المحددة إلى ملف CSV" : "Export selected as CSV"}
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isRtl ? "تصدير CSV" : "Export CSV"}</span>
            </button>
          )}

          {onBulkDelete && (
            <button
              type="button"
              onClick={onBulkDelete}
              disabled={isPublishing || isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 active:scale-95 text-white font-bold transition disabled:opacity-50 cursor-pointer"
              title={isRtl ? "حذف العناصر المحددة" : "Delete selected items"}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isDeleting ? (isRtl ? "جاري الحذف..." : "Deleting...") : isRtl ? "حذف" : "Delete"}</span>
            </button>
          )}

          {/* Deselect button */}
          <button
            type="button"
            onClick={onClearSelection}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={isRtl ? "إلغاء التحديد" : "Clear selection"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
