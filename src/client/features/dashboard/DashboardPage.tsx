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
import { MakeAutomationCard } from "@/client/features/dashboard/MakeAutomationCard";
import { McpConnectCard } from "@/client/features/dashboard/McpConnectCard";
import { WorkspaceMergeBanner } from "@/client/features/dashboard/WorkspaceMergeBanner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121215]/90 shadow-xl shadow-black/20 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
  const queryClient = useQueryClient();

  const activationQuery = useQuery({
    queryKey: ["dashboardActivation", projectId],
    queryFn: () => getDashboardActivation({ data: { projectId } }),
  });
  const overviewQuery = useQuery({
    queryKey: ["dashboardOverview", projectId],
    queryFn: () => getDashboardOverview({ data: { projectId } }),
  });

  const activation = activationQuery.data;
  const overview = overviewQuery.data;

  // Visit-triggered backlink snapshot: fire once per page view when the
  // overview reports a missing or stale snapshot for a project with a domain.
  // The server re-checks freshness, so a stray double-fire costs nothing.
  const refreshMutation = useMutation({
    mutationFn: () => refreshDashboardBacklinkSnapshot({ data: { projectId } }),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", projectId],
      }),
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

  if (activationQuery.isError) {
    return (
      <div className="px-4 py-4 md:px-6 md:py-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-[#FF453A]">
          {getStandardErrorMessage(activationQuery.error)}
        </div>
      </div>
    );
  }

  // Wait for the overview too: rendering cards from `overview === undefined`
  // flashes their empty states (and reshuffles the data-first sort) once the
  // real data lands. An overview error falls through so the page still loads.
  if (!activation || overviewQuery.isPending) {
    return (
      <div
        className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-4 md:px-6 md:py-6"
        aria-busy
      >
        <div className="h-8 w-48 animate-pulse rounded-xl bg-white/5" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-44 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-44 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  const showBacklinks = activation.domain !== null;
  const gscConnected = activation.gsc.connected;
  const ga4Connected = activation.ga4.connected;

  // Array order is the within-bucket order after the data-first sort below:
  // the MCP pitch leads the setup cards.
  const cards = [
    ...(activation.mcp.firstToolCallAt || activation.mcp.cardDismissedAt
      ? []
      : [
          {
            key: "mcp",
            hasData: false,
            node: (
              <McpConnectCard projectId={projectId} activation={activation} />
            ),
          },
        ]),
    {
      key: "gsc",
      hasData: gscConnected,
      node: <GscCard projectId={projectId} connected={gscConnected} />,
    },
    ...(ga4Connected || !activation.ga4.cardDismissedAt
      ? [
          {
            key: "ga4",
            hasData: ga4Connected,
            node: <Ga4Card projectId={projectId} connected={ga4Connected} />,
          },
        ]
      : []),
    {
      key: "googleAds",
      hasData: true,
      node: <GoogleAdsCard projectId={projectId} />,
    },
    {
      key: "makeAutomation",
      hasData: true,
      node: <MakeAutomationCard projectId={projectId} />,
    },
    {
      key: "audit",
      hasData: overview?.audit != null,
      node: (
        <AuditHealthCard
          projectId={projectId}
          audit={overview?.audit ?? null}
        />
      ),
    },
    ...(showBacklinks
      ? [
          {
            key: "backlinks",
            hasData: overview?.backlinks != null || refreshMutation.isPending,
            node: (
              <BacklinkPulseCard
                projectId={projectId}
                backlinks={overview?.backlinks ?? null}
                refreshing={refreshMutation.isPending}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        {/* Header with Title & Domain Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Organic search performance, autonomous engine & technical health
            </p>
          </div>

          {activation.domain ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <Globe className="size-3.5 text-zinc-400" />
              <span className="font-mono text-white">{activation.domain}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#30D158]/30 bg-[#30D158]/10 px-2 py-0.5 text-[10px] font-semibold text-[#30D158]">
                <span className="size-1.5 rounded-full bg-[#30D158] animate-pulse" />
                Active
              </span>
            </div>
          ) : null}
        </div>

        {/* Internal Action Command Strip */}
        <div className="rounded-2xl border border-white/10 bg-[#121215]/80 p-3 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Services
            </span>
            <div className="h-3.5 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
              <span className={`size-1.5 rounded-full ${gscConnected ? "bg-[#30D158]" : "bg-zinc-600"}`} />
              <span>GSC</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
              <span className={`size-1.5 rounded-full ${ga4Connected ? "bg-[#30D158]" : "bg-zinc-600"}`} />
              <span>GA4</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
              <span className="size-1.5 rounded-full bg-[#30D158]" />
              <span>Make.com</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
              <span className="size-1.5 rounded-full bg-[#30D158]" />
              <span>Google Ads</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.success("دورة Make.com التلقائية مجدولة ونشطة كل 12 ساعة وجاهزة للنشر اليومي!")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Zap className="size-3.5 text-amber-400" />
              <span>Trigger Automation</span>
            </button>

            <button
              type="button"
              disabled={refreshMutation.isPending}
              onClick={() => refreshMutation.mutate()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 text-zinc-400 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
              <span>Sync Snapshot</span>
            </button>

            <Link
              to="/p/$projectId/settings/integrations"
              params={{ projectId }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="size-3.5 text-zinc-400" />
              <span>Integrations</span>
            </Link>
          </div>
        </div>

        <WorkspaceMergeBanner />

        <OnboardingChecklist projectId={projectId} activation={activation} />

        {/* Every card is half width on large screens (only the checklist spans).
          Cards with data render before setup pitches and empty states. */}
        <div className="grid items-start gap-5 lg:grid-cols-2">
          {sort(cards, (a, b) => Number(b.hasData) - Number(a.hasData)).map(
            (card) => (
              <div key={card.key}>{card.node}</div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
