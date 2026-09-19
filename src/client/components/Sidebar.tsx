import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  LayoutGrid,
  LogOut,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
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
  Performance: "nav.roas_performance",
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

function SidebarNavLink({
  icon: Icon,
  label,
  onNavigate,
  linkProps,
  isCollapsed,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onNavigate?: () => void;
  linkProps: LinkOptions;
  isCollapsed?: boolean;
}) {
  return (
    <Link
      onClick={onNavigate}
      activeOptions={{ exact: false, includeSearch: false }}
      {...linkProps}
      className={`group relative flex items-center rounded-xl transition-all duration-200 ${
        isCollapsed
          ? "justify-center p-2.5 mx-auto text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-white/[0.08]"
          : "gap-3 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-white/[0.05]"
      }`}
      activeProps={{
        className: isCollapsed
          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-sm"
          : "bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent dark:from-amber-500/20 dark:to-transparent text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20 shadow-sm",
      }}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {isActive && !isCollapsed && (
            <div className="absolute start-0 top-2 bottom-2 w-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          )}
          {isActive && isCollapsed && (
            <div className="absolute -start-0.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          )}

          <Icon
            className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
              isActive ? "text-amber-600 dark:text-amber-400" : ""
            }`}
          />

          {!isCollapsed && <span className="truncate">{label}</span>}

          {/* Floating Tooltip in Collapsed Rail Mode */}
          {isCollapsed && (
            <div className="pointer-events-none absolute start-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
              {label}
            </div>
          )}
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

  // Collapse state (persisted in localStorage, disabled if mobile drawer modal)
  const isMobileDrawer = Boolean(onClose);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (!isMobileDrawer && typeof window !== "undefined") {
      const saved = localStorage.getItem("openseo_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    }
  }, [isMobileDrawer]);

  const toggleCollapse = () => {
    if (isMobileDrawer) return;
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("openseo_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Group expansion state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Overview: true,
    "Growth & Performance": true,
    "My Site": true,
    Research: true,
    Connect: true,
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // View state: Browse vs Chat
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

  const openBrowse = () => {
    setView("browse");
    if (!projectId || !onSamRoute) return;
    void navigate({ to: "/p/$projectId", params: { projectId } });
    onNavigate?.();
  };

  return (
    <aside
      className={`flex h-full flex-col backdrop-blur-2xl bg-white/80 dark:bg-[#121214]/80 border-r border-zinc-200/60 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
        isCollapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Brand Header & Collapse Toggle */}
      <div className="flex items-center justify-between px-3.5 pb-2 pt-3.5">
        <Link
          to="/"
          onClick={onNavigate}
          className="group flex items-center gap-2.5 overflow-hidden transition-all duration-200"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white font-bold text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <span>O</span>
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-[#30D158] border-2 border-white dark:border-[#121214] animate-pulse" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                OpenSEO
              </span>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                Autonomous AI Studio
              </span>
            </div>
          )}
        </Link>

        {isMobileDrawer ? (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-95"
            title={isCollapsed ? t("nav.expand_sidebar", "Expand Sidebar") : t("nav.collapse_sidebar", "Collapse Sidebar")}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Project Switcher */}
      <div className={`transition-all duration-200 ${isCollapsed ? "px-2 pb-1" : "px-3 pb-1"}`}>
        {isCollapsed ? (
          <div className="group relative flex justify-center py-1">
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-xs font-bold cursor-pointer hover:border-amber-400/50 transition-colors">
              P
            </div>
            <div className="pointer-events-none absolute start-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
              {t("nav.switch_project", "Project Scope")}
            </div>
          </div>
        ) : (
          <ProjectSwitcher
            activeProjectId={projectId}
            onCloseDrawer={onNavigate}
          />
        )}
      </div>

      {/* Browse vs Chat Tabs */}
      {projectId ? (
        <div className={`pb-2 ${isCollapsed ? "px-2" : "px-3"}`}>
          {isCollapsed ? (
            <div className="flex flex-col gap-1 items-center">
              <button
                type="button"
                onClick={openBrowse}
                className={`group relative p-2 rounded-xl transition-all duration-200 ${
                  view === "browse"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
                }`}
                aria-label="Browse navigation"
              >
                <LayoutGrid className="h-4 w-4" />
                <div className="pointer-events-none absolute start-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                  {t("nav.browse", "Browse")}
                </div>
              </button>

              <button
                type="button"
                onClick={openChat}
                className={`group relative p-2 rounded-xl transition-all duration-200 ${
                  view === "chat"
                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
                }`}
                aria-label="AI Chat Studio"
              >
                <MessageCircle className="h-4 w-4" />
                <div className="pointer-events-none absolute start-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                  {t("nav.chat", "Chat Studio")}
                </div>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100/80 dark:bg-white/[0.06] p-1 border border-zinc-200/60 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={openBrowse}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 ${
                  view === "browse"
                    ? "bg-white dark:bg-[#1C1C1E] text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{t("nav.browse", "Browse")}</span>
              </button>

              <button
                type="button"
                onClick={openChat}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 ${
                  view === "chat"
                    ? "bg-white dark:bg-[#1C1C1E] text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5 text-indigo-500" />
                <span>{t("nav.chat", "Chat")}</span>
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Main Navigation Area */}
      {view === "chat" && projectId ? (
        <SamSidebarPanel projectId={projectId} onNavigate={onNavigate} />
      ) : (
        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-1 space-y-3 no-scrollbar">
          {navGroups.map((group) => {
            const groupTranslated = t(
              GROUP_LABEL_KEYS[group.label] ?? group.label,
              group.label,
            );
            const isExpanded = expandedGroups[group.label] !== false;

            return (
              <div key={group.label} className="space-y-1">
                {!isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    <span>{groupTranslated}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 transition-transform" />
                    ) : (
                      <ChevronRight className="h-3 w-3 transition-transform" />
                    )}
                  </button>
                ) : (
                  <div className="mx-auto my-1 w-6 border-t border-zinc-200/50 dark:border-white/[0.06]" />
                )}

                {(isCollapsed || isExpanded) && (
                  <div className="space-y-0.5">
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
                          isCollapsed={isCollapsed}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Luxury Monogram Footer */}
      <SidebarFooter onNavigate={onNavigate} isCollapsed={isCollapsed} />
    </aside>
  );
}

function SidebarFooter({
  onNavigate,
  isCollapsed,
}: {
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  const { t, isRtl } = useI18n();
  const { data: session } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const superAdmin = useSuperAdmin();
  const email = superAdmin.user?.email || session?.user?.email;
  const userName =
    superAdmin.user?.name ||
    session?.user?.name ||
    (email ? email.split("@")[0] : isRtl ? "المستخدم" : "User");
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
      window.location.assign("/");
    } catch {
      setIsSwitching(false);
    }
  }

  return (
    <div
      className={`shrink-0 border-t border-zinc-200/60 dark:border-white/[0.08] p-2 space-y-1.5 transition-all duration-200 ${
        isCollapsed ? "px-1.5" : "px-2.5"
      }`}
    >
      <SidebarNavLink
        icon={CircleHelp}
        label={t("nav.help", "Help & Community")}
        onNavigate={onNavigate}
        linkProps={{ to: "/support" }}
        isCollapsed={isCollapsed}
      />

      {email ? (
        <div className="dropdown dropdown-top w-full">
          <button
            type="button"
            tabIndex={0}
            className={`group relative flex w-full items-center rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-[#161618]/70 backdrop-blur-md transition-all duration-200 hover:border-amber-400/50 hover:bg-zinc-50 dark:hover:bg-[#1C1C1F] shadow-sm cursor-pointer active:scale-98 ${
              isCollapsed ? "justify-center p-2" : "gap-2.5 p-2 text-left"
            }`}
            aria-label="Open account menu"
          >
            {/* Apple HIG Monogram Avatar */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 text-amber-500 font-bold text-xs shadow-inner">
              MA
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30D158]" />
              </span>
            </div>

            {!isCollapsed && (
              <>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-semibold text-zinc-900 dark:text-white leading-tight">
                    {userName}
                  </span>
                  <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {email}
                  </span>
                </div>

                <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
                  {isRtl ? "👑 مدير" : "👑 Admin"}
                </span>
              </>
            )}

            {isCollapsed && (
              <div className="pointer-events-none absolute start-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                {userName} ({email})
              </div>
            )}
          </button>

          <ul
            tabIndex={0}
            className="dropdown-content z-50 menu mb-2 w-64 rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#161618]/95 p-2 shadow-2xl backdrop-blur-2xl text-zinc-900 dark:text-white"
          >
            <li className="menu-title flex flex-row items-center gap-1.5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {isRtl ? "حساب المدير العام" : "Super Admin Account"}
            </li>
            <li className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 mb-1">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                  {userName}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {email}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#30D158] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#30D158]" />
                  {isRtl ? "جلسة مشفرة ومحمية بنظام أبل الأمني" : "Secure & Encrypted Session"}
                </span>
              </div>
            </li>
            <li aria-hidden className="pointer-events-none my-1 h-px bg-zinc-200 dark:bg-white/10 p-0" />
            {organizations.length > 1 ? (
              <>
                <li className="menu-title flex flex-row items-center gap-1.5 max-w-full text-zinc-500 dark:text-zinc-400">
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
                  className="pointer-events-none my-1 h-px bg-zinc-200 dark:bg-white/10 p-0"
                />
              </>
            ) : null}
            <li>
              <Link
                to="/settings"
                onClick={closeMenu}
                className="hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-200 rounded-xl"
              >
                <Settings className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                {t("nav.settings", "Settings")}
              </Link>
            </li>
            {isHostedMode ? (
              <li>
                <Link
                  to={BILLING_ROUTE}
                  onClick={closeMenu}
                  className="hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-200 rounded-xl"
                >
                  <CreditCard className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  {t("nav.billing", "Billing")}
                </Link>
              </li>
            ) : null}
            <ThemePreferenceMenuItems />
            <li
              aria-hidden
              className="pointer-events-none my-1 h-px bg-zinc-200 dark:bg-white/10 p-0"
            />
            <li>
              <button
                type="button"
                className="text-[#FF453A] hover:bg-[#FF453A]/10 font-medium rounded-xl"
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
          isCollapsed={isCollapsed}
        />
      )}
    </div>
  );
}
