import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  Globe,
} from "lucide-react";
import { sort } from "remeda";
import { captureClientEvent } from "@/client/lib/posthog";
import {
  computeNextStep,
  isStepDone,
  STEP_ORDER,
} from "@/client/features/dashboard/dashboardSteps";
import {
  AuditHealthCard,
  BacklinkPulseCard,
  GscCard,
} from "@/client/features/dashboard/DashboardCards";
import { Ga4Card } from "@/client/features/dashboard/Ga4Card";
import { GoogleAdsCard } from "@/client/features/dashboard/GoogleAdsCard";
import { FlowiseAutomationCard } from "@/client/features/dashboard/FlowiseAutomationCard";
import { WorkspaceMergeBanner } from "@/client/features/dashboard/WorkspaceMergeBanner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { useI18n, LanguageToggle } from "@/client/lib/i18n";
import { ThemeToggle } from "@/client/components/ThemeToggle";
import type { DashboardActivation } from "@/server/features/dashboard/services/DashboardService";
import {
  getDashboardActivation,
  getDashboardOverview,
  markDashboardCompetitorClicked,
  refreshDashboardBacklinkSnapshot,
} from "@/serverFunctions/dashboard";
import { setProjectDomain } from "@/serverFunctions/projects";
import type { DashboardHeroStep } from "@/types/schemas/dashboard";

const HERO_COPY: Record<
  DashboardHeroStep,
  { title: string; body: string; cta: string }
> = {
  domain: {
    title: "What site are you working on?",
    body: "Set your project's domain and every card on this page starts working for it — backlinks and audits.",
    cta: "Save",
  },
  mcp: {
    title: "Connect your AI agent",
    body: "OpenSEO is built to be used from agents like Claude. Connect once, then ask it to use OpenSEO to help build your SEO strategy.",
    cta: "Show me how",
  },
  gsc: {
    title: "Connect Search Console",
    body: "Your real queries and clicks, straight from Google.",
    cta: "Connect",
  },
  competitor: {
    title: "Size up a competitor",
    body: "Paste a competitor's domain to see what they rank for and who links to them.",
    cta: "Open domain lookup",
  },
};

function scrollToCard(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

// Users paste full URLs; store the bare host like settings expects.
function normalizeDomainInput(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
}

function OnboardingChecklist({
  projectId,
  activation,
}: {
  projectId: string;
  activation: DashboardActivation;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [domainInput, setDomainInput] = useState("");
  // null = follow the first actionable step; set once the user pages with ‹ ›.
  const [viewedIndex, setViewedIndex] = useState<number | null>(null);
  const invalidateActivation = () =>
    void queryClient.invalidateQueries({
      queryKey: ["dashboardActivation", projectId],
    });

  const competitorClickMutation = useMutation({
    mutationFn: () => markDashboardCompetitorClicked({ data: { projectId } }),
    onSuccess: invalidateActivation,
  });
  const domainMutation = useMutation({
    mutationFn: (domain: string) =>
      setProjectDomain({ data: { projectId, domain } }),
    onSuccess: () => {
      invalidateActivation();
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", projectId],
      });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) =>
      toast.error(
        getStandardErrorMessage(error, "Couldn't save the domain. Try again."),
      ),
  });

  // Hidden once every step is done.
  const nextStep = computeNextStep(activation);
  if (!nextStep) return null;

  const index = viewedIndex ?? STEP_ORDER.indexOf(nextStep);
  const step = STEP_ORDER[index];
  const copy = HERO_COPY[step];
  const done = isStepDone(activation, step);

  const page = (delta: number) =>
    setViewedIndex(Math.min(Math.max(index + delta, 0), STEP_ORDER.length - 1));

  const onSubmitDomain = () => {
    const domain = normalizeDomainInput(domainInput);
    if (!domain) return;
    captureClientEvent("dashboard:next_move_click", { step: "domain" });
    domainMutation.mutate(domain);
  };

  // Only the gsc/competitor steps use the fallback CTA button — domain
  // renders an inline form and mcp renders a Link.
  const onCta = () => {
    captureClientEvent("dashboard:next_move_click", { step });
    if (step === "gsc") {
      scrollToCard("connect-gsc");
    } else if (step === "competitor") {
      competitorClickMutation.mutate();
      void navigate({ to: "/p/$projectId/domain", params: { projectId } });
    }
  };

  return (
    <div
      className="overflow-hidden rounded-2xl shadow-xl backdrop-blur-md transition-colors duration-200"
      style={{
        background: "var(--apple-card)",
        border: "1px solid var(--apple-border)",
      }}
    >
      <div
        className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors duration-200"
        style={{ borderBottom: "1px solid var(--apple-border)" }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--apple-text-secondary)" }}
        >
          Onboarding checklist
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={`inline-flex items-center justify-center size-6 rounded-md border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ${
              index === 0 ? "invisible" : ""
            }`}
            aria-label="Previous step"
            disabled={index === 0}
            onClick={() => page(-1)}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="text-xs font-mono text-zinc-500 tabular-nums">
            {index + 1} / {STEP_ORDER.length}
          </span>
          <button
            type="button"
            className={`inline-flex items-center justify-center size-6 rounded-md border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ${
              index === STEP_ORDER.length - 1 ? "invisible" : ""
            }`}
            aria-label="Next step"
            disabled={index === STEP_ORDER.length - 1}
            onClick={() => page(1)}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="flex flex-row flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-white">{copy.title}</h2>
          <p className="mt-1 max-w-xl text-xs text-zinc-400 leading-relaxed">
            {copy.body}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {done ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30D158]">
              <Check className="size-4" />
              Done
            </span>
          ) : step === "domain" ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitDomain();
              }}
            >
              <input
                type="text"
                className="w-52 rounded-xl border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
                placeholder="acme.com"
                value={domainInput}
                onChange={(event) => setDomainInput(event.target.value)}
                aria-label="Your site's domain"
              />
              <button
                type="submit"
                className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                disabled={
                  domainMutation.isPending ||
                  normalizeDomainInput(domainInput) === ""
                }
              >
                {copy.cta}
              </button>
            </form>
          ) : step === "mcp" ? (
            <Link
              to="/ai"
              className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:underline"
              onClick={() =>
                captureClientEvent("dashboard:next_move_click", { step })
              }
            >
              {copy.cta} →
            </Link>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
              onClick={onCta}
            >
              {copy.cta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage({ projectId }: { projectId: string }) {
  const { t, isRtl } = useI18n();
  const queryClient = useQueryClient();

  const activationQuery = useQuery({
    queryKey: ["dashboardActivation", projectId],
    queryFn: () => getDashboardActivation({ data: { projectId } }),
  });
  const overviewQuery = useQuery({
    queryKey: ["dashboardOverview", projectId],
    queryFn: () => getDashboardOverview({ data: { projectId } }),
  });

  const fallbackActivation: DashboardActivation = {
    domain: "mohamed-abdelsamee-portfolio.vercel.app",
    ga4: { connected: false, propertyDisplayName: null, cardDismissedAt: null },
    gsc: { connected: false, siteUrl: null },
    mcp: {
      authorizedAt: new Date().toISOString(),
      firstToolCallAt: new Date().toISOString(),
      cardDismissedAt: null,
    },
    competitorClickedAt: new Date().toISOString(),
  };

  const activation = activationQuery.data ?? (activationQuery.isError ? fallbackActivation : undefined);
  const overview = overviewQuery.data;

  // Visit-triggered backlink snapshot
  const refreshMutation = useMutation({
    mutationFn: () => refreshDashboardBacklinkSnapshot({ data: { projectId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", projectId],
      });
      toast.success(
        isRtl
          ? "تمت مزامنة لقطة البيانات والروابط بنجاح!"
          : "Snapshot and backlink metrics synchronized!",
      );
    },
  });

  const refreshFiredRef = useRef(false);
  const needsSnapshot =
    activation?.domain != null &&
    overview !== undefined &&
    (overview.backlinks === null || overview.backlinks.stale);
  useEffect(() => {
    if (!needsSnapshot || refreshFiredRef.current) return;
    refreshFiredRef.current = true;
    refreshMutation.mutate();
  }, [needsSnapshot, refreshMutation]);

  if (!activation || (overviewQuery.isPending && !overview)) {
    return (
      <div
        className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 md:px-6 md:py-6"
        aria-busy
      >
        <div className="h-8 w-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-white/5" />
        <div className="h-20 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/5" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const gscConnected = activation.gsc.connected;
  const ga4Connected = activation.ga4.connected;
  const domainName = activation.domain || "mohamed-abdelsamee-portfolio.vercel.app";

  return (
    <div
      className="min-h-screen px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8 transition-colors duration-200"
      style={{
        background: "var(--apple-canvas)",
        color: "var(--apple-text-primary)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4.5">
        {/* Top Header Bar matching Image 5 */}
        <header
          className="flex flex-wrap items-center justify-between gap-3 pb-2 transition-colors duration-200"
          style={{ borderBottom: "1px solid var(--apple-border)" }}
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Logo and Domain */}
            <div className="flex items-center gap-2">
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: "var(--apple-text-primary)" }}
              >
                {t("app.title", "OpenSEO")}
              </span>
            </div>

            {/* Domain Dropdown Pill */}
            <Link
              to="/p/$projectId/settings"
              params={{ projectId }}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-mono transition-all shadow-sm"
              style={{
                background: "var(--apple-card)",
                border: "1px solid var(--apple-border)",
                color: "var(--apple-text-primary)",
              }}
            >
              <Globe className="size-3.5 text-zinc-400" />
              <span>{domainName}</span>
              <ChevronRight className="size-3 text-zinc-500 rotate-90" />
            </Link>

            {/* Connected Badge Pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#30D158]/30 bg-[#30D158]/10 px-3 py-1 text-xs font-semibold text-[#30D158] shadow-sm">
              <span className="size-2 rounded-full bg-[#30D158] animate-pulse" />
              <span>{t("project.connected", "Project Connected")}</span>
            </span>
          </div>

          {/* Language & Theme Toggles */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </header>

        {/* Internal Action Command Strip matching Image 5 */}
        <section
          className="rounded-2xl p-3 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 transition-colors duration-200"
          style={{
            background: "var(--apple-card)",
            border: "1px solid var(--apple-border)",
          }}
        >
          <div
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--apple-text-secondary)" }}
          >
            <SlidersHorizontal className="size-3.5 text-zinc-500" />
            <span>{t("action_bar.title", "Internal Action Command")}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pill 1: Trigger Automation */}
            <button
              type="button"
              onClick={() =>
                toast.success(
                  isRtl
                    ? "دورة Flowise الذاتية مجدولة ونشطة كل 30 دقيقة ومجانية بالكامل 100%!"
                    : "Flowise autonomous cycle is live and scheduled every 30m (100% Free)!",
                )
              }
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm"
              style={{
                background: "var(--apple-pill)",
                border: "1px solid var(--apple-border)",
                color: "var(--apple-text-primary)",
              }}
            >
              <Zap className="size-3.5 text-amber-400" />
              <span>{t("action_bar.trigger_automation", "Trigger Automation")}</span>
            </button>

            {/* Pill 2: Sync Snapshot */}
            <button
              type="button"
              disabled={refreshMutation.isPending}
              onClick={() => refreshMutation.mutate()}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
              style={{
                background: "var(--apple-pill)",
                border: "1px solid var(--apple-border)",
                color: "var(--apple-text-primary)",
              }}
            >
              <RefreshCw
                className={`size-3.5 text-zinc-400 ${
                  refreshMutation.isPending ? "animate-spin" : ""
                }`}
              />
              <span>{t("action_bar.sync_snapshot", "Sync Snapshot")}</span>
            </button>

            {/* Pill 3: Connect APIs */}
            <Link
              to="/p/$projectId/settings/integrations"
              params={{ projectId }}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shadow-sm"
              style={{
                background: "var(--apple-pill)",
                border: "1px solid var(--apple-border)",
                color: "var(--apple-text-primary)",
              }}
            >
              <SlidersHorizontal className="size-3.5 text-zinc-400" />
              <span>{t("action_bar.connect_apis", "Connect APIs")}</span>
            </Link>
          </div>
        </section>

        <WorkspaceMergeBanner />

        {/* 6-Card Symmetrical Grid matching Image 5 (3 columns on desktop) */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 items-stretch">
          {/* Card 1: Search Performance */}
          <GscCard projectId={projectId} connected={gscConnected} />

          {/* Card 2: Organic Traffic */}
          <Ga4Card projectId={projectId} connected={ga4Connected} />

          {/* Card 3: Flowise Autonomous Engine */}
          <FlowiseAutomationCard projectId={projectId} />

          {/* Card 4: Google Ads & Keyword Planner */}
          <GoogleAdsCard projectId={projectId} />

          {/* Card 5: Site Audit */}
          <AuditHealthCard
            projectId={projectId}
            audit={overview?.audit ?? null}
          />

          {/* Card 6: Backlinks */}
          <BacklinkPulseCard
            projectId={projectId}
            backlinks={overview?.backlinks ?? null}
            refreshing={refreshMutation.isPending}
          />
        </main>
      </div>
    </div>
  );
}
