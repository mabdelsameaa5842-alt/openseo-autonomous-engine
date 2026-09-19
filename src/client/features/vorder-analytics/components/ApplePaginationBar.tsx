import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  ChevronDown,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

export interface ApplePaginationBarProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isRtl?: boolean;
  itemLabel?: string;
  className?: string;
}

export const ApplePaginationBar: React.FC<ApplePaginationBarProps> = ({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100, 250, 500, 1000],
  onPageChange,
  onPageSizeChange,
  isRtl = true,
  itemLabel = "مقال",
  className = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (validPage - 1) * pageSize + 1;
  const endItem = Math.min(validPage * pageSize, totalItems);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Generate pagination buttons with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, validPage - 1);
      const end = Math.min(totalPages - 1, validPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (validPage < totalPages - 2) {
        pages.push("...");
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(jumpInput.trim());
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      setJumpInput("");
    }
  };

  return (
    <div
      className={`relative flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-xs text-zinc-600 dark:text-zinc-300 ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Left: Range Info & Page Size Pull-down Picker */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-zinc-500 dark:text-zinc-400">
          {isRtl ? (
            <>
              عرض <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{startItem.toLocaleString()}</strong>–<strong className="font-semibold text-zinc-900 dark:text-zinc-100">{endItem.toLocaleString()}</strong> من أصل <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems.toLocaleString()}</strong> {itemLabel}
            </>
          ) : (
            <>
              Showing <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{startItem.toLocaleString()}</strong>–<strong className="font-semibold text-zinc-900 dark:text-zinc-100">{endItem.toLocaleString()}</strong> of <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems.toLocaleString()}</strong> {itemLabel}s
            </>
          )}
        </span>

        {/* Liquid Glass Pull-down Picker */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
            aria-expanded={isDropdownOpen}
            aria-label="Select items per page"
          >
            <SlidersHorizontal className="h-3 w-3 text-indigo-500" />
            <span>
              {pageSize} {isRtl ? "/ صفحة" : "/ page"}
            </span>
            <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 z-50 min-w-[170px] rounded-2xl p-1.5 backdrop-blur-2xl bg-white/95 dark:bg-[#18181b]/95 border border-zinc-200/90 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {isRtl ? "التدرج الذكي للعرض" : "Page Graduation Scale"}
              </div>
              <div className="space-y-0.5 mt-1">
                {pageSizeOptions.map((opt) => {
                  const isSelected = opt === pageSize;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onPageSizeChange(opt);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                          : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{opt}</span>
                        <span className="text-[11px] opacity-75">
                          {opt >= 500 ? (isRtl ? "(شامل)" : "(Panoramic)") : isRtl ? "عنصر" : "items"}
                        </span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Stepper Buttons & Jump to Page */}
      <div className="flex items-center gap-2">
        {/* Navigation Steppers */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={validPage <= 1}
            className="p-1.5 rounded-xl border border-zinc-200/60 dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title={isRtl ? "الصفحة الأولى" : "First Page"}
          >
            {isRtl ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
          </button>

          {/* Prev Page */}
          <button
            type="button"
            onClick={() => onPageChange(validPage - 1)}
            disabled={validPage <= 1}
            className="p-1.5 rounded-xl border border-zinc-200/60 dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title={isRtl ? "الصفحة السابقة" : "Previous Page"}
          >
            {isRtl ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`ellipsis_${idx}`} className="px-1 text-zinc-400 font-mono text-xs">
                    …
                  </span>
                );
              }
              const isCurrent = p === validPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm scale-105"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(validPage + 1)}
            disabled={validPage >= totalPages}
            className="p-1.5 rounded-xl border border-zinc-200/60 dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title={isRtl ? "الصفحة التالية" : "Next Page"}
          >
            {isRtl ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={validPage >= totalPages}
            className="p-1.5 rounded-xl border border-zinc-200/60 dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title={isRtl ? "الصفحة الأخيرة" : "Last Page"}
          >
            {isRtl ? <ChevronsLeft className="h-3.5 w-3.5" /> : <ChevronsRight className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Jump-to-Page Input */}
        {totalPages > 5 && (
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 mr-2 rtl:mr-2 ltr:ml-2">
            <span className="text-[11px] text-zinc-400">{isRtl ? "انتقال:" : "Go to:"}</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={String(validPage)}
              className="w-12 h-7 px-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-center font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </form>
        )}
      </div>
    </div>
  );
};
