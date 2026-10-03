import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, ExternalLink, Eye, EyeOff, KeyRound, LogIn, ShieldCheck } from "lucide-react";
import { GoogleGlyph } from "@/client/features/gsc/GoogleGlyph";
import { IntegrationConnectionCard } from "@/client/features/integrations/IntegrationConnectionCard";
import { startGoogleLink } from "@/client/features/integrations/startGoogleLink";
import {
  SupabaseLogo,
  GitHubLogo,
  VercelLogo,
  GeminiAiStudioLogo,
  CloudflareLogo,
  ClerkLogo,
  CamberLogo,
  TavilyLogo,
} from "@/client/components/BrandLogos";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  disconnectPlatformIntegration,
  getPlatformConnection,
  listPlatformResources,
  setPlatformResource,
  verifyPlatformCredentials,
} from "@/serverFunctions/platformIntegrations";
import type { ManagedPlatformType } from "@/server/features/integrations/PlatformIntegrationsService";

interface PlatformCardDescriptor {
  platform: ManagedPlatformType;
  title: string;
  icon: React.ReactNode;
  description: React.ReactNode;
  signInButtonLabel?: string;
  tokenLabel: string;
  tokenPlaceholder: string;
  tokenHelpUrl: string;
  tokenHelpLabel: string;
  resourceLabel: string;
  metaCol1Label: string;
  metaCol1Key: string;
  metaCol1Fallback: string;
  metaCol2Label: string;
  metaCol2Key: string;
  metaCol2Fallback: string;
}

const PLATFORM_DESCRIPTORS: Record<ManagedPlatformType, PlatformCardDescriptor> = {
  google_ai_studio: {
    platform: "google_ai_studio",
    title: "Google Gemini AI Studio",
    icon: <GeminiAiStudioLogo className="size-5" />,
    description: (
      <>
        Sign in with your <strong>Google Account</strong> (OAuth 2.0) or connect your <strong>Google AI Studio</strong> credential to power the 9 autonomous Egyptian Arabic SEO agents with live Gemini models.
      </>
    ),
    signInButtonLabel: "Connect with Google",
    tokenLabel: "Gemini API Key / Token",
    tokenPlaceholder: "AIzaSy... or AQ...",
    tokenHelpUrl: "https://aistudio.google.com/apikey",
    tokenHelpLabel: "Get API Key from Google AI Studio",
    resourceLabel: "Gemini model",
    metaCol1Label: "Context window",
    metaCol1Key: "inputTokenLimit",
    metaCol1Fallback: "1,048,576 tokens",
    metaCol2Label: "Discovered models",
    metaCol2Key: "totalModelsCount",
    metaCol2Fallback: "Live API",
  },
  supabase: {
    platform: "supabase",
    title: "Supabase Database & Vector Store",
    icon: <SupabaseLogo className="size-5" />,
    description: (
      <>
        Paste your <strong>Supabase Management Access Token</strong> (<code>sbp_...</code>) or <strong>Project URL + API Key</strong> to verify your account, select your database project, and inspect live PostgREST tables.
      </>
    ),
    tokenLabel: "Supabase Access Token (sbp_...)",
    tokenPlaceholder: "Paste your Supabase Token (e.g. sbp_...)",
    tokenHelpUrl: "https://supabase.com/dashboard/account/tokens",
    tokenHelpLabel: "Get Access Token from Supabase",
    resourceLabel: "Supabase project",
    metaCol1Label: "Region / Tables",
    metaCol1Key: "region",
    metaCol1Fallback: "PostgREST",
    metaCol2Label: "Database status",
    metaCol2Key: "status",
    metaCol2Fallback: "ACTIVE_HEALTHY",
  },
  github: {
    platform: "github",
    title: "GitHub Repository",
    icon: <GitHubLogo className="size-5" />,
    description: (
      <>
        Paste your <strong>GitHub Personal Access Token</strong> (<code>ghp_...</code>) to authenticate your GitHub account, select your repository, and monitor live commits and open issues.
      </>
    ),
    tokenLabel: "GitHub Personal Access Token",
    tokenPlaceholder: "Paste your GitHub Token (e.g. ghp_...)",
    tokenHelpUrl:
      "https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=OpenSEO-Integration",
    tokenHelpLabel: "Generate Token on GitHub",
    resourceLabel: "GitHub repository",
    metaCol1Label: "Default branch",
    metaCol1Key: "defaultBranch",
    metaCol1Fallback: "main",
    metaCol2Label: "Visibility",
    metaCol2Key: "visibility",
    metaCol2Fallback: "Repository",
  },
  vercel: {
    platform: "vercel",
    title: "Vercel Deployment Cloud",
    icon: <VercelLogo className="size-5" />,
    description: (
      <>
        Paste your <strong>Vercel Access Token</strong> (<code>vcp_...</code>) to authenticate your Vercel account, select your deployed project, and monitor live production builds.
      </>
    ),
    tokenLabel: "Vercel Access Token",
    tokenPlaceholder: "Paste your Vercel Token (e.g. vcp_...)",
    tokenHelpUrl: "https://vercel.com/account/tokens",
    tokenHelpLabel: "Create Access Token on Vercel",
    resourceLabel: "Vercel project",
    metaCol1Label: "Framework",
    metaCol1Key: "framework",
    metaCol1Fallback: "Web",
    metaCol2Label: "Production state",
    metaCol2Key: "readyState",
    metaCol2Fallback: "READY",
  },
  cloudflare: {
    platform: "cloudflare",
    title: "Cloudflare Edge, Workers & DNS",
    icon: <CloudflareLogo className="size-5" />,
    description: (
      <>
        Paste your <strong>Cloudflare API / OAuth Token</strong> (<code>cfoat_...</code>) to verify your Cloudflare account, select your active DNS Zone or Workers account, and monitor edge health.
      </>
    ),
    tokenLabel: "Cloudflare API / OAuth Token",
    tokenPlaceholder: "Paste your Cloudflare Token (e.g. cfoat_...)",
    tokenHelpUrl: "https://dash.cloudflare.com/profile/api-tokens",
    tokenHelpLabel: "Create API Token on Cloudflare",
    resourceLabel: "Cloudflare zone or account",
    metaCol1Label: "Plan / Type",
    metaCol1Key: "plan",
    metaCol1Fallback: "Edge",
    metaCol2Label: "Status",
    metaCol2Key: "status",
    metaCol2Fallback: "active",
  },
  clerk: {
    platform: "clerk",
    title: "Clerk Authentication Shield",
    icon: <ClerkLogo className="size-5" />,
    description: (
      <>
        Sign in with your official <strong>Clerk Account</strong> (Sinai University) or paste your <strong>Publishable / Secret Key</strong> to protect your APIs and authenticate the executive agent chamber.
      </>
    ),
    signInButtonLabel: "Sign in with Clerk",
    tokenLabel: "Clerk Publishable / Secret Key (pk_test_... or sk_test_...)",
    tokenPlaceholder: "pk_test_... or sk_test_...",
    tokenHelpUrl: "https://dashboard.clerk.com",
    tokenHelpLabel: "Open Clerk Dashboard (Applications -> API Keys)",
    resourceLabel: "Auth Shield",
    metaCol1Label: "Auth Mode",
    metaCol1Key: "authMode",
    metaCol1Fallback: "RS256_EDGE_JWT",
    metaCol2Label: "Status",
    metaCol2Key: "status",
    metaCol2Fallback: "ACTIVE_PROTECTED",
  },
  camber: {
    platform: "camber",
    title: "Camber Agentic Cloud Compute",
    icon: <CamberLogo className="size-5" />,
    description: (
      <>
        Connect your <strong>Camber Cloud Account</strong> to offload long-running agent meetings and deep data workflows to cloud CPU/GPU nodes with <strong>40 CPU hours & 50GB storage</strong>.
      </>
    ),
    signInButtonLabel: "Open Camber Profile",
    tokenLabel: "Camber API Bearer Token",
    tokenPlaceholder: "Paste your Camber API Token...",
    tokenHelpUrl: "https://app.cambercloud.com/agents",
    tokenHelpLabel: "Open Camber Profile Settings (Bottom Left Avatar -> Token)",
    resourceLabel: "Compute Engine",
    metaCol1Label: "CPU Hours",
    metaCol1Key: "cpuHours",
    metaCol1Fallback: "40 Hours Available",
    metaCol2Label: "Status",
    metaCol2Key: "status",
    metaCol2Fallback: "ONLINE_READY",
  },
  tavily: {
    platform: "tavily",
    title: "Tavily AI Search Grounding",
    icon: <TavilyLogo className="size-5" />,
    description: (
      <>
        Connect your <strong>Tavily Search API Key</strong> (<code>tvly-dev-...</code>) to power Agent Director Tariq with live Google / web fact-checking and 100% ground-truth arbitration.
      </>
    ),
    signInButtonLabel: "Open Tavily Platform",
    tokenLabel: "Tavily API Key (tvly-...)",
    tokenPlaceholder: "tvly-dev-********************************",
    tokenHelpUrl: "https://app.tavily.com/home",
    tokenHelpLabel: "Copy API Key from Tavily Overview",
    resourceLabel: "Search Engine",
    metaCol1Label: "Monthly Quota",
    metaCol1Key: "monthlyQuota",
    metaCol1Fallback: "1,000 Searches",
    metaCol2Label: "Arbitration Status",
    metaCol2Key: "status",
    metaCol2Fallback: "READY_FOR_TARIQ",
  },
};

export function PlatformAuthenticConnectionCard({
  projectId,
  platform,
  heading,
}: {
  projectId: string;
  platform: ManagedPlatformType;
  heading?: React.ReactNode;
}) {
  const descriptor = PLATFORM_DESCRIPTORS[platform];
  const queryClient = useQueryClient();

  const [picking, setPicking] = React.useState(false);
  const [updatingCredentials, setUpdatingCredentials] = React.useState(false);
  const [showManualTokenInput, setShowManualTokenInput] = React.useState(
    platform !== "google_ai_studio",
  );
  const [tokenInput, setTokenInput] = React.useState("");
  const [secretKeyInput, setSecretKeyInput] = React.useState("");
  const [showSecretKey, setShowSecretKey] = React.useState(false);
  const [supabaseMode, setSupabaseMode] = React.useState<"pat" | "url_key">("pat");
  const [supabaseUrlInput, setSupabaseUrlInput] = React.useState("");
  const [supabaseKeyInput, setSupabaseKeyInput] = React.useState("");
  const [verifyError, setVerifyError] = React.useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = React.useState<string>("");

  const connectionKey = ["platformConnection", projectId, platform];
  const connectionQuery = useQuery({
    queryKey: connectionKey,
    queryFn: () => getPlatformConnection({ data: { projectId, platform } }),
  });

  const connection = connectionQuery.data;
  const connected = Boolean(connection?.connected);
  const hasGrant = Boolean(connection?.currentUserHasGrant);

  const isAutoConnectedPlatform = ["clerk", "camber", "tavily"].includes(platform);
  const shouldLoadResources = Boolean(
    !updatingCredentials && (picking || (hasGrant && !connected && !isAutoConnectedPlatform)),
  );

  const resourcesQuery = useQuery({
    queryKey: ["platformResources", projectId, platform],
    queryFn: () => listPlatformResources({ data: { projectId, platform } }),
    enabled: shouldLoadResources,
  });

  const resources = React.useMemo(
    () => resourcesQuery.data?.resources ?? [],
    [resourcesQuery.data?.resources],
  );

  React.useEffect(() => {
    if (resources.length > 0 && !selectedResourceId) {
      const current = resources.find((r) => r.isSelected) || resources[0];
      if (current) setSelectedResourceId(current.id);
    }
  }, [resources, selectedResourceId]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: connectionKey });
    void queryClient.invalidateQueries({
      queryKey: ["platformResources", projectId, platform],
    });
    void queryClient.invalidateQueries({
      queryKey: ["platformDashboardReport", projectId, platform],
    });
    void queryClient.invalidateQueries({
      queryKey: ["platformIntegrations", projectId],
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vorder-integrations-updated"));
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async (opts?: { useEnvSignIn?: boolean }) => {
      setVerifyError(null);
      if (opts?.useEnvSignIn) {
        return await verifyPlatformCredentials({
          data: {
            projectId,
            platform,
            credentials: {
              useEnvSignIn: true,
            },
          },
        });
      }
      if (platform === "supabase" && supabaseMode === "url_key") {
        return await verifyPlatformCredentials({
          data: {
            projectId,
            platform,
            credentials: {
              projectUrl: supabaseUrlInput.trim(),
              apiKey: supabaseKeyInput.trim(),
            },
          },
        });
      }
      if (platform === "clerk") {
        return await verifyPlatformCredentials({
          data: {
            projectId,
            platform,
            credentials: {
              token: tokenInput.trim() || secretKeyInput.trim(),
              apiKey: tokenInput.trim() || secretKeyInput.trim(),
              publishableKey: tokenInput.trim(),
              secretKey: secretKeyInput.trim() || undefined,
            },
          },
        });
      }
      if (platform === "camber") {
        return await verifyPlatformCredentials({
          data: {
            projectId,
            platform,
            credentials: {
              token: tokenInput.trim() || secretKeyInput.trim(),
              apiKey: tokenInput.trim() || secretKeyInput.trim(),
              secretKey: secretKeyInput.trim() || undefined,
            },
          },
        });
      }
      return await verifyPlatformCredentials({
        data: {
          projectId,
          platform,
          credentials: {
            token: tokenInput.trim(),
            apiKey: tokenInput.trim(),
          },
        },
      });
    },
    onSuccess: (state) => {
      const isAuto = ["clerk", "camber", "tavily"].includes(platform) || state.connected;
      if (isAuto) {
        toast.success(
          `تم ربط ${descriptor.title} بنجاح (${state.connectedByEmail || state.accountName}).`,
        );
        setTokenInput("");
        setSecretKeyInput("");
        setSupabaseKeyInput("");
        setUpdatingCredentials(false);
        setPicking(false);
      } else {
        toast.success(
          `Signed in to ${descriptor.title} (${state.connectedByEmail || state.accountName}). Now select a ${descriptor.resourceLabel}.`,
        );
        setTokenInput("");
        setSecretKeyInput("");
        setSupabaseKeyInput("");
        setUpdatingCredentials(false);
        setPicking(true);
      }
      invalidateAll();
    },
    onError: (err) => {
      const msg = getStandardErrorMessage(err, "Failed to verify credentials.");
      setVerifyError(msg);
      toast.error(msg);
    },
  });

  const selectResourceMutation = useMutation({
    mutationFn: async () => {
      const chosen = resources.find((r) => r.id === selectedResourceId);
      if (!chosen) {
        throw new Error(`Please select a ${descriptor.resourceLabel} first.`);
      }
      return await setPlatformResource({
        data: {
          projectId,
          platform,
          resourceId: chosen.id,
          resourceName: chosen.name,
          resourceMeta: chosen.meta,
        },
      });
    },
    onSuccess: () => {
      toast.success(`${descriptor.title} connected`);
      setPicking(false);
      invalidateAll();
    },
    onError: (err) => toast.error(getStandardErrorMessage(err)),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectPlatformIntegration({ data: { projectId, platform } }),
    onSuccess: () => {
      toast.success(`${descriptor.title} disconnected`);
      setPicking(false);
      setUpdatingCredentials(false);
      setSelectedResourceId("");
      invalidateAll();
    },
    onError: (err) => toast.error(getStandardErrorMessage(err)),
  });

  const metaObj = connection?.selectedResourceMeta ?? {};
  const col1Raw = metaObj[descriptor.metaCol1Key] ?? metaObj.tablesCount ?? descriptor.metaCol1Fallback;
  const col2Raw = metaObj[descriptor.metaCol2Key] ?? descriptor.metaCol2Fallback;

  return (
    <>
      {heading}
      <IntegrationConnectionCard
        title={descriptor.title}
        icon={descriptor.icon}
        status={
          connectionQuery.isLoading
            ? undefined
            : (connected || (isAutoConnectedPlatform && hasGrant))
              ? "connected"
              : hasGrant
                ? "setup_required"
                : "disconnected"
        }
      >
        {verifyError ? (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 break-words">{verifyError}</div>
          </div>
        ) : null}

        {connectionQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-base-content/50">
            <span className="loading loading-spinner loading-sm" />
            Checking {descriptor.title} connection…
          </div>
        ) : (connected || (isAutoConnectedPlatform && hasGrant)) && !picking && !updatingCredentials ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-base-300 bg-base-200/30 px-4 py-3.5">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">
                      Selected Property
                    </p>
                    {connection?.selectedResourceMeta?.hasSecretKey ? (
                      <span className="inline-flex items-center gap-1 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
                        <ShieldCheck className="size-3" />
                        Dual-Key Protected
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {connection?.selectedResourceName ?? connection?.selectedResourceId}
                  </p>
                </div>
                {connection?.selectedResourceId ? (
                  <span className="rounded-md border border-base-300 bg-base-100 px-2 py-1 font-mono text-[11px] text-base-content/60">
                    ID {connection.selectedResourceId}
                  </span>
                ) : null}
              </div>

              <dl className="mt-3 grid gap-x-6 gap-y-2 border-t border-base-300/70 pt-3 text-xs sm:grid-cols-3">
                <div className="min-w-0">
                  <dt className="text-base-content/45">{descriptor.metaCol1Label}</dt>
                  <dd className="mt-0.5 truncate font-medium text-base-content/75">
                    {String(col1Raw)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-base-content/45">{descriptor.metaCol2Label}</dt>
                  <dd className="mt-0.5 truncate font-medium text-base-content/75">
                    {String(col2Raw)}
                  </dd>
                </div>
                {connection?.connectedByEmail ? (
                  <div className="min-w-0">
                    <dt className="text-base-content/45">Connected account</dt>
                    <dd className="mt-0.5 truncate font-medium text-base-content/75">
                      {connection.connectedByEmail}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-outline btn-sm border-base-300 font-medium"
                onClick={() => setPicking(true)}
              >
                Change property
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm font-medium text-error hover:bg-error/10"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          </div>
        ) : shouldLoadResources ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/70">
              <span>
                Select the {descriptor.resourceLabel} to link to this project:
              </span>
              {connection?.connectedByEmail ? (
                <span className="font-mono text-[11px] text-base-content/60">
                  Account: {connection.connectedByEmail}
                </span>
              ) : null}
            </div>

            {resourcesQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-base-content/50">
                <span className="loading loading-spinner loading-sm" />
                Loading {descriptor.resourceLabel}s from live API…
              </div>
            ) : resourcesQuery.isError ? (
              <div className="space-y-2">
                <div className="rounded-md border border-error/30 bg-error/10 p-3 text-xs text-error">
                  {getStandardErrorMessage(
                    resourcesQuery.error,
                    `Failed to list ${descriptor.resourceLabel}s.`,
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => setUpdatingCredentials(true)}
                >
                  Use another token / account
                </button>
              </div>
            ) : resources.length === 0 ? (
              <div className="space-y-2">
                <div className="rounded-md bg-base-200/50 p-3 text-xs text-base-content/70">
                  No accessible {descriptor.resourceLabel}s found on this account.
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => setUpdatingCredentials(true)}
                >
                  Use another token / account
                </button>
              </div>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  selectResourceMutation.mutate();
                }}
              >
                <select
                  className="select select-bordered select-sm w-full font-mono text-xs"
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                >
                  {resources.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} — {res.subtitle}
                    </option>
                  ))}
                </select>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={selectResourceMutation.isPending || !selectedResourceId}
                  >
                    {selectResourceMutation.isPending ? "Saving…" : "Save property"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm border-base-300"
                    onClick={() => setUpdatingCredentials(true)}
                  >
                    Use another account
                  </button>
                  {connected ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-base-content/60"
                      onClick={() => setPicking(false)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                      onClick={() => disconnectMutation.mutate()}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Disconnected / Authenticate View */
          <div className="space-y-3">
            <p className="text-sm text-base-content/70">{descriptor.description}</p>

            {/* Primary Google OAuth 2.0 Button for Google Gemini AI Studio */}
            {platform === "google_ai_studio" ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm inline-flex items-center gap-2"
                  onClick={() => void startGoogleLink("gemini", window.location.href)}
                >
                  <GoogleGlyph className="size-4" />
                  <span>Connect with Google</span>
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-base-content/60"
                  onClick={() => setShowManualTokenInput((v) => !v)}
                >
                  {showManualTokenInput
                    ? "Hide manual API Key input"
                    : "Or use custom Gemini API Key"}
                </button>
              </div>
            ) : null}

            {/* Direct Token Input Form (Always shown for Supabase, GitHub, Vercel, Cloudflare; toggleable for Gemini) */}
            {(platform !== "google_ai_studio" || showManualTokenInput) && (
              <>
                {platform === "supabase" ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSupabaseMode("pat")}
                      className={`btn btn-xs ${
                        supabaseMode === "pat" ? "btn-primary" : "btn-outline border-base-300"
                      }`}
                    >
                      Management Access Token (Lists all projects)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupabaseMode("url_key")}
                      className={`btn btn-xs ${
                        supabaseMode === "url_key" ? "btn-primary" : "btn-outline border-base-300"
                      }`}
                    >
                      Direct Project URL + API Key
                    </button>
                  </div>
                ) : null}

                <form
                  className="space-y-3 pt-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    verifyMutation.mutate({});
                  }}
                >
                  {platform === "supabase" && supabaseMode === "url_key" ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        type="url"
                        required
                        placeholder="https://your-project-ref.supabase.co"
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        className="input input-bordered input-sm w-full font-mono text-xs"
                      />
                      <input
                        type="password"
                        required
                        placeholder="Supabase anon or service_role API key"
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        className="input input-bordered input-sm w-full font-mono text-xs"
                      />
                    </div>
                  ) : platform === "clerk" ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-base-content/80">
                          1. Clerk Publishable Key (pk_test_... / pk_live_...)
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="pk_test_..."
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          className="input input-bordered input-sm w-full font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-base-content/80">
                          <span>2. Clerk Backend Secret Key (sk_test_... / sk_live_...)</span>
                          <span className="text-[10px] font-normal text-primary">مطلوب للتشفير ومصادقة الـ Edge</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showSecretKey ? "text" : "password"}
                            dir="ltr"
                            placeholder="sk_test_..."
                            value={secretKeyInput}
                            onChange={(e) => setSecretKeyInput(e.target.value)}
                            className="input input-bordered input-sm w-full font-mono text-xs pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-base-content/50 hover:text-base-content"
                            title={showSecretKey ? "إخفاء المفتاح" : "إظهار المفتاح"}
                          >
                            {showSecretKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : platform === "camber" ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-base-content/80">
                          1. Camber API / Access Token
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="Paste your Camber API Token..."
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          className="input input-bordered input-sm w-full font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-base-content/80">
                          <span>2. Camber Execution Secret Key / MCP Token</span>
                          <span className="text-[10px] font-normal text-primary">لتفويض تشغيل مهام الـ Sandbox</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showSecretKey ? "text" : "password"}
                            dir="ltr"
                            placeholder="Paste Camber Secret Key..."
                            value={secretKeyInput}
                            onChange={(e) => setSecretKeyInput(e.target.value)}
                            className="input input-bordered input-sm w-full font-mono text-xs pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-base-content/50 hover:text-base-content"
                            title={showSecretKey ? "إخفاء المفتاح" : "إظهار المفتاح"}
                          >
                            {showSecretKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[240px]">
                        <input
                          type="text"
                          required
                          dir="ltr"
                          placeholder={descriptor.tokenPlaceholder}
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          className="input input-bordered input-sm w-full font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm inline-flex items-center gap-2"
                      disabled={
                        verifyMutation.isPending ||
                        (platform === "supabase" && supabaseMode === "url_key"
                          ? !supabaseUrlInput.trim() || !supabaseKeyInput.trim()
                          : !tokenInput.trim() && !secretKeyInput.trim())
                      }
                    >
                      <KeyRound className="size-3.5" />
                      {verifyMutation.isPending
                        ? `Verifying with ${descriptor.title}…`
                        : `Connect ${descriptor.title}`}
                    </button>

                    <a
                      href={descriptor.tokenHelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm border-base-300 inline-flex items-center gap-1.5 text-xs font-medium"
                    >
                      <span>{descriptor.tokenHelpLabel}</span>
                      <ExternalLink className="size-3.5" />
                    </a>

                    {updatingCredentials ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-base-content/60"
                        onClick={() => setUpdatingCredentials(false)}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </IntegrationConnectionCard>
    </>
  );
}

export function GeminiAiStudioConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  return (
    <PlatformAuthenticConnectionCard
      projectId={projectId}
      platform="google_ai_studio"
      heading={heading}
    />
  );
}

export function SupabaseConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  return (
    <PlatformAuthenticConnectionCard
      projectId={projectId}
      platform="supabase"
      heading={heading}
    />
  );
}

export function GitHubConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  return (
    <PlatformAuthenticConnectionCard
      projectId={projectId}
      platform="github"
      heading={heading}
    />
  );
}

export function VercelConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  return (
    <PlatformAuthenticConnectionCard
      projectId={projectId}
      platform="vercel"
      heading={heading}
    />
  );
}

export function CloudflareConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  return (
    <PlatformAuthenticConnectionCard
      projectId={projectId}
      platform="cloudflare"
      heading={heading}
    />
  );
}

export function ClerkConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  return (
    <PlatformAuthenticConnectionCard
      projectId={projectId}
      platform="clerk"
      heading={heading}
    />
  );
}

export function CamberConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  return (
    <PlatformAuthenticConnectionCard
      projectId={projectId}
      platform="camber"
      heading={heading}
    />
  );
}

export function TavilyConnectionCard({
  projectId,
  heading,
}: {
  projectId: string;
  heading?: React.ReactNode;
}) {
  return (
    <PlatformAuthenticConnectionCard
      projectId={projectId}
      platform="tavily"
      heading={heading}
    />
  );
}

