import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowLeftRight,
  Check,
  CircleHelp,
  CreditCard,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Settings,
  User,
  X,
} from "lucide-react";
import { organizationContextQueryOptions } from "@/client/features/team/organizationQueries";
import { switchOrganization } from "@/serverFunctions/organization";
import {
  connectNavGroup,
  getProjectNavGroups,
} from "@/client/navigation/items";
import { ProjectSwitcher } from "@/client/features/projects/ProjectSwitcher";
import { SamSidebarPanel } from "@/client/features/sam/SamSidebarPanel";
import { ThemePreferenceMenuItems } from "@/client/components/ThemePreferenceMenuItems";
import { closeDropdown } from "@/client/lib/dropdown";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { BILLING_ROUTE } from "@/shared/billing";
import { useSuperAdmin } from "@/client/components/SuperAdminGate";
import { useI18n } from "@/client/lib/i18n";

const GROUP_LABEL_KEYS: Record<string, string> = {
  Overview: "nav.overview",
  "Growth & Performance": "nav.growth_performance",
  "My Site": "nav.my_site",
  Research: "nav.research",
  Connect: "nav.connect",
};

const ITEM_LABEL_KEYS: Record<string, string> = {
  Dashboard: "nav.dashboard",
  "Keyword Research": "nav.keyword_research",
  "Saved Keywords": "nav.saved_keywords",
  "Rank Tracking": "nav.rank_tracking",
  "GSC Insights": "nav.gsc_insights",
  "Domain Overview": "nav.domain_overview",
  Backlinks: "nav.backlinks",
  "Site Audit": "nav.site_audit",
  "Performance": "nav.roas_performance",
  "AI Strategy & Skills Hub": "nav.skills_hub",
  "Brand Lookup": "nav.brand_lookup",
  "Prompt Explorer": "nav.prompt_explorer",
  "AI & MCP": "nav.ai_mcp",
};

interface SidebarProps {
  projectId: string | null;
  onNavigate?: () => void;
  onClose?: () => void;
}

const navItemBaseClass =
  "relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-base-content/70";

// Hover uses a lighter tint than the active background (bg-base-300/50) so a
// hovered item next to the active one stays visually distinct instead of
// merging into a single block.
const navItemClass = `${navItemBaseClass} transition-colors hover:bg-base-300/30 hover:text-base-content`;

const navItemActiveProps = {
  // Keep the active tint on hover so the active item does not fall back to the
  // lighter hover background of navItemClass.
  className:
    "bg-base-300/50 hover:bg-base-300/50 font-medium text-base-content",
};

function SidebarNavLink({
  icon: Icon,
  label,
  onNavigate,
  linkProps,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onNavigate?: () => void;
  linkProps: LinkOptions;
}) {
  return (
    <Link
      onClick={onNavigate}
      activeOptions={{ exact: false, includeSearch: false }}
      {...linkProps}
      className={navItemClass}
      activeProps={navItemActiveProps}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {isActive ? (
            <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary" />
          ) : null}
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </>
      )}
    </Link>
  );
}

export function Sidebar({ projectId, onNavigate, onClose }: SidebarProps) {
  const { t } = useI18n();
  const navGroups = [
    ...(projectId ? getProjectNavGroups(projectId) : []),
    connectNavGroup,
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const onSamRoute = location.pathname.includes("/sam");

  // PostHog-style sidebar tabs: Browse shows the regular nav, Chat shows the
  // SAM chat history. The tab is view state (switching to Browse leaves the
  // conversation open in the content panel), but the route wins: landing on
  // /sam selects Chat, navigating anywhere else flips back to Browse.
  const [view, setView] = useState<"browse" | "chat">(
    onSamRoute ? "chat" : "browse",
  );
  useEffect(() => {
    setView(onSamRoute ? "chat" : "browse");
  }, [onSamRoute]);

  const openChat = () => {
    setView("chat");
    if (!projectId) return;
    if (!onSamRoute) {
      void navigate({
        to: "/p/$projectId/sam",
        params: { projectId },
        search: {},
      });
      onNavigate?.();
    }
  };

  // Coming back from Chat, land on the dashboard rather than leaving the
  // conversation filling the content panel next to a Browse nav.
  const openBrowse = () => {
    setView("browse");
    if (!projectId || !onSamRoute) return;
    void navigate({ to: "/p/$projectId", params: { projectId } });
    onNavigate?.();
  };

  return (
    <div
      className="flex h-full w-60 flex-col transition-colors duration-200"
      style={{
        background: "var(--apple-sidebar)",
        borderRight: "1px solid var(--apple-sidebar-border)",
      }}
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="text-base font-bold tracking-tight flex items-center gap-2"
          style={{ color: "var(--apple-text-primary)" }}
        >
          <span className="size-2 rounded-full bg-[#30D158] animate-pulse" />
          <span>OpenSEO</span>
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-zinc-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="px-3 pb-1">
        <ProjectSwitcher
          activeProjectId={projectId}
          onCloseDrawer={onNavigate}
        />
      </div>

      {projectId ? (
        // Same underline tab idiom as the in-page tab strips (e.g. Domain
        // Overview's Top Keywords / Top Pages).
        <div className="px-3 pb-1">
          <div role="tablist" className="tabs tabs-border w-full border-white/10">
            <SidebarViewTab
              icon={LayoutGrid}
              label={t("nav.browse", "Browse")}
              active={view === "browse"}
              onClick={openBrowse}
            />
            <SidebarViewTab
              icon={MessageCircle}
              label={t("nav.chat", "Chat")}
              active={view === "chat"}
              onClick={openChat}
            />
          </div>
        </div>
      ) : null}

      {view === "chat" && projectId ? (
        <SamSidebarPanel projectId={projectId} onNavigate={onNavigate} />
      ) : (
        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {navGroups.map((group) => {
            const groupTranslated = t(
              GROUP_LABEL_KEYS[group.label] ?? group.label,
              group.label,
            );
            return (
              <div key={group.label} className="mb-2">
                <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {groupTranslated}
                </div>
                {group.items.map((item) => {
                  const { icon, label, ...linkProps } = item;
                  const itemTranslated = t(
                    ITEM_LABEL_KEYS[label] ?? label,
                    label,
                  );
                  return (
                    <SidebarNavLink
                      key={linkProps.to}
                      icon={icon}
                      label={itemTranslated}
                      onNavigate={onNavigate}
                      linkProps={linkProps}
                    />
                  );
                })}
              </div>
            );
          })}
        </nav>
      )}

      <SidebarFooter onNavigate={onNavigate} />
    </div>
  );
}

function SidebarViewTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`tab flex-1 gap-1.5 ${active ? "tab-active" : ""}`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { t, isRtl } = useI18n();
  const { data: session } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const superAdmin = useSuperAdmin();
  const email = superAdmin.user?.email || session?.user?.email;
  const userName = superAdmin.user?.name || session?.user?.name || (email ? email.split("@")[0] : (isRtl ? "المستخدم" : "User"));
  const [isSwitching, setIsSwitching] = useState(false);

  const orgContextQuery = useQuery({
    ...organizationContextQueryOptions(),
    enabled: isHostedMode && Boolean(email),
  });
  const organizations = orgContextQuery.data?.organizations ?? [];
  const activeOrganizationId = orgContextQuery.data?.organizationId;

  const closeMenu = () => {
    closeDropdown();
    onNavigate?.();
  };

  async function handleSwitchOrganization(organizationId: string) {
    if (isSwitching || organizationId === activeOrganizationId) return;
    setIsSwitching(true);
    try {
      await switchOrganization({ data: { organizationId } });
      // Full reload: every cached query and the project-scoped URL belong to
      // the previous organization.
      window.location.assign("/");
    } catch {
      setIsSwitching(false);
    }
  }

  return (
    <div
      className="shrink-0 px-2 py-2 pb-safe space-y-1.5 transition-colors duration-200"
      style={{
        background: "var(--apple-sidebar)",
        borderTop: "1px solid var(--apple-sidebar-border)",
      }}
    >
      <SidebarNavLink
        icon={CircleHelp}
        label={t("nav.help", "Help & Community")}
        onNavigate={onNavigate}
        linkProps={{ to: "/support" }}
      />

      {email ? (
        <div className="dropdown dropdown-top w-full">
          <button
            type="button"
            tabIndex={0}
            className="group relative flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-[#161618] p-2 text-left backdrop-blur-md transition-all duration-200 hover:border-amber-400/50 hover:bg-[#1C1C1F] hover:shadow-sm"
            aria-label="Open account menu"
          >
            {/* Apple HIG Monogram Avatar */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 text-amber-500 font-bold text-xs shadow-inner">
              MA
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30D158]"></span>
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-white leading-tight">
                {userName}
              </span>
              <span className="truncate text-[11px] text-zinc-400 font-mono">
                {email}
              </span>
            </div>

            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
              {isRtl ? "👑 مدير عام" : "👑 Super Admin"}
            </span>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-30 menu mb-1 w-64 rounded-2xl border border-white/10 bg-[#161618] p-2 shadow-2xl backdrop-blur-xl text-white"
          >
            <li className="menu-title flex flex-row items-center gap-1.5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              {isRtl ? "حساب المدير العام" : "Super Admin Account"}
            </li>
            <li className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 mb-1">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-xs text-white">{userName}</span>
                <span className="text-[11px] text-zinc-400 font-mono">{email}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#30D158] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#30D158]"></span>
                  {isRtl ? "جلسة مشفرة ومحمية بنظام أبل الأمني" : "Secure & Encrypted Session"}
                </span>
              </div>
            </li>
            <li aria-hidden className="pointer-events-none my-1 h-px bg-white/10 p-0" />
            {organizations.length > 1 ? (
              <>
                <li className="menu-title flex flex-row items-center gap-1.5 max-w-full text-zinc-400">
                  <ArrowLeftRight className="h-3 w-3" />
                  {t("nav.organization", "Organization")}
                </li>
                {organizations.map((organization) => (
                  <li key={organization.organizationId}>
                    <button
                      type="button"
                      disabled={isSwitching}
                      onClick={() =>
                        void handleSwitchOrganization(
                          organization.organizationId,
                        )
                      }
                    >
                      <span className="truncate">
                        {organization.organizationName}
                      </span>
                      {organization.organizationId === activeOrganizationId ? (
                        <Check className="h-4 w-4 shrink-0 text-[#30D158]" />
                      ) : null}
                    </button>
                  </li>
                ))}
                <li
                  aria-hidden
                  className="pointer-events-none my-1 h-px bg-white/10 p-0"
                />
              </>
            ) : null}
            <li>
              <Link to="/settings" onClick={closeMenu} className="hover:bg-white/10">
                <Settings className="h-4 w-4 text-zinc-400" />
                {t("nav.settings", "Settings")}
              </Link>
            </li>
            {isHostedMode ? (
              <li>
                <Link to={BILLING_ROUTE} onClick={closeMenu} className="hover:bg-white/10">
                  <CreditCard className="h-4 w-4 text-zinc-400" />
                  {t("nav.billing", "Billing")}
                </Link>
              </li>
            ) : null}
            <ThemePreferenceMenuItems />
            <li
              aria-hidden
              className="pointer-events-none my-1 h-px bg-white/10 p-0"
            />
            <li>
              <button
                type="button"
                className="text-[#FF453A] hover:bg-[#FF453A]/10 font-medium"
                onClick={() => {
                  superAdmin.logout();
                  if (isHostedMode) signOutAndRedirect();
                }}
              >
                <LogOut className="h-4 w-4" />
                {t("nav.logout", "Sign Out")}
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <SidebarNavLink
          icon={Settings}
          label={t("nav.settings", "Settings")}
          onNavigate={onNavigate}
          linkProps={{ to: "/settings" }}
        />
      )}
    </div>
  );
}
