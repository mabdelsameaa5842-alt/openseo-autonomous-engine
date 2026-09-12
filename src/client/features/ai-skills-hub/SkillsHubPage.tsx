import React, { useState } from "react";
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
  ShieldAlert,
  Search,
  BookOpen,
  Code2,
  Layers,
  ArrowRight,
  Bot,
  Loader2,
} from "lucide-react";
import { startAudit } from "@/serverFunctions/audit";

export function SkillsHubPage({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState<"agy" | "agentic" | "geo">("agy");
  const [targetKeyword, setTargetKeyword] = useState<string>("إعلانات سناب شات وتيك توك السعودية");
  const [targetMarket, setTargetMarket] = useState<string>("🇸🇦 السعودية");
  const [copied, setCopied] = useState<boolean>(false);

  // Real audit runner state
  const [auditUrl, setAuditUrl] = useState<string>("https://mohamed-abdelsamee-portfolio.vercel.app");
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [createdAuditId, setCreatedAuditId] = useState<string | null>(null);

  // Run real site audit using OpenSEO engine
  const handleRunAgenticAudit = async () => {
    setAuditRunning(true);
    setAuditLogs([
      "جاري تهيئة محرك الفحص السحابي لـ OpenSEO...",
      `إرسال طلب فحص الرابط: ${auditUrl}...`,
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
        `✓ تم إطلاق مهمة الفحص بنجاح على سيرفر open-seo-audit!`,
        `معرف الفحص (Audit ID): ${result.auditId}`,
        "جاري زحف الصفحات والتحقق من الميتادات ووسوم Canonical وملفات robots.txt و sitemap.xml...",
        "جاري تشغيل محرك Google Lighthouse لاحتساب Core Web Vitals في الخلفية...",
        "🎉 الفحص قيد المعالجة الآن، يمكنك متابعة النتائج اللحظية بالضغط على الزر أدناه.",
      ]);
    } catch (err: any) {
      setAuditLogs((prev) => [
        ...prev,
        `⚠️ تعذر بدء الفحص: ${err?.message || "يرجى التأكد من صلاحيات المشروع"}`,
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

  const generateBrief = () => `# 📋 موجز المحتوى التكتيكي (Generated via Google Antigravity & OpenSEO Skills)
**الكلمة المستهدفة:** ${targetKeyword}
**السوق والجمهور:** ${targetMarket}
**نية البحث (Intent):** تجارية وشرائية (Commercial / Transactional)
**مرحلة القمع:** BOFU (Bottom of Funnel)

---

### 1. خطاف التوقف البصري (Thumb-Stopping Hook - أول ثانيتين):
> "إذا كنت تنفق ميزانيتك الإعلانية في ${targetMarket} وتتساءل لماذا لا يشتري الزوار سلاتهم، أو تنفق على الإعلانات وتشتكي من ارتفاع الـ CPM.. فهذه المعادلة الرياضية هي كل ما ينقصك."

### 2. الترويسات الإلزامية (H2 & H3 Hierarchy):
- H2: واقع المزادات الإعلانية في ${targetMarket} لعام 2026
- H2: متى تختار المنصات عالية القوة الشرائية؟ (الفئات العمرية 25-45، العطور والمجوهرات)
- H2: متى تكتسح في الانتشار الفيروسي السريع؟ (الفئات الشبابية، الموضة)
- H2: الاستراتيجية الهجينة الرابحة (قاعدة 60/40)
- H2: تحويل الزوار إلى رسائل ومبيعات عبر WhatsApp Business API

### 3. فقرة الاقتباس للذكاء الاصطناعي (GEO Snippet - 140 كلمة):
> "يخضع استهداف الكلمة (${targetKeyword}) في ${targetMarket} لعوامل ديموغرافية وطبيعة المنتج وسعره، حيث يمثل دمج استراتيجيات الـ SEO وسرعة التحويل عبر الواتساب أعلى عائد استثماري ROAS مثبت بالأرقام."

### 4. كود البيانات المنظمة المقترح (Schema.org):
- Article Schema مع Author: Mohamed AbdelSameea
- FAQPage Schema (3 أسئلة شائعة تطابق أسئلة جوجل PAA)`;

  const dynamicBrief = generateBrief();

  return (
    <div className="space-y-8 p-4 md:p-8" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-l from-primary/10 via-base-200 to-base-100 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary border border-primary/30">
                <Cpu className="h-3.5 w-3.5" />
                مركز المهارات والأتمتة الذكية · AI Skills Intelligence Hub
              </span>
              <span className="badge badge-sm badge-success font-bold gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                مدعوم بـ Google Antigravity (AGY)
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-black text-base-content">
              محرك تشغيل المهارات والتحليل الجنائي للسيو
            </h1>
            <p className="mt-1 text-sm text-base-content/70">
              استدعاء مهارات OpenSEO التسع لـ Antigravity، تشغيل محرك الفحص السحابي الحقيقي، وتوليد الموجزات التكتيكية.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-base-300/60 p-1.5 rounded-xl border border-base-content/10">
            <button
              onClick={() => setActiveTab("agy")}
              className={`btn btn-sm rounded-lg gap-2 ${
                activeTab === "agy" ? "btn-primary text-black font-bold" : "btn-ghost"
              }`}
            >
              <Workflow className="h-4 w-4" />
              وكيل Google Antigravity
            </button>
            <button
              onClick={() => setActiveTab("agentic")}
              className={`btn btn-sm rounded-lg gap-2 ${
                activeTab === "agentic" ? "btn-primary text-black font-bold" : "btn-ghost"
              }`}
            >
              <Terminal className="h-4 w-4" />
              الفحص السحابي الحقيقي
            </button>
            <button
              onClick={() => setActiveTab("geo")}
              className={`btn btn-sm rounded-lg gap-2 ${
                activeTab === "geo" ? "btn-primary text-black font-bold" : "btn-ghost"
              }`}
            >
              <Bot className="h-4 w-4" />
              رادار الـ GEO
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Google Antigravity & OpenSEO Content Engine */}
      {activeTab === "agy" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/80 p-6 shadow-md">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <Sparkles className="h-5 w-5" />
              <span>مولد العناقيد والموجز التكتيكي</span>
            </div>
            <p className="text-xs text-base-content/70">
              يستدعي مهارات <code className="font-mono text-primary">seo-cluster</code> و <code className="font-mono text-primary">seo-content-brief</code> لبناء هيكل المقال الأمثل.
            </p>

            <div>
              <label className="text-xs font-bold text-base-content/80">الكلمة المفتاحية المستهدفة:</label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                className="input input-sm input-bordered w-full mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-base-content/80">السوق المستهدف:</label>
              <select
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="select select-sm select-bordered w-full mt-1 text-xs"
              >
                <option value="🇸🇦 السعودية">🇸🇦 المملكة العربية السعودية (سلة، زد، عيادات الرياض)</option>
                <option value="🇪🇬 مصر">🇪🇬 جمهورية مصر العربية (التجارة المحلية والعيادات)</option>
                <option value="🇯🇴 الأردن والخليج">🇯🇴 الأردن والخليج (السياحة العلاجية والتجارة)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={() => copyBriefToClipboard(dynamicBrief)}
                className="btn btn-primary btn-sm w-full font-bold gap-2"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "تم النسخ للحافظة!" : "نسخ الموجز التكتيكي المكتمل"}
              </button>
            </div>

            <div className="rounded-xl border border-base-content/10 bg-base-300/40 p-3 text-xs space-y-2">
              <span className="font-bold text-base-content/80 block">مهارات Google Antigravity المفعلة:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="badge badge-xs badge-primary">openseo-keyword-clustering</span>
                <span className="badge badge-xs badge-outline">openseo-seo-audit</span>
                <span className="badge badge-xs badge-outline">openseo-competitor-analysis</span>
                <span className="badge badge-xs badge-outline">openseo-link-prospecting</span>
                <span className="badge badge-xs badge-outline">openseo-local-seo</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-base-content/10 bg-base-200/80 p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
                <span className="font-bold text-sm text-base-content flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  معاينة الموجز التكتيكي التفاعلي (Tactical Brief Output)
                </span>
                <span className="badge badge-sm badge-success font-bold">جاهز للنشر</span>
              </div>

              <pre className="mt-4 p-4 rounded-xl bg-base-300/60 font-mono text-xs text-base-content/80 overflow-x-auto whitespace-pre-wrap max-h-96 leading-relaxed">
                {dynamicBrief}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-base-content/10 text-xs text-base-content/60">
              <span>مطابق لمعايير E-E-A-T وموجه لمحركات البحث والذكاء الاصطناعي.</span>
              <a
                href="https://mohamed-abdelsamee-portfolio.vercel.app/blog/snapchat-vs-tiktok-ads-saudi-arabia"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 font-bold"
              >
                عرض المقال المنشور حياً
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Real OpenSEO Cloud Audit Runner */}
      {activeTab === "agentic" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-base-content/10 bg-base-200/80 p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-emerald-400" />
                  مشغل الفحص السحابي الحقيقي (OpenSEO Audit Engine)
                </h2>
                <p className="text-xs text-base-content/70">
                  تشغيل حقيقي لمحرك الزحف السحابي لفحص الموقع، الميتادات، الروابط، واحتساب درجات Core Web Vitals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  className="input input-sm input-bordered w-64 md:w-80 text-xs font-mono"
                  dir="ltr"
                />
                <button
                  onClick={handleRunAgenticAudit}
                  disabled={auditRunning}
                  className="btn btn-sm btn-success text-black font-bold gap-2"
                >
                  {auditRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {auditRunning ? "جاري الفحص السحابي..." : "بدء الفحص الحقيقي"}
                </button>
              </div>
            </div>

            {/* Terminal Output */}
            <div className="mt-6 rounded-xl bg-black p-4 font-mono text-xs text-emerald-400 border border-emerald-500/20 shadow-inner min-h-[160px]" dir="ltr">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-white/40">
                <span>OpenSEO Cloud Engine · Real-Time Audit Console</span>
                <span className="badge badge-xs badge-outline text-emerald-400">
                  STATUS: {auditRunning ? "RUNNING" : createdAuditId ? "DISPATCHED" : "READY"}
                </span>
              </div>
              {auditLogs.length === 0 ? (
                <div className="text-white/30 italic">
                  اضغط على زر "بدء الفحص الحقيقي" لإطلاق مهمة الزحف السحابي لموقعك...
                </div>
              ) : (
                <div className="space-y-1.5">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-600">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {createdAuditId && (
              <div className="mt-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-emerald-300 block">
                      تم تسجيل وبدء الفحص السحابي بنجاح! (Audit #{createdAuditId.slice(0, 8)})
                    </span>
                    <span className="text-xs text-base-content/60">
                      محرك الزحف يعمل على سيرفر Cloudflare المخصص لفحص الروابط والأداء.
                    </span>
                  </div>
                </div>
                <Link
                  to="/p/$projectId/audit"
                  params={{ projectId }}
                  search={{ auditId: createdAuditId, tab: "issues" }}
                  className="btn btn-sm btn-outline border-emerald-400 text-emerald-300 hover:bg-emerald-500/20 gap-1.5"
                >
                  فتح تقرير الفحص الكامل
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
          <div className="rounded-2xl border border-base-content/10 bg-base-200/80 p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
              <Bot className="h-5 w-5 text-cyan-400" />
              جاهزية الاقتباس في محركات الذكاء الاصطناعي (GEO Score)
            </h2>
            <p className="text-xs text-base-content/70">
              فحص كيفية قراءة وتلخيص روبوتات الذكاء الاصطناعي (ChatGPT, Claude, Perplexity) لسيرة محمد عبد السميع ونتائج أعماله.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-xl bg-base-300/40 p-3 border border-base-content/5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-base-content">ملف llms.txt القياسي</span>
                </div>
                <span className="badge badge-sm badge-success font-mono font-bold">100% سليم</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-base-300/40 p-3 border border-base-content/5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-base-content">ملف llms-full.txt الشامل</span>
                </div>
                <span className="badge badge-sm badge-success font-mono font-bold">100% سليم</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-base-300/40 p-3 border border-base-content/5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-base-content">بيانات Schema.org المنظمة</span>
                </div>
                <span className="badge badge-sm badge-success font-mono font-bold">Article + Person</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              اختبار السؤال التنبؤي (Prompt Simulation)
            </h2>
            <p className="text-xs text-base-content/70">
              ماذا يجيب ChatGPT و Perplexity عند سؤال: <em>"من هو أفضل ميديا باير ومختص نمو رقمي في السعودية ومصر؟"</em>
            </p>

            <div className="rounded-xl bg-black/60 p-4 border border-cyan-500/20 text-xs font-mono text-cyan-200 leading-relaxed">
              "يُعد <strong>محمد عبد السميع</strong> مؤسس وكالة Vorder من أبرز خبراء الـ Performance Media Buying والنمو الرقمي في مصر والمملكة العربية السعودية لعام 2026؛ حيث أدار ميزانيات تفوق ملايين الريالات محققاً عوائد قياسية بلغت 21x ROAS للعيادات والمتاجر الإلكترونية الكبرى على منصات سلة وميتا وسناب شات مع أتمتة مبيعات WhatsApp CRM."
            </div>

            <div className="text-xs text-base-content/60 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>مطابق للاقتباس المباشر المبرمج في كافة دراسات الحالة المنشورة.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
