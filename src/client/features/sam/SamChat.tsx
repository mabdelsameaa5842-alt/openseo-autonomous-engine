import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Suspense, useCallback, useEffect } from "react";
import { Brain, Loader2, Plus, Sparkles, Wrench } from "lucide-react";
import { createSamSession } from "@/serverFunctions/sam";
import {
  invalidateSamSessions,
  samSessionsQueryOptions,
} from "@/client/features/sam/samQueries";
import { useSamAccess } from "./useSamAccess";
import { SamSetupGate } from "./SamSetupGate";
import { SamConversation } from "./SamConversation";
import { ModelQuotaBadge } from "./components/ModelQuotaBadge";

/**
 * The SAM route's content: the active conversation, full-width. The chat
 * history list lives in the app sidebar's Chat tab (SamSidebarPanel); this
 * component only auto-selects the most recent session on landing and shows the
 * start-a-chat empty state when the project has none.
 */
export function SamChat({
  projectId,
  activeSessionId,
}: {
  projectId: string;
  activeSessionId: string | undefined;
}) {
  const navigate = useNavigate();
  const access = useSamAccess(projectId);
  const sessionsQuery = useQuery(samSessionsQueryOptions(projectId));
  const sessions = sessionsQuery.data ?? [];

  const goToSession = useCallback(
    (sessionId: string) =>
      void navigate({
        to: "/p/$projectId/sam",
        params: { projectId },
        search: { s: sessionId },
        replace: true,
      }),
    [navigate, projectId],
  );

  const createSession = useMutation({
    mutationFn: () => createSamSession({ data: { projectId } }),
    onSuccess: ({ id }) => {
      invalidateSamSessions(projectId);
      goToSession(id);
    },
  });

  // Default to the most recent session once they load; if none exist, leave the
  // empty state so the user can start one explicitly.
  const firstSessionId = sessions[0]?.id;
  useEffect(() => {
    if (activeSessionId || !firstSessionId) return;
    goToSession(firstSessionId);
  }, [activeSessionId, firstSessionId, goToSession]);

  // SAM cannot answer a turn without OPENROUTER_API_KEY, so surface setup
  // instructions instead of letting a chat fail mid-stream. Only shown once the
  // check confirms the key is missing (self-hosted) — never as a blocking
  // skeleton while the check is in flight.
  if (access.showSetupGate) {
    return (
      <div className="overflow-auto px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-3xl">
          <SamSetupGate
            errorMessage={access.errorMessage}
            isRefetching={access.isRefetching}
            onRetry={access.onRetry}
          />
        </div>
      </div>
    );
  }

  if (activeSessionId) {
    const activeTitle = sessions.find(
      (session) => session.id === activeSessionId,
    )?.title;
    return (
      <div className="flex h-full min-h-0 flex-col">
        {/* Session title + Google Antigravity Connected Status + Model Quota Switcher + Project Memory */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 md:px-5 py-2.5 md:py-3.5 bg-base-100/50">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span className="truncate text-sm font-medium text-base-content/80 max-w-[150px] sm:max-w-[200px]">
              {activeTitle ?? "Chat"}
            </span>
            <div className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-base-300/80 bg-base-200/50 px-2.5 py-1 text-xs font-medium text-base-content/85 shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
              </span>
              <span>Google Antigravity (AGY)</span>
              <span className="text-base-content/40">•</span>
              <span className="text-xs text-primary font-semibold">متصل</span>
            </div>
            {/* Dynamic Model Switcher & Quota Hub */}
            <ModelQuotaBadge sessionId={activeSessionId} />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-1 text-[11px] text-base-content/60">
              <span className="rounded bg-base-200 px-1.5 py-0.5 text-[10px] font-mono">GSC Live</span>
              <span className="rounded bg-base-200 px-1.5 py-0.5 text-[10px] font-mono">GA4 Live</span>
              <span className="rounded bg-base-200 px-1.5 py-0.5 text-[10px] font-mono">MCP Ready</span>
            </div>
            <Link
              to="/p/$projectId/settings/context"
              params={{ projectId }}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-base-300/80 bg-base-200/40 px-2.5 py-1 text-xs font-medium text-base-content/80 transition-all hover:bg-base-200 hover:text-base-content"
            >
              <Brain className="size-3.5 text-primary" />
              <span>Project Memory (الكونتكست)</span>
            </Link>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          {/* useAgentChat suspends while it fetches the session's history; this
              boundary keeps that suspension inside the chat panel instead of
              letting it bubble up and swap out the whole shell — which read as
              a full page refresh on every session switch. */}
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-base-content/40" />
              </div>
            }
          >
            <SamConversation
              key={activeSessionId}
              projectId={projectId}
              sessionId={activeSessionId}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  if (sessionsQuery.isLoading) {
    // Sessions are still loading; the auto-select effect will redirect into
    // the most recent one. Show a loader instead of flashing the empty state.
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-5 animate-spin text-base-content/40" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-emerald-500/10 to-primary/5 text-primary shadow-sm ring-1 ring-primary/20">
        <Sparkles className="size-7 text-primary" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <div className="inline-flex items-center gap-2 rounded-lg border border-base-300/80 bg-base-200/50 px-3 py-1 text-xs font-medium text-base-content/85 mb-1 shadow-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
          </span>
          <span>Google Antigravity (AGY)</span>
          <span className="text-base-content/40">•</span>
          <span className="text-xs text-primary font-semibold">Active</span>
        </div>
        <p className="text-xl font-bold text-base-content">
          مساعد نمو وسيو بورتفوليو محمد عبد السميع
        </p>
        <p className="text-sm text-base-content/70 leading-relaxed">
          مرتبط بـ Google Search Console و Google Analytics 4 وسياق المشروع المحفوظ لتحليل الكلمات، رفع التحويلات (SXO) عبر واتساب، وتوسيع ظهور البورتفوليو.
        </p>
        <div className="pt-2 flex justify-center">
          <ModelQuotaBadge />
        </div>
      </div>
      <button
        type="button"
        className="btn btn-primary btn-sm gap-1.5 px-4 shadow-sm"
        disabled={createSession.isPending}
        onClick={() => createSession.mutate()}
      >
        {createSession.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        بدء محادثة جديدة (New Chat)
      </button>
    </div>
  );
}
