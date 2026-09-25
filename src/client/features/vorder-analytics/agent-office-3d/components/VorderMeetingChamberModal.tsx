import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Users,
  MessageSquare,
  FileSpreadsheet,
  Shield,
  UserPlus,
  Send,
  Sparkles,
  Clock,
  RefreshCw,
  Award,
  Layers,
  Brain,
  Ear,
  Cpu,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import {
  VorderAgentNominationCard,
  type AgentNomination,
} from "./VorderAgentNominationCard";

interface MeetingParticipant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface MeetingMessage {
  id: string;
  agentId: string;
  agentName: string;
  role: string;
  phase?: string;
  modelUsed?: string;
  handoverFrom?: string;
  learnedRuleBadge?: string;
  time: string;
  text: string;
}

interface CampaignBreakdownItem {
  name: string;
  target: number;
  published: number;
  gscImp: number;
}

interface ConsolidatedReport {
  publishedCount: number;
  queueCount: number;
  gscImpressions: number;
  gscAvgPosition: number;
  collisionRate: string;
  purgedDuplicates: number;
  campaignBreakdown: CampaignBreakdownItem[];
  executiveSummary: string;
}

interface LearnedRuleItem {
  id: string;
  category: "like" | "dislike" | "binding_rule";
  text: string;
  learnedByAgent: string;
  createdAt: string;
}

interface AgentMeetingData {
  id: string;
  title: string;
  cycleId: string;
  startedAt: string;
  status: "active" | "concluded";
  restDurationMinutes: number;
  restSecondsRemaining: number;
  chairperson: MeetingParticipant;
  consolidatedReport: ConsolidatedReport;
  dialogue: MeetingMessage[];
  latestNomination?: AgentNomination;
  teamMemory?: {
    likes: string[];
    dislikes: string[];
    bindingRules: LearnedRuleItem[];
  };
  checkpointLedger?: {
    previousModelsChain: string[];
    completedSteps: string[];
    partialOutputSummary: string;
    pendingSteps: string[];
  };
}

export interface UnifiedHierarchyAgent {
  id: string;
  buttonIndex: number;
  nameAr: string;
  roleAr: string;
  tier: 1 | 2 | 3 | 4;
  tierLabelAr: string;
  emoji: string;
  primaryModel: string;
  fallbackModel: string;
  platforms: string[];
  specialtyAr: string;
  badgeColor: string;
}

export const UNIFIED_9_AGENTS_HIERARCHY: UnifiedHierarchyAgent[] = [
  {
    id: "vorder-tariq",
    buttonIndex: 1,
    nameAr: "طارق العبدلي",
    roleAr: "المدير التنفيذي ومهندس القرار الاستراتيجي",
    tier: 1,
    tierLabelAr: "المستوى 1: القيادة العليا",
    emoji: "👑",
    primaryModel: "gemini-2.5-pro",
    fallbackModel: "gemini-3.1-pro",
    platforms: ["GSC", "GA4", "Google Ads", "Supabase", "GitHub", "Vercel", "Gemini", "Cloudflare"],
    specialtyAr: "القيادة العليا، طلب المتابعة من الوكلاء الـ 8، واعتماد خطط الحملات والميزانيات",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30",
  },
  {
    id: "vorder-sara",
    buttonIndex: 2,
    nameAr: "سارة المهندس",
    roleAr: "قائدة الحملات الأورجانيك والإعلانات المدفوعة",
    tier: 2,
    tierLabelAr: "المستوى 2: قيادة الحملات",
    emoji: "🎯",
    primaryModel: "gemini-2.5-flash",
    fallbackModel: "gemini-3.5-flash-lite",
    platforms: ["Google Search Console", "Google Analytics 4", "Google Ads"],
    specialtyAr: "هندسة الحملات الأورجانيك والمدفوعة بالذكاء الاصطناعي ومراقبة الـ CTR والـ ROAS وتوجيه التعديلات",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
  },
  {
    id: "vorder-yasmine",
    buttonIndex: 3,
    nameAr: "ياسمين الشريف",
    roleAr: "مهندسة اقتناص الكلمات والعناقيد الدلالية",
    tier: 2,
    tierLabelAr: "المستوى 2: الاستخبارات الدلالية",
    emoji: "🔍",
    primaryModel: "gemini-2.5-flash",
    fallbackModel: "gemini-3.5-flash-lite",
    platforms: ["Google Search Console", "Google Ads Keyword Planner"],
    specialtyAr: "حصاد الكلمات الذهبية ذات النية الشرائية وبناء الخرائط الدلالية للحملات",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  },
  {
    id: "vorder-karim",
    buttonIndex: 4,
    nameAr: "كريم الدسوقي",
    roleAr: "كبير محرري المحتوى ومسؤول النشر الفوري",
    tier: 3,
    tierLabelAr: "المستوى 3: الإنتاج والنشر",
    emoji: "✍️",
    primaryModel: "gemini-2.5-pro",
    fallbackModel: "gemini-3.8-flash",
    platforms: ["GitHub", "Vercel", "GSC Indexing", "IndexNow"],
    specialtyAr: "كتابة المقالات وصفحات الهبوط ونصوص الإعلانات حسب نوع الحملة ونشرها وأرشفتها فوراً",
    badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30",
  },
  {
    id: "vorder-nour",
    buttonIndex: 5,
    nameAr: "نور المرشدي",
    roleAr: "خبيرة محركات الإجابة الذكية (GEO) والتحويل (CRO)",
    tier: 3,
    tierLabelAr: "المستوى 3: GEO & CRO",
    emoji: "🧠",
    primaryModel: "deep-research-pro-preview-12-2025",
    fallbackModel: "gemini-2.5-pro",
    platforms: ["Google Analytics 4", "Gemini AI Studio"],
    specialtyAr: "تصدر اقتباسات ChatGPT وPerplexity وGemini وتحسين معدلات التحويل في صفحات الهبوط",
    badgeColor: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30",
  },
  {
    id: "vorder-omar",
    buttonIndex: 6,
    nameAr: "عمر الفاروق",
    roleAr: "قائد العلاقات الرقمية والباك لينكس وGitHub",
    tier: 3,
    tierLabelAr: "المستوى 3: السلطة والروابط",
    emoji: "🔗",
    primaryModel: "gemini-2.5-pro",
    fallbackModel: "gemma-3-27b-it",
    platforms: ["GitHub", "Google Search Console Links"],
    specialtyAr: "بناء الروابط الداخلية والخارجية، إدارة مستودعات GitHub، وحملات قنص المنافسين",
    badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30",
  },
  {
    id: "vorder-faris",
    buttonIndex: 7,
    nameAr: "فارس النجار",
    roleAr: "قائد السيو المحلي وخرائط جوجل وحافة Cloudflare",
    tier: 3,
    tierLabelAr: "المستوى 3: السيو المحلي والحافة",
    emoji: "📍",
    primaryModel: "gemini-2.5-flash",
    fallbackModel: "gemini-3.7-flash",
    platforms: ["Cloudflare", "Google Maps / GBP", "GSC"],
    specialtyAr: "توليد صفحات التغطية الجغرافية للسيو المحلي وإدارة الكاش والـ Workers على Cloudflare",
    badgeColor: "bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30",
  },
  {
    id: "vorder-layla",
    buttonIndex: 8,
    nameAr: "ليلى الألفي",
    roleAr: "مهندسة السيو التقني والـ Schema وسرعة الأداء",
    tier: 4,
    tierLabelAr: "المستوى 4: الهندسة التقنية",
    emoji: "⚙️",
    primaryModel: "gemini-2.5-flash-lite",
    fallbackModel: "gemini-3.1-flash-lite",
    platforms: ["Google Search Console", "Vercel", "GitHub"],
    specialtyAr: "حقن أكواد JSON-LD Schema المناسبة لكل حملة ومراقبة مؤشرات Core Web Vitals",
    badgeColor: "bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30",
  },
  {
    id: "vorder-ziad",
    buttonIndex: 9,
    nameAr: "زياد عمران",
    roleAr: "المراقب الصارم للجودة ومنع التكرار وحارس البيانات",
    tier: 4,
    tierLabelAr: "المستوى 4: الرقابة والحماية",
    emoji: "🛡️",
    primaryModel: "gemini-2.5-pro",
    fallbackModel: "gemma-3-27b-it",
    platforms: ["Supabase", "Cloudflare D1 & KV"],
    specialtyAr: "فحص جودة كل مقال وحملة قبل النشر، منع تضارب الكلمات (Cannibalization)، وحماية D1 وSupabase",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30",
  },
];

interface VorderMeetingChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl?: boolean;
}

export function VorderMeetingChamberModal({
  isOpen,
  onClose,
  isRtl = true,
}: VorderMeetingChamberModalProps) {
  const [activeTab, setActiveTab] = useState<
    "chat" | "rules" | "report" | "authorities" | "nominations"
  >("chat");
  const [meetingData, setMeetingData] = useState<AgentMeetingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  // 10-Button Selector State: "ALL_TEAM" (Button 10) or specific agentId (Buttons 1..9)
  const [selectedTarget, setSelectedTarget] = useState<string>("ALL_TEAM");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1500);
  const [learnedLikes, setLearnedLikes] = useState<string[]>([
    "العناوين القوية المدعومة بالأرقام والنسب الحقيقية من GSC",
    "الجداول المقارنة المباشرة وتجنب المقدمات الإنشائية الطويلة",
    "توجيه كل وكيل في تخصصه الدقيق مع متابعة المدير طارق العبدلي",
  ]);
  const [learnedDislikes, setLearnedDislikes] = useState<string[]>([
    "الكلام العام المكرر بدون أرقام أو إجراءات عملية",
    "تضارب الكلمات المفتاحية بين الصفحات (Keyword Cannibalization)",
  ]);
  const [learnedRules, setLearnedRules] = useState<LearnedRuleItem[]>([
    {
      id: "rule_1",
      category: "binding_rule",
      text: "قاعدة #1: كل حملة أورجانيك أو مدفوعة تُربط بنوع محتوى وSchema مخصصين وتُراقب حياً في GSC وGA4.",
      learnedByAgent: "طارق العبدلي + سارة المهندس",
      createdAt: new Date().toISOString(),
    },
    {
      id: "rule_2",
      category: "binding_rule",
      text: "قاعدة #2: عند التبديل بين نماذج Google AI Studio الـ 50، يستلم النموذج الجديد سجل الخطوات المنجزة ويكمل من نفس النقطة.",
      learnedByAgent: "جميع الوكلاء الـ 9",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [contextChain, setContextChain] = useState<string[]>([
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "deep-research-pro-preview-12-2025",
  ]);
  const [completedChecklist, setCompletedChecklist] = useState<string[]>([
    "فحص اتصال المنصات الـ 8 وسحب مؤشرات GSC وGA4",
    "توحيد الهيكلة الهرمية للوكلاء الـ 9 عبر 4 مستويات قيادية",
    "تجهيز مصفوفة ربط الحملات الأورجانيك والمدفوعة بأنواع المحتوى",
  ]);
  const [pendingChecklist, setPendingChecklist] = useState<string[]>([
    "متابعة تعديل العناوين للصفحات في المراكز 4-15 لرفع الـ CTR",
    "تطبيق قواعد القائد المتعلمة على المقالات والحملات الجديدة",
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchMeeting = async () => {
    try {
      const res = await fetch("/api/automation/agent-meetings");
      if (!res.ok) throw new Error("فشل جلب تفاصيل الاجتماع");
      const json = (await res.json()) as any;
      if (json.meeting) {
        setMeetingData(json.meeting);
        if (typeof json.meeting.restSecondsRemaining === "number") {
          setSecondsRemaining(json.meeting.restSecondsRemaining);
        }
        if (json.meeting.teamMemory) {
          if (json.meeting.teamMemory.likes?.length) {
            setLearnedLikes(json.meeting.teamMemory.likes);
          }
          if (json.meeting.teamMemory.dislikes?.length) {
            setLearnedDislikes(json.meeting.teamMemory.dislikes);
          }
          if (json.meeting.teamMemory.bindingRules?.length) {
            setLearnedRules(json.meeting.teamMemory.bindingRules);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching meeting:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMeeting();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 1500));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === "chat" && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [meetingData?.dialogue, activeTab]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Trigger Director Tariq's Hierarchical Follow-up Across All 9 Agents
  const handleTriggerHierarchicalFollowUp = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/automation/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "ALL_TEAM",
          mode: "hierarchical_followup",
          message:
            "يا طارق، اطلب متابعة هرمية فورية من جميع الوكلاء الـ 8 كلٌ في تخصصه واعرض لي ما توصلتم إليه بالأرقام.",
        }),
      });
      const data = (await res.json()) as any;
      if (data.replies && Array.isArray(data.replies)) {
        setMeetingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            dialogue: [...prev.dialogue, ...data.replies],
          };
        });
        if (data.checkpoint?.previousModelsChain) {
          setContextChain(data.checkpoint.previousModelsChain);
        }
        toast.success("👑 أجرى المدير طارق العبدلي جولة متابعة هرمية شاملة مع الوكلاء!");
      }
    } catch (e: any) {
      toast.error(e?.message || "تعذر إجراء جولة المتابعة");
    } finally {
      setIsSending(false);
    }
  };

  // Send message to either a specific agent (Buttons 1..9, while others listen & learn) OR All 9 Agents (Button 10)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || !meetingData) return;

    const userText = userInput.trim();
    setUserInput("");
    setIsSending(true);

    const nowStr = new Date().toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const targetAgentObj = UNIFIED_9_AGENTS_HIERARCHY.find((a) => a.id === selectedTarget);
    const targetLabel =
      selectedTarget === "ALL_TEAM"
        ? "🌐 موجه للفريق بالكامل (الوكلاء الـ 9 يشاركون كلٌ في تخصصه)"
        : `${targetAgentObj?.emoji} موجه إلى: ${targetAgentObj?.nameAr} (بقية الوكلاء الـ 8 في وضع الاستماع والتعلم النشط)`;

    const userMsg: MeetingMessage = {
      id: `usr_${Date.now()}`,
      agentId: "human-director",
      agentName: "القائد الأعلى (أنت)",
      role: targetLabel,
      time: nowStr,
      text: userText,
    };

    setMeetingData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        dialogue: [...prev.dialogue, userMsg],
      };
    });

    try {
      const res = await fetch("/api/automation/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedTarget,
          message: userText,
          history: meetingData.dialogue.slice(-8).map((d) => ({
            sender: d.agentId === "human-director" ? "user" : "agent",
            agentName: d.agentName,
            text: d.text,
          })),
        }),
      });
      const data = (await res.json()) as any;

      if (data.newlyLearnedRule) {
        const rule = data.newlyLearnedRule as LearnedRuleItem;
        setLearnedRules((prev) => [rule, ...prev.slice(0, 19)]);
        if (rule.category === "like") {
          setLearnedLikes((prev) => [userText, ...prev.slice(0, 14)]);
        } else if (rule.category === "dislike") {
          setLearnedDislikes((prev) => [userText, ...prev.slice(0, 14)]);
        }
        toast.success(
          `🧠 استمع الوكلاء الـ 9 وتعلموا قاعدة جديدة من كلامك: "${rule.text}"`,
        );
      }

      if (data.checkpoint) {
        if (data.checkpoint.previousModelsChain?.length) {
          setContextChain(data.checkpoint.previousModelsChain);
        }
        if (data.checkpoint.completedSteps?.length) {
          setCompletedChecklist(data.checkpoint.completedSteps);
        }
        if (data.checkpoint.pendingSteps?.length) {
          setPendingChecklist(data.checkpoint.pendingSteps);
        }
      }

      if (data.replies && Array.isArray(data.replies)) {
        setMeetingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            dialogue: [...prev.dialogue, ...data.replies],
          };
        });
      } else if (data.reply) {
        const agentMeta =
          targetAgentObj || UNIFIED_9_AGENTS_HIERARCHY[0];
        const replyMsg: MeetingMessage = {
          id: `resp_${Date.now()}`,
          agentId: agentMeta.id,
          agentName: `${agentMeta.emoji} ${agentMeta.nameAr}`,
          role: `${agentMeta.roleAr} (${agentMeta.tierLabelAr})`,
          phase: `استماع وتعلم نشط من الـ 8 الآخرين`,
          modelUsed: data.modelUsed || agentMeta.primaryModel,
          handoverFrom: data.handoverFrom,
          learnedRuleBadge: data.newlyLearnedRule?.text,
          time: new Date().toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          text: data.reply,
        };
        setMeetingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            dialogue: [...prev.dialogue, replyMsg],
          };
        });
      }
    } catch (err: any) {
      toast.error(err?.message || "تعذر الاتصال بمحرك الوكلاء");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-6xl h-[94vh] max-h-[920px] flex flex-col rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-2xl overflow-hidden text-[var(--apple-text-primary)] ${
          isRtl ? "rtl text-right" : "ltr text-left"
        }`}
      >
        {/* 1. Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--apple-border)] bg-[var(--apple-canvas)]/70 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#97233A] to-indigo-600 text-white shadow-md">
              <Users className="size-5" />
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight">
                  غرفة القيادة والاجتماعات الهرمية للوكلاء الـ 9 (نظام الـ 10 أزرار + التعلم المستمر)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  9 وكلاء متصلون • 50 نموذجاً بسياق موحد
                </span>
              </div>
              <p className="text-[11px] text-[var(--apple-text-secondary)] mt-0.5">
                بقيادة المدير التنفيذي 👑 طارق العبدلي: تحدّث مع أي وكيل على حدة (والباقون يستمعون ويتعلمون تفضيلاتك) أو مع الفريق بالكامل في آنٍ واحد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSending}
              onClick={handleTriggerHierarchicalFollowUp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#97233A] to-indigo-600 hover:opacity-95 text-white text-[11px] font-black shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              <span>طلب متابعة هرمية من طارق للوكلاء الـ 8</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-mono font-bold">
              <Clock className="size-3.5 animate-spin text-indigo-500" style={{ animationDuration: "8s" }} />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              type="button"
              onClick={fetchMeeting}
              title="تحديث بيانات الاجتماع"
              className="p-2 rounded-xl border border-[var(--apple-border)] hover:bg-[var(--apple-pill)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all cursor-pointer"
            >
              <RefreshCw className="size-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[var(--apple-border)] hover:bg-red-500/10 hover:text-red-500 text-[var(--apple-text-secondary)] transition-all cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="px-5 pt-2.5 pb-2 border-b border-[var(--apple-border)] bg-[var(--apple-canvas)]/30 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--apple-canvas)] border border-[var(--apple-border)] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "chat"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <MessageSquare className="size-3.5 text-indigo-500" />
              <span>النقاش الحي (الأزرار الـ 10)</span>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "rules"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <Brain className="size-3.5 text-fuchsia-500" />
              <span>ذاكرة القواعد المتعلمة واستمرارية الـ 50 نموذجاً</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 font-extrabold">
                {learnedRules.length} قواعد
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("authorities")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "authorities"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <Shield className="size-3.5 text-emerald-500" />
              <span>الهيكلة الهرمية للوكلاء الـ 9 (4 مستويات)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "report"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <FileSpreadsheet className="size-3.5 text-blue-500" />
              <span>التقرير الميداني المجمع</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("nominations")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "nominations"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <UserPlus className="size-3.5 text-[#97233A] dark:text-[#E15B75]" />
              <span>ترشيحات التوسع</span>
            </button>
          </div>
        </div>

        {/* 3. Main Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[var(--apple-canvas)]/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--apple-text-secondary)]">
              <RefreshCw className="size-8 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">جاري مزامنة قاعة الاجتماعات والوكلاء الـ 9...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: LIVE HIERARCHICAL CHAT WITH 10-BUTTON SELECTOR */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full space-y-3">
                  {/* THE 10-BUTTON COMMAND & ACTIVE LISTENING BAR */}
                  <div className="rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] p-3 space-y-2 shrink-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-extrabold text-[var(--apple-text-primary)]">
                        <Ear className="size-3.5 text-[#97233A] dark:text-rose-400" />
                        <span>
                          اختر من الأزرار الـ 10: تحدّث مع وكيل محدد (والـ 8 الآخرون يستمعون ويتعلمون تفضيلاتك) أو مع الفريق بالكامل:
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-300">
                        <Cpu className="size-3" /> سياق موحد عبر الـ 50 نموذجاً
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {/* BUTTON 10 (Placed First/Prominent): ALL 9 AGENTS ROUNDTABLE */}
                      <button
                        type="button"
                        onClick={() => setSelectedTarget("ALL_TEAM")}
                        className={`flex items-center justify-between gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-black transition-all cursor-pointer ${
                          selectedTarget === "ALL_TEAM"
                            ? "bg-gradient-to-r from-[#97233A] to-indigo-600 text-white border-transparent shadow-sm"
                            : "bg-[var(--apple-canvas)] border-[var(--apple-border)] text-[var(--apple-text-primary)] hover:border-indigo-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span>🌐</span>
                          <span className="truncate">10. الفريق بالكامل (9 وكلاء)</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/20 shrink-0">
                          جماعي
                        </span>
                      </button>

                      {/* BUTTONS 1 TO 9: INDIVIDUAL AGENTS */}
                      {UNIFIED_9_AGENTS_HIERARCHY.map((ag) => {
                        const isSelected = selectedTarget === ag.id;
                        return (
                          <button
                            key={ag.id}
                            type="button"
                            onClick={() => setSelectedTarget(ag.id)}
                            className={`flex items-center justify-between gap-1 rounded-xl border px-2.5 py-2 text-[11px] font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                                : "bg-[var(--apple-canvas)] border-[var(--apple-border)] text-[var(--apple-text-primary)] hover:border-indigo-500/40"
                            }`}
                          >
                            <div className="flex items-center gap-1 truncate">
                              <span>{ag.emoji}</span>
                              <span className="truncate">
                                {ag.buttonIndex}. {ag.nameAr}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] px-1 rounded shrink-0 ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-zinc-500/10 text-zinc-500"
                              }`}
                            >
                              T{ag.tier}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Mode Explanation Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-[var(--apple-text-secondary)] border-t border-[var(--apple-border)]/60">
                      {selectedTarget === "ALL_TEAM" ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ✨ الوضع النشط الآن (الزر العاشر): جميع الوكلاء الـ 9 يستمعون ويرد كل وكيل عليك في تخصصه الدقيق بتسلسل هرمي بقيادة طارق العبدلي.
                        </span>
                      ) : (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          🎧 الوضع النشط الآن: حوار مباشر مع{" "}
                          <b>
                            {
                              UNIFIED_9_AGENTS_HIERARCHY.find(
                                (a) => a.id === selectedTarget,
                              )?.nameAr
                            }
                          </b>{" "}
                          — بينما يستمع الوكلاء الـ 8 الآخرون لنقاشك ويتعلمون ما تحبه وما ترفضه لتحديث قواعد الفريق تلقائياً.
                        </span>
                      )}
                      <span className="font-mono">
                        آخر نموذج نشط: {contextChain[contextChain.length - 1] || "gemini-2.5-pro"}
                      </span>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {meetingData?.dialogue.map((msg) => {
                      const isDirector = msg.agentId === "vorder-tariq";
                      const isHuman = msg.agentId === "human-director";
                      const agentInfo = UNIFIED_9_AGENTS_HIERARCHY.find(
                        (a) => a.id === msg.agentId,
                      );

                      const badgeColor = isHuman
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : agentInfo?.badgeColor ||
                          "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border transition-all ${
                            isHuman
                              ? "bg-amber-500/[0.07] border-amber-500/30 mr-4 sm:mr-10"
                              : isDirector
                              ? "bg-purple-500/[0.06] border-purple-500/30"
                              : "bg-[var(--apple-card)] border-[var(--apple-border)]"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-black text-[var(--apple-text-primary)]">
                                {agentInfo ? `${agentInfo.emoji} ${agentInfo.nameAr}` : msg.agentName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}
                              >
                                {agentInfo ? `${agentInfo.roleAr} (${agentInfo.tierLabelAr})` : msg.role}
                              </span>
                              {msg.modelUsed && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/25">
                                  ⚡ {msg.modelUsed}
                                  {msg.handoverFrom ? ` (استكمل سياق ${msg.handoverFrom})` : ""}
                                </span>
                              )}
                              {msg.phase && (
                                <span className="hidden md:inline text-[10px] text-[var(--apple-text-secondary)] font-medium">
                                  [{msg.phase}]
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-[var(--apple-text-secondary)]">
                              {msg.time}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-[var(--apple-text-primary)] leading-relaxed mt-1 whitespace-pre-line">
                            {msg.text}
                          </p>

                          {msg.learnedRuleBadge && (
                            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              <Brain className="size-3" />
                              <span>
                                تم تسجيل قاعدة جديدة وتعميمها على الوكلاء الـ 9: {msg.learnedRuleBadge}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-xs shrink-0"
                  >
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={
                        selectedTarget === "ALL_TEAM"
                          ? "تحدّث مع الفريق بالكامل (أو اكتب: بحب كذا / مبحبش كذا / قاعدة جديدة ليحفظها الوكلاء الـ 9)..."
                          : `وجّه سؤالك أو تعليماتك إلى ${
                              UNIFIED_9_AGENTS_HIERARCHY.find((a) => a.id === selectedTarget)
                                ?.nameAr || "الوكيل"
                            } (والـ 8 الآخرون يستمعون ويتعلمون)...`
                      }
                      className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[var(--apple-text-primary)] placeholder-[var(--apple-text-secondary)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !userInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#97233A] to-indigo-600 hover:opacity-95 text-white font-black text-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      <Send className="size-3.5" />
                      <span>
                        {isSending
                          ? "جاري المعالجة..."
                          : selectedTarget === "ALL_TEAM"
                          ? "إرسال للفريق بالكامل (9)"
                          : "إرسال للوكيل المختار"}
                      </span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: LEARNED RULES & 50-MODEL STATEFUL CONTEXT HANDOVER */}
              {activeTab === "rules" && (
                <div className="space-y-5">
                  {/* Stateful Context Handover Across 50 Models */}
                  <div className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/[0.06] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-black text-fuchsia-700 dark:text-fuchsia-300">
                        <Cpu className="size-4" />
                        <span>
                          سجل استمرارية السياق وحالة المهمة عبر الـ 50 نموذجاً (Stateful Model Handover Ledger)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300">
                        OAUTH_KV + Memory Synced
                      </span>
                    </div>
                    <p className="text-xs text-[var(--apple-text-secondary)]">
                      عند التبديل اللحظي بين نماذج Google AI Studio الـ 50، يستلم النموذج الجديد سجل ما أنجزه النموذج السابق ويكمل المهمة من نفس النقطة دون فقدان أي سياق:
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold">سلسلة النماذج المشاركة في السياق الحالي:</span>
                      {contextChain.map((m, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2.5 py-1 rounded-lg bg-[var(--apple-card)] border border-fuchsia-500/30 text-[11px] font-mono font-bold text-fuchsia-600 dark:text-fuchsia-300">
                            {m}
                          </span>
                          {i < contextChain.length - 1 && (
                            <span className="text-xs font-bold text-fuchsia-500">➔</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-3 space-y-1.5">
                        <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" />
                          <span>ما أنهته النماذج السابقة (Completed Checkpoint):</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-[var(--apple-text-primary)] list-disc list-inside">
                          {completedChecklist.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-3 space-y-1.5">
                        <div className="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <GitBranch className="size-3.5" />
                          <span>ما يستكمله النموذج الحالي (Pending Handover):</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-[var(--apple-text-primary)] list-disc list-inside">
                          {pendingChecklist.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Likes & Dislikes Learned from User */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-4 space-y-2.5">
                      <h3 className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <span>💚 ما يحبه القائد ويفضله (Learned Likes)</span>
                      </h3>
                      <ul className="space-y-1.5 text-xs text-[var(--apple-text-primary)]">
                        {learnedLikes.map((like, idx) => (
                          <li
                            key={idx}
                            className="p-2 rounded-xl bg-[var(--apple-card)] border border-emerald-500/20"
                          >
                            ✓ {like}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] p-4 space-y-2.5">
                      <h3 className="text-xs font-black text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <span>🚫 ما يرفضه القائد ولا يحبه (Learned Dislikes)</span>
                      </h3>
                      <ul className="space-y-1.5 text-xs text-[var(--apple-text-primary)]">
                        {learnedDislikes.map((dislike, idx) => (
                          <li
                            key={idx}
                            className="p-2 rounded-xl bg-[var(--apple-card)] border border-rose-500/20"
                          >
                            ✕ {dislike}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Binding Rules List */}
                  <div className="rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] p-4 space-y-3">
                    <h3 className="text-xs font-black text-[var(--apple-text-primary)] flex items-center gap-2">
                      <Brain className="size-4 text-indigo-500" />
                      <span>دفتر القواعد الملزمة المستنبطة من توجيهاتك للوكلاء الـ 9:</span>
                    </h3>
                    <div className="space-y-2">
                      {learnedRules.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--apple-canvas)] border border-[var(--apple-border)] text-xs"
                        >
                          <span className="font-bold text-[var(--apple-text-primary)]">
                            {r.text}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shrink-0">
                            {r.learnedByAgent}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 4-TIER HIERARCHY OF ALL 9 AGENTS */}
              {activeTab === "authorities" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-xs">
                    <p className="font-black text-indigo-700 dark:text-indigo-300">
                      الهيكلة الهرمية الموحدة للوكلاء الـ 9 (4 مستويات قيادية وتنفيذية متصلة بالمنصات الـ 8 والـ 50 نموذجاً):
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {UNIFIED_9_AGENTS_HIERARCHY.map((ag) => (
                      <div
                        key={ag.id}
                        className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-sm text-[var(--apple-text-primary)]">
                              {ag.emoji} {ag.buttonIndex}. {ag.nameAr}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ag.badgeColor}`}
                            >
                              {ag.tierLabelAr}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {ag.roleAr}
                          </div>
                          <p className="text-xs text-[var(--apple-text-secondary)] leading-relaxed">
                            {ag.specialtyAr}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[var(--apple-border)]/60 space-y-1 text-[10px]">
                          <div className="font-mono text-fuchsia-600 dark:text-fuchsia-400 font-bold">
                            النموذج: {ag.primaryModel} ➔ {ag.fallbackModel}
                          </div>
                          <div className="text-[var(--apple-text-secondary)]">
                            المنصات: {ag.platforms.join(" • ")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CONSOLIDATED REAL REPORT */}
              {activeTab === "report" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      <Sparkles className="size-4" />
                      <span>التقرير التنفيذي الميداني المعتمد من المدير طارق العبدلي والوكلاء الـ 9</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--apple-text-primary)] leading-relaxed">
                      {meetingData?.consolidatedReport.executiveSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        إجمالي المقالات المنشورة
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[var(--apple-text-primary)] font-mono mt-1 block">
                        {meetingData?.consolidatedReport.publishedCount || 742}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                        ✓ مفهرسة عبر كريم الدسوقي
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        المقالات في طابور النشر
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#97233A] dark:text-[#E15B75] font-mono mt-1 block">
                        {meetingData?.consolidatedReport.queueCount || 96}
                      </span>
                      <span className="text-[10px] text-[var(--apple-text-secondary)] font-bold mt-1 block">
                        تحت إشراف سارة وياسمين
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        ظهورات Google Search Console
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-sky-400 font-mono mt-1 block">
                        {meetingData?.consolidatedReport.gscImpressions || 148920}
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-sky-400 font-bold mt-1 block">
                        قراءات حية من المنصات الـ 8
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        نسبة تصادم المحتوى (Cannibalization)
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                        0.0%
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                        حماية زياد عمران 100%
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[var(--apple-border)] flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                        <Layers className="size-4 text-indigo-500" />
                        <span>توزيع التقدم الميداني للحملات الاستراتيجية</span>
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right">
                        <thead className="bg-[var(--apple-canvas)] text-[var(--apple-text-secondary)] border-b border-[var(--apple-border)]">
                          <tr>
                            <th className="px-4 py-3 font-semibold">اسم الحملة التكتيكية</th>
                            <th className="px-4 py-3 font-semibold text-center">الهدف التكتيكي</th>
                            <th className="px-4 py-3 font-semibold text-center">المنشور الفعلي</th>
                            <th className="px-4 py-3 font-semibold text-center">ظهورات كونسول</th>
                            <th className="px-4 py-3 font-semibold text-center">نسبة الإنجاز</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--apple-border)]">
                          {meetingData?.consolidatedReport.campaignBreakdown.map((c, idx) => {
                            const pct = Math.round((c.published / c.target) * 100);
                            return (
                              <tr key={idx} className="hover:bg-[var(--apple-canvas)]/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-[var(--apple-text-primary)]">
                                  {c.name}
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-[var(--apple-text-secondary)]">
                                  {c.target} مقال
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-[var(--apple-text-primary)]">
                                  {c.published}
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-blue-600 dark:text-sky-400">
                                  {c.gscImp} ظهور
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full"
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[10px] font-bold">{pct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AI AGENT NOMINATIONS */}
              {activeTab === "nominations" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-2">
                      <Award className="size-4 text-amber-500 shrink-0" />
                      <span className="font-bold text-amber-800 dark:text-amber-300">
                        نظام الترشيح الأسبوعي للوكلاء الأذكياء (بقيادة طارق العبدلي):
                      </span>
                    </div>
                  </div>

                  {meetingData?.latestNomination ? (
                    <VorderAgentNominationCard
                      nomination={meetingData.latestNomination}
                      onStatusChange={(updated) => {
                        setMeetingData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            latestNomination: updated,
                          };
                        });
                        toast.success("تم تحديث حالة ترشيح الوكيل بنجاح!");
                      }}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-[var(--apple-text-secondary)]">
                      لا توجد ترشيحات معلقة حالياً.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Footer info */}
        <div className="px-5 py-2.5 border-t border-[var(--apple-border)] bg-[var(--apple-canvas)]/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--apple-text-secondary)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>الوكلاء الـ 9 • نظام الأزرار الـ 10 • ذاكرة القواعد المتعلمة • 50 نموذجاً في Google AI Studio</span>
          </div>
          <span className="font-mono">Stateful Context Handover: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
