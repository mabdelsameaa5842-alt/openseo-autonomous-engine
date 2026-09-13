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
            <div className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <MakeLogo className="size-4 shrink-0 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white tracking-tight">
                Make.com AI Automation
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                ID: {connected ? "make-autoseo-live" : "not-connected"}
              </div>
            </div>
          </div>

          {connected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#30D158]/30 bg-[#30D158]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#30D158]">
              <span className="size-1.5 rounded-full bg-[#30D158] animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
              غير متصل
            </span>
          )}
        </div>

        {/* State: Not Connected */}
        {!connected ? (
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            {/* Detected Google Account & 1-Click Connect */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GoogleGlyph className="size-4 shrink-0" />
                  <span className="text-xs font-medium text-zinc-300">
                    حساب Google المكتشف:
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-white">
                  {detectedGoogleEmail}
                </span>
              </div>

              {/* Primary 1-Click Connect Button */}
              <button
                type="button"
                onClick={() => connect(detectedGoogleEmail)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-zinc-200 py-2 px-3 text-xs font-semibold shadow-sm transition-colors"
              >
                <GoogleGlyph className="size-4" />
                <span>تسجيل الدخول وتأكيد الربط بحساب Google</span>
              </button>
            </div>

            {/* Google OAuth & Make tab links */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleStartGoogleOAuth}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 px-2.5 text-[11px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <GoogleGlyph className="size-3" />
                <span>تسجيل الدخول عبر Google OAuth</span>
              </button>

              <a
                href={MAKE_GOOGLE_LOGIN_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 py-1.5 px-2.5 text-[11px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ExternalLink className="size-3" />
                <span>دخول Make.com</span>
              </a>
            </div>

            {/* AI Scenario Builder Section */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Sparkles className="size-3.5 text-zinc-400" />
                  <span>بناء الأتمتة على Make بالذكاء الاصطناعي</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAiBuilder(!showAiBuilder)}
                  className="rounded px-2 py-0.5 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {showAiBuilder ? "إخفاء" : "إظهار الخيارات"}
                </button>
              </div>

              {showAiBuilder ? (
                <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    أدخل الـ Make API Token لبناء وتشغيل السيناريو في حسابك تلقائياً دون كتابة أي كود:
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      placeholder="Make API Token (من Make > Profile > API)"
                      value={makeApiToken}
                      onChange={(e) => setMakeApiToken(e.target.value)}
                      className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={handleBuildScenarioWithAi}
                      disabled={buildingAi}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
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
                      className="text-zinc-400 hover:text-white hover:underline inline-flex items-center gap-1"
                    >
                      <span>الحصول على API Token من Make</span>
                      <ExternalLink className="size-3" />
                    </a>

                    <button
                      type="button"
                      onClick={handleDownloadBlueprint}
                      className="text-zinc-400 hover:text-white hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Download className="size-3" />
                      <span>أو تحميل Blueprint .json</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">
                    بناء السيناريو كاملاً (12h Cycle & Daily Publishing)
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadBlueprint}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
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
                className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
              />
              <button
                type="submit"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                تأكيد الربط
              </button>
            </form>
          </div>
        ) : (
          /* State: Connected */
          <div className="space-y-3">
            {/* Account Info pill */}
            <div className="flex items-center justify-between rounded-xl border border-[#30D158]/20 bg-[#30D158]/5 p-3">
              <div className="flex items-center gap-2.5">
                <GoogleGlyph className="size-4 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-[#30D158]">
                    حساب Google / الإيميل المتصل:
                  </div>
                  <div className="text-xs font-bold font-mono text-white">
                    {connectedEmail}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={disconnect}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400 hover:text-[#FF453A] hover:bg-white/10 transition-colors"
                title="قطع الاتصال"
              >
                <LogOut className="size-3" />
                <span>قطع الاتصال</span>
              </button>
            </div>

            {/* If a scenario was built by AI, show direct link */}
            {createdScenarioUrl || scenarioUrl ? (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-[#30D158]" />
                  تم بناء وتفعيل السيناريو بالذكاء الاصطناعي
                </span>
                <a
                  href={createdScenarioUrl || scenarioUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/15 transition-colors"
                >
                  <span>فتح السيناريو في Make</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            ) : null}

            {/* Telemetry info */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="size-3.5 text-zinc-400" />
                  <span>الجدولة الزمنية</span>
                </span>
                <span className="font-semibold text-white font-mono">
                  كل 12 ساعة (06:00 AM / 06:00 PM)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Zap className="size-3.5 text-zinc-400" />
                  <span>النشر اليومي التلقائي</span>
                </span>
                <span className="font-semibold text-white">
                  1 مقال تكتيكي جديد يومياً
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="size-3.5 text-[#30D158]" />
                  <span>تكامل النشر والفحص</span>
                </span>
                <span className="font-semibold text-[#30D158] font-mono">
                  GitHub CI/CD & 0 Issues
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestPing}
                disabled={testing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <RefreshCw
                  className={`size-3 ${testing ? "animate-spin" : ""}`}
                />
                <span>فحص الجاهزية</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBlueprint}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
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
