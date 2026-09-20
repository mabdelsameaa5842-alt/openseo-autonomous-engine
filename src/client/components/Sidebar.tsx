import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ComponentType } from "react";
import {
  Activity,
  ArrowLeftRight,
  Bookmark,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  LogOut,
  MessageCircle,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  X,
  Zap,
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

// Distinct Apple HIG Group Icons and Accent Badges
const GROUP_META: Record<
  string,
  {
    icon: ComponentType<{ className?: string }>;
    accentColor: string;
    badgeText?: string;
    badgeColor?: string;
  }
> = {
  Overview: {
    icon: LayoutDashboard,
    accentColor: "text-blue-500 dark:text-blue-400 bg-blue-500/10",
  },
  "Growth & Performance": {
    icon: TrendingUp,
    accentColor: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10",
    badgeText: "Real-time",
    badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/20",
  },
  "My Site": {
    icon: ClipboardCheck,
    accentColor: "text-sky-500 dark:text-sky-400 bg-sky-500/10",
  },
  Research: {
    icon: Search,
    accentColor: "text-indigo-500 dark:text-indigo-400 bg-indigo-500/10",
  },
  Connect: {
    icon: Bot,
    accentColor: "text-violet-500 dark:text-violet-400 bg-violet-500/10",
    badgeText: "AI",
    badgeColor: "text-violet-600 dark:text-violet-400 bg-violet-500/15 border-violet-500/20",
  },
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
      className={`group relative flex items-center rounded-xl transition-all duration-200 spring-interaction ${
        isCollapsed
          ? "justify-center p-2.5 mx-auto text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/[0.08]"
          : "gap-2.5 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-white/[0.06]"
      }`}
      activeProps={{
        className: isCollapsed
          ? "bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] dark:text-[#0A84FF] border border-[var(--apple-accent)]/30 active-capsule-glow"
          : "bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] dark:text-[#0A84FF] font-semibold border border-[var(--apple-accent)]/25 active-capsule-glow shadow-sm",
      }}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {isActive && !isCollapsed && (
            <div className="absolute start-0 top-2 bottom-2 w-1 rounded-full bg-[var(--apple-accent)] shadow-[0_0_8px_var(--apple-accent)]" />
          )}
          {isActive && isCollapsed && (
            <div className="absolute -start-0.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-[var(--apple-accent)] shadow-[0_0_8px_var(--apple-accent)]" />
          )}

          <Icon
            className={`h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-110 ${
              isActive
                ? "text-[var(--apple-accent)] dark:text-[#0A84FF]"
                : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
            }`}
          />

          {!isCollapsed && (
            <span className="truncate tracking-tight">{label}</span>
          )}

          {/* Floating Tooltip in Collapsed Rail Mode */}
          {isCollapsed && (
            <div className="pointer-events-none absolute ltr:left-[calc(100%+14px)] rtl:right-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xl backdrop-blur-2xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
              {label}
            </div>
          )}
        </>
      )}
    </Link>
  );
}

export function Sidebar({ projectId, onNavigate, onClose }: SidebarProps) {
  const { t, isRtl } = useI18n();
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

  // Group expansion state: all groups start expanded by default
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
      className={`flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
        isMobileDrawer
          ? "h-full w-72 bg-white/95 dark:bg-[#121214]/95 border-r border-zinc-200/80 dark:border-white/10 backdrop-blur-2xl"
          : `m-3 h-[calc(100vh-24px)] rounded-3xl glass-island overflow-hidden z-20 ${
              isCollapsed ? "w-[72px]" : "w-68"
            }`
      }`}
    >
      {/* Brand Header & Collapse Action */}
      <div
        className={`flex shrink-0 border-b border-zinc-200/50 dark:border-white/[0.06] transition-all duration-200 ${
          isCollapsed
            ? "flex-col items-center justify-center gap-2.5 px-2 pt-3.5 pb-3"
            : "items-center justify-between px-3.5 pt-3.5 pb-2.5"
        }`}
      >
        <Link
          to="/"
          onClick={onNavigate}
          className="group flex items-center gap-2.5 overflow-hidden transition-all duration-200"
        >
          {/* Apple HIG Squircle App Icon */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--apple-accent)] to-[#2997FF] text-white font-bold text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <span>O</span>
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-[#30D158] border-2 border-white dark:border-[#121214] animate-pulse" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                  OpenSEO
                </span>
                <span className="text-[9px] font-medium tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] border border-[var(--apple-accent)]/20 uppercase">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                Autonomous AI Suite
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

      {/* Project Switcher Bar */}
      {!isCollapsed && (
        <div className="px-3 pt-2.5 pb-1 shrink-0">
          <ProjectSwitcher
            activeProjectId={projectId}
            onCloseDrawer={onClose}
          />
        </div>
      )}

      {/* Apple-Style Segmented Control: Browse vs Chat */}
      {projectId ? (
        <div className={`py-2 shrink-0 ${isCollapsed ? "px-2" : "px-3"}`}>
          {isCollapsed ? (
            <div className="flex flex-col gap-1.5 items-center">
              <button
                type="button"
                onClick={openBrowse}
                className={`group relative p-2 rounded-xl transition-all duration-200 spring-interaction ${
                  view === "browse"
                    ? "bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] border border-[var(--apple-accent)]/30 active-capsule-glow"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
                }`}
                aria-label="Browse navigation"
              >
                <LayoutGrid className="h-4 w-4" />
                <div className="pointer-events-none absolute ltr:left-[calc(100%+14px)] rtl:right-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xl backdrop-blur-2xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                  {t("nav.browse", "Browse")}
                </div>
              </button>

              <button
                type="button"
                onClick={openChat}
                className={`group relative p-2 rounded-xl transition-all duration-200 spring-interaction ${
                  view === "chat"
                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 active-capsule-glow"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
                }`}
                aria-label="AI Chat Studio"
              >
                <MessageCircle className="h-4 w-4" />
                <div className="pointer-events-none absolute ltr:left-[calc(100%+14px)] rtl:right-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white shadow-xl backdrop-blur-2xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                  {t("nav.chat", "Chat Studio")}
                </div>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-200/60 dark:bg-white/[0.06] p-1 border border-zinc-300/40 dark:border-white/[0.06] shadow-inner">
              <button
                type="button"
                onClick={openBrowse}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all duration-200 spring-interaction cursor-pointer ${
                  view === "browse"
                    ? "bg-white dark:bg-[#1C1C1E] text-zinc-950 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{t("nav.browse", "Browse")}</span>
              </button>

              <button
                type="button"
                onClick={openChat}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold transition-all duration-200 spring-interaction cursor-pointer ${
                  view === "chat"
                    ? "bg-white dark:bg-[#1C1C1E] text-zinc-950 dark:text-white shadow-sm"
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

      {/* Main Navigation: Cascading Accordion with 60 FPS Spring Motion */}
      {view === "chat" && projectId ? (
        <SamSidebarPanel projectId={projectId} onNavigate={onNavigate} />
      ) : (
        <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-1.5 space-y-2.5 no-scrollbar">
          {navGroups.map((group) => {
            const groupTranslated = t(
              GROUP_LABEL_KEYS[group.label] ?? group.label,
              group.label,
            );
            const isExpanded = expandedGroups[group.label] !== false;
            const meta = GROUP_META[group.label] ?? {
              icon: LayoutGrid,
              accentColor: "text-zinc-500 bg-zinc-500/10",
            };
            const GroupIcon = meta.icon;

            return (
              <div
                key={group.label}
                className="rounded-2xl border border-transparent transition-colors duration-200 hover:border-zinc-200/40 dark:hover:border-white/[0.04]"
              >
                {!isCollapsed ? (
                  /* Expanded Accordion Header Button */
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="w-full group flex items-center justify-between px-2 py-1.5 rounded-xl text-start hover:bg-zinc-100/60 dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-lg ${meta.accentColor} transition-transform group-hover:scale-105`}
                      >
                        <GroupIcon className="h-3 w-3" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 tracking-tight">
                        {groupTranslated}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {meta.badgeText && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${meta.badgeColor}`}
                        >
                          {meta.badgeText}
                        </span>
                      )}
                      <ChevronRight
                        className={`h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isExpanded ? "rotate-90 text-zinc-800 dark:text-zinc-200" : "rotate-0"
                        }`}
                      />
                    </div>
                  </button>
                ) : (
                  /* Collapsed Rail Divider / Floating Popover Trigger */
                  <div className="relative group/rail flex justify-center py-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${meta.accentColor} transition-all duration-200 hover:scale-110 active:scale-95`}
                      title={groupTranslated}
                    >
                      <GroupIcon className="h-4 w-4" />
                    </button>

                    {/* Floating Flyout Submenu in Collapsed Mode */}
                    <div className="pointer-events-none group-hover/rail:pointer-events-auto absolute ltr:left-[calc(100%+12px)] rtl:right-[calc(100%+12px)] top-0 z-50 min-w-[200px] rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-white/95 dark:bg-[#161618]/95 p-2 shadow-2xl backdrop-blur-3xl opacity-0 scale-95 ltr:translate-x-1 rtl:-translate-x-1 group-hover/rail:opacity-100 group-hover/rail:scale-100 group-hover/rail:translate-x-0 transition-all duration-200">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-zinc-100 dark:border-white/[0.06] mb-1">
                        <GroupIcon className="h-3.5 w-3.5 text-[var(--apple-accent)]" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {groupTranslated}
                        </span>
                      </div>
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
                              isCollapsed={false}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 60 FPS Cascading Grid Dropdown Container */}
                {!isCollapsed && (
                  <div
                    className={`accordion-grid ${
                      isExpanded ? "accordion-grid-expanded" : ""
                    }`}
                  >
                    <div className="accordion-inner ps-2 pt-1 pb-0.5 space-y-0.5 border-s-2 border-zinc-200/50 dark:border-white/[0.08] ms-4 my-0.5">
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
                            isCollapsed={false}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Bottom Live System Telemetry Card */}
      {!isCollapsed && (
        <div className="px-3 py-1.5 shrink-0">
          <div className="rounded-2xl border border-zinc-200/60 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.03] p-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30D158]" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">
                  {isRtl ? "586 مقال حي بالموقع" : "586 Live Articles"}
                </span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                  {isRtl ? "مزامنة السايت ماب نشطة" : "Sitemap Sync Active"}
                </span>
              </div>
            </div>
            <Zap className="h-3.5 w-3.5 text-amber-500/80 animate-pulse" />
          </div>
        </div>
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
      className={`shrink-0 border-t border-zinc-200/60 dark:border-white/[0.08] p-2 transition-all duration-200 ${
        isCollapsed ? "px-1.5" : "px-2.5"
      }`}
    >
      <div className="dropdown dropdown-top w-full">
        <button
          type="button"
          tabIndex={0}
          className={`flex w-full items-center rounded-2xl transition-all duration-200 spring-interaction cursor-pointer ${
            isCollapsed
              ? "justify-center p-2 hover:bg-zinc-100 dark:hover:bg-white/10"
              : "gap-2.5 p-1.5 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06]"
          }`}
          aria-label="User profile and settings"
        >
          {/* Apple Monogram Avatar with Royal Indigo Gradient */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--apple-accent)] to-[#6366F1] text-white font-bold text-xs shadow-md shadow-blue-500/20">
            <span>{userName.charAt(0).toUpperCase()}</span>
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-[#30D158] border-2 border-white dark:border-[#121214]" />
          </div>

          {!isCollapsed && (
            <>
              <div className="flex flex-1 flex-col text-start overflow-hidden leading-tight">
                <span className="truncate text-xs font-bold text-zinc-900 dark:text-white">
                  {userName}
                </span>
                <span className="truncate text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  {email || "admin@openseo.suite"}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            </>
          )}
        </button>

        <ul
          tabIndex={0}
          className="dropdown-content z-50 menu mb-2 w-64 rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#161618]/95 p-2 shadow-2xl backdrop-blur-3xl text-zinc-900 dark:text-white"
        >
          <li className="menu-title flex flex-row items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {isRtl ? "حساب المشرف العام" : "Administrator Account"}
          </li>
          <li className="px-3 py-2 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/60 dark:border-white/10 mb-1">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-xs text-zinc-900 dark:text-white">
                {userName}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {email}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#30D158] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#30D158]" />
                {isRtl ? "جلسة مشفرة ومؤمنة بنظام Apple" : "Secure Apple HIG Session"}
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
    </div>
  );
}
