import { useAgent } from "agents/react";
// Think speaks the same chat protocol as @cloudflare/ai-chat, but its hook
// variant skips the client->server transcript sync Think doesn't support.
import { useAgentChat } from "@cloudflare/think/react";
import { useEffect, useRef } from "react";
import { ChatComposer } from "@/client/features/onboarding/OnboardingChatParts";
import { invalidateSamSessions } from "@/client/features/sam/samQueries";
import {
  ChatMessage,
  humanizeToolLabel,
  messageHasVisibleContent,
} from "@/client/components/chat/ChatMessage";
import { useStickToBottom } from "@/client/components/chat/useStickToBottom";
import { useProjectMarket } from "@/client/features/projects/useProjectMarket";

const SUGGESTIONS = [
  {
    category: "Google Search Console (GSC)",
    icon: "📊",
    prompt: "حلل أداء Google Search Console لموقع البورتفوليو واستخرج الكلمات الواعدة بين المراكز 4 و 20",
  },
  {
    category: "Google Analytics 4 (GA4)",
    icon: "📈",
    prompt: "ما هي الصفحات الأكثر جذباً للزيارات في GA4 وما أفضل مصادر الترافيك للبورتفوليو؟",
  },
  {
    category: "تحويلات واتساب (SXO)",
    icon: "🎯",
    prompt: "اقترح خطة SXO لتحسين معدل التحويل وزيادة نقرات التواصل واستشارات الواتساب من الزوار العضويين",
  },
  {
    category: "الميديا باينج وإعلانات الخليج",
    icon: "🔍",
    prompt: "حلل فرص الكلمات المفتاحية لإعلانات تيك توك وسناب شات والميديا باينج في السعودية ومصر",
  },
  {
    category: "سياق المشروع (Project Memory)",
    icon: "🧠",
    prompt: "راجع سياق المشروع المحفوظ (Project Memory) واقترح الأولويات التسويقية والسيو لهذا الأسبوع",
  },
  {
    category: "السيو الفني وتجربة الصفحة",
    icon: "⚡",
    prompt: "افحص صحة السيو الفني لموقع البورتفوليو والـ Core Web Vitals لضمان أفضل تجربة للمستخدم",
  },
];

export function SamConversation({
  projectId,
  sessionId,
}: {
  projectId: string;
  sessionId: string;
}) {
  const projectMarket = useProjectMarket(projectId);
  const activeDomain = (projectMarket as any)?.domain || (projectMarket as any)?.name || "الموقع النشط";
  // The conversation lives in the SamChatAgent Durable Object, keyed by the
  // session id. The WebSocket is authorized in the Worker (src/server.ts) before
  // it reaches the DO; billing gates come back as normal assistant messages.
  const wsHost =
    typeof window !== "undefined" &&
    window.location.hostname.includes("vercel.app")
      ? "open-seo.abdelsameaa.workers.dev"
      : undefined;
  const agent = useAgent({
    agent: "sam-chat",
    name: sessionId,
    host: wsHost,
  });
  // SAM streams dense tool-input deltas; unthrottled per-chunk store fanout
  // re-renders the transcript per delta and trips React #185 (cloudflare/agents#1361).
  const { messages, sendMessage, setMessages, clearHistory, status, error } =
    useAgentChat({ agent, experimental_throttle: 50 });

  const isBusy = status === "submitted" || status === "streaming";
  const { scrollRef, onScroll, pinToBottom } = useStickToBottom(
    messages,
    status,
  );
  const sendText = (text: string) => {
    pinToBottom();
    void sendMessage({ text });
  };

  // Rewind the server-side conversation to before `messageId`: the DO aborts
  // any in-flight turn, then deletes the message and everything after it. Sync
  // the local view from the server afterwards rather than slicing locally —
  // an aborted turn may have persisted (or removed) more than we can see, and
  // on Think setMessages is local-only, so this is a pure view update.
  const rewindTo = async (messageId: string) => {
    const response = await fetch(`/agents/sam-chat/${sessionId}/rewind`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    if (!response.ok) return false;
    const fresh = await fetch(
      `/agents/sam-chat/${sessionId}/get-messages`,
    ).then((res) => (res.ok ? res.json() : null));
    if (Array.isArray(fresh)) setMessages(fresh);
    return true;
  };

  const undoFrom = (messageId: string) => void rewindTo(messageId);
  const editAndResend = async (messageId: string, newText: string) => {
    if (await rewindTo(messageId)) sendText(newText);
  };

  // The DO names the session from its first message during the turn, so refresh
  // the side-panel once the turn settles (busy -> idle) to pick up the title.
  const wasBusyRef = useRef(false);
  useEffect(() => {
    if (isBusy) {
      wasBusyRef.current = true;
      return;
    }
    if (wasBusyRef.current) {
      wasBusyRef.current = false;
      invalidateSamSessions(projectId);
    }
  }, [isBusy, projectId]);

  const lastMessage = messages[messages.length - 1];
  const showTyping =
    isBusy &&
    (lastMessage?.role !== "assistant" ||
      !messageHasVisibleContent(lastMessage));
  const showSuggestions = messages.length === 0 && !isBusy;

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      {import.meta.env.DEV ? (
        // Dev-only escape hatch: wipes this session's persisted transcript on
        // the server (Think's cf_agent_chat_clear), for testing fresh-session
        // behavior without creating a new chat.
        <button
          type="button"
          className="btn btn-ghost btn-xs absolute right-3 top-2 z-10 text-base-content/40"
          onClick={() => clearHistory()}
        >
          Clear history (dev)
        </button>
      ) : null}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-5 py-6"
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length === 0 ? (
            <div className="space-y-4 rounded-2xl border border-base-300 bg-base-100/70 p-5 shadow-sm backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-bold text-base-content">
                    Google Antigravity (AGY) & SAM متصل
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="badge badge-outline badge-xs text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">GSC Live</span>
                  <span className="badge badge-outline badge-xs text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">GA4 Live</span>
                  <span className="badge badge-outline badge-xs text-[10px] text-primary font-semibold">Context Loaded</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-base-content/85 leading-relaxed">
                <p>
                  أهلاً بك! أنا <strong>SAM</strong> ومساعد الذكاء الاصطناعي <strong>Google Antigravity (AGY)</strong> — وكيل السيو والنمو الرقمي لبورتفوليو محمد عبد السميع.
                </p>
                <p className="text-xs text-base-content/70">
                  متصل مباشرة ببيانات <strong>Google Search Console</strong> و <strong>Google Analytics 4</strong> وسياق المشروع المحفوظ (Project Memory). جاهز لتحليل الكلمات المفتاحية، ومراقبة المنافسين، واقتراح تحسينات للتحويل (SXO) عبر واتساب.
                </p>
              </div>

              <div className="rounded-xl bg-base-200/50 p-3 text-xs space-y-1.5 border border-base-300/40">
                <div className="font-semibold text-base-content/90 flex items-center gap-1.5">
                  <span>🧠</span> <span>سياق المشروع المفعل (Project Context & Memory):</span>
                </div>
                <div className="text-base-content/70 grid sm:grid-cols-2 gap-1.5 pt-0.5">
                  <div>• <strong>الموقع:</strong> {activeDomain}</div>
                  <div>• <strong>النشاط:</strong> Senior Performance Media Buyer (21x ROAS)</div>
                  <div>• <strong>السوق المستهدف:</strong> السعودية، مصر، الخليج العربي</div>
                  <div>• <strong>الأولوية:</strong> تصدر نتائج الميديا باينج + رفع استشارات واتساب</div>
                </div>
              </div>

              <p className="text-xs font-semibold text-base-content/75 pt-1">
                ⚡ اختر برومبت مقترح للبدء الفوري، أو اكتب استفسارك بالأسفل:
              </p>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              // SAM exposes the full MCP tool surface (~19 tools), too many to
              // hand-label, so tool names are humanized generically rather
              // than kept in a curated label map.
              message={message}
              resolveToolLabel={humanizeToolLabel}
              streaming={
                isBusy &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
              onUndo={
                // Allowed even mid-turn: rewind aborts the in-flight turn
                // server-side, so undo doubles as "stop and take it back".
                message.role === "user" ? () => undoFrom(message.id) : undefined
              }
              onEdit={
                message.role === "user"
                  ? (newText) => void editAndResend(message.id, newText)
                  : undefined
              }
            />
          ))}

          {showTyping ? (
            <div className="flex items-center gap-2 pt-1 text-base-content/40">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-current" />
              </span>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-xs text-error space-y-1.5">
              <p className="font-semibold text-sm">⚠️ تعذر استلام الرد من نموذج الذكاء الاصطناعي:</p>
              <p className="font-mono text-[11px] opacity-90 break-words leading-relaxed">
                {error?.message || "حدث خطأ غير متوقع أثناء المعالجة، يرجى إعادة المحاولة أو تبديل الموديل."}
              </p>
            </div>
          ) : null}

          {showSuggestions ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.prompt}
                  type="button"
                  className="flex items-start gap-2.5 rounded-xl border border-base-300 bg-base-100 p-3 text-right transition-all hover:border-primary hover:bg-base-200/50 hover:shadow-sm group cursor-pointer"
                  onClick={() => sendText(item.prompt)}
                >
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-base-content/80 group-hover:text-base-content transition-colors line-clamp-2">
                      {item.prompt}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-base-300 px-5 py-3">
        <div className="mx-auto w-full max-w-2xl">
          <ChatComposer
            busy={isBusy}
            onSend={sendText}
            placeholder="اسأل Google Antigravity و SAM عن تحليل الكلمات، أداء GSC و GA4، أو خطط النمو…"
          />
        </div>
      </div>
    </div>
  );
}
