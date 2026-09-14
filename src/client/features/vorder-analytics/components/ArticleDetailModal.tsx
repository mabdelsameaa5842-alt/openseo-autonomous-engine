import React from "react";
import { X, ExternalLink, Calendar, Key, Layers, Globe, CheckCircle2, Clock, Sparkles, Send } from "lucide-react";
import { useI18n } from "@/client/lib/i18n";

export interface ArticleDetailData {
  id: string;
  title: string;
  slug: string;
  url?: string | null;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  intent?: "commercial" | "transactional" | "informational";
  monthlyVolume?: number;
  status: "published" | "queued";
  publishedAt?: string | null;
  queueOrder?: number;
  briefOutline?: {
    h1?: string;
    sections?: string[];
    targetAudience?: string;
    geoSnippet?: string;
    schemaType?: string;
  } | null;
}

interface ArticleDetailModalProps {
  article: ArticleDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onPublishNow?: (articleId: string) => Promise<void>;
  publishingId?: string | null;
}

export function ArticleDetailModal({
  article,
  isOpen,
  onClose,
  onPublishNow,
  publishingId,
}: ArticleDetailModalProps) {
  const { t, isRtl } = useI18n();

  if (!isOpen || !article) return null;

  const isPublishing = publishingId === article.id;
  const isPublished = article.status === "published";
  const liveUrl =
    article.url || (article.slug ? `/blog/${article.slug}` : "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isRtl ? "rtl" : "ltr"}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141416] p-6 shadow-2xl text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                }`}
              >
                {isPublished ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    {t("perf.status_published", "منشور حياً")}
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    {t("perf.status_queued", "في طابور النشر المجدول")}
                    {article.queueOrder ? ` (#${article.queueOrder})` : ""}
                  </>
                )}
              </span>

              {article.intent && (
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                  {article.intent}
                </span>
              )}
            </div>

            <h2 className="text-lg md:text-xl font-bold leading-tight">
              {article.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                <Key className="h-3.5 w-3.5 text-indigo-500" />
                <span className="font-semibold">{t("perf.col_keyword", "الكلمة المفتاحية المستهدفة")}</span>
              </div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {article.primaryKeyword}
              </div>
              {article.monthlyVolume ? (
                <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  {article.monthlyVolume.toLocaleString()} {t("perf.monthly_searches", "بحث شهري")}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-semibold">{t("perf.col_date", "تاريخ وحالة النشر")}</span>
              </div>
              <div className="font-medium text-xs text-zinc-800 dark:text-zinc-200">
                {isPublished && article.publishedAt
                  ? new Date(article.publishedAt).toLocaleString(isRtl ? "ar-SA" : "en-US")
                  : t("perf.queued_schedule_hint", "مجدول للنشر عبر دورة Make.com التلقائية")}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 truncate font-mono" dir="ltr">
                /blog/{article.slug}
              </div>
            </div>
          </div>

          {/* Secondary Keywords */}
          {article.secondaryKeywords && article.secondaryKeywords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>{t("perf.secondary_keywords_label", "الكلمات الدلالية المكملة (LSI Keywords)")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {article.secondaryKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Brief Outline / H2 & H3 Structure */}
          {article.briefOutline && (
            <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-indigo-500" />
                  {t("perf.outline_hierarchy", "هيكل الترويسات الإلزامية (H2 & H3 Hierarchy)")}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {article.briefOutline.schemaType || "Article & FAQPage"}
                </span>
              </div>

              {article.briefOutline.sections && article.briefOutline.sections.length > 0 && (
                <ul className="space-y-1.5 pl-4 pr-4">
                  {article.briefOutline.sections.map((sec, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                      <span className="text-indigo-500 font-bold font-mono">H2.</span>
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              )}

              {article.briefOutline.geoSnippet && (
                <div className="mt-3 rounded-lg border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
                  <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1 text-[11px]">
                    <Sparkles className="h-3 w-3" />
                    {t("perf.geo_snippet_label", "مقتطف محركات الذكاء الاصطناعي (GEO Snippet):")}
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed italic">
                    "{article.briefOutline.geoSnippet}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <div className="w-full sm:w-auto">
            {isPublished ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("perf.view_live_article", "معاينة المقال في الموقع مباشرة")}
              </a>
            ) : (
              <span className="text-xs text-zinc-400">
                {t("perf.auto_schedule_note", "سيتم نشره تلقائياً ومزامنته مع Google Search Console.")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isPublished && onPublishNow && (
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => onPublishNow(article.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {t("perf.publishing_now", "جاري النشر والمزامنة...")}
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    {t("perf.publish_now_btn", "⚡ نشر المقال الآن فورياً")}
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {t("perf.modal_close", "إغلاق")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
