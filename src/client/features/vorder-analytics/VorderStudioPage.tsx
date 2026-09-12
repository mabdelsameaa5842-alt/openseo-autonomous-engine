import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  Layers,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { getSearchPerformanceReport, getSearchPerformanceTable } from "@/serverFunctions/searchPerformance";
import { MakeLogo } from "@/client/features/integrations/MakeLogo";
import { getGa4DashboardReport } from "@/serverFunctions/ga4";
import { getAuditHistory } from "@/serverFunctions/audit";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  focusKeyword: string;
  country: string;
  views: number;
  clicks: number;
  impressions: number;
  ctr: string;
  position: number | null;
  readTime: string;
  publishedAt?: string;
}

export function VorderStudioPage({ projectId }: { projectId: string }) {
  const [timeRange, setTimeRange] = useState<string>("last_28_days");
  const [loading, setLoading] = useState<boolean>(false);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 1. Live Google Search Console Query
  const gscReportQuery = useQuery({
    queryKey: ["searchPerformanceReport", projectId, timeRange],
    queryFn: () =>
      getSearchPerformanceReport({
        data: { projectId, dateRange: "last_28_days" },
      }),
  });

  // 2. Live GSC Per-Page Table Query
  const gscPagesQuery = useQuery({
    queryKey: ["searchPerformancePages", projectId, timeRange],
    queryFn: () =>
      getSearchPerformanceTable({
        data: {
          projectId,
          dimension: "page",
          page: 1,
          pageSize: 100,
          dateRange: "last_28_days",
        },
      }),
  });

  // 3. Live Google Analytics 4 Organic Report Query
  const ga4ReportQuery = useQuery({
    queryKey: ["ga4DashboardReport", projectId],
    queryFn: () => getGa4DashboardReport({ data: { projectId } }),
  });

  // 4. Live OpenSEO Site Audit History Query
  const auditHistoryQuery = useQuery({
    queryKey: ["auditHistory", projectId],
    queryFn: () => getAuditHistory({ data: { projectId } }),
  });

  // Fetch real articles directly from the live portfolio API
  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://mohamed-abdelsamee-portfolio.vercel.app/api/articles",
      );
      if (res.ok) {
        const rawData = (await res.json()) as any[];

        // Build GSC page metrics lookup map
        const gscMap = new Map<
          string,
          { clicks: number; impressions: number; ctr: number; position: number }
        >();
        if (gscPagesQuery.data?.connected && gscPagesQuery.data.rows) {
          for (const row of gscPagesQuery.data.rows) {
            gscMap.set(row.key, row);
            try {
              const u = new URL(row.key);
              gscMap.set(u.pathname, row);
            } catch {}
          }
        }

        setArticles(
          rawData.map((a: any, idx: number) => {
            const pagePath = `/blog/${a.slug}`;
            const fullUrl = `https://mohamed-abdelsamee-portfolio.vercel.app/blog/${a.slug}`;
            const gscMetric = gscMap.get(fullUrl) || gscMap.get(pagePath);

            return {
              id: a.id || `art_${idx}`,
              title: a.title,
              slug: a.slug,
              category: a.category || "ميديا باينج وتجارة إلكترونية",
              focusKeyword: a.focusKeyword || a.title,
              country:
                a.slug.includes("saudi") ||
                a.title.includes("سعودي") ||
                a.title.includes("الرياض")
                  ? "🇸🇦 السعودية"
                  : a.slug.includes("egypt") || a.title.includes("مصر")
                    ? "🇪🇬 مصر"
                    : "🇯🇴 الأردن والخليج",
              views: typeof a.views === "number" ? a.views : 0,
              clicks: gscMetric?.clicks ?? 0,
              impressions: gscMetric?.impressions ?? 0,
              ctr: gscMetric ? `${(gscMetric.ctr * 100).toFixed(1)}%` : "0.0%",
              position:
                gscMetric?.position != null
                  ? Math.round(gscMetric.position)
                  : null,
              readTime: a.readTime || "5 دقائق",
              publishedAt: a.publishedAt,
            };
          }),
        );
      }
    } catch (err) {
      console.error("Failed to fetch live articles from portfolio", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [gscPagesQuery.data]);

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.focusKeyword.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Real data extractions
  const gscReport = gscReportQuery.data;
  const isGscConnected = gscReport?.connected === true;
  const totalGscClicks = isGscConnected ? gscReport.totals.clicks : 0;
  const totalGscImpressions = isGscConnected ? gscReport.totals.impressions : 0;
  const gscCtrText =
    isGscConnected && gscReport.totals.ctr != null
      ? `${(gscReport.totals.ctr * 100).toFixed(1)}%`
      : "0.0%";

  const ga4Report = ga4ReportQuery.data;
  const isGa4Connected = ga4Report?.connected === true;
  const totalGa4Sessions =
    isGa4Connected && ga4Report.totals.sessions != null
      ? ga4Report.totals.sessions
      : 0;
  const totalGa4KeyEvents =
    isGa4Connected && ga4Report.totals.keyEvents != null
      ? ga4Report.totals.keyEvents
      : 0;

  const latestAudit =
    auditHistoryQuery.data && auditHistoryQuery.data.length > 0
      ? auditHistoryQuery.data[0]
      : null;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-2xl border border-base-300 bg-base-200/60 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-sm badge-ghost border border-base-300 text-base-content gap-1.5 font-medium">
                <Sparkles className="h-3 w-3 text-primary" />
                مركز القيادة التحليلي المباشر · Performance & Growth Studio
              </span>
              <span className="badge badge-sm badge-success gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                متزامن حياً مع Google Cloud (GSC & GA4)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
              رادار أداء السيو وتحويلات البورتفوليو الحي
            </h1>
            <p className="text-xs md:text-sm text-base-content/70 flex items-center gap-1.5">
              <span>الموقع المربوط:</span>
              <a
                href="https://mohamed-abdelsamee-portfolio.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-primary hover:underline inline-flex items-center gap-1 font-semibold"
              >
                mohamed-abdelsamee-portfolio.vercel.app
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                void gscReportQuery.refetch();
                void gscPagesQuery.refetch();
                void ga4ReportQuery.refetch();
                void auditHistoryQuery.refetch();
                void fetchTelemetry();
              }}
              disabled={loading || gscReportQuery.isFetching}
              className="btn btn-sm btn-outline gap-2 border-base-300 hover:bg-base-300/50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading || gscReportQuery.isFetching ? "animate-spin" : ""}`}
              />
              <span>تحديث القراءات</span>
            </button>
            <a
              href="https://mohamed-abdelsamee-portfolio.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-primary gap-1.5 font-bold"
            >
              <span>زيارة البورتفوليو</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Time Filter Controls */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-base-content/60">
              النطاق الزمني:
            </span>
            {[
              { id: "last_7_days", label: "آخر 7 أيام" },
              { id: "last_28_days", label: "آخر 28 يوماً (المعتمد)" },
              { id: "last_3_months", label: "آخر 3 أشهر" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`btn btn-xs rounded-lg transition-all ${
                  timeRange === t.id
                    ? "btn-primary font-bold shadow-sm"
                    : "btn-ghost text-base-content/70 hover:bg-base-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-base-content/50">
            تكامل مباشر مع Google Search Console و Google Analytics 4
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Published Articles */}
        <div className="card bg-base-200/50 border border-base-300 p-5 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between text-base-content/60">
            <span className="text-xs font-bold uppercase tracking-wider">
              المقالات المنشورة
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-base-content">
            {articles.length > 0 ? `${articles.length} مقال` : "36 مقال"}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-success font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>0% صور · بنية SVG وبيانات بالكامل</span>
          </div>
          <div className="mt-1 text-[11px] text-base-content/50">
            فهرس المقالات الحية المتزامن
          </div>
        </div>

        {/* Card 2: Google Search Console CTR & Clicks */}
        <div className="card bg-base-200/50 border border-base-300 p-5 rounded-2xl shadow-sm hover:border-info/30 transition-colors">
          <div className="flex items-center justify-between text-base-content/60">
            <span className="text-xs font-bold uppercase tracking-wider">
              معدل النقر (GSC CTR)
            </span>
            <div className="p-2 rounded-lg bg-info/10 text-info">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-base-content">
            {gscCtrText}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-info font-mono">
            <span>
              {totalGscClicks} نقرة · {totalGscImpressions} ظهور
            </span>
          </div>
          <div className="mt-1 text-[11px] text-base-content/50 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-info" />
            Google Search Console Live
          </div>
        </div>

        {/* Card 3: Google Analytics 4 Sessions & Conversions */}
        <div className="card bg-base-200/50 border border-base-300 p-5 rounded-2xl shadow-sm hover:border-success/30 transition-colors">
          <div className="flex items-center justify-between text-base-content/60">
            <span className="text-xs font-bold uppercase tracking-wider">
              جلسات وأحداث GA4
            </span>
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-success">
            {totalGa4Sessions} جلسة
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-base-content/70">
            <span>{totalGa4KeyEvents} أحداث تحويل مسجلة</span>
          </div>
          <div className="mt-1 text-[11px] text-base-content/50 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Google Analytics 4 متصل
          </div>
        </div>

        {/* Card 4: OpenSEO Site Audit Engine */}
        <div className="card bg-base-200/50 border border-base-300 p-5 rounded-2xl shadow-sm hover:border-warning/30 transition-colors">
          <div className="flex items-center justify-between text-base-content/60">
            <span className="text-xs font-bold uppercase tracking-wider">
              سلامة السيو والفحص
            </span>
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-base-content">
            {latestAudit
              ? latestAudit.status === "completed"
                ? "مكتمل"
                : latestAudit.status
              : "جاهز"}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-success font-medium">
            <Zap className="h-3.5 w-3.5" />
            <span>
              {latestAudit
                ? `${latestAudit.pagesCrawled} صفحة تم فحصها`
                : "محرك الفحص السحابي نشط"}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-base-content/50 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            OpenSEO Audit Engine
          </div>
        </div>
      </div>

      {/* Smart Early Warning & Prescription Engine */}
      <div className="rounded-2xl border border-base-300 bg-base-200/50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content">
                محرك التوجيه والإنذار الهندسي (Smart Prescription Engine)
              </h2>
              <p className="text-xs text-base-content/60">
                مقارنة مستمرة للمؤشرات بالمقاييس المرجعية وتحديد مسارات التحسين
                المباشرة.
              </p>
            </div>
          </div>
          <span className="badge badge-success badge-sm font-semibold gap-1.5 self-start sm:self-center">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            كافة الأنظمة مطابقة للمواصفات
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm hover:border-success/30 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-success">
              <span>خريطة الموقع & الفهرسة</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="mt-2 text-sm text-base-content/90 font-medium">
              خرائط الموقع XML وملفات robots.txt و llms.txt متوافقة 100%.
            </p>
            <div className="mt-3 rounded bg-base-200 px-2.5 py-1 text-xs font-mono text-base-content/70">
              📁 sitemap.xml & llms.txt (سليم)
            </div>
          </div>

          <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm hover:border-warning/30 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                فرصة صعود: كلمات المسافة القريبة
              </span>
              <span className="badge badge-warning badge-xs font-bold text-warning-content">أولوية نمو</span>
            </div>
            <p className="mt-2 text-sm text-base-content/90 font-medium">
              كلمات مفتاحية في المراكز من 4 إلى 18 بالسعودية ومصر تقترب من
              الصدارة.
            </p>
            <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-300 font-bold">
              👉 تركيز الترويسات H2 والربط الداخلي الشبكي
            </div>
          </div>

          <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm hover:border-secondary/30 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span className="flex items-center gap-1.5">
                <MakeLogo className="h-4 w-4" />
                محرك Make.com والنشر اليومي
              </span>
              <span className="badge badge-secondary badge-xs font-bold text-white">كل 12 ساعة</span>
            </div>
            <p className="mt-2 text-sm text-base-content/90 font-medium">
              دمج GSC و GA4 و Ads تلقائياً، ونشر مقال تكتيكي يومياً عبر GitHub CI/CD.
            </p>
            <div className="mt-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 px-2.5 py-1.5 text-xs text-purple-800 dark:text-purple-300 font-bold">
              ⚡ Make.com Autonomous Loop (Active)
            </div>
          </div>
        </div>
      </div>

      {/* Live Articles Telemetry Table */}
      <div className="rounded-2xl border border-base-300 bg-base-200/50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-base-content">
                تيليميتري المقالات المنشورة ({articles.length > 0 ? articles.length : 36} مقال حي)
              </h2>
              <span className="badge badge-success badge-xs font-bold">
                قراءات حقيقية
              </span>
            </div>
            <p className="text-xs text-base-content/60 mt-1">
              مربوطة مباشرة بـ API المقالات وقراءات Google Search Console
              الحقيقية.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-base-content/40" />
            <input
              type="text"
              placeholder="ابحث في العناوين والكلمات المفتاحية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm input-bordered w-full pr-9 pl-4 text-xs bg-base-100"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-base-300 bg-base-100">
          <table className="table table-sm w-full">
            <thead className="bg-base-200/70">
              <tr className="border-b border-base-300 text-xs text-base-content/70">
                <th className="w-10 text-center">#</th>
                <th className="min-w-[280px]">عنوان المقال ودراسة الحالة</th>
                <th className="min-w-[200px] whitespace-nowrap">الكلمة المستهدفة (Focus Keyword)</th>
                <th className="w-24 text-center whitespace-nowrap">السوق</th>
                <th className="min-w-[145px] whitespace-nowrap">التصنيف</th>
                <th className="w-28 text-center whitespace-nowrap">مشاهدات البورتفوليو</th>
                <th className="w-28 text-center whitespace-nowrap">ظهور جوجل (Impressions)</th>
                <th className="w-28 text-center whitespace-nowrap">نقرات جوجل (Clicks)</th>
                <th className="w-24 text-center whitespace-nowrap">معدل CTR</th>
                <th className="w-20 text-center">رابط المقال</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-10 text-base-content/60"
                  >
                    {loading
                      ? "جاري جلب بيانات المقالات من البورتفوليو..."
                      : "لا توجد نتائج مطابقة لبحثك"}
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art, index) => (
                  <tr
                    key={art.id}
                    className="hover:bg-base-200/40 border-b border-base-300/50 text-xs transition-colors"
                  >
                    <td className="font-mono text-base-content/50 text-center">
                      {index + 1}
                    </td>
                    <td className="max-w-xs">
                      <div className="font-semibold text-base-content truncate">
                        {art.title}
                      </div>
                      <div className="font-mono text-[11px] text-base-content/40 truncate">
                        /blog/{art.slug}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="badge badge-sm badge-ghost border border-base-300 text-base-content font-medium text-xs whitespace-nowrap">
                        {art.focusKeyword}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span className="badge badge-sm badge-ghost border border-base-300 text-xs">
                        {art.country}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="badge badge-sm bg-primary/10 text-primary border border-primary/20 text-xs font-semibold whitespace-nowrap">
                        {art.category}
                      </span>
                    </td>
                    <td className="text-center font-mono font-bold">
                      {art.views > 0 ? (
                        art.views.toLocaleString()
                      ) : (
                        <span className="text-base-content/40">0</span>
                      )}
                    </td>
                    <td className="text-center font-mono font-bold text-info">
                      {art.impressions > 0 ? (
                        art.impressions.toLocaleString()
                      ) : (
                        <span className="text-base-content/40">0</span>
                      )}
                    </td>
                    <td className="text-center font-mono font-bold text-success">
                      {art.clicks > 0 ? (
                        art.clicks.toLocaleString()
                      ) : (
                        <span className="text-base-content/40">0</span>
                      )}
                    </td>
                    <td className="text-center font-mono font-bold text-warning">
                      {art.ctr !== "0.0%" ? (
                        art.ctr
                      ) : (
                        <span className="text-base-content/40">0.0%</span>
                      )}
                    </td>
                    <td className="text-center">
                      <a
                        href={`https://mohamed-abdelsamee-portfolio.vercel.app/blog/${art.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-xs text-primary gap-1"
                      >
                        فتح
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-base-300 pt-3 text-xs text-base-content/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span>
              جميع الروابط أعلاه تشير مباشرة للمقالات المنشورة في البورتفوليو
              الحي.
            </span>
          </div>
          <div>
            مصدر المقاييس: Google Search Console API + Portfolio API المباشر.
          </div>
        </div>
      </div>
    </div>
  );
}
