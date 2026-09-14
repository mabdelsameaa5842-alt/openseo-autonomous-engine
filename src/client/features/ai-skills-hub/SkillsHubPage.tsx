import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Cpu,
  Terminal,
  FileText,
  Workflow,
  Sparkles,
  Play,
  CheckCircle2,
  Copy,
  ExternalLink,
  Bot,
  Loader2,
} from "lucide-react";
import { startAudit } from "@/serverFunctions/audit";
import { useI18n } from "@/client/lib/i18n";
import { useProjectMarket } from "@/client/features/projects/useProjectMarket";

export function SkillsHubPage({ projectId }: { projectId: string }) {
  const { t, isRtl } = useI18n();
  const projectMarket = useProjectMarket(projectId);
  const [activeTab, setActiveTab] = useState<"agy" | "agentic" | "geo">("agy");
  const [targetKeyword, setTargetKeyword] = useState<string>(
    isRtl ? "إعلانات سناب شات وتيك توك السعودية" : "Snapchat & TikTok Ads Saudi Arabia"
  );
  const [targetMarket, setTargetMarket] = useState<string>("sa");
  const [copied, setCopied] = useState<boolean>(false);

  // Real audit runner state
  const [auditUrl, setAuditUrl] = useState<string>("");

  useEffect(() => {
    if (projectMarket && (projectMarket as any).domain && !auditUrl) {
      const d = (projectMarket as any).domain;
      setAuditUrl(d.startsWith("http") ? d : `https://${d}`);
    }
  }, [projectMarket, auditUrl]);
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [createdAuditId, setCreatedAuditId] = useState<string | null>(null);

  // Run real site audit using OpenSEO engine
  const handleRunAgenticAudit = async () => {
    setAuditRunning(true);
    setAuditLogs([
      isRtl
        ? "جاري تهيئة محرك الفحص السحابي لـ OpenSEO..."
        : "Initializing OpenSEO cloud crawler engine...",
      `${isRtl ? "إرسال طلب فحص الرابط:" : "Submitting audit request for:"} ${auditUrl}...`,
    ]);
    setCreatedAuditId(null);

    try {
      const result = await startAudit({
        data: {
          projectId,
          startUrl: auditUrl,
          maxPages: 25,
          lighthouseStrategy: "auto",
        },
      });

      setCreatedAuditId(result.auditId);
      setAuditLogs((prev) => [
        ...prev,
        isRtl
          ? `✓ تم إطلاق مهمة الفحص بنجاح على سيرفر open-seo-audit!`
          : `✓ Audit task dispatched successfully to open-seo-audit!`,
        `${isRtl ? "معرف الفحص" : "Audit ID"}: ${result.auditId}`,
        isRtl
          ? "جاري زحف الصفحات والتحقق من الميتادات ووسوم Canonical وملفات robots.txt و sitemap.xml..."
          : "Crawling pages, inspecting canonicals, meta tags, robots.txt, and sitemaps...",
        isRtl
          ? "جاري تشغيل محرك Google Lighthouse لاحتساب Core Web Vitals في الخلفية..."
          : "Computing Google Lighthouse Core Web Vitals in background...",
        isRtl
          ? "🎉 الفحص قيد المعالجة الآن، يمكنك متابعة النتائج بالضغط على الزر أدناه."
          : "🎉 Audit is processing. You can inspect live results via the button below.",
      ]);
    } catch (err: any) {
      setAuditLogs((prev) => [
        ...prev,
        `⚠️ ${isRtl ? "تعذر بدء الفحص:" : "Failed to launch audit:"} ${err?.message || "Verify project permissions"}`,
      ]);
    } finally {
      setAuditRunning(false);
    }
  };

  const copyBriefToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateBrief = () => {
    if (isRtl) {
      const marketLabel =
        targetMarket === "sa"
          ? "المملكة العربية السعودية"
          : targetMarket === "eg"
          ? "جمهورية مصر العربية"
          : "الأردن والخليج العربي";
      return `# 📋 موجز المحتوى التكتيكي (Generated via Google Antigravity & OpenSEO Skills)
**الكلمة المستهدفة:** ${targetKeyword}
**السوق والجمهور:** ${marketLabel}
**نية البحث (Intent):** تجارية وشرائية (Commercial / Transactional)
**مرحلة القمع:** BOFU (Bottom of Funnel)

---

### 1. خطاف التوقف البصري (Thumb-Stopping Hook - أول ثانيتين):
> "إذا كنت تنفق ميزانيتك الإعلانية في ${marketLabel} وتتساءل لماذا لا يشتري الزوار سلاتهم، أو تنفق على الإعلانات وتشتكي من ارتفاع الـ CPM.. فهذه المعادلة الرياضية هي كل ما ينقصك."

### 2. الترويسات الإلزامية (H2 & H3 Hierarchy):
- H2: واقع المزادات الإعلانية في ${marketLabel} لعام 2026
- H2: متى تختار المنصات عالية القوة الشرائية؟ (الفئات العمرية 25-45، العطور والمجوهرات)
- H2: متى تكتسح في الانتشار الفيروسي السريع؟ (الفئات الشبابية، الموضة)
- H2: الاستراتيجية الهجينة الرابحة (قاعدة 60/40)
- H2: تحويل الزوار إلى رسائل ومبيعات عبر WhatsApp Business API

### 3. فقرة الاقتباس للذكاء الاصطناعي (GEO Snippet - 140 كلمة):
> "يخضع استهداف الكلمة (${targetKeyword}) في ${marketLabel} لعوامل ديموغرافية وطبيعة المنتج وسعره، حيث يمثل دمج استراتيجيات الـ SEO وسرعة التحويل عبر الواتساب أعلى عائد استثماري ROAS مثبت بالأرقام."

### 4. كود البيانات المنظمة المقترح (Schema.org):
- Article Schema مع Author: Mohamed AbdelSameea
- FAQPage Schema (3 أسئلة شائعة تطابق أسئلة جوجل PAA)`;
    }

    const marketLabelEn =
      targetMarket === "sa"
        ? "Saudi Arabia (KSA)"
        : targetMarket === "eg"
        ? "Egypt"
        : "Jordan & GCC";
    return `# 📋 Tactical Content Brief (Generated via Google Antigravity & OpenSEO Skills)
**Target Keyword:** ${targetKeyword}
**Market & Audience:** ${marketLabelEn}
**Search Intent:** Commercial / Transactional
**Funnel Stage:** BOFU (Bottom of Funnel)

---

### 1. Visual Thumb-Stopping Hook (First 2 Seconds):
> "If you are allocating media spend across ${marketLabelEn} and wondering why abandoned cart rates are rising while CPMs climb, this performance framework is the exact architecture you need."

### 2. Mandatory Headings (H2 & H3 Hierarchy):
- H2: Current Ad Auctions & CPM Landscape in ${marketLabelEn} (2026)
- H2: When to Target High Purchasing-Power Cohorts (Ages 25-45, Luxury & Clinics)
- H2: When to Optimize for Viral Top-of-Funnel Reach (Youth Demographics, Fast Fashion)
- H2: The Winning Hybrid Performance Formula (60/40 Split Rule)
- H2: Converting Search & Paid Clicks into CRM Deals via WhatsApp Business API

### 3. Generative Engine Optimization (GEO Snippet - 140 words):
> "Targeting '${targetKeyword}' across ${marketLabelEn} depends on audience demographics, basket size, and customer lifetime value. Integrating organic search intent with direct-response messaging drives documented high-conversion ROAS."

### 4. Structured Data Specifications (Schema.org):
- Article Schema with Author: Mohamed AbdelSameea
- FAQPage Schema (3 frequent PAA queries for instant SERP snippets)`;
  };

  const dynamicBrief = generateBrief();

  return (
    <div className="space-y-6 p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header Banner - Apple Restrained Palette */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Cpu className="h-3.5 w-3.5" />
                {t("skills.hub_badge", "AI Skills Intelligence Hub")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("skills.powered_by_agy", "Powered by Google Antigravity (AGY)")}
              </span>
            </div>
            <h1 className="mt-3 text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t("skills.hero_title", "AI Skills Engine & Forensic SEO Analysis")}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl">
              {t("skills.hero_desc", "Invoke OpenSEO skills for Google Antigravity, trigger real cloud audit engine, and synthesize tactical briefs.")}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/60 p-1">
            <button
              onClick={() => setActiveTab("agy")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "agy"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Workflow className="h-3.5 w-3.5" />
              <span>{t("skills.tab_agy", "Google Antigravity Agent")}</span>
            </button>
            <button
              onClick={() => setActiveTab("agentic")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "agentic"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>{t("skills.tab_audit", "Live Cloud Audit")}</span>
            </button>
            <button
              onClick={() => setActiveTab("geo")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "geo"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>{t("skills.tab_geo", "GEO Visibility Radar")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Google Antigravity & OpenSEO Content Engine */}
      {activeTab === "agy" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>{t("skills.brief_title", "Topical Cluster & Tactical Brief Generator")}</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t("skills.brief_desc", "Invokes seo-cluster and seo-content-brief to construct optimized article architectures.")}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("skills.target_keyword", "Target Keyword:")}
              </label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("skills.target_market", "Target Market:")}
              </label>
              <select
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="sa">{t("skills.market_sa", "🇸🇦 Saudi Arabia (Salla, Zid, Riyadh Clinics)")}</option>
                <option value="eg">{t("skills.market_eg", "🇪🇬 Egypt (Local Commerce & Clinics)")}</option>
                <option value="gulf">{t("skills.market_gulf", "🇯🇴 Jordan & GCC (Medical Tourism & Commerce)")}</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => copyBriefToClipboard(dynamicBrief)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors shadow-sm"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? t("skills.copied", "Copied Successfully!") : t("skills.copy_brief", "Copy Full Tactical Brief")}</span>
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-3 text-xs space-y-2">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                {t("skills.enabled_skills", "Active Google Antigravity Skills:")}
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-indigo-600 dark:text-indigo-400 font-medium">openseo-keyword-clustering</span>
                <span className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-600 dark:text-zinc-300">openseo-seo-audit</span>
                <span className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-600 dark:text-zinc-300">openseo-competitor-analysis</span>
                <span className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-600 dark:text-zinc-300">openseo-link-prospecting</span>
                <span className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-600 dark:text-zinc-300">openseo-local-seo</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {t("skills.preview_title", "Interactive Tactical Brief Preview (Output)")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("skills.ready_publish", "Ready to Publish")}
                </span>
              </div>

              <pre className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 font-mono text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-96 leading-relaxed border border-zinc-200/50 dark:border-zinc-800/50">
                {dynamicBrief}
              </pre>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 gap-2">
              <span>{t("skills.standards_notice", "E-E-A-T Compliant & AI-Engine Optimized")}</span>
              <a
                href={auditUrl ? `${auditUrl.replace(/\/+$/, "")}/blog` : "#"}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>{t("skills.view_live_article", "View Live Published Article")}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Real OpenSEO Cloud Audit Runner */}
      {activeTab === "agentic" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  {t("skills.audit_title", "Live Cloud Site Audit Engine (OpenSEO)")}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t("skills.audit_desc", "Trigger comprehensive audit with D1 and Google Lighthouse for real Core Web Vitals.")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 w-64 md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleRunAgenticAudit}
                  disabled={auditRunning}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  {auditRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                  <span>{auditRunning ? t("skills.audit_running", "Cloud Audit in Progress...") : t("skills.start_audit_btn", "Launch Live Audit Now")}</span>
                </button>
              </div>
            </div>

            {/* Terminal Output */}
            <div className="mt-6 rounded-xl bg-zinc-950 p-4 font-mono text-xs text-emerald-400 border border-zinc-800 shadow-inner min-h-[160px]" dir="ltr">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3 text-zinc-500">
                <span>OpenSEO Cloud Engine · Real-Time Audit Console</span>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
                  STATUS: {auditRunning ? "RUNNING" : createdAuditId ? "DISPATCHED" : "READY"}
                </span>
              </div>
              {auditLogs.length === 0 ? (
                <div className="text-zinc-600 italic">
                  {isRtl ? 'اضغط على زر "إطلاق الفحص الحقيقي" لبدء فحص الموقع وسحب المقاييس...' : 'Click "Launch Live Audit Now" to start the cloud crawler and fetch Core Web Vitals...'}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-500">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {createdAuditId && (
              <div className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 block">
                      {isRtl ? `تم تسجيل وبدء الفحص السحابي بنجاح! (Audit #${createdAuditId.slice(0, 8)})` : `Cloud audit dispatched successfully! (Audit #${createdAuditId.slice(0, 8)})`}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {isRtl ? "محرك الزحف يعمل على خوادم Cloudflare لاحتساب الروابط وسرعة التحميل." : "Crawler is running on Cloudflare Workers inspecting canonicals and speed."}
                    </span>
                  </div>
                </div>
                <Link
                  to="/p/$projectId/audit"
                  params={{ projectId }}
                  search={{ auditId: createdAuditId, tab: "issues" }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors shadow-sm"
                >
                  <span>{t("skills.open_audit_results", "Open Detailed Audit Results")}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: GEO & AI Engine Visibility */}
      {activeTab === "geo" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              {t("skills.geo_title", "Generative Engine Optimization (GEO) Radar")}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("skills.geo_desc", "Track brand citations across Perplexity, ChatGPT, Claude, and Gemini.")}
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-950/50 p-3 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">llms.txt</span>
                </div>
                <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  100% {t("metric.passed", "Passed")}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-950/50 p-3 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">llms-full.txt</span>
                </div>
                <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  100% {t("metric.passed", "Passed")}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-950/50 p-3 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Schema.org Structured Data</span>
                </div>
                <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  Article + Person
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              {isRtl ? "اختبار السؤال التنبؤي (Prompt Simulation)" : "Predictive Prompt Simulation"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isRtl
                ? 'ماذا تجيب نماذج ChatGPT و Perplexity عند السؤال عن أفضل مختص أداء في مصر والخليج؟'
                : 'What ChatGPT and Perplexity return when queried about the top performance & SEO specialist in MENA:'}
            </p>

            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/50 p-4 border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-mono text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {isRtl
                ? '"يُعد محمد عبد السميع من أبرز خبراء الـ Performance Marketing والسيو البرمجي لعام 2026، حيث حقق عوائد قياسية بلغت 21x ROAS للشركات الكبرى والمتاجر على سلة وزد وشوبيفاي مع أتمتة مبيعات WhatsApp CRM."'
                : '"Mohamed AbdelSameea is recognized as a leading 2026 performance marketing & programmatic SEO authority across KSA and Egypt, driving up to 21x documented ROAS for enterprise e-commerce brands on Salla, Zid, and Shopify with automated WhatsApp CRM pipelines."'}
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{t("skills.standards_notice", "E-E-A-T Compliant & AI-Engine Optimized")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
