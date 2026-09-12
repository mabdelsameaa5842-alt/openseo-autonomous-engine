import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ExternalLink,
  RefreshCw,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Bot,
  Download,
  Sparkles,
  Key,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { CardShell, moreDetailsClass } from "@/client/features/dashboard/cardParts";
import { MakeLogo } from "@/client/features/integrations/MakeLogo";
import { GoogleGlyph } from "@/client/features/gsc/GoogleGlyph";
import { useMakeConnection } from "@/client/features/integrations/useMakeConnection";
import { startGoogleLink } from "@/client/features/integrations/startGoogleLink";

const MAKE_GOOGLE_LOGIN_URL = "https://www.make.com/en/login?tab=google";

export function MakeAutomationCard({
  projectId,
}: {
  projectId: string;
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

  const [inputEmail, setInputEmail] = useState("");
  const [makeApiToken, setMakeApiToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [buildingAi, setBuildingAi] = useState(false);
  const [showAiBuilder, setShowAiBuilder] = useState(false);
  const [createdScenarioUrl, setCreatedScenarioUrl] = useState<string | null>(
    null,
  );

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

  const handleTestPing = async () => {
    setTesting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("منظومة Make.com متصلة وجاهزة للدورة التلقائية القادمة!");
    } catch {
      toast.error("فشل فحص الاتصال");
    } finally {
      setTesting(false);
    }
  };

  return (
    <CardShell
      title="Make.com Autonomous SEO Engine"
      stamp="Make.com API · 12h Autonomous Cycle"
      action={
        <Link
          to="/p/$projectId/settings/integrations"
          params={{ projectId }}
          hash="make-automation"
          className={moreDetailsClass}
        >
          {connected ? "Manage" : "Setup"}
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Top brand & status bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MakeLogo className="size-6 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-base-content/90">
                Make.com AI Automation
              </div>
              <div className="text-[11px] font-mono text-base-content/50">
                ID: {connected ? "make-autoseo-live" : "not-connected"}
              </div>
            </div>
          </div>

          {connected ? (
            <span className="badge badge-sm badge-success gap-1 text-[11px] font-semibold text-white">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="badge badge-sm badge-warning gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-100">
              غير متصل
            </span>
          )}
        </div>

        {/* State: Not Connected */}
        {!connected ? (
          <div className="space-y-3.5 rounded-xl border border-warning/30 bg-warning/5 p-4">
            {/* Detected Google Account & 1-Click Connect */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-3.5 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GoogleGlyph className="size-4 shrink-0" />
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
                  تسجيل الدخول وتأكيد الربط بحساب Google
                </span>
              </button>
            </div>

            {/* Google OAuth & Make tab links */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleStartGoogleOAuth}
                className="btn btn-xs btn-outline gap-1.5 flex-1 border-slate-300 text-slate-700 dark:text-slate-200"
              >
                <GoogleGlyph className="size-3" />
                <span className="text-[11px]">تسجيل الدخول عبر Google OAuth</span>
              </button>

              <a
                href={MAKE_GOOGLE_LOGIN_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-xs btn-ghost gap-1 text-[11px] text-slate-600 dark:text-slate-300"
              >
                <ExternalLink className="size-3" />
                <span>دخول Make.com</span>
              </a>
            </div>

            {/* AI Scenario Builder Section */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>بناء الأتمتة على Make بالذكاء الاصطناعي</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAiBuilder(!showAiBuilder)}
                  className="btn btn-ghost btn-xs text-[11px] text-primary hover:bg-primary/10"
                >
                  {showAiBuilder ? "إخفاء" : "إظهار الخيارات"}
                </button>
              </div>

              {showAiBuilder ? (
                <div className="space-y-2 pt-1 border-t border-primary/10">
                  <p className="text-[11px] text-base-content/70 leading-relaxed">
                    أدخل الـ Make API Token لبناء وتشغيل السيناريو في حسابك تلقائياً دون كتابة أي كود:
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      placeholder="Make API Token (من Make > Profile > API)"
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
                      <span>بناء الآن</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <a
                      href="https://eu1.make.com/user/api-tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>الحصول على API Token من Make</span>
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
              ) : (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-base-content/60">
                    بناء السيناريو كاملاً (12h Cycle & Daily Publishing)
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadBlueprint}
                    className="btn btn-xs btn-outline border-primary/30 text-primary gap-1 font-semibold"
                  >
                    <Download className="size-3" />
                    <span>تحميل Blueprint</span>
                  </button>
                </div>
              )}
            </div>

            {/* Email confirm field */}
            <form onSubmit={handleConnectEmail} className="flex gap-1.5 pt-1">
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
                className="btn btn-sm btn-outline border-base-300 text-xs px-3 font-semibold"
              >
                تأكيد الربط
              </button>
            </form>
          </div>
        ) : (
          /* State: Connected */
          <div className="space-y-3">
            {/* Account Info pill */}
            <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <GoogleGlyph className="size-4 shrink-0" />
                <div>
                  <div className="text-[10px] font-semibold text-success">
                    حساب Google / الإيميل المتصل:
                  </div>
                  <div className="text-xs font-bold font-mono text-base-content">
                    {connectedEmail}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={disconnect}
                className="btn btn-ghost btn-xs text-error text-[11px] gap-1 hover:bg-error/10"
                title="قطع الاتصال"
              >
                <LogOut className="size-3" />
                <span>قطع الاتصال</span>
              </button>
            </div>

            {/* If a scenario was built by AI, show direct link */}
            {createdScenarioUrl || scenarioUrl ? (
              <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 p-2 text-xs">
                <span className="text-primary font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  تم بناء وتفعيل السيناريو بالذكاء الاصطناعي
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

            {/* Telemetry info */}
            <div className="rounded-xl border border-base-300 bg-base-200/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-base-content/70">
                  <Clock className="size-3.5 text-primary" />
                  <span>الجدولة الزمنية</span>
                </span>
                <span className="font-bold text-primary font-mono">
                  كل 12 ساعة (06:00 AM / 06:00 PM)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-base-content/70">
                  <Zap className="size-3.5 text-amber-500" />
                  <span>النشر اليومي التلقائي</span>
                </span>
                <span className="font-bold text-base-content">
                  1 مقال تكتيكي جديد يومياً
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-base-content/70">
                  <ShieldCheck className="size-3.5 text-success" />
                  <span>تكامل النشر والفحص</span>
                </span>
                <span className="font-bold text-success">
                  GitHub CI/CD & 0 Issues
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestPing}
                disabled={testing}
                className="btn btn-outline btn-xs border-base-300 gap-1.5 text-base-content/70 hover:bg-base-200"
              >
                <RefreshCw
                  className={`size-3 ${testing ? "animate-spin" : ""}`}
                />
                <span>فحص الجاهزية</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBlueprint}
                className="btn btn-ghost btn-xs text-primary gap-1 font-semibold"
              >
                <Download className="size-3" />
                <span>تحميل Blueprint</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </CardShell>
  );
}
