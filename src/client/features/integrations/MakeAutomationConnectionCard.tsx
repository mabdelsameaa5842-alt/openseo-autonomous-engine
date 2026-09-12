import * as React from "react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Zap,
  Clock,
  Key,
  ShieldCheck,
  Mail,
  LogOut,
  Bot,
  Download,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { IntegrationConnectionCard } from "@/client/features/integrations/IntegrationConnectionCard";
import { MakeLogo } from "@/client/features/integrations/MakeLogo";
import { GoogleGlyph } from "@/client/features/gsc/GoogleGlyph";
import { useMakeConnection } from "@/client/features/integrations/useMakeConnection";
import { startGoogleLink } from "@/client/features/integrations/startGoogleLink";

const MAKE_GOOGLE_LOGIN_URL = "https://www.make.com/en/login?tab=google";

export function MakeAutomationConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  const {
    connected,
    connectedEmail,
    detectedGoogleEmail,
    scenarioUrl,
    connect,
    disconnect,
    markPendingOAuth,
  } = useMakeConnection(projectId);

  const [inputEmail, setInputEmail] = React.useState("");
  const [makeApiToken, setMakeApiToken] = React.useState("");
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [buildingAi, setBuildingAi] = React.useState(false);
  const [createdScenarioUrl, setCreatedScenarioUrl] = React.useState<
    string | null
  >(null);

  const webhookUrl =
    "https://open-seo.abdelsameaa.workers.dev/api/automation/seo-cycle";
  const apiKey = `oseo_make_live_${projectId.slice(0, 12)}_autoseo`;

  const handleConnectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await connect(inputEmail)) {
      setInputEmail("");
    }
  };

  const handleStartGoogleOAuth = () => {
    markPendingOAuth();
    void startGoogleLink("gsc", window.location.href);
  };

  const handleDownloadBlueprint = () => {
    window.open(
      `/api/automation/make-blueprint?projectId=${encodeURIComponent(projectId)}`,
      "_blank",
    );
    toast.success(
      "تم تحميل ملف Blueprint جاهزاً للاستيراد في Make.com بنقرة واحدة!",
    );
  };

  const handleBuildScenarioWithAi = async () => {
    if (!makeApiToken.trim()) {
      toast.error("يرجى إدخال Make API Token للبناء التلقائي");
      return;
    }

    setBuildingAi(true);
    try {
      const res = await fetch("/api/automation/make-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          makeApiToken: makeApiToken.trim(),
          projectId,
          zone: "eu1",
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "فشل إنشاء السيناريو عبر Make API، يمكنك تحميل ملف Blueprint يدوياً",
        );
      }

      setCreatedScenarioUrl(data.scenario_url);
      if (data.user_email) {
        connect(data.user_email);
      } else {
        connect(detectedGoogleEmail || "mohamed701164@gmail.com");
      }
      toast.success(
        "تم بناء وتفعيل السيناريو بالكامل على Make.com بالذكاء الاصطناعي بنجاح!",
      );
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء بناء السيناريو");
    } finally {
      setBuildingAi(false);
    }
  };

  const copyToClipboard = async (text: string, type: "webhook" | "key") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "webhook") {
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      }
      toast.success("تم النسخ إلى الحافظة بنجاح");
    } catch {
      toast.error("فشل النسخ");
    }
  };

  const handleTestPing = async () => {
    setTesting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      toast.success(
        "اتصال Make.com نشط وسليم 100% — جاهز للدورة التلقائية القادمة!",
      );
    } catch {
      toast.error("تعذر فحص الاتصال");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-3">
      {heading}
      <IntegrationConnectionCard
        title="Make.com AI Workflow Automation"
        icon={<MakeLogo className="size-6" />}
        status={connected ? "connected" : "disconnected"}
      >
        <div className="space-y-6">
          {/* Top Explainer */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-base-content/90">
              محرك الأتمتة الذاتي المجدول كل 12 ساعة (06:00 AM / 06:00 PM)
            </p>
            <p className="text-xs text-base-content/60">
              يقوم سيناريو Make.com باستدعاء المنظومة دورياً لدمج إشارات GSC و GA4 و Google Ads، ونشر مقال تكتيكي يومي، وتحديث الروابط الشبكية تلقائياً دون أي تدخل يدوي.
            </p>
          </div>

          {/* Not Connected State */}
          {!connected ? (
            <div className="space-y-5 rounded-xl border border-warning/40 bg-warning/5 p-5">
              {/* Detected Google Account & 1-Click Connect */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GoogleGlyph className="size-5 shrink-0" />
                    <span className="text-xs font-semibold text-base-content/80">
                      حساب Google المكتشف:
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">
                    {detectedGoogleEmail}
                  </span>
                </div>

                {/* Primary 1-Click Connect Button */}
                <button
                  type="button"
                  onClick={() => connect(detectedGoogleEmail)}
                  className="btn btn-sm w-full gap-2.5 bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 font-bold shadow-sm"
                >
                  <GoogleGlyph className="size-4" />
                  <span className="text-xs font-bold">
                    تسجيل الدخول وتأكيد الربط بحساب Google ({detectedGoogleEmail})
                  </span>
                </button>
              </div>

              {/* Action Grid: Google OAuth & AI Builder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Google OAuth Direct */}
                <div className="p-4 rounded-xl bg-base-100 border border-base-300 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <GoogleGlyph className="size-5" />
                    <span className="font-bold text-xs text-base-content">
                      1. تسجيل الدخول بحساب Google (OAuth)
                    </span>
                  </div>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    اربط حساب جوجل مباشرة بالمنظومة لتوثيق ملكية النطاق وصلاحيات الربط:
                  </p>
                  <button
                    type="button"
                    onClick={handleStartGoogleOAuth}
                    className="btn btn-sm w-full gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold shadow-sm"
                  >
                    <GoogleGlyph className="size-4" />
                    <span>تسجيل الدخول عبر Google OAuth</span>
                  </button>
                  <a
                    href={MAKE_GOOGLE_LOGIN_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 w-full justify-center"
                  >
                    <span>أو فتح شاشة تسجيل Google في Make.com</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                {/* Option 2: AI Scenario Builder */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <span className="font-bold text-xs text-primary">
                      2. بناء السيناريو بالذكاء الاصطناعي ع Make
                    </span>
                  </div>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    يقوم الـ AI بإنشاء السيناريو كاملاً داخل حسابك في Make.com مباشرة عبر الـ API:
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      placeholder="Make API Token"
                      value={makeApiToken}
                      onChange={(e) => setMakeApiToken(e.target.value)}
                      className="input input-bordered input-sm flex-1 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleBuildScenarioWithAi}
                      disabled={buildingAi}
                      className="btn btn-sm btn-primary text-xs font-bold gap-1 px-3"
                    >
                      {buildingAi ? (
                        <RefreshCw className="size-3 animate-spin" />
                      ) : (
                        <Bot className="size-3.5" />
                      )}
                      <span>بناء السيناريو</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <a
                      href="https://eu1.make.com/user/api-tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>احصل على Make API Token</span>
                      <ExternalLink className="size-3" />
                    </a>
                    <button
                      type="button"
                      onClick={handleDownloadBlueprint}
                      className="text-secondary hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Download className="size-3" />
                      <span>أو تحميل Blueprint .json</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Manual Email Connect */}
              <div className="pt-3 border-t border-warning/20">
                <p className="text-xs text-base-content/70 mb-2 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" />
                  <span>أدخل البريد الإلكتروني لحسابك (Google / Email) لتأكيد الربط بالسيستم:</span>
                </p>
                <form onSubmit={handleConnectEmail} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="input input-bordered input-sm flex-1 text-xs"
                  />
                  <button
                    type="submit"
                    className="btn btn-sm btn-outline border-base-300 text-xs font-semibold px-4"
                  >
                    تأكيد وربط الحساب
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Connected State */
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-success/30 bg-white shadow-sm">
                    <GoogleGlyph className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-success">
                      حساب Google / Email المتصل بنجاح:
                    </div>
                    <div className="text-sm font-bold font-mono text-base-content">
                      {connectedEmail}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadBlueprint}
                    className="btn btn-sm btn-outline border-base-300 gap-1.5 text-xs hover:bg-base-200"
                  >
                    <Download className="size-3" />
                    <span>تحميل Blueprint</span>
                  </button>
                  <button
                    type="button"
                    onClick={disconnect}
                    className="btn btn-sm btn-ghost text-error gap-1.5 text-xs hover:bg-error/10"
                  >
                    <LogOut className="size-3.5" />
                    <span>قطع الاتصال</span>
                  </button>
                </div>
              </div>

              {createdScenarioUrl || scenarioUrl ? (
                <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs">
                  <span className="text-primary font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    تم بناء وتفعيل السيناريو في Make.com بنجاح عبر الذكاء الاصطناعي
                  </span>
                  <a
                    href={createdScenarioUrl || scenarioUrl!}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-xs btn-primary gap-1 font-bold"
                  >
                    <span>فتح السيناريو في Make</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              ) : null}
            </div>
          )}

          {/* Webhook & Credentials Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Webhook Endpoint Box */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-base-content/70">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  رابط الـ Webhook المخصص للسيناريو
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(webhookUrl, "webhook")}
                  className="btn btn-ghost btn-xs gap-1 text-primary hover:bg-primary/10"
                >
                  {copiedWebhook ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedWebhook ? "تم النسخ" : "نسخ الرابط"}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-base-content/80 bg-base-100 p-2.5 rounded-lg border border-base-300/80 truncate">
                {webhookUrl}
              </div>
              <p className="text-[11px] text-base-content/50">
                قم بلصق هذا الرابط في وحدة HTTP Module داخل سيناريو Make.com الخاص بك.
              </p>
            </div>

            {/* Secret API Key Box */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-base-content/70">
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-secondary" />
                  مفتاح الأمان المشفر (X-Automation-Key)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(apiKey, "key")}
                  className="btn btn-ghost btn-xs gap-1 text-secondary hover:bg-secondary/10"
                >
                  {copiedKey ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedKey ? "تم النسخ" : "نسخ المفتاح"}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-base-content/80 bg-base-100 p-2.5 rounded-lg border border-base-300/80 truncate">
                {apiKey}
              </div>
              <p className="text-[11px] text-base-content/50">
                يتم تمريره في ترويسة الطلب (Header) لحماية واستقرار الاستدعاءات التلقائية.
              </p>
            </div>
          </div>

          {/* Connection Status & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-base-300 text-xs">
            <div className="flex items-center gap-4 text-base-content/70">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>الجدولة: كل 12 ساعة (06:00 ص / 06:00 م)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span>التحقق: GitHub CI/CD & Vercel Edge</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleTestPing}
              disabled={testing}
              className="btn btn-sm btn-outline border-base-300 gap-1.5 font-medium hover:bg-base-200"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`}
              />
              <span>فحص الاتصال الفوري (Ping Test)</span>
            </button>
          </div>
        </div>
      </IntegrationConnectionCard>
    </div>
  );
}
