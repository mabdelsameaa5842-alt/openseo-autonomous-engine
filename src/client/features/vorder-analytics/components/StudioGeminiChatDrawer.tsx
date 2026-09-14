import React, { useState } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  CheckCircle2,
  Eye,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  Search,
  MapPin,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import type { FlowGraph } from "@/server/features/automation/flowEngine";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  generatedWorkflow?: FlowGraph;
  highlights?: string[];
  timestamp: string;
}

interface StudioGeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  domain?: string;
  onPreviewWorkflow: (workflow: FlowGraph) => void;
  onApplyWorkflow: (workflow: FlowGraph) => void;
  isRtl?: boolean;
}

const QUICK_STARTERS = [
  {
    title: "مراقبة تراجع الكلمات في GSC",
    prompt: "أنشئ ورك فلو تراقب الكلمات الصعبة في Google Search Console يومياً، وإذا تراجع ترتيب أي كلمة تقوم بصياغة تحديثات فورية وإشعار الفريق.",
    icon: TrendingUp,
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "اقتناص ثغرات المنافسين",
    prompt: "أنشئ ورك فلو تتجسس على محتوى ومنافسي السيرب في السوق السعودي أسبوعياً وتستخرج الكلمات المفقودة وتكتب مقالات متفوقة عنها تلقائياً.",
    icon: Search,
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "تعزيز السيو المحلي والخرائط",
    prompt: "أنشئ ورك فلو تحلل ظهور الفروع في خرائط جوجل في الرياض وتبني بيانات منظمة LocalBusiness Schema وتحدث صفحات المناطق شهرياً.",
    icon: MapPin,
    badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
];

export const StudioGeminiChatDrawer: React.FC<StudioGeminiChatDrawerProps> = ({
  isOpen,
  onClose,
  projectId,
  domain,
  onPreviewWorkflow,
  onApplyWorkflow,
  isRtl = true,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "assistant",
      text: isRtl
        ? "أهلاً بك! أنا مساعد Gemini AI الخاص باستوديو الأتمتة. صف لي فكرة مسار العمل (Workflow) التي ترغب في بنائها، وسأقوم بهندستها ورسم مخطط الـ DAG الخاص بها كاملاً مع العقد والروابط فورياً!"
        : "Welcome! I'm your Gemini AI Workflow Co-Pilot. Describe any automation flow you'd like to build, and I will synthesize the entire DAG graph with all nodes and connections instantly!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/automation/generate-ai-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          projectId,
          domain,
        }),
      });

      const data = await res.json() as any;

      if (data?.success && data?.graph) {
        const assistantMsg: ChatMessage = {
          id: `msg_a_${Date.now()}`,
          sender: "assistant",
          text: data.explanationAr || (isRtl ? "تم توليد مسار العمل بنجاح!" : "Workflow synthesized successfully!"),
          generatedWorkflow: data.graph,
          highlights: data.highlights || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        toast.success(isRtl ? "تم توليد المسار بنجاح عبر Gemini 2.0 ✨" : "Workflow generated with Gemini ✨");
      } else {
        throw new Error(data?.error || "Failed to generate workflow");
      }
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "فشل توليد المسار" : "Generation failed"));
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: "assistant",
          text: isRtl
            ? "عذراً، حدث خطأ أثناء معالجة الطلب. يرجى تجربة وصف أبسط أو اختيار أحد المقترحات السريعة."
            : "Sorry, an error occurred while processing. Please try a simpler description.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-500/[0.08] via-indigo-500/[0.08] to-emerald-500/[0.08]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {isRtl ? "مساعد Gemini AI للأتمتة" : "Gemini AI Workflow Co-Pilot"}
              </h3>
              <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                gemini-2.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {isRtl ? "تحويل الأفكار إلى مسارات Flowise قابلة للتنفيذ" : "Prompt to Flowise DAG Engine"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
              }`}
            >
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700/50"
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Render Synthesized Workflow Card if present */}
              {msg.generatedWorkflow && (
                <div className="mt-3.5 pt-3 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                  <div className="rounded-xl bg-white dark:bg-zinc-900 p-3 border border-emerald-500/30 shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 truncate">
                        {msg.generatedWorkflow.name}
                      </span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-500">
                        {msg.generatedWorkflow.nodes?.length || 0} {isRtl ? "عقد" : "nodes"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {msg.generatedWorkflow.description}
                    </p>

                    {/* Highlights */}
                    {msg.highlights && msg.highlights.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {msg.highlights.map((hl, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Preview & Apply Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.generatedWorkflow) {
                            onPreviewWorkflow(msg.generatedWorkflow);
                            toast.info(isRtl ? "تمت المعاينة على القماش!" : "Preview loaded on canvas!");
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isRtl ? "معاينة على القماش" : "Preview"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (msg.generatedWorkflow) {
                            onApplyWorkflow(msg.generatedWorkflow);
                            toast.success(isRtl ? "تم اعتماد وحفظ المسار بنجاح! 🚀" : "Workflow applied & saved!");
                            onClose();
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white p-2 text-xs font-bold hover:bg-emerald-500 transition shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isRtl ? "اعتماد وتطبيق" : "Apply Flow"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`mt-1 text-[10px] opacity-60 text-right ${
                  msg.sender === "user" ? "text-indigo-200" : "text-zinc-400"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 p-3.5 text-xs text-zinc-500 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500 animate-bounce" />
              <span>{isRtl ? "يقوم Gemini بهندسة وتوليد مخطط الـ DAG..." : "Gemini is synthesizing DAG workflow..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Starters Carousel */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
          <span>{isRtl ? "اقتراحات سريعة للمسارات:" : "Quick Starters:"}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_STARTERS.map((starter, i) => {
            const Icon = starter.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(starter.prompt)}
                disabled={isGenerating}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 text-indigo-400" />
                <span>{starter.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder={
              isRtl
                ? "صف المسار المطلوب (مثال: فحص الروابط كل 24 ساعة...)"
                : "Describe your workflow..."
            }
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-40 transition shadow-sm cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
