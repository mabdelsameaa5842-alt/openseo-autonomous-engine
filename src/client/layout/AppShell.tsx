import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import {
  MissingSeoSetupModal,
  MobileSidebarDrawer,
  SeoApiStatusBanners,
} from "@/client/layout/AppShellParts";
import { GscReEngagementModal } from "@/client/features/gsc/GscReEngagementModal";
import { Sidebar } from "@/client/components/Sidebar";
import { BILLING_ROUTE } from "@/shared/billing";
import { getSeoApiKeyStatus } from "@/serverFunctions/config";
import { getProjects } from "@/serverFunctions/projects";
import { getLastProjectId } from "@/client/lib/active-project";
import { SuperAdminGate } from "@/client/components/SuperAdminGate";
import { I18nProvider, LanguageToggle } from "@/client/lib/i18n";
import { useThemePreference } from "@/client/lib/theme";
import { ThemeToggle } from "@/client/components/ThemeToggle";

const DATAFORSEO_HELP_PATH = "/help/dataforseo-api-key";

export function AuthenticatedAppLayout({
  children,
  projectId,
  banner,
}: {
  children: React.ReactNode;
  projectId?: string;
  banner?: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <SuperAdminGate>
        <AuthenticatedAppLayoutInner projectId={projectId} banner={banner}>
          {children}
        </AuthenticatedAppLayoutInner>
      </SuperAdminGate>
    </I18nProvider>
  );
}

function AuthenticatedAppLayoutInner({
  children,
  projectId,
  banner,
}: {
  children: React.ReactNode;
  projectId?: string;
  banner?: React.ReactNode;
}) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const setupModalRef = React.useRef<HTMLDivElement | null>(null);
  const [showMissingSeoApiKeyModal, setShowMissingSeoApiKeyModal] =
    React.useState(false);
  // On non-project pages (e.g. /settings) there's no projectId in the URL, so
  // derive one for the nav/switcher: prefer the last-visited project, else the
  // most recent. The whole app tree is client-only (see root ClientOnly), so we
  // can read localStorage synchronously during the first render — this lets the
  // sidebar show the full project nav on the very first paint instead of briefly
  // flashing only the always-visible Connect group while projects load.
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
    enabled: !projectId,
  });
  const [rememberedProjectId] = React.useState<string | null>(() =>
    getLastProjectId(),
  );
  const fallbackProjects = projectsQuery.data ?? [];
  const fallbackProjectId =
    fallbackProjects.find((project) => project.id === rememberedProjectId)
      ?.id ??
    fallbackProjects[0]?.id ??
    null;
  // Once the projects list loads, fallbackProjectId is the validated choice
  // (remembered-if-valid, else most recent). Before it loads, fall back to the
  // remembered id so the project nav renders immediately; a stale id here only
  // builds links that self-correct via the route guard once data arrives.
  const sidebarProjectId =
    projectId ?? fallbackProjectId ?? rememberedProjectId;
  const shouldCheckSeoApiKeyStatus = location.pathname !== BILLING_ROUTE;
  const seoApiKeyStatusQuery = useQuery({
    queryKey: ["seoApiKeyStatus"],
    queryFn: () => getSeoApiKeyStatus(),
    enabled: shouldCheckSeoApiKeyStatus,
  });
  const isSeoApiKeyConfigured = shouldCheckSeoApiKeyStatus
    ? (seoApiKeyStatusQuery.data?.configured ?? null)
    : null;
  const seoApiKeyStatusError =
    shouldCheckSeoApiKeyStatus && seoApiKeyStatusQuery.isError;

  React.useEffect(() => {
    if (!shouldCheckSeoApiKeyStatus) {
      setShowMissingSeoApiKeyModal(false);
      return;
    }

    if (seoApiKeyStatusQuery.isError) {
      setShowMissingSeoApiKeyModal(false);
      return;
    }

    if (!seoApiKeyStatusQuery.isSuccess) return;
    setShowMissingSeoApiKeyModal(!seoApiKeyStatusQuery.data.configured);
  }, [
    location.pathname,
    seoApiKeyStatusQuery.data,
    seoApiKeyStatusQuery.isError,
    seoApiKeyStatusQuery.isSuccess,
    shouldCheckSeoApiKeyStatus,
  ]);

  const shouldShowMissingSeoApiKeyModal =
    showMissingSeoApiKeyModal && location.pathname !== DATAFORSEO_HELP_PATH;

  const shouldShowSeoApiWarning =
    !seoApiKeyStatusError &&
    isSeoApiKeyConfigured === false &&
    !shouldShowMissingSeoApiKeyModal;

  React.useEffect(() => {
    if (!shouldShowMissingSeoApiKeyModal) return;

    setupModalRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMissingSeoApiKeyModal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldShowMissingSeoApiKeyModal]);

  return (
    <div
      className="flex h-[100dvh] font-sans transition-colors duration-200"
      style={{
        background: "var(--apple-canvas)",
        color: "var(--apple-text-primary)",
      }}
    >
      <div className="hidden shrink-0 md:block transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <Sidebar projectId={sidebarProjectId} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar
          drawerOpen={drawerOpen}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        {/* PostHog-style cutout: the main content sits on a raised panel with a
            thin strip of the sidebar background above it and a hairline border. */}
        <div className="flex min-h-0 flex-1 flex-col md:pt-2">
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden md:rounded-tl-lg md:border-l md:border-t transition-colors duration-200"
            style={{
              background: "var(--apple-canvas)",
              borderColor: "var(--apple-border)",
            }}
          >
            <SeoApiStatusBanners
              shouldShowSeoApiWarning={shouldShowSeoApiWarning}
              seoApiKeyStatusError={seoApiKeyStatusError}
            />

            {banner}

            <div 
              className="min-h-0 flex-1 overflow-auto"
              style={{
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      <MobileSidebarDrawer
        open={drawerOpen}
        projectId={sidebarProjectId}
        onClose={() => setDrawerOpen(false)}
      />

      <MissingSeoSetupModal
        ref={setupModalRef}
        isOpen={shouldShowMissingSeoApiKeyModal}
        onClose={() => setShowMissingSeoApiKeyModal(false)}
      />

      <GscReEngagementModal
        projectId={sidebarProjectId}
        suppressed={shouldShowMissingSeoApiKeyModal}
      />
    </div>
  );
}

function MobileTopBar({
  drawerOpen,
  onOpenDrawer,
}: {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
}) {
  const { themePreference } = useThemePreference();
  const isDark =
    themePreference === "dark" ||
    (themePreference === "system" &&
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-color-scheme: light)").matches);

  return (
    <header
      className="flex shrink-0 items-center justify-between gap-2 md:hidden z-30 transition-colors duration-200"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
        paddingBottom: "10px",
        paddingLeft: "calc(env(safe-area-inset-left, 0px) + 12px)",
        paddingRight: "calc(env(safe-area-inset-right, 0px) + 12px)",
        background: isDark ? "rgba(14, 14, 16, 0.95)" : "rgba(245, 245, 247, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center justify-center h-10 w-10 rounded-xl text-zinc-400 hover:text-white active:scale-95 transition-all touch-manipulation"
          style={isDark ? { background: "rgba(255,255,255,0.06)" } : { background: "rgba(0,0,0,0.06)", color: "#1D1D1F" }}
          aria-label="Toggle sidebar"
          aria-expanded={drawerOpen}
          onClick={onOpenDrawer}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          to="/"
          className="font-bold text-base tracking-tight flex items-center gap-2"
          style={{ color: isDark ? "#FFFFFF" : "#1D1D1F" }}
        >
          <span className="size-2 rounded-full bg-[#30D158] animate-pulse" />
          <span>OpenSEO</span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>
  );
}

