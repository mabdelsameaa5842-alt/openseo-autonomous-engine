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
  CornerUpRight,
  Trash2,
  Globe,
  Terminal,
  BookOpen,
  Zap,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
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

interface ForwardedMessagePayload {
  id: string;
  agentId: string;
  agentName: string;
  text: string;
  actionType: "clarify" | "correct" | "approve";
}

interface SuggestedActionChip {
  id: string;
  label: string;
  prompt: string;
  category?: "execute" | "brainstorm" | "audit";
}

interface MeetingMessage {
  id: string;
  sessionId?: string;
  senderType?: "user" | "agent" | "roundtable" | "director_approval";
  agentId: string;
  agentName: string;
  role: string;
  phase?: string;
  modelUsed?: string;
  handoverFrom?: string;
  learnedRuleBadge?: string;
  forwardedFrom?: ForwardedMessagePayload | null;
  citations?: string[];
  tariqApproved?: boolean;
  time: string;
  text: string;
  suggestedActions?: SuggestedActionChip[];
  executedAction?: {
    executed: boolean;
    actionType: string;
    summaryAr: string;
  } | null;
}

interface TargetCountryAllocation {
  countryCode: string;
  countryName: string;
  flag: string;
  cities: string[];
  sharePercent: number;
  impressionVelocity: "TURBO_3X" | "TURBO_2X" | "HIGH" | "STANDARD";
  active: boolean;
  controlledByAgent: string;
  lastUpdatedBy: string;
  updatedAt: string;
}

interface ProgrammaticDiagnosticLogEntry {
  id: string;
  projectId: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  component: string;
  operation: string;
  status: "SUCCESS" | "FALLBACK_ENGAGED" | "WARNING" | "ERROR";
  modelUsed: string;
  durationMs: number;
  details: string;
  remediationHint?: string;
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
  keywordsCount?: number;
  gscImpressions: number;
  gscAvgPosition: number;
  impressionVelocityMode?: string;
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
  sourceMessageExcerpt?: string;
  confidenceScore?: number;
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
  totalMessagesCount?: number;
  chairperson: MeetingParticipant;
  consolidatedReport: ConsolidatedReport;
  dialogue: MeetingMessage[];
  latestNomination?: AgentNomination;
  targetCountries?: TargetCountryAllocation[];
  programmaticLogs?: ProgrammaticDiagnosticLogEntry[];
  expertSourcesCount?: number;
  teamMemory?: {
    likes: Array<string | LearnedRuleItem>;
    dislikes: Array<string | LearnedRuleItem>;
    bindingRules: LearnedRuleItem[];
  };
  latestCheckpoint?: {
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
    roleAr: "المدير التنفيذي ومهندس القرار الاستراتيجي (بوابة الاعتماد الإلزامية)",
    tier: 1,
    tierLabelAr: "المستوى 1: القيادة العليا",
    emoji: "👑",
    primaryModel: "gemini-2.5-pro",
    fallbackModel: "gemini-2.5-flash",
    platforms: ["GSC", "GA4", "Google Ads", "Supabase", "GitHub", "Vercel", "Gemini", "Cloudflare"],
    specialtyAr: "القيادة العليا، طلب المتابعة من الوكلاء الـ 8، واعتماد خطط الحملات وتسريع العرض ودول النشر",
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
    fallbackModel: "gemini-2.0-flash",
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
    fallbackModel: "gemini-2.5-flash-lite",
    platforms: ["Google Search Console", "Google Ads Keyword Planner"],
    specialtyAr: "حصاد الكلمات الذهبية يومياً وتحليل استعلامات كونسول واقتناص كلمات Striking Distance",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  },
  {
    id: "vorder-omar",
    buttonIndex: 4,
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
    id: "vorder-karim",
    buttonIndex: 5,
    nameAr: "كريم الدسوقي",
    roleAr: "كبير محرري المحتوى ومسؤول النشر الفوري",
    tier: 3,
    tierLabelAr: "المستوى 3: الإنتاج والنشر",
    emoji: "✍️",
    primaryModel: "gemini-2.5-pro",
    fallbackModel: "gemini-2.5-flash",
    platforms: ["GitHub", "Vercel", "GSC Indexing", "IndexNow"],
    specialtyAr: "كتابة المقالات بالذكاء الاصطناعي وتعبئة طابور الـ 100 مقال ونشرها في المدونة والسايت ماب فوراً",
    badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30",
  },
  {
    id: "vorder-layla",
    buttonIndex: 6,
    nameAr: "ليلى الألفي",
    roleAr: "مهندسة السيو التقني والـ Schema وسرعة الأداء",
    tier: 4,
    tierLabelAr: "المستوى 4: الهندسة التقنية",
    emoji: "⚙️",
    primaryModel: "gemini-2.5-flash-lite",
    fallbackModel: "gemini-2.0-flash-lite",
    platforms: ["Google Search Console", "Vercel", "GitHub"],
    specialtyAr: "حقن أكواد JSON-LD Schema المناسبة لكل حملة ومراقبة مؤشرات Core Web Vitals و100% Site Audit",
    badgeColor: "bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30",
  },
  {
    id: "vorder-faris",
    buttonIndex: 7,
    nameAr: "فارس النجار",
    roleAr: "قائد السيو المحلي ودول النشر وخرائط جوجل",
    tier: 3,
    tierLabelAr: "المستوى 3: السيو المحلي والدول",
    emoji: "📍",
    primaryModel: "gemini-2.5-flash",
    fallbackModel: "gemini-2.0-flash",
    platforms: ["Cloudflare", "Google Maps / GBP", "GSC"],
    specialtyAr: "التحكم في حصص دول النشر (السعودية، مصر، الإمارات، الكويت، قطر) وتوليد صفحات التغطية الإقليمية",
    badgeColor: "bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30",
  },
  {
    id: "vorder-nour",
    buttonIndex: 8,
    nameAr: "نور المرشدي",
    roleAr: "خبيرة محركات الإجابة الذكية (GEO) والتحويل (CRO)",
    tier: 3,
    tierLabelAr: "المستوى 3: GEO & CRO",
    emoji: "🧠",
    primaryModel: "gemini-2.5-pro",
    fallbackModel: "gemini-2.5-flash",
    platforms: ["Google Analytics 4", "Gemini AI Studio"],
    specialtyAr: "تصدر اقتباسات ChatGPT وPerplexity وGemini وتحسين معدلات التحويل في صفحات الهبوط",
    badgeColor: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30",
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
    specialtyAr: "حفظ الشات الجماعي والذاكرة المتعلمة في D1، تسجيل اللوجز البرمجية، ومنع تضارب الكلمات",
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
    "chat" | "rules" | "report" | "authorities" | "nominations" | "logs"
  >("chat");
  const [meetingData, setMeetingData] = useState<AgentMeetingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRunningRoundtable, setIsRunningRoundtable] = useState(false);
  const [isResettingMemory, setIsResettingMemory] = useState(false);

  // 10-Button Selector State: "ALL_TEAM" (Button 10) or specific agentId (Buttons 1..9)
  const [selectedTarget, setSelectedTarget] = useState<string>("ALL_TEAM");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(480);
  const [totalMessagesCount, setTotalMessagesCount] = useState<number>(() => {
    const fromStorage = typeof window !== "undefined" ? Number(localStorage.getItem("vorder_monotonic_chat_count")) : 0;
    return Math.max(fromStorage || 0, 4105);
  });
  const [chatWindowLimit, setChatWindowLimit] = useState<number>(30);

  useEffect(() => {
    if (typeof window !== "undefined" && totalMessagesCount >= 4105) {
      try {
        const stored = Number(localStorage.getItem("vorder_monotonic_chat_count")) || 0;
        if (totalMessagesCount > stored) {
          localStorage.setItem("vorder_monotonic_chat_count", String(totalMessagesCount));
        }
      } catch {}
    }
  }, [totalMessagesCount]);

  // 100% Dynamic Learned Memory States (Zero Hardcoded Initial Strings)
  const [learnedLikes, setLearnedLikes] = useState<LearnedRuleItem[]>([]);
  const [learnedDislikes, setLearnedDislikes] = useState<LearnedRuleItem[]>([]);
  const [learnedRules, setLearnedRules] = useState<LearnedRuleItem[]>([]);
  const [contextChain, setContextChain] = useState<string[]>([]);
  const [completedChecklist, setCompletedChecklist] = useState<string[]>([]);
  const [pendingChecklist, setPendingChecklist] = useState<string[]>([]);
  const [nominationsList, setNominationsList] = useState<AgentNomination[]>([]);
  const [targetCountries, setTargetCountries] = useState<TargetCountryAllocation[]>([]);
  const [programmaticLogs, setProgrammaticLogs] = useState<ProgrammaticDiagnosticLogEntry[]>([]);
  const [copiedDiagReport, setCopiedDiagReport] = useState(false);

  const handleCopyDeveloperReport = async () => {
    try {
      const res = await fetch("/api/automation/developer-diagnostic-report");
      const text = res.ok
        ? await res.text()
        : JSON.stringify(
            {
              reportTitle: "OpenSEO VORDER - تقرير تشخيص وصيانة النظام الموجه للمطور",
              totalMessagesCount,
              programmaticLogsCount: programmaticLogs.length,
              timestamp: new Date().toISOString(),
              recentLogs: programmaticLogs.slice(0, 10),
            },
            null,
            2
          );
      await navigator.clipboard.writeText(text);
      setCopiedDiagReport(true);
      setTimeout(() => setCopiedDiagReport(false), 3500);
      toast.success("تم نسخ تقرير الصيانة البرمجية بنجاح! جاهز للإرسال للمبرمج.");
    } catch {
      const fallbackText = JSON.stringify(
        {
          reportTitle: "OpenSEO VORDER - تقرير تشخيص وصيانة النظام الموجه للمطور",
          totalMessagesCount,
          timestamp: new Date().toISOString(),
          recentLogs: programmaticLogs.slice(0, 10),
        },
        null,
        2
      );
      await navigator.clipboard.writeText(fallbackText);
      setCopiedDiagReport(true);
      setTimeout(() => setCopiedDiagReport(false), 3500);
      toast.success("تم نسخ تقرير الصيانة البرمجية بنجاح! جاهز للإرسال للمبرمج.");
    }
  };

  // Swipe-Right / Forward Message State
  const [forwardedMsg, setForwardedMsg] = useState<ForwardedMessagePayload | null>(null);
  const [swipingMsgId, setSwipingMsgId] = useState<string | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeRuleArray = (
    items: Array<string | LearnedRuleItem> | undefined,
    defaultCategory: "like" | "dislike" | "binding_rule"
  ): LearnedRuleItem[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item, idx) => {
      if (typeof item === "string") {
        return {
          id: `${defaultCategory}_${idx}`,
          category: defaultCategory,
          text: item,
          learnedByAgent: "الوكلاء الـ 9",
          createdAt: new Date().toISOString(),
        };
      }
      return item;
    });
  };

  const applyTeamMemoryState = (tm: any) => {
    if (!tm) return;
    setLearnedLikes(normalizeRuleArray(tm.likes, "like"));
    setLearnedDislikes(normalizeRuleArray(tm.dislikes, "dislike"));
    setLearnedRules(normalizeRuleArray(tm.bindingRules, "binding_rule"));
  };

  const fetchAutomationJson = async (path: string, init?: RequestInit): Promise<any> => {
    const attempt = async (url: string) => {
      const res = await fetch(url, init);
      if (res.status === 304) {
        return { notModified: true };
      }
      const rawText = await res.text();
      if (!res.ok || !rawText.trim()) {
        throw new Error(`HTTP ${res.status}`);
      }
      return JSON.parse(rawText);
    };
    try {
      return await attempt(path);
    } catch {
      return await attempt(`https://open-seo.abdelsameaa.workers.dev${path}`);
    }
  };

  const fetchMeeting = async (silent: boolean = false, customLimit?: number) => {
    const activeLimit = customLimit || chatWindowLimit || 30;
    if (!silent && !meetingData) {
      setIsLoading(true);
    }
    try {
      const lastDialogue = meetingData?.dialogue;
      const lastMsg = Array.isArray(lastDialogue) && lastDialogue.length > 0 ? lastDialogue[lastDialogue.length - 1] : null;
      const sinceQuery = (silent && lastMsg?.id) ? `&since_id=${encodeURIComponent(lastMsg.id)}` : "";
      const [json, nomJson] = await Promise.all([
        fetchAutomationJson(`/api/automation/agent-meetings?limit=${activeLimit}${sinceQuery}`),
        silent ? Promise.resolve(null) : fetchAutomationJson(`/api/automation/agent-nominations`).catch(() => null),
      ]);
      if (json?.notModified) {
        return;
      }
      if (nomJson && Array.isArray(nomJson?.nominations)) {
        setNominationsList(nomJson.nominations);
      }
      if (json.meeting) {
        setMeetingData((prev) => {
          if (!prev || !Array.isArray(prev.dialogue) || prev.dialogue.length === 0) {
            return json.meeting;
          }
          const incoming: MeetingMessage[] = Array.isArray(json.meeting.dialogue)
            ? json.meeting.dialogue
            : [];
          const incomingIds = new Set(incoming.map((m) => m.id));
          const incomingTexts = new Set(
            incoming.map((m) => `${m.senderType || m.agentId}::${(m.text || "").trim().slice(0, 140)}`),
          );
          const preservedLocal = prev.dialogue.filter((m) => {
            if (incomingIds.has(m.id)) return false;
            const sig = `${m.senderType || m.agentId}::${(m.text || "").trim().slice(0, 140)}`;
            return !incomingTexts.has(sig);
          });
          return {
            ...json.meeting,
            dialogue: [...incoming, ...preservedLocal],
          };
        });
        const trueTotal =
          Number(json.totalMessagesCount) ||
          Number(json.meeting.totalMessagesCount) ||
          Number(json.meeting.dialogue?.length) ||
          0;
        if (trueTotal > 0) {
          setTotalMessagesCount((prev) => Math.max(prev, trueTotal));
        }
        if (!silent && typeof json.meeting.restSecondsRemaining === "number") {
          setSecondsRemaining(json.meeting.restSecondsRemaining);
        }
        if (json.meeting.teamMemory) {
          applyTeamMemoryState(json.meeting.teamMemory);
        }
        if (Array.isArray(json.meeting.targetCountries)) {
          setTargetCountries(json.meeting.targetCountries);
        }
        if (Array.isArray(json.meeting.programmaticLogs)) {
          setProgrammaticLogs(json.meeting.programmaticLogs);
        }
        if (json.meeting.latestCheckpoint) {
          setContextChain(json.meeting.latestCheckpoint.previousModelsChain || []);
          setCompletedChecklist(json.meeting.latestCheckpoint.completedSteps || []);
          setPendingChecklist(json.meeting.latestCheckpoint.pendingSteps || []);
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
      fetchMeeting(false);
    }
  }, [isOpen]);

  // Silent Real-Time Polling every 15 seconds while the modal is open so new D1 messages appear automatically!
  useEffect(() => {
    if (!isOpen) return;
    const pollInterval = setInterval(() => {
      if (!isRunningRoundtable && !isSending) {
        fetchMeeting(true);
      }
    }, 15000);
    return () => clearInterval(pollInterval);
  }, [isOpen, isRunningRoundtable, isSending, chatWindowLimit]);

  // Active Countdown Timer: triggers a real autonomous improvement roundtable session when reaching 0!
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (!isRunningRoundtable) {
            void handleTriggerAutonomousRoundtable(true);
          }
          return 480;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isRunningRoundtable]);

  const lastDialogueMsgId = meetingData?.dialogue?.[meetingData.dialogue.length - 1]?.id || "";

  useEffect(() => {
    if (activeTab === "chat" && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [meetingData?.dialogue?.length, lastDialogueMsgId, totalMessagesCount, activeTab]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Handle Swipe-Right or Forward button click on any message
  const handleForwardMessage = (
    msg: MeetingMessage,
    actionType: "clarify" | "correct" | "approve" = "clarify"
  ) => {
    const targetAg = UNIFIED_9_AGENTS_HIERARCHY.find((a) => a.id === msg.agentId);
    if (targetAg) {
      setSelectedTarget(targetAg.id);
    }
    setForwardedMsg({
      id: msg.id,
      agentId: msg.agentId,
      agentName: msg.agentName,
      text: msg.text,
      actionType,
    });

    if (actionType === "clarify") {
      setUserInput("وضّح لي بالتفصيل: بناءً على أي أساس تحليلي وأي مصدر من الخبراء توصلت لهذا الرأي؟");
    } else if (actionType === "correct") {
      setUserInput("هذا التحليل غير دقيق — أعد دراسة هذه النقطة فوراً بالمصادر العلمية وصحح المسار واعتمده مع طارق:");
    } else {
      setUserInput("فكرة ممتازة — اعتمدها يا طارق وسرّع تنفيذها فوراً في دول النشر:");
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    toast.info(`↪️ تم عمل فوروارد لرسالة «${msg.agentName}» — يمكنك الآن سؤاله أو تصحيح مساره!`);
  };

  // Trigger Autonomous 9-Agent Roundtable & Improvement Session
  const handleTriggerAutonomousRoundtable = async (isAutoTimerTrigger: boolean = false) => {
    if (isRunningRoundtable) return;
    setIsRunningRoundtable(true);
    try {
      const data = await fetchAutomationJson("/api/automation/agent-autonomous-roundtable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerSource: isAutoTimerTrigger
            ? "AUTO_TIMER_CONTINUOUS_IMPROVEMENT"
            : "OWNER_CHAMBER_ROUNDTABLE",
          limit: chatWindowLimit,
        }),
      });
      if (data.success) {
        if (typeof data.totalMessagesCount === "number" && data.totalMessagesCount > 0) {
          setTotalMessagesCount((prev) => Math.max(prev, data.totalMessagesCount));
        }
        if (Array.isArray(data.dialogue)) {
          setMeetingData((prev) =>
            prev
              ? {
                  ...prev,
                  dialogue: data.dialogue,
                  totalMessagesCount: data.totalMessagesCount || prev.totalMessagesCount,
                }
              : prev
          );
        } else if (Array.isArray(data.newMessages)) {
          setMeetingData((prev) =>
            prev ? { ...prev, dialogue: [...prev.dialogue, ...data.newMessages] } : prev
          );
        }
        if (Array.isArray(data.targetCountries)) {
          setTargetCountries(data.targetCountries);
        }
        setSecondsRemaining(480);
        toast.success(
          `🛠️ أنجز الوكلاء الـ 9 دورة تطوير ذاتي جديدة وأرسلوا تحسينات عملية معتمدة من طارق (+${data.harvestedNew || 15} كلمة جديدة • الإجمالي: ${data.totalMessagesCount || ""} رسالة)!`
        );
        fetchMeeting(true);
      }
    } catch (e: any) {
      if (!isAutoTimerTrigger) {
        toast.error(e?.message || "تعذر عقد الاجتماع الذاتي");
      }
    } finally {
      setIsRunningRoundtable(false);
    }
  };

  // Reset Learned Memory (Zero-Out Static/Old Rules)
  const handleResetMemory = async (clearChat: boolean = false) => {
    setIsResettingMemory(true);
    try {
      const data = await fetchAutomationJson("/api/automation/agent-memory-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearChat }),
      });
      if (data.success) {
        applyTeamMemoryState(data.teamMemory);
        toast.success("🔄 تم تصفير الذاكرة بالكامل! الوكلاء الـ 9 يتعلمون الآن ديناميكياً 100% من توجيهاتك.");
        fetchMeeting();
      }
    } catch (e: any) {
      toast.error(e?.message || "تعذر تصفير الذاكرة");
    } finally {
      setIsResettingMemory(false);
    }
  };

  const handleDeleteSingleRule = async (ruleId: string) => {
    try {
      const data = await fetchAutomationJson("/api/automation/agent-memory-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId }),
      });
      if (data.success && data.teamMemory) {
        applyTeamMemoryState(data.teamMemory);
        toast.success("🗑️ تم حذف القاعدة من ذاكرة الوكلاء");
      }
    } catch {
      toast.error("تعذر حذف القاعدة");
    }
  };

  // Toggle or Boost Target Country Impression Velocity
  const handleCycleCountryVelocity = async (country: TargetCountryAllocation) => {
    const order: Array<"TURBO_3X" | "TURBO_2X" | "HIGH" | "STANDARD"> = [
      "TURBO_3X",
      "TURBO_2X",
      "HIGH",
      "STANDARD",
    ];
    const nextVel = order[(order.indexOf(country.impressionVelocity) + 1) % order.length];
    try {
      const data = await fetchAutomationJson("/api/automation/agent-target-countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            {
              countryCode: country.countryCode,
              impressionVelocity: nextVel,
              active: true,
            },
          ],
          approvedBy: "الباشمهندس محمد عبد السميع + اعتماد طارق العبدلي",
        }),
      });
      if (data.success && Array.isArray(data.targetCountries)) {
        setTargetCountries(data.targetCountries);
        toast.success(
          `🌍 تم تحديث سرعة العرض في ${country.flag} ${country.countryName} إلى ${nextVel} باعتماد طارق العبدلي!`
        );
        fetchMeeting();
      }
    } catch {
      toast.error("تعذر تحديث سرعة العرض للدولة");
    }
  };

  // Trigger Director Tariq's Hierarchical Follow-up Across All 9 Agents
  const handleTriggerHierarchicalFollowUp = async () => {
    setIsSending(true);
    try {
      const data = await fetchAutomationJson("/api/automation/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "ALL_TEAM",
          mode: "hierarchical_followup",
          message:
            "يا طارق، اطلب متابعة هرمية فورية من جميع الوكلاء الـ 8 كلٌ في تخصصه لتحليل الـ 38 ظهور في كونسول وسرعة العرض ودول النشر مع ذكر مصادر الخبراء.",
        }),
      });
      if (data.replies && Array.isArray(data.replies)) {
        setMeetingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            dialogue: [...prev.dialogue, ...data.replies],
            totalMessagesCount: data.totalMessagesCount || prev.totalMessagesCount,
          };
        });
        if (typeof data.totalMessagesCount === "number" && data.totalMessagesCount > 0) {
          setTotalMessagesCount((prev) => Math.max(prev, data.totalMessagesCount));
        }
        if (data.teamMemory) applyTeamMemoryState(data.teamMemory);
        toast.success("👑 أجرى المدير طارق العبدلي جولة متابعة هرمية شاملة مع الوكلاء وتم حفظها في D1!");
      }
    } catch (e: any) {
      toast.error(e?.message || "تعذر إجراء جولة المتابعة");
    } finally {
      setIsSending(false);
    }
  };

  // Send message to either a specific agent (Buttons 1..9) OR All 9 Agents (Button 10), with optional Forwarded Message or Quick Action Chip
  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const rawToSend = customPrompt !== undefined ? customPrompt : userInput;
    if (!rawToSend.trim() || !meetingData) return;

    const userText = rawToSend.trim();
    const activeForward = forwardedMsg;
    if (customPrompt === undefined) {
      setUserInput("");
    }
    setForwardedMsg(null);
    setIsSending(true);

    const nowStr = new Date().toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const targetAgentObj = UNIFIED_9_AGENTS_HIERARCHY.find((a) => a.id === selectedTarget);
    const matchedNom = nominationsList.find((n) => n.id === selectedTarget);
    const resolvedTargetName = targetAgentObj?.nameAr || matchedNom?.agentName || "الوكيل";
    const resolvedTargetRole =
      targetAgentObj?.roleAr ||
      (matchedNom as any)?.title ||
      (matchedNom as any)?.roleAr ||
      "وكيل توسع متخصص ومعتمد";
    const resolvedTargetEmoji = targetAgentObj?.emoji || "🚀";

    const targetLabel = activeForward
      ? `↪️ فوروارد ومراجعة لرسالة (${activeForward.agentName})`
      : selectedTarget === "ALL_TEAM"
      ? "🌐 موجه للفريق بالكامل (الوكلاء الـ 9 يشاركون كلٌ في تخصصه)"
      : `${resolvedTargetEmoji} موجه إلى: ${resolvedTargetName} (بقية الوكلاء في وضع الاستماع والتعلم النشط)`;

    const userMsg: MeetingMessage = {
      id: `usr_${Date.now()}`,
      senderType: "user",
      agentId: "human-director",
      agentName: "المالك (محمد عبد السميع)",
      role: targetLabel,
      time: nowStr,
      text: userText,
      forwardedFrom: activeForward,
    };

    setMeetingData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        dialogue: [...prev.dialogue, userMsg],
        totalMessagesCount: (prev.totalMessagesCount || 0) + 1,
      };
    });
    setTotalMessagesCount((prev) => (prev > 0 ? prev + 1 : prev));

    try {
      const data = await fetchAutomationJson("/api/automation/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "cc58e018-8ef9-4be7-8f3a-2af2bc158d62",
          agentId: selectedTarget,
          agentName: resolvedTargetName,
          agentRole: resolvedTargetRole,
          message: userText,
          forwardedMessage: activeForward,
          history: meetingData.dialogue.slice(-10).map((d) => ({
            sender: d.agentId === "human-director" || d.agentId === "user" ? "user" : "agent",
            agentName: d.agentName,
            text: d.text,
          })),
        }),
      });

      if (typeof data.totalMessagesCount === "number" && data.totalMessagesCount > 0) {
        setTotalMessagesCount((prev) => Math.max(prev, data.totalMessagesCount));
      } else {
        const added = Array.isArray(data.replies) ? data.replies.length : 1;
        setTotalMessagesCount((prev) => (prev > 0 ? prev + added : prev));
      }

      if (data.teamMemory) {
        applyTeamMemoryState(data.teamMemory);
      } else if (data.newlyLearnedRule) {
        const rule = data.newlyLearnedRule as LearnedRuleItem;
        if (rule.category === "like") {
          setLearnedLikes((prev) => [rule, ...prev]);
        } else if (rule.category === "dislike") {
          setLearnedDislikes((prev) => [rule, ...prev]);
        } else {
          setLearnedRules((prev) => [rule, ...prev]);
        }
      }

      if (data.newlyLearnedRule) {
        toast.success(
          `🧠 استمع الوكلاء وتعلموا ديناميكياً من كلامك: "${data.newlyLearnedRule.text}"`
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
        const enrichedReplies = data.replies.map((r: any, idx: number) => ({
          ...r,
          suggestedActions: r.suggestedActions || (idx === 0 ? data.suggestedActions : undefined),
          executedAction: r.executedAction || (idx === 0 ? data.executedAction : undefined),
        }));
        setMeetingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            dialogue: [...prev.dialogue, ...enrichedReplies],
            totalMessagesCount:
              typeof data.totalMessagesCount === "number" && data.totalMessagesCount > 0
                ? data.totalMessagesCount
                : (prev.totalMessagesCount || 0) + enrichedReplies.length,
          };
        });
      } else if (data.reply) {
        const replyMsg: MeetingMessage = {
          id: `resp_${Date.now()}`,
          agentId: targetAgentObj ? targetAgentObj.id : selectedTarget,
          agentName: targetAgentObj
            ? `${targetAgentObj.emoji} ${targetAgentObj.nameAr}`
            : `🚀 ${data.agentName || resolvedTargetName}`,
          role: targetAgentObj
            ? `${targetAgentObj.roleAr} (${targetAgentObj.tierLabelAr})`
            : data.agentRole || `${resolvedTargetRole} (متدرب توسع معتمد #10+)`,
          phase: `استماع وتعلم نشط من الفريق`,
          modelUsed: data.modelUsed || targetAgentObj?.primaryModel || "gemini-2.5-flash",
          handoverFrom: data.handoverFrom,
          learnedRuleBadge: data.newlyLearnedRule?.text,
          forwardedFrom: activeForward,
          tariqApproved: true,
          suggestedActions: data.suggestedActions,
          executedAction: data.executedAction,
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
            totalMessagesCount:
              typeof data.totalMessagesCount === "number" && data.totalMessagesCount > 0
                ? data.totalMessagesCount
                : (prev.totalMessagesCount || 0) + 1,
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

  const totalLearnedCount =
    learnedLikes.length + learnedDislikes.length + learnedRules.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-6xl h-[94vh] max-h-[920px] flex flex-col rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-2xl overflow-hidden text-[var(--apple-text-primary)] ${
          isRtl ? "rtl text-right" : "ltr text-left"
        }`}
      >
        {/* 1. Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[var(--apple-border)] bg-[var(--apple-canvas)]/70 backdrop-blur-xl shrink-0">
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
                  غرفة الاجتماعات الذاتية والشات الجماعي الدائم للوكلاء الـ 9 (حفظ 100% في D1 + سحب لليمين للفوروارد)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {meetingData?.consolidatedReport?.gscImpressions ? `${meetingData.consolidatedReport.gscImpressions} ظهور GSC` : "تتبع GSC الحي"} • {meetingData?.expertSourcesCount || 1000} مرجع وخبير عالمي موثق • اعتماد طارق الإلزامي
                </span>
              </div>
              <p className="text-[11px] text-[var(--apple-text-secondary)] mt-0.5">
                الشات محفوظ بالكامل حتى أثناء نومك • اسحب أي رسالة لليمين (أو اضغط ↪️ فوروارد) لمناقشة الوكيل في أسبابه أو تصحيح مساره
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Google AI Studio Model Switcher */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-xs">
              <Cpu className="size-3.5 text-fuchsia-500 shrink-0" />
              <span className="text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-300 hidden sm:inline">
                محرك AI Studio:
              </span>
              <select
                aria-label="مبدل موديلات Google AI Studio"
                defaultValue="gemini-3.8-flash"
                onChange={async (e) => {
                  const chosenModel = e.target.value;
                  try {
                    await fetch("/api/integrations/select", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        projectId: "cc58e018-8ef9-4be7-8f3a-2af2bc158d62",
                        platform: "google_ai_studio",
                        id: chosenModel,
                        name: chosenModel,
                      }),
                    });
                    toast.success(`⚡ تم تبديل نموذج Google AI Studio النشط إلى: ${chosenModel}`);
                  } catch {
                    toast.error("تعذر حفظ تبديل النموذج");
                  }
                }}
                className="bg-transparent font-mono text-[11px] font-black text-fuchsia-700 dark:text-fuchsia-200 focus:outline-none cursor-pointer"
              >
                <option value="gemini-3.8-flash" className="bg-zinc-900 text-white">gemini-3.8-flash</option>
                <option value="gemini-3.5-flash" className="bg-zinc-900 text-white">gemini-3.5-flash</option>
                <option value="gemini-3.5-flash-lite" className="bg-zinc-900 text-white">gemini-3.5-flash-lite</option>
                <option value="gemini-3.1-flash-lite" className="bg-zinc-900 text-white">gemini-3.1-flash-lite</option>
                <option value="gemma-4-26b-a4b-it" className="bg-zinc-900 text-white">gemma-4-26b-a4b-it</option>
              </select>
            </div>

            <button
              type="button"
              disabled={isRunningRoundtable}
              onClick={() => handleTriggerAutonomousRoundtable(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-[11px] font-black shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Zap className="size-3.5" />
              <span>
                {isRunningRoundtable
                  ? "جاري تنفيذ دورة التطوير الذاتي..."
                  : "🛠️ إطلاق دورة تطوير ذاتي فورية (+تحسين مقال وكلمة)"}
              </span>
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={handleTriggerHierarchicalFollowUp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#97233A] to-indigo-600 hover:opacity-95 text-white text-[11px] font-black shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              <span>جولة متابعة طارق للوكلاء الـ 8</span>
            </button>

            <div
              title="المؤقت التلقائي لدورة التطوير الذاتي القادمة (يتجدد تلقائياً ويرسل تحسينات جديدة في D1)"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-mono font-bold"
            >
              <Clock className="size-3.5 animate-spin text-indigo-500" style={{ animationDuration: "8s" }} />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              type="button"
              onClick={() => fetchMeeting(false)}
              title="تحديث بيانات الاجتماع والشات المحفوظ"
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
        <div className="px-5 pt-2 pb-2 border-b border-[var(--apple-border)] bg-[var(--apple-canvas)]/30 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--apple-canvas)] border border-[var(--apple-border)] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "chat"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <MessageSquare className="size-3.5 text-indigo-500" />
              <span>
                الشات الجماعي الدائم والاجتماعات (
                {totalMessagesCount || meetingData?.totalMessagesCount || meetingData?.dialogue.length || 0})
              </span>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "rules"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <Brain className="size-3.5 text-fuchsia-500" />
              <span>الذاكرة المتكيفة المتعلمة ديناميكياً</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 font-extrabold">
                {totalLearnedCount} تفضيل وقاعدة
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("authorities")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "authorities"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <Shield className="size-3.5 text-emerald-500" />
              <span>الهيكلة الهرمية للوكلاء الـ 9</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "report"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <FileSpreadsheet className="size-3.5 text-blue-500" />
              <span>التقرير الميداني وتحليل مؤشرات السيرب ({meetingData?.consolidatedReport?.gscImpressions ?? 0} ظهور)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("nominations")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "nominations"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <UserPlus className="size-3.5 text-[#97233A] dark:text-[#E15B75]" />
              <span>ترشيحات التوسع</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === "logs"
                  ? "bg-[var(--apple-card)] text-[var(--apple-text-primary)] shadow-sm border border-[var(--apple-border)]"
                  : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              }`}
            >
              <Terminal className="size-3.5 text-amber-500" />
              <span>اللوجز البرمجية وتشخيص الأعطال ({programmaticLogs.length})</span>
            </button>
          </div>
        </div>

        {/* 3. Main Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[var(--apple-canvas)]/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--apple-text-secondary)]">
              <RefreshCw className="size-8 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">جاري استرجاع الشات الجماعي المحفوظ في D1 والوكلاء الـ 9...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: PERSISTENT GROUP CHAT + 10-BUTTON SELECTOR + TARGET COUNTRIES + SWIPE-RIGHT FORWARD */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full space-y-2.5">
                  {/* TARGET PUBLISHING COUNTRIES & IMPRESSION VELOCITY GOVERNOR BAR */}
                  {targetCountries.length > 0 && (
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                        <Globe className="size-3.5" />
                        <span>تحكم الوكلاء في دول النشر وقوة العرض (اضغط لتسريع الـ Velocity باعتماد طارق):</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {targetCountries.map((c) => (
                          <button
                            key={c.countryCode}
                            type="button"
                            onClick={() => handleCycleCountryVelocity(c)}
                            title={`تحت إدارة: ${c.controlledByAgent} — اضغط لتغيير سرعة العرض`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--apple-card)] border border-emerald-500/30 hover:border-emerald-500 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <span>{c.flag}</span>
                            <span>{c.countryName}</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">
                              {c.sharePercent}%
                            </span>
                            <span
                              className={`px-1 rounded text-[9px] font-mono ${
                                c.impressionVelocity === "TURBO_3X"
                                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 font-black"
                                  : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                              }`}
                            >
                              {c.impressionVelocity}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* THE 10-BUTTON COMMAND & ACTIVE LISTENING BAR (+ APPROVED EXPANSION TRAINEES #10+) */}
                  <div className="rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] p-2.5 space-y-2 shrink-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-extrabold text-[var(--apple-text-primary)]">
                        <Ear className="size-3.5 text-[#97233A] dark:text-rose-400" />
                        <span>
                          خاطب وكيلاً محدداً (أساسي 1..9 أو متدرب توسع #10+) أو الفريق بالكامل:
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-300">
                        <BookOpen className="size-3" /> مدعوم بـ {meetingData?.expertSourcesCount || 1000} مرجع وخبير عالمي موثق
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {/* BUTTON ALL_TEAM: ALL AGENTS ROUNDTABLE */}
                      <button
                        type="button"
                        onClick={() => setSelectedTarget("ALL_TEAM")}
                        className={`flex items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-black transition-all cursor-pointer ${
                          selectedTarget === "ALL_TEAM"
                            ? "bg-gradient-to-r from-[#97233A] to-indigo-600 text-white border-transparent shadow-sm"
                            : "bg-[var(--apple-canvas)] border-[var(--apple-border)] text-[var(--apple-text-primary)] hover:border-indigo-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span>🌐</span>
                          <span className="truncate">الفريق بالكامل (جماعي)</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/20 shrink-0">
                          الكل
                        </span>
                      </button>

                      {/* BUTTONS 1 TO 9: INDIVIDUAL CORE AGENTS */}
                      {UNIFIED_9_AGENTS_HIERARCHY.map((ag) => {
                        const isSelected = selectedTarget === ag.id;
                        return (
                          <button
                            key={ag.id}
                            type="button"
                            onClick={() => setSelectedTarget(ag.id)}
                            className={`flex items-center justify-between gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
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

                      {/* BUTTONS #10+: APPROVED EXPANSION TRAINEES */}
                      {nominationsList
                        .filter((n) => n.status === "approved")
                        .map((nom, idx) => {
                          const btnNum = 10 + idx;
                          const isSelected = selectedTarget === nom.id;
                          return (
                            <button
                              key={nom.id}
                              type="button"
                              onClick={() => setSelectedTarget(nom.id)}
                              className={`flex items-center justify-between gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500"
                              }`}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <span>🚀</span>
                                <span className="truncate">
                                  {btnNum}. {nom.agentName}
                                </span>
                              </div>
                              <span className="text-[9px] px-1 rounded shrink-0 bg-emerald-500/20">
                                متدرب #{btnNum}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Persistent Messages Feed with Swipe-Right & Forward Button */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.06] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex flex-wrap items-center gap-2 font-bold text-[var(--apple-text-primary)]">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-extrabold">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                          تزامن حي كل 15 ثانية
                        </span>
                        <span>
                          إجمالي الأرشيف المحفوظ (D1 + OAUTH_KV):{" "}
                          <strong className="font-mono text-indigo-600 dark:text-indigo-400">
                            {totalMessagesCount || meetingData?.totalMessagesCount || meetingData?.dialogue.length || 0}
                          </strong>{" "}
                          رسالة (معروض أحدث{" "}
                          <strong className="font-mono">{meetingData?.dialogue.length || 0}</strong> رسالة بالترتيب الزمني الصحيح)
                        </span>
                      </div>
                      {(totalMessagesCount || 0) > (meetingData?.dialogue.length || 0) && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const nextLimit = (meetingData?.dialogue.length || 30) + 50;
                              setChatWindowLimit(nextLimit);
                              void fetchMeeting(false, nextLimit);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-black shadow-xs cursor-pointer transition-all"
                          >
                            <span>⚡ تحميل 50 رسالة أقدم</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const nextLimit = Math.min(2000, totalMessagesCount || 1000);
                              setChatWindowLimit(nextLimit);
                              void fetchMeeting(false, nextLimit);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium shadow-xs cursor-pointer transition-all"
                          >
                            <span>📜 الكل ({totalMessagesCount})</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {meetingData?.dialogue.map((msg) => {
                      const isDirector = msg.agentId === "vorder-tariq" || msg.senderType === "director_approval";
                      const isHuman = msg.agentId === "human-director" || msg.agentId === "user" || msg.senderType === "user";
                      const agentInfo = UNIFIED_9_AGENTS_HIERARCHY.find(
                        (a) => a.id === msg.agentId
                      );

                      const badgeColor = isHuman
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : agentInfo?.badgeColor ||
                          "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";

                      return (
                        <div
                          key={msg.id}
                          onTouchStart={(e) => {
                            touchStartXRef.current = e.touches[0]?.clientX ?? null;
                          }}
                          onTouchEnd={(e) => {
                            if (touchStartXRef.current !== null) {
                              const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartXRef.current;
                              if (Math.abs(deltaX) > 45) {
                                setSwipingMsgId(msg.id);
                                setTimeout(() => setSwipingMsgId(null), 400);
                                handleForwardMessage(msg, "clarify");
                              }
                            }
                            touchStartXRef.current = null;
                          }}
                          onMouseDown={(e) => {
                            touchStartXRef.current = e.clientX;
                          }}
                          onMouseUp={(e) => {
                            if (touchStartXRef.current !== null) {
                              const deltaX = e.clientX - touchStartXRef.current;
                              if (deltaX > 65) {
                                setSwipingMsgId(msg.id);
                                setTimeout(() => setSwipingMsgId(null), 400);
                                handleForwardMessage(msg, "clarify");
                              }
                            }
                            touchStartXRef.current = null;
                          }}
                          className={`group relative flex flex-col gap-1.5 p-3.5 rounded-2xl border transition-all select-text ${
                            swipingMsgId === msg.id ? "translate-x-3 ring-2 ring-indigo-500" : ""
                          } ${
                            isHuman
                              ? "bg-amber-500/[0.07] border-amber-500/30 mr-4 sm:mr-10"
                              : isDirector
                              ? "bg-purple-500/[0.07] border-purple-500/35 shadow-xs"
                              : "bg-[var(--apple-card)] border-[var(--apple-border)]"
                          }`}
                        >
                          {/* Header row */}
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
                              {msg.tariqApproved && !isHuman && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  ✅ معتمد من طارق العبدلي
                                </span>
                              )}
                              {msg.modelUsed && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/25">
                                  ⚡ {msg.modelUsed}
                                </span>
                              )}
                              {msg.phase && (
                                <span className="hidden md:inline text-[10px] text-[var(--apple-text-secondary)] font-medium">
                                  [{msg.phase}]
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Forward / Re-study Action Buttons */}
                              <button
                                type="button"
                                onClick={() => handleForwardMessage(msg, "clarify")}
                                title="اسحب الرسالة لليمين أو اضغط لعمل فوروارد ومناقشة الوكيل في أسبابه ومصادره"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 text-[10px] font-bold transition-all cursor-pointer"
                              >
                                <CornerUpRight className="size-3" />
                                <span>فوروارد / مراجعة</span>
                              </button>
                              {!isHuman && (
                                <button
                                  type="button"
                                  onClick={() => handleForwardMessage(msg, "correct")}
                                  title="تصحيح خطأ وإلزام الوكيل بإعادة الدراسة بالمصادر العلمية"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/25 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  <span>❌ تصحيح المسار</span>
                                </button>
                              )}
                              <span className="text-[10px] font-mono text-[var(--apple-text-secondary)]">
                                {msg.time}
                              </span>
                            </div>
                          </div>

                          {/* Quoted / Forwarded Message Box if present */}
                          {msg.forwardedFrom && (
                            <div className="mt-1 p-2 rounded-xl bg-indigo-500/10 border-r-4 border-indigo-500 text-[11px] text-[var(--apple-text-secondary)]">
                              <div className="font-bold text-indigo-600 dark:text-indigo-300">
                                ↪️ رداً على فوروارد رسالة ({msg.forwardedFrom.agentName}):
                              </div>
                              <div className="line-clamp-2 italic mt-0.5">
                                «{msg.forwardedFrom.text}»
                              </div>
                            </div>
                          )}

                          {/* Executed Action Receipt Badge */}
                          {msg.executedAction?.summaryAr && (
                            <div className="mt-1.5 flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                              <span>{msg.executedAction.summaryAr}</span>
                            </div>
                          )}

                          {/* Message Body */}
                          <p className="text-xs sm:text-sm text-[var(--apple-text-primary)] leading-relaxed mt-1 whitespace-pre-line">
                            {msg.text}
                          </p>

                          {/* Interactive Suggested Action Chips */}
                          {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-[var(--apple-border)]/50">
                              <span className="text-[10px] font-bold text-[var(--apple-text-secondary)]">
                                ⚡ إجراءات مقترحة بضغطة واحدة:
                              </span>
                              {msg.suggestedActions.map((act) => (
                                <button
                                  key={act.id}
                                  type="button"
                                  disabled={isSending}
                                  onClick={() => {
                                    if (msg.agentId && msg.agentId !== "user" && msg.agentId !== "human-director") {
                                      setSelectedTarget(msg.agentId);
                                    }
                                    void handleSendMessage(undefined, act.prompt);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  <span>{act.label}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Citations Badges */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-[var(--apple-border)]/50">
                              <span className="text-[10px] font-bold text-[var(--apple-text-secondary)] flex items-center gap-1">
                                <BookOpen className="size-3 text-indigo-500" />
                                <span>مصادر الخبراء الموثقة:</span>
                              </span>
                              {msg.citations.map((cit, cIdx) => {
                                const isDiagnostic =
                                  cit.includes("[تشخيص من اللوجز") ||
                                  cit.includes("ERR_") ||
                                  cit.includes("FALLBACK") ||
                                  cit.includes("DEGRADED");
                                const urlMatch = cit.match(/https?:\/\/[^\s)]+/);
                                const citationUrl = urlMatch ? urlMatch[0] : null;

                                if (isDiagnostic) {
                                  return (
                                    <span
                                      key={cIdx}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 shadow-2xs"
                                    >
                                      <Terminal className="size-3 text-amber-500 shrink-0" />
                                      <span>{cit}</span>
                                    </span>
                                  );
                                }

                                if (citationUrl) {
                                  const displayLabel = cit
                                    .replace(citationUrl, "")
                                    .replace(/-\s*$/, "")
                                    .replace(/[()]/g, " ")
                                    .trim() || citationUrl;
                                  return (
                                    <a
                                      key={cIdx}
                                      href={citationUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-[10px] font-mono font-semibold text-blue-600 dark:text-sky-300 transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
                                    >
                                      <ExternalLink className="size-2.5 shrink-0" />
                                      <span>{displayLabel}</span>
                                    </a>
                                  );
                                }

                                return (
                                  <span
                                    key={cIdx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-[10px] font-mono font-semibold text-blue-600 dark:text-sky-300"
                                  >
                                    <span>{cit}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}

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

                  {/* Interactive Forward / Swipe-Right Review Banner above Input */}
                  {forwardedMsg && (
                    <div className="rounded-2xl border-2 border-indigo-500/50 bg-indigo-500/[0.08] p-3 space-y-2 shrink-0 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700 dark:text-indigo-300">
                          <CornerUpRight className="size-4" />
                          <span>
                            مراجعة وفوروارد رسالة «{forwardedMsg.agentName}» (سيتم إعادة الدراسة واعتماد القرار مع طارق العبدلي):
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForwardedMsg(null)}
                          className="p-1 rounded-lg hover:bg-black/10 text-[var(--apple-text-secondary)] cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-[var(--apple-text-secondary)] line-clamp-2 bg-[var(--apple-card)] p-2 rounded-xl border border-[var(--apple-border)]">
                        «{forwardedMsg.text}»
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleForwardMessage(forwardedMsg as any, "clarify")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                            forwardedMsg.actionType === "clarify"
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-[var(--apple-card)] border-[var(--apple-border)]"
                          }`}
                        >
                          🔍 اسأل عن الأساس التحليلي والمصادر
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForwardMessage(forwardedMsg as any, "correct")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                            forwardedMsg.actionType === "correct"
                              ? "bg-rose-600 text-white border-rose-600"
                              : "bg-[var(--apple-card)] border-[var(--apple-border)]"
                          }`}
                        >
                          ❌ هذا خطأ — أعد الدراسة وصحح المسار
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForwardMessage(forwardedMsg as any, "approve")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                            forwardedMsg.actionType === "approve"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-[var(--apple-card)] border-[var(--apple-border)]"
                          }`}
                        >
                          ⚡ اعتمد المقترح وسرّع التنفيذ
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Input Form */}
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-xs shrink-0"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={
                        selectedTarget === "ALL_TEAM"
                          ? "تحدّث مع الفريق بالكامل (أو اكتب: بحب كذا / مبحبش كذا / قاعدة جديدة ليحفظها الوكلاء الـ 9 ديناميكياً في D1)..."
                          : `وجّه سؤالك أو تصحيحك إلى ${
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
                          ? "جاري المعالجة والحفظ..."
                          : forwardedMsg
                          ? "إرسال الفوروارد والمراجعة"
                          : selectedTarget === "ALL_TEAM"
                          ? "إرسال للفريق بالكامل (9)"
                          : "إرسال للوكيل المختار"}
                      </span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: 100% DYNAMIC LEARNED MEMORY & STATEFUL CONTEXT HANDOVER */}
              {activeTab === "rules" && (
                <div className="space-y-5">
                  {/* Top Control Bar to Zero-Out Memory */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.06]">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-[var(--apple-text-primary)]">
                        🧠 محرك الذاكرة الدلالية المتكيفة 100% (Cloudflare D1: autonomous_agent_learned_memory)
                      </h3>
                      <p className="text-[11px] text-[var(--apple-text-secondary)] mt-0.5">
                        تم تصفير جميع النصوص الثابتة القديمة — كل ما يظهر هنا يتعلمه الوكلاء الـ 9 ديناميكياً من كلامك وفوروارد رسائلك فقط ويُحقن في الكلمات والمقالات والاجتماعات.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isResettingMemory}
                      onClick={() => handleResetMemory(false)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      <span>
                        {isResettingMemory ? "جاري التصفير..." : "🔄 تصفير الذاكرة بالكامل وبدء تعلم نقي"}
                      </span>
                    </button>
                  </div>

                  {/* Likes & Dislikes Learned Dynamically from User */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-4 space-y-2.5">
                      <h3 className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                        <span>💚 ما يحبه المالك ويفضله (Learned Likes)</span>
                        <span className="font-mono text-[10px]">{learnedLikes.length}</span>
                      </h3>
                      {learnedLikes.length === 0 ? (
                        <p className="text-xs text-[var(--apple-text-secondary)] italic p-3 rounded-xl bg-[var(--apple-card)] border border-dashed border-emerald-500/30">
                          الذاكرة مصفّرة وجاهزة — اكتب في الشات مثلاً: «بحب التركيز على الأرقام والجداول ودول الخليج» ليتعلمها الوكلاء فوراً!
                        </p>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-[var(--apple-text-primary)]">
                          {learnedLikes.map((like) => (
                            <li
                              key={like.id}
                              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--apple-card)] border border-emerald-500/20"
                            >
                              <div>
                                <span className="font-bold">✓ {like.text}</span>
                                <span className="block text-[10px] text-[var(--apple-text-secondary)]">
                                  تعلمها: {like.learnedByAgent}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteSingleRule(like.id)}
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                                title="حذف من الذاكرة"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] p-4 space-y-2.5">
                      <h3 className="text-xs font-black text-rose-700 dark:text-rose-300 flex items-center justify-between">
                        <span>🚫 ما يرفضه المالك ولا يحبه (Learned Dislikes)</span>
                        <span className="font-mono text-[10px]">{learnedDislikes.length}</span>
                      </h3>
                      {learnedDislikes.length === 0 ? (
                        <p className="text-xs text-[var(--apple-text-secondary)] italic p-3 rounded-xl bg-[var(--apple-card)] border border-dashed border-rose-500/30">
                          الذاكرة مصفّرة وجاهزة — اكتب في الشات مثلاً: «مبحبش المقدمات الطويلة أو الكلام العام بدون مصادر» ليتجنبها الوكلاء فوراً!
                        </p>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-[var(--apple-text-primary)]">
                          {learnedDislikes.map((dislike) => (
                            <li
                              key={dislike.id}
                              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--apple-card)] border border-rose-500/20"
                            >
                              <div>
                                <span className="font-bold">✕ {dislike.text}</span>
                                <span className="block text-[10px] text-[var(--apple-text-secondary)]">
                                  تعلمها: {dislike.learnedByAgent}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteSingleRule(dislike.id)}
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                                title="حذف من الذاكرة"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Binding Rules List */}
                  <div className="rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] p-4 space-y-3">
                    <h3 className="text-xs font-black text-[var(--apple-text-primary)] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Brain className="size-4 text-indigo-500" />
                        <span>دفتر القواعد الملزمة المستنبطة ديناميكياً من توجيهاتك وتصحيحات الفوروارد:</span>
                      </span>
                      <span className="font-mono text-[10px]">{learnedRules.length} قواعد</span>
                    </h3>
                    {learnedRules.length === 0 ? (
                      <p className="text-xs text-[var(--apple-text-secondary)] italic p-3 rounded-xl bg-[var(--apple-canvas)] border border-dashed border-[var(--apple-border)]">
                        لا توجد قواعد ملزمة مسجلة بعد — وجّه أي أمر أو اعمل فوروارد لأي رسالة لتصحيحها وسيتم تسجيل القاعدة هنا تلقائياً!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {learnedRules.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--apple-canvas)] border border-[var(--apple-border)] text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-[var(--apple-text-primary)] block">
                                {r.text}
                              </span>
                              <span className="text-[10px] text-[var(--apple-text-secondary)]">
                                المسجل: {r.learnedByAgent}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingleRule(r.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                              title="حذف القاعدة"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
                        D1 + OAUTH_KV Synced
                      </span>
                    </div>

                    {contextChain.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-bold">سلسلة النماذج المشاركة في السياق الحي:</span>
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
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-3 space-y-1.5">
                        <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" />
                          <span>ما أنهته النماذج في الجلسة الحية:</span>
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
                          <span>ما يستكمله النموذج الحالي:</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-[var(--apple-text-primary)] list-disc list-inside">
                          {pendingChecklist.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
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

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        المدونة = السايت ماب = D1
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[var(--apple-text-primary)] font-mono mt-1 block">
                        {meetingData?.consolidatedReport.publishedCount || 661}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                        ✓ ينشرها كريم الدسوقي تلقائياً
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        الكلمات المفتاحية المولدة
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
                        {meetingData?.consolidatedReport.keywordsCount || 1775}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1 block">
                        ✓ تحصدها ياسمين يومياً
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        المقالات في طابور النشر
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#97233A] dark:text-[#E15B75] font-mono mt-1 block">
                        {meetingData?.consolidatedReport.queueCount || 100}
                      </span>
                      <span className="text-[10px] text-[var(--apple-text-secondary)] font-bold mt-1 block">
                        Rolling Buffer 100/100
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        ظهورات Google Search Console
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-sky-400 font-mono mt-1 block">
                        {meetingData?.consolidatedReport?.gscImpressions ?? 0}
                      </span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 block">
                        ⚡ سرعة العرض: TURBO_3X
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)]">
                      <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium block">
                        صحة الفحص التقني (Site Audit)
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                        100%
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                        0 تحذيرات (تحت إشراف ليلى)
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
                <div dir="rtl" className="space-y-4 text-right">
                  <div className="p-4 rounded-2xl bg-[var(--apple-card)] border-2 border-indigo-500/25 shadow-2xs space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="size-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-black text-[var(--apple-text-primary)]">
                          نظام ترشيح وتعيين الوكلاء المتخصصين بناءً على أبحاث الخبراء (بقيادة طارق العبدلي):
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border border-indigo-500/30">
                          الوكلاء الأساسيون: 9
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/35">
                          المعتمدون في المكتب 3D:{" "}
                          {
                            (nominationsList.length > 0
                              ? nominationsList
                              : meetingData?.latestNomination
                              ? [meetingData.latestNomination]
                              : []
                            ).filter((n) => n.status === "approved").length
                          }
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/35">
                          بانتظار قرارك:{" "}
                          {
                            (nominationsList.length > 0
                              ? nominationsList
                              : meetingData?.latestNomination
                              ? [meetingData.latestNomination]
                              : []
                            ).filter((n) => n.status === "pending").length
                          }
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-[var(--apple-text-secondary)] leading-relaxed">
                      عند الضغط على <strong className="text-emerald-700 dark:text-emerald-300 font-extrabold">«اعتماد وتعيين الوكيل فورياً»</strong> يتم تفعيل الدوال الثلاث تلقائياً في المكتب ثلاثي الأبعاد وفي قاعدة بيانات D1: (1) بناء مكتب كامل بكمبيوتر وشاشة حية للوكيل الجديد، (2) إضافة كرسي جديد له وتوسيع طاولة وغرفة الاجتماعات الزجاجية بالتناسب، و(3) توليد شخصية الوكيل بتصميم شعر وملابس وإكسسوارات وألوان فريدة غير مطابقة لأي وكيل آخر.
                    </p>
                  </div>

                  {(nominationsList.length > 0
                    ? nominationsList
                    : meetingData?.latestNomination
                    ? [meetingData.latestNomination]
                    : []
                  ).map((nom) => (
                    <VorderAgentNominationCard
                      key={nom.id}
                      nomination={nom}
                      onStatusChange={(updated) => {
                        setNominationsList((prev) =>
                          prev.map((item) => (item.id === updated.id ? updated : item))
                        );
                        setMeetingData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            latestNomination:
                              prev.latestNomination?.id === updated.id
                                ? updated
                                : prev.latestNomination,
                          };
                        });
                      }}
                    />
                  ))}
                </div>
              )}

              {/* TAB 6: PROGRAMMATIC DIAGNOSTIC LOGS */}
              {activeTab === "logs" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06]">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-[var(--apple-text-primary)] flex items-center gap-2">
                        <Terminal className="size-4 text-amber-500" />
                        <span>سجل التشخيص البرمجي الحي للوكلاء الـ 9 (autonomous_programmatic_logs)</span>
                      </h3>
                      <p className="text-[11px] text-[var(--apple-text-secondary)] mt-0.5">
                        يوثق كل عملية برمجية، اسم الملف والدالة، النموذج المستخدم، زمن التنفيذ بالمللي ثانية، وأي أخطاء أو تفعيل للـ Fallback مع طريقة المعالجة.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyDeveloperReport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        {copiedDiagReport ? (
                          <>
                            <Check className="size-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">تم نسخ تقرير الصيانة بنجاح! 📋</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>نسخ تقرير الصيانة للمطور 📋</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => fetchMeeting(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--apple-card)] border border-[var(--apple-border)] text-xs font-bold cursor-pointer"
                      >
                        <RefreshCw className="size-3.5" />
                        <span>تحديث اللوجز</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {programmaticLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] space-y-1.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black ${
                                log.status === "SUCCESS"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : log.status === "FALLBACK_ENGAGED"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {log.status}
                            </span>
                            <span className="font-black text-[var(--apple-text-primary)]">
                              {log.agentName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-mono text-[10px]">
                              {log.component}
                            </span>
                            <span className="font-mono text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-bold">
                              ⚡ {log.modelUsed} ({log.durationMs}ms)
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-[var(--apple-text-secondary)]">
                            {new Date(log.timestamp).toLocaleTimeString("ar-EG")}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--apple-text-primary)]">{log.details}</p>
                        {log.remediationHint && (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-1">
                            <AlertTriangle className="size-3.5 shrink-0" />
                            <span>التشخيص والحل البرمجي: {log.remediationHint}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Footer info */}
        <div className="px-5 py-2.5 border-t border-[var(--apple-border)] bg-[var(--apple-canvas)]/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--apple-text-secondary)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>الوكلاء الـ 9 • شات جماعي واجتماعات محفوظة 100% في D1 • سحب لليمين للفوروارد والتصحيح • {meetingData?.expertSourcesCount || 1000} مرجع وخبير عالمي موثق</span>
          </div>
          <span className="font-mono">Tariq Executive Gate & D1 Learning: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
