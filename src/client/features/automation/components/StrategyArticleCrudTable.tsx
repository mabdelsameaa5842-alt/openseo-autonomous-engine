import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  X,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

interface ArticleItem {
  id: string;
  queue_order: number;
  article_slug: string;
  article_title: string;
  intent: string;
  primary_keyword: string;
  secondary_keywords: string[];
  monthly_volume: number;
  brief_outline: string[];
  status: "queued" | "published";
  published_at?: string;
  article_url?: string;
  target_market: string;
  strategic_rationale: string;
  engine?: string;
  engineLabel?: string;
}

interface StrategyArticleCrudTableProps {
  projectId: string;
  projectDomain?: string;
  isRtl?: boolean;
  onMutationSuccess?: () => void;
}

export function StrategyArticleCrudTable({
  projectId,
  projectDomain = "mohamed-abdelsamee-portfolio.vercel.app",
  isRtl = true,
  onMutationSuccess,
}: StrategyArticleCrudTableProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [totalMatching, setTotalMatching] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filter & Pagination States
  const [statusTab, setStatusTab] = useState<"all" | "queued" | "published">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [previewArticle, setPreviewArticle] = useState<ArticleItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    primaryKeyword: "",
    slug: "",
    targetMarket: "مصر والخليج (B2B & CAPI)",
    monthlyVolume: 1500,
    rationale: "مقال استراتيجي ذو عائد تحويلي مرتفع لمضاعفة المبيعات العضوية.",
    publishNow: false,
  });

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        projectId,
        page: String(page),
        limit: String(limit),
      });
      if (statusTab !== "all") params.set("status", statusTab);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/automation/queue?${params.toString()}`);
      const data = (await res.json()) as any;
      if (data?.success) {
        setArticles(data.queue || []);
        setTotalMatching(data.pagination?.total || data.total || 0);
        setSummary(data.summary || null);
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطأ في جلب المقالات" : "Failed to load articles"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [projectId, statusTab, page, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalMatching / limit));

  // Add Article
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryKeyword.trim()) {
      toast.error(isRtl ? "يرجى كتابة الكلمة المفتاحية" : "Keyword is required");
      return;
    }

    try {
      const res = await fetch(`/api/automation/queue?projectId=${encodeURIComponent(projectId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          article_title: formData.title.trim() || formData.primaryKeyword.trim(),
          primary_keyword: formData.primaryKeyword.trim(),
          article_slug: formData.slug.trim() || undefined,
          target_market: formData.targetMarket,
          monthly_volume: Number(formData.monthlyVolume),
          strategic_rationale: formData.rationale,
          publish_now: formData.publishNow,
        }),
      });
      const data = (await res.json()) as any;
      if (data?.success) {
        toast.success(
          isRtl
            ? formData.publishNow
              ? "تم إنشاء ونشر المقال فوراً بنجاح!"
              : "تمت إضافة المقال إلى طابور الأتمتة بنجاح!"
            : formData.publishNow
              ? "Article created and published instantly!"
              : "Article added to queue successfully!"
        );
        setIsAddModalOpen(false);
        setFormData({
          title: "",
          primaryKeyword: "",
          slug: "",
          targetMarket: "مصر والخليج (B2B & CAPI)",
          monthlyVolume: 1500,
          rationale: "مقال استراتيجي ذو عائد تحويلي مرتفع لمضاعفة المبيعات العضوية.",
          publishNow: false,
        });
        fetchArticles();
        if (onMutationSuccess) onMutationSuccess();
      } else {
        toast.error(data?.error || (isRtl ? "تعذر إنشاء المقال" : "Failed to create article"));
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطأ أثناء الحفظ" : "Save error"));
    }
  };

  // Edit Article
  const openEditModal = (art: ArticleItem) => {
    setEditingArticle(art);
    setFormData({
      title: art.article_title,
      primaryKeyword: art.primary_keyword,
      slug: art.article_slug,
      targetMarket: art.target_market || "مصر والخليج",
      monthlyVolume: art.monthly_volume || 1500,
      rationale: art.strategic_rationale || "",
      publishNow: false,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    try {
      const res = await fetch(`/api/automation/queue?projectId=${encodeURIComponent(projectId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingArticle.id,
          article_title: formData.title.trim(),
          article_slug: formData.slug.trim(),
          primary_keyword: formData.primaryKeyword.trim(),
          target_market: formData.targetMarket,
          monthly_volume: Number(formData.monthlyVolume),
          strategic_rationale: formData.rationale,
        }),
      });
      const data = (await res.json()) as any;
      if (data?.success) {
        toast.success(isRtl ? "تم تحديث بيانات المقال بنجاح!" : "Article updated successfully!");
        setIsEditModalOpen(false);
        setEditingArticle(null);
        fetchArticles();
        if (onMutationSuccess) onMutationSuccess();
      } else {
        toast.error(data?.error || (isRtl ? "تعذر التعديل" : "Failed to update"));
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطأ أثناء التعديل" : "Update error"));
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm(isRtl ? "هل أنت متأكد من حذف هذا المقال من الطابور؟" : "Are you sure you want to delete this article?")) {
      return;
    }

    try {
      const res = await fetch(`/api/automation/queue?projectId=${encodeURIComponent(projectId)}&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as any;
      if (data?.success) {
        toast.success(isRtl ? "تم حذف المقال بنجاح" : "Article deleted successfully");
        fetchArticles();
        if (onMutationSuccess) onMutationSuccess();
      } else {
        toast.error(data?.error || (isRtl ? "تعذر الحذف" : "Failed to delete"));
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطأ في الشبكة" : "Network error"));
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(isRtl ? `هل أنت متأكد من حذف ${selectedIds.length} مقالاً دفعة واحدة؟` : `Delete ${selectedIds.length} selected articles?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/automation/queue?projectId=${encodeURIComponent(projectId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = (await res.json()) as any;
      if (data?.success) {
        toast.success(isRtl ? `تم حذف ${data.deleted} مقالاً بنجاح` : `Deleted ${data.deleted} articles`);
        setSelectedIds([]);
        fetchArticles();
        if (onMutationSuccess) onMutationSuccess();
      } else {
        toast.error(data?.error || (isRtl ? "تعذر الحذف الجماعي" : "Bulk delete failed"));
      }
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطأ أثناء الحذف" : "Delete error"));
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a.id));
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 md:p-8 shadow-sm space-y-6">
      {/* Table Header & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>{isRtl ? "مركز إدارة المقالات وأتمتة الـ CRUD الحي" : "Autonomous Article CRUD & Queue Command Table"}</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {isRtl
              ? `تحكم كامل في خط إنتاج المحتوى لـ ${projectDomain}: إضافة يدوية، تعديل فوري، معاينة دلالية، وحذف فردي أو جماعي بنسبة 100% نجاح.`
              : `End-to-end content production lifecycle: manual creation, inline editing, instant publishing, and bulk actions.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isRtl ? `حذف المحدد (${selectedIds.length})` : `Delete Selected (${selectedIds.length})`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-sm hover:shadow-indigo-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isRtl ? "إضافة مقال مخصص للطابور" : "Add Custom Article"}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchArticles()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{isRtl ? "تحديث" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800/70 p-1 border border-zinc-200/50 dark:border-zinc-700/50 text-xs">
          <button
            type="button"
            onClick={() => { setStatusTab("all"); setPage(1); }}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition-colors ${
              statusTab === "all"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {isRtl ? "الكل" : "All"} ({summary?.total_queue_articles || totalMatching})
          </button>
          <button
            type="button"
            onClick={() => { setStatusTab("queued"); setPage(1); }}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition-colors flex items-center gap-1.5 ${
              statusTab === "queued"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>{isRtl ? "في الطابور" : "Queued"} ({summary?.queued_articles ?? 0})</span>
          </button>
          <button
            type="button"
            onClick={() => { setStatusTab("published"); setPage(1); }}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition-colors flex items-center gap-1.5 ${
              statusTab === "published"
                ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>{isRtl ? "المنشور الحي" : "Published"} ({summary?.published_articles ?? 0})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 right-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder={isRtl ? "بحث بالعنوان أو الكلمة أو الرابط..." : "Search title, keyword, or slug..."}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 pl-3 pr-9 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-right text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="p-3.5 w-8">
                <input
                  type="checkbox"
                  checked={articles.length > 0 && selectedIds.length === articles.length}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="p-3.5 w-12">#</th>
              <th className="p-3.5">{isRtl ? "عنوان المقال والكلمة المستهدفة" : "Article Title & Target Keyword"}</th>
              <th className="p-3.5">{isRtl ? "السوق والنية" : "Market & Intent"}</th>
              <th className="p-3.5">{isRtl ? "حجم البحث" : "Volume"}</th>
              <th className="p-3.5">{isRtl ? "الحالة" : "Status"}</th>
              <th className="p-3.5 text-center w-36">{isRtl ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-500" />
                  <span>{isRtl ? "جاري تحميل جدول المقالات..." : "Loading articles..."}</span>
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  {isRtl ? "لا توجد مقالات تطابق هذا البحث أو الفلتر." : "No articles found matching query."}
                </td>
              </tr>
            ) : (
              articles.map((art) => (
                <tr key={art.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(art.id)}
                      onChange={() => toggleSelect(art.id)}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-3.5 font-mono text-zinc-400 text-[11px]">
                    {art.queue_order}
                  </td>
                  <td className="p-3.5 max-w-md">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs line-clamp-1">
                      {art.article_title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {art.primary_keyword}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 truncate max-w-[200px]" dir="ltr">
                        /blog/{art.article_slug}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="text-zinc-700 dark:text-zinc-300 text-[11px] block">
                      {art.target_market}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mt-0.5">
                      {art.intent}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-zinc-700 dark:text-zinc-300 text-xs">
                    {art.monthly_volume?.toLocaleString() || 1200}
                  </td>
                  <td className="p-3.5">
                    {art.status === "published" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{isRtl ? "منشور حي" : "Published"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        <Clock className="h-3 w-3" />
                        <span>{isRtl ? "في الطابور" : "Queued"}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="inline-flex items-center gap-1">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewArticle(art)}
                        title={isRtl ? "معاينة التفاصيل" : "Preview"}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(art)}
                        title={isRtl ? "تعديل المقال" : "Edit"}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-600 transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {/* Open live if published */}
                      {art.status === "published" && (
                        <a
                          href={`https://${projectDomain}/blog/${art.article_slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title={isRtl ? "فتح الرابط الحي" : "Open Live"}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-600 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id)}
                        title={isRtl ? "حذف" : "Delete"}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 pt-1">
        <span>
          {isRtl ? `عرض ${(page - 1) * limit + 1} إلى ${Math.min(page * limit, totalMatching)} من إجمالي ${totalMatching} مقالاً` : `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, totalMatching)} of ${totalMatching}`}
        </span>

        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" />
                <span>{isRtl ? "إضافة مقال استراتيجي جديد للطابور" : "Create New Strategic Article"}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? "الكلمة المفتاحية الرئيسية (إلزامية):" : "Primary Keyword (Required):"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: تتبع التحويلات CAPI شوبيفاي" : "e.g. CAPI Conversion Tracking Shopify"}
                  value={formData.primaryKeyword}
                  onChange={(e) => setFormData({ ...formData, primaryKeyword: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? "عنوان المقال الكامل (اختياري، يولد تلقائياً):" : "Full Article Title (Optional):"}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? "اتركه فارغاً للصياغة الذاتية الذكية..." : "Leave empty for dynamic generation..."}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {isRtl ? "السوق والمدينة:" : "Target Market:"}
                  </label>
                  <input
                    type="text"
                    value={formData.targetMarket}
                    onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {isRtl ? "حجم البحث المتوقع:" : "Monthly Volume:"}
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publishNowCheckbox"
                  checked={formData.publishNow}
                  onChange={(e) => setFormData({ ...formData, publishNow: e.target.checked })}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="publishNowCheckbox" className="font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  {isRtl ? "نشر فوري الآن وبث التحديث لـ IndexNow وجوجل" : "Publish instantly and dispatch to IndexNow & GSC"}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  {isRtl ? "حفظ وإدراج" : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-indigo-600" />
                <span>{isRtl ? "تعديل بيانات المقال في الطابور" : "Edit Article in Queue"}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? "عنوان المقال:" : "Article Title:"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? "الرابط (Slug):" : "Slug:"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isRtl ? "الكلمة المفتاحية الرئيسية:" : "Primary Keyword:"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.primaryKeyword}
                  onChange={(e) => setFormData({ ...formData, primaryKeyword: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {isRtl ? "السوق المستهدف:" : "Target Market:"}
                  </label>
                  <input
                    type="text"
                    value={formData.targetMarket}
                    onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {isRtl ? "حجم البحث الشهري:" : "Monthly Volume:"}
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  {isRtl ? "تحديث الحفظ" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW DRAWER */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-xl h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {isRtl ? "معاينة المخطط الاستراتيجي للمقال" : "Article Strategy Preview"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">{isRtl ? "العنوان الكامل:" : "Full Title:"}</span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {previewArticle.article_title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/70 dark:border-zinc-800">
                <div>
                  <span className="text-zinc-400 block text-[11px]">{isRtl ? "الكلمة الرئيسية:" : "Primary Keyword:"}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">{previewArticle.primary_keyword}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">{isRtl ? "السوق المستهدف:" : "Target Market:"}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">{previewArticle.target_market}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1.5">{isRtl ? "المبرر الاستراتيجي ونوايا الشراء:" : "Strategic Rationale:"}</span>
                <p className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 leading-relaxed border border-zinc-200/50 dark:border-zinc-800">
                  {previewArticle.strategic_rationale}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1.5">{isRtl ? "العناوين الفرعية والمخطط الهيكلي (Outline):" : "Subheadings & Architecture:"}</span>
                <div className="space-y-2">
                  {previewArticle.brief_outline?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800">
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-500/10 text-indigo-600 text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
