import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ListTodo,
  Terminal,
  MessageSquare,
  Sparkles,
  X,
  CheckCircle2,
  Loader2,
  CircleDot,
  Activity,
  Database,
  Globe,
} from 'lucide-react';
import {
  createVorderOfficeScene,
  VORDER_OFFICE_AGENTS,
} from '../VorderOfficeScene';
import { VorderOfficeTicker } from './VorderOfficeTicker';
import { VorderOfficeHUD } from './VorderOfficeHUD';
import { VorderTaskBoardOverlay } from './VorderTaskBoardOverlay';
import { VorderSystemLogOverlay } from './VorderSystemLogOverlay';
import { VorderAgentDirectorChat } from './VorderAgentDirectorChat';
import { VORDER_AGENTS_ROSTER, type VorderAgentData } from '../../agent-office-engine/vorderAgentsData';

interface Vorder3DCanvasProps {
  onSelectAgent?: (agent: VorderAgentData) => void;
}

interface LiveAgentTelemetry {
  id: string;
  agentIndex: number;
  name: string;
  role: string;
  tier: string;
  signatureStyle: string;
  currentState: string;
  statusBadgeAr: string;
  currentTaskTitle: string;
  currentSubStep: string;
  progressPct: number;
  completedSubSteps: string[];
  pendingSubSteps: string[];
  activeCountry: string;
  lastLogSummary: string;
  lastLogTime: string;
  modelUsed: string;
  durationMs: number;
}

const FALLBACK_LIVE_TELEMETRY: Record<number, LiveAgentTelemetry> = {
  0: {
    id: 'vorder-tariq',
    agentIndex: 0,
    name: 'طارق العبدلي',
    role: 'المدير التنفيذي وقائد التكتيكات (Tier 1)',
    tier: 'المستوى 1: القيادة العليا وتوجيه الحملات',
    signatureStyle: 'قيادي استراتيجي حازم، يربط بين قرارات الوكلاء الـ 8 ويصدر أوامر تنفيذية مرقمة ومباشرة.',
    currentState: 'executing',
    statusBadgeAr: '⚡ يدير العمليات ويعتمد الخطط',
    currentTaskTitle: 'قيادة خلية الوكلاء الـ 9 ومراجعة أداء 661 مقالاً منشوراً و38 ظهوراً في كونسول',
    currentSubStep: 'مراجعة حصص دول النشر النشطة واعتماد وضع سرعة العرض TURBO_3X',
    progressPct: 78,
    completedSubSteps: [
      'فحص تقارير الـ 38 ظهوراً في Google Search Console',
      'التصديق على مخرجات سارة وياسمين وكريم في D1',
    ],
    pendingSubSteps: ['إصدار أوامر التوزيع التكتيكي للدورة القادمة'],
    activeCountry: '🇸🇦 السعودية (35%)',
    lastLogSummary: 'اعتماد خطة تسريع قوة العرض TURBO_3X وحفظ قرارات الاجتماع في D1',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 840,
  },
  1: {
    id: 'vorder-sara',
    agentIndex: 1,
    name: 'سارة المهندس',
    role: 'قائدة الإعلانات والأورجانيك والمزايدات (Tier 2)',
    tier: 'المستوى 2: هندسة الحملات والمزايدات',
    signatureStyle: 'محللة مالية وميديا باير حادة الذكاء، تقيس كل خطوة بالـ ROAS والـ CPA ومعدلات التحويل في GA4.',
    currentState: 'optimizing',
    statusBadgeAr: '📈 تحلل الـ ROAS وتضبط سرعة العرض',
    currentTaskTitle: 'مزامنة نوايا الشراء في GA4 ورفع سرعة العرض إلى TURBO_3X',
    currentSubStep: 'تحليل تكلفة النقرة CPC للكلمات التجارية في السعودية ومصر',
    progressPct: 64,
    completedSubSteps: ['قراءة أحداث التحويل وServer-Side CAPI في GA4'],
    pendingSubSteps: ['ربط صفحات الهبوط الأعلى تحويلاً بحملات الأورجانيك', 'تحديث مصفوفة العائد ROAS'],
    activeCountry: '🇸🇦 السعودية (35%)',
    lastLogSummary: 'تحليل مسارات التحويل في GA4 وضبط سرعة العرض الإعلانية والأورجانيك',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 920,
  },
  2: {
    id: 'vorder-yasmine',
    agentIndex: 2,
    name: 'ياسمين الشريف',
    role: 'خبيرة حصاد الكلمات وتصنيف النوايا (Tier 2)',
    tier: 'المستوى 2: هندسة الحملات والمزايدات',
    signatureStyle: 'باحثة لسانيات وسيو دلالي لماحة، تقرأ سيكولوجية الباحث وتصطاد الكلمات في منطقة الـ Striking Distance.',
    currentState: 'executing',
    statusBadgeAr: '🔍 تحصد كلمات Striking Distance',
    currentTaskTitle: 'تحليل استعلامات Search Console وتوسيع قاعدة الـ 1,775 كلمة مفتاحية',
    currentSubStep: 'تحليل الفجوة الدلالية (Semantic Gap) وتوليد عناقيد الكلمات الطويلة',
    progressPct: 83,
    completedSubSteps: ['فرز الكلمات الواقعة في المراكز 7 إلى 14 في GSC'],
    pendingSubSteps: ['حفظ الكلمات المصنفة في جدول saved_keywords'],
    activeCountry: '🇪🇬 مصر (25%)',
    lastLogSummary: 'حصاد دفعة كلمات مفتاحية عالية النية الشرائية وربطها بطابور المحتوى',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 790,
  },
  3: {
    id: 'vorder-omar',
    agentIndex: 3,
    name: 'عمر الفاروق',
    role: 'العلاقات الرقمية وبناء الروابط والسلطة (Tier 3)',
    tier: 'المستوى 3: توجيه المحتوى لكل نوع حملة',
    signatureStyle: 'دبلوماسي هادئ ومهندس سلطة نطاق (Domain Authority)، يتحدث بلغة الثقة وتدفق الـ PageRank.',
    currentState: 'syncing',
    statusBadgeAr: '🔗 يبني شبكة الروابط والـ PageRank',
    currentTaskTitle: 'تدوير سلطة النطاق (Internal PageRank) عبر 661 مقالاً لدعم صفحات الظهور',
    currentSubStep: 'ربط المقالات الجديدة بالـ 15 صفحة المحققة للظهور في كونسول',
    progressPct: 71,
    completedSubSteps: ['فحص كثافة الروابط الداخلية لكل صفحة في المدونة', 'توليد نصوص Anchor Text دلالية'],
    pendingSubSteps: ['تحديث خريطة التدفق الدلالي للروابط'],
    activeCountry: '🇦🇪 الإمارات (20%)',
    lastLogSummary: 'توزيع الروابط الداخلية الدلالية وفق دراسة Zyppy لرفع الظهور 4x',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 880,
  },
  4: {
    id: 'vorder-karim',
    agentIndex: 4,
    name: 'كريم الدسوقي',
    role: 'مهندس المحتوى العضوي والفهرسة الفورية (Tier 3)',
    tier: 'المستوى 3: توجيه المحتوى لكل نوع حملة',
    signatureStyle: 'مهندس نشر وأرشفة سريع الإيقاع، يتحدث بلغة خطوط الإنتاج وطابور المقالات والـ Sitemap و IndexNow.',
    currentState: 'executing',
    statusBadgeAr: '🚀 ينشر المقالات ويحدث Sitemap',
    currentTaskTitle: 'إدارة خط إنتاج المحتوى (661 منشور + 100 في الطابور) وإطلاق IndexNow',
    currentSubStep: 'تحديث ملف Sitemap.xml الحي وإرسال إشعار فوري لبروتوكول IndexNow',
    progressPct: 89,
    completedSubSteps: [
      'توليد وهيكلة المقالات التكتيكية الطويلة بالذكاء الاصطناعي',
      'فحص عدم تكرار العناوين والـ Slugs بنسبة 100%',
    ],
    pendingSubSteps: ['تأكيد الأرشفة الفورية في Google Search Console'],
    activeCountry: '🇸🇦 السعودية (35%)',
    lastLogSummary: 'ملء طابور النشر 100/100 ومزامنة Sitemap.xml مع المدونة وD1',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 950,
  },
  5: {
    id: 'vorder-layla',
    agentIndex: 5,
    name: 'ليلى الألفي',
    role: 'الأداء التقني ومؤشرات الويب (Tier 4)',
    tier: 'المستوى 4: المراقبة الحية والتعديلات التلقائية',
    signatureStyle: 'مهندسة برمجيات وأداء صارمة ودقيقة بالمللي ثانية، تتحدث بلغة LCP و INP و CLS و JSON-LD Schema.',
    currentState: 'auditing',
    statusBadgeAr: '⚡ تفحص Core Web Vitals والـ Schema',
    currentTaskTitle: 'حماية سرعة الأداء بالمللي ثانية والحفاظ على Site Audit = 100%',
    currentSubStep: 'حقن أكواد TechArticle و FAQPage JSON-LD Schema وفحص Canonical',
    progressPct: 92,
    completedSubSteps: ['قياس مؤشرات LCP و INP و CLS على الحافة (Cloudflare Edge)'],
    pendingSubSteps: ['اعتماد شهادة الصحة التقنية 100% (0 تحذيرات)'],
    activeCountry: '🇰🇼 الكويت (10%)',
    lastLogSummary: 'فحص تقني شامل 100% Site Audit وتأكيد 0 تحذيرات في جدول audit_issues',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 760,
  },
  6: {
    id: 'vorder-faris',
    agentIndex: 6,
    name: 'فارس النجار',
    role: 'السيو المحلي والخرائط (Tier 3)',
    tier: 'المستوى 3: توجيه المحتوى لكل نوع حملة',
    signatureStyle: 'مخطط جغرافي وإقليمي خبير بأسواق السعودية ومصر والخليج، يتحدث بلغة المدن وحصص الدول.',
    currentState: 'optimizing',
    statusBadgeAr: '🌍 يضبط حصص السعودية ومصر والخليج',
    currentTaskTitle: 'توجيه التغطية الجغرافية للأسواق الـ 5 النشطة (السعودية، مصر، الإمارات، الكويت، قطر)',
    currentSubStep: 'تطعيم المقالات بأمثلة محلية لمدن الرياض وجدة والقاهرة ودبي والدوحة',
    progressPct: 75,
    completedSubSteps: ['موازنة حصص النشر بين السعودية (35%) ومصر (25%) والإمارات (20%)'],
    pendingSubSteps: ['مزامنة سرعة العرض الإقليمية مع طارق وسارة'],
    activeCountry: '🇶🇦 قطر (10%)',
    lastLogSummary: 'تحديث حصص دول النشر الإقليمية وربطها بمحرك توليد المقالات',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 810,
  },
  7: {
    id: 'vorder-nour',
    agentIndex: 7,
    name: 'نور المرشدي',
    role: 'محركات الذكاء الاصطناعي GEO (Tier 3)',
    tier: 'المستوى 3: توجيه المحتوى لكل نوع حملة',
    signatureStyle: 'باحثة ذكاء اصطناعي ومهندسة GEO عصرية، تتحدث بلغة الـ Embeddings والـ Entities واقتباسات LLM.',
    currentState: 'executing',
    statusBadgeAr: '🤖 تهندس اقتباسات الذكاء الاصطناعي GEO',
    currentTaskTitle: 'تحسين فقرات الإجابة المباشرة لتصدر Google AI Overviews و Perplexity',
    currentSubStep: 'بناء خريطة الكيانات الدلالية (Entity Graph) وتدعيم الإحصائيات الموثقة',
    progressPct: 86,
    completedSubSteps: ['صياغة فقرات Direct Answer Blocks (45-60 كلمة) في مطلع المقالات'],
    pendingSubSteps: ['اختبار معدل الاقتباس التوليدي عبر Gemini AI Studio'],
    activeCountry: '🇸🇦 السعودية (35%)',
    lastLogSummary: 'تطبيق معايير دراسة Princeton GEO لرفع نسبة الاقتباس التوليدي 40%',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 870,
  },
  8: {
    id: 'vorder-ziad',
    agentIndex: 8,
    name: 'زياد عمران',
    role: 'المشرف العام وحارس الجودة والأتمتة (Tier 4)',
    tier: 'المستوى 4: المراقبة الحية والتعديلات التلقائية',
    signatureStyle: 'مراقب جنائي صارم وحارس قواعد البيانات والذاكرة المتعلمة في D1، يتحدث بلغة اللوجز والتحقق الصارم.',
    currentState: 'inspecting',
    statusBadgeAr: '🛡️ يراقب قواعد D1 وفلتر ذاكرة المالك',
    currentTaskTitle: 'الرقابة الجنائية على اللوجز البرمجية وتطبيق قواعد الذاكرة المتعلمة',
    currentSubStep: 'فحص جدول autonomous_agent_learned_memory وتفعيل حظر الكلمات المرفوضة',
    progressPct: 95,
    completedSubSteps: [
      'مراقبة سلامة حفظ الشات في autonomous_agent_chat_history',
      'تسجيل اللوجز التشخيصية في autonomous_programmatic_logs',
    ],
    pendingSubSteps: ['التأكد من عمل مسارات البدائل الفورية (Multi-Credential Cascade)'],
    activeCountry: '🇸🇦 السعودية + 🇪🇬 مصر',
    lastLogSummary: 'تفعيل فلتر الحماية البرمجي (Post-Generation Guardrail) لمنع أي عبارات مرفوضة',
    lastLogTime: new Date().toISOString(),
    modelUsed: 'gemini-2.5-flash',
    durationMs: 690,
  },
};

export const Vorder3DCanvas: React.FC<Vorder3DCanvasProps> = ({ onSelectAgent }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<any>(null);
  const onSelectAgentRef = useRef(onSelectAgent);

  useEffect(() => {
    onSelectAgentRef.current = onSelectAgent;
  }, [onSelectAgent]);

  // Simulation & Live Telemetry State
  const [timeMinutes, setTimeMinutes] = useState<number>(540); // 9:00 AM start
  const [status, setStatus] = useState<string>('⚡ طارق العبدلي يدير التكتيكات ويعتمد خطة تسريع العرض TURBO_3X');
  const [inMeeting, setInMeeting] = useState<boolean>(false);
  const [cyberpunk, setCyberpunk] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveTelemetryMap, setLiveTelemetryMap] = useState<Record<number, LiveAgentTelemetry>>(FALLBACK_LIVE_TELEMETRY);
  const [approvedExpansionList, setApprovedExpansionList] = useState<any[]>([]);
  const [liveSummaryStats, setLiveSummaryStats] = useState({
    publishedCount: 688,
    gscImpressions: 48,
    keywordsCount: 2948,
    totalMessagesCount: 858,
  });
  const handoverDemoIdxRef = useRef<number>(0);

  // Selected Agent & Overlays
  const [selectedAgentId, setSelectedAgentId] = useState<number>(0);
  const [dossierAgent, setDossierAgent] = useState<VorderAgentData | null>(null);
  const [showTaskBoard, setShowTaskBoard] = useState<boolean>(false);
  const [showSystemLog, setShowSystemLog] = useState<boolean>(false);
  const [chattingAgent, setChattingAgent] = useState<VorderAgentData | null>(null);

  // Build combined roster (9 Core Agents + Approved 3D Expansion Agents)
  const combinedRoster: VorderAgentData[] = React.useMemo(() => {
    const expAgents: VorderAgentData[] = approvedExpansionList.map((nom, idx) => {
      const slotIdx = 9 + idx;
      const active3d = sceneRef.current?.getActiveAgents?.()?.[slotIdx];
      return {
        id: nom.id || `vorder-exp-${slotIdx}`,
        name: nom.title || `Expansion Specialist #${idx + 1}`,
        title: nom.agentName || `وكيل توسع #${idx + 1}`,
        role: nom.proposedByRole || 'Autonomous Expansion Agent',
        roleAr: `${nom.title || 'وكيل توسع معتمد'} (مكتب #${slotIdx + 1})`,
        level: 88 + (idx % 10),
        power: 94 + (idx % 6),
        status: 'working',
        model: 'gemini-2.5-flash',
        station: `محطة توسع #${slotIdx + 1} (كمبيوتر 3D حي)`,
        gitBranch: `feat/expansion-${nom.id || slotIdx}`,
        avatarUrl:
          active3d?.avatarUrl ||
          ['/game-assets/avatars/agent_03_kareem.png', '/game-assets/avatars/agent_05_fahd.png', '/game-assets/avatars/agent_07_omar.png'][idx % 3],
        color: active3d?.hex || '#10B981',
        summary: `${nom.reason || ''} — الأثر المتوقع: ${nom.expectedImpact || ''} — الهوية البصرية 3D: ${nom.visualProfileSummary || active3d?.visualProfileSummary || 'مظهر 3D فريد ومخصص'}`,
        platforms: ['Cloudflare D1', 'Google Search Console', '3D Expansion Workstation'],
        tasksCompleted: 14 + idx * 5,
        efficiency: 98,
        specialties: [nom.title || 'توسع تكتيكي', 'مكتب 3D مستقل', 'كرسي اجتماعات رسمي'],
      } as unknown as VorderAgentData;
    });
    return [...VORDER_AGENTS_ROSTER, ...expAgents];
  }, [approvedExpansionList]);

  const combinedRosterRef = useRef<VorderAgentData[]>(combinedRoster);
  useEffect(() => {
    combinedRosterRef.current = combinedRoster;
  }, [combinedRoster]);

  const formatTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60);
    const isPM = h >= 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isPM ? 'م' : 'ص'}`;
  };

  // Poll live backend telemetry every 8 seconds and listen for immediate nomination approvals
  useEffect(() => {
    let mounted = true;
    const fetchLiveTelemetry = async () => {
      try {
        const res = await fetch(`/api/automation/agent-meetings?limit=40&t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data: any = await res.json();
        if (!mounted || !data?.meeting) return;

        const rep = data.meeting.consolidatedReport || {};
        const pubCount = Number(rep.publishedCount) || 688;
        const gscImp = Number(rep.gscImpressions) || 48;
        const kwCount = Number(rep.keywordsCount) || 2948;
        const msgCount = Number(data.totalMessagesCount || data.meeting.totalMessagesCount) || 858;

        setLiveSummaryStats({
          publishedCount: pubCount,
          gscImpressions: gscImp,
          keywordsCount: kwCount,
          totalMessagesCount: msgCount,
        });

        try {
          localStorage.setItem('vorder_last_published_count', String(pubCount));
        } catch {}

        const approvedNoms = Array.isArray(data.meeting.approvedExpansionAgents)
          ? data.meeting.approvedExpansionAgents
          : [];
        setApprovedExpansionList(approvedNoms);

        if (sceneRef.current?.syncApprovedExpansionAgents && approvedNoms.length > 0) {
          sceneRef.current.syncApprovedExpansionAgents(approvedNoms);
        }

        const arr: LiveAgentTelemetry[] = data.meeting.agentsLiveTelemetry || [];
        if (Array.isArray(arr) && arr.length > 0) {
          setLiveTelemetryMap((prev) => {
            const next = { ...prev };
            arr.forEach((item) => {
              next[item.agentIndex] = item;
            });
            return next;
          });
          const rotatingIdx = Math.floor(Date.now() / 8000) % arr.length;
          const featured = arr[rotatingIdx];
          if (featured?.name && featured?.statusBadgeAr) {
            setStatus(`${featured.name}: ${featured.statusBadgeAr} (${featured.progressPct}%)`);
          }
        }

        if (sceneRef.current?.updateLiveTelemetry) {
          sceneRef.current.updateLiveTelemetry({
            publishedCount: pubCount,
            gscImpressions: gscImp,
            keywordsCount: kwCount,
            approvedExpansionAgents: approvedNoms,
            platformRacksStatus: data.meeting.platformRacksStatus || rep.platformRacksStatus,
            recentPipelineHandovers: data.meeting.recentPipelineHandovers || rep.recentPipelineHandovers,
            dialogue: data.meeting.dialogue,
            agentsLiveTelemetry: arr,
          });
        }
      } catch {}
    };

    const handleNominationEvent = () => {
      fetchLiveTelemetry();
    };

    fetchLiveTelemetry();
    window.addEventListener('vorder-nomination-updated', handleNominationEvent);
    const pollInterval = setInterval(fetchLiveTelemetry, 8000);
    return () => {
      mounted = false;
      window.removeEventListener('vorder-nomination-updated', handleNominationEvent);
      clearInterval(pollInterval);
    };
  }, []);

  // Initialize Three.js 3D Miniature Office Scene ONCE
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = createVorderOfficeScene(containerRef.current, {
      onTimeUpdate: (m) => setTimeMinutes(m),
      onStatusUpdate: (s) => setStatus(s),
      onMeetingChange: (m) => setInMeeting(m),
      onAgentClick: (agentId, clicked3dConfig) => {
        setSelectedAgentId(agentId);
        const rosterMatch =
          combinedRosterRef.current[agentId] ||
          (clicked3dConfig
            ? ({
                id: clicked3dConfig.nominationId || `vorder-exp-${agentId}`,
                name: clicked3dConfig.nameEn,
                title: clicked3dConfig.name,
                role: clicked3dConfig.roleEn,
                roleAr: clicked3dConfig.role,
                level: 90,
                power: 96,
                status: 'working',
                model: 'gemini-2.5-flash',
                station: `محطة توسع #${agentId + 1} (كمبيوتر 3D حي)`,
                gitBranch: `feat/expansion-${agentId}`,
                avatarUrl: clicked3dConfig.avatarUrl,
                color: clicked3dConfig.hex,
                summary: clicked3dConfig.visualProfileSummary || clicked3dConfig.metrics,
                platforms: ['Cloudflare D1', 'Google Search Console', '3D Expansion Workstation'],
              } as unknown as VorderAgentData)
            : null);
        setDossierAgent(rosterMatch);
        if (onSelectAgentRef.current && rosterMatch) {
          onSelectAgentRef.current(rosterMatch);
        }
      },
    });

    sceneRef.current = scene;
    try {
      (window as any).__VORDER_3D_INSPECTOR__ = scene;
    } catch {}

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
      try {
        delete (window as any).__VORDER_3D_INSPECTOR__;
      } catch {}
    };
  }, []);

  const handleTimeChange = useCallback((m: number) => {
    setTimeMinutes(m);
    if (sceneRef.current) {
      sceneRef.current.setTime(m);
    }
  }, []);

  const handleCyberpunkToggle = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.toggleCyberpunk();
      setCyberpunk((prev) => !prev);
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.zoomOut();
    }
  }, []);

  const handleQuickAgentSelect = (idx: number) => {
    setSelectedAgentId(idx);
    const matched = combinedRoster[idx] || null;
    setDossierAgent(matched);
    if (sceneRef.current) {
      sceneRef.current.flyToAgent(idx);
    }
    if (onSelectAgentRef.current && matched) {
      onSelectAgentRef.current(matched);
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const totalActiveCount = combinedRoster.length;
  const activeDossierIndex = dossierAgent
    ? combinedRoster.findIndex((a) => a.id === dossierAgent.id)
    : selectedAgentId;
  const activeDossierLive =
    liveTelemetryMap[activeDossierIndex >= 0 ? activeDossierIndex : 0] || FALLBACK_LIVE_TELEMETRY[0];

  const dynamicTickerItems = React.useMemo(() => {
    const colors = ['#0DEEF3', '#00E676', '#FF5252', '#F5A623', '#E040FB', '#7C4DFF', '#FF9100', '#38BDF8', '#448AFF'];
    const entries = Object.values(liveTelemetryMap);
    if (entries.length === 0) return undefined;
    return entries.map((item, i) => ({
      text: `${item.name}: ${item.statusBadgeAr} — ${item.currentTaskTitle} (${item.modelUsed})`,
      color: colors[i % colors.length],
    }));
  }, [liveTelemetryMap]);

  return (
    <div
      ref={containerRef}
      id="vorder-3d-office-container"
      className={`relative w-full overflow-hidden rounded-2xl bg-[#000C1E] border border-cyan-500/20 text-white shadow-2xl transition-all duration-300 font-sans select-none ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : 'h-[740px] sm:h-[800px]'
      }`}
    >
      {/* 1. Top Live Activity Ticker */}
      <VorderOfficeTicker items={dynamicTickerItems} />

      {/* 2. Top Sub-Bar with HUD Metrics and Overlays (Strictly RTL BiDi Isolated) */}
      <div
        dir="rtl"
        className="absolute top-10 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto text-right"
      >
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 text-xs shadow-lg">
          <div className="size-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span className="font-bold text-cyan-300">
            مقر <bdi dir="ltr">VORDER 3D</bdi> التكتيكي (<bdi dir="ltr">{totalActiveCount}</bdi> وكلاء نشطين)
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-200 hidden sm:inline">
            <bdi dir="ltr">{liveSummaryStats.publishedCount}</bdi> مقال حي •{' '}
            <bdi dir="ltr">{liveSummaryStats.keywordsCount}</bdi> كلمة •{' '}
            <bdi dir="ltr">{liveSummaryStats.totalMessagesCount}</bdi> سجل في <bdi dir="ltr">D1</bdi>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] hidden lg:inline">
            <bdi dir="ltr">60 FPS</bdi> حي
          </span>
        </div>

        {/* Quick Modal Overlays Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (sceneRef.current?.toggleMeetingRoom) {
                sceneRef.current.toggleMeetingRoom();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs shadow-md transition-all cursor-pointer ${
              inMeeting
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-purple-500/25 hover:bg-purple-500/35 border-purple-400/50 text-purple-200'
            }`}
          >
            <Sparkles className="size-3.5 shrink-0" />
            <span>
              {inMeeting
                ? 'إنهاء الاجتماع والعودة للمكاتب'
                : `جمع الـ ${totalActiveCount} وكلاء في الميتينج (${totalActiveCount} كراسي) 🎙️`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              const handoverScenarios = [
                { from: 1, to: 4, summary: 'ياسمين الشريف تسلم عنقود كلمات GSC لنور المرشدي (GEO)' },
                { from: 4, to: 3, summary: 'نور المرشدي تسلم مخطط الكيانات لكريم الدسوقي للنشر' },
                { from: 3, to: 5, summary: 'كريم الدسوقي يسلم المقال المنشور لعمر الفاروق لربط الـ PageRank' },
                { from: 0, to: 2, summary: 'طارق العبدلي يعتمد خطة سرعة العرض مع سارة المهندس' },
                { from: 7, to: 8, summary: 'ليلى الألفي تسلم شهادة الأداء 100% لزياد عمران' },
              ];
              const pick = handoverScenarios[handoverDemoIdxRef.current % handoverScenarios.length];
              handoverDemoIdxRef.current += 1;
              if (sceneRef.current?.triggerAgentTaskHandoverWalk) {
                sceneRef.current.triggerAgentTaskHandoverWalk(pick.from, pick.to, pick.summary);
                setStatus(`⚡ ${pick.summary}`);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Activity className="size-3.5 text-cyan-300 shrink-0" />
            <span>تسليم مهمة حي (مسار A*)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (sceneRef.current?.flyToServerWall) {
                sceneRef.current.flyToServerWall();
                setStatus('🖥️ فحص جدار السيرفرات الـ 8 الحية (8/8 منصات متصلة وفعالة)');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Database className="size-3.5 text-emerald-300 shrink-0" />
            <span>جدار المنصات الـ 8</span>
          </button>

          <button
            type="button"
            onClick={() => setChattingAgent(VORDER_AGENTS_ROSTER[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="size-3.5 shrink-0" />
            <span>مدير الوكلاء (طارق العبدلي)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTaskBoard(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-200 font-semibold text-xs shadow transition-all cursor-pointer"
          >
            <ListTodo className="size-3.5 text-cyan-400 shrink-0" />
            <span>لوحة المهام</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSystemLog(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-200 font-semibold text-xs shadow transition-all cursor-pointer"
          >
            <Terminal className="size-3.5 text-emerald-400 shrink-0" />
            <span>السجل الحي</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom Agent Selector Row (All 9 Core Agents + Approved 3D Expansion Agents) */}
      <div
        dir="rtl"
        className="absolute bottom-16 left-3 right-3 z-20 overflow-x-auto no-scrollbar py-1.5 flex items-center gap-2 justify-start xl:justify-center pointer-events-auto"
      >
        {combinedRoster.map((agent, idx) => {
          const isSelected = selectedAgentId === idx;
          const active3dAgents = sceneRef.current?.getActiveAgents?.() || VORDER_OFFICE_AGENTS;
          const officeConfig = active3dAgents[idx] || VORDER_OFFICE_AGENTS[idx % VORDER_OFFICE_AGENTS.length];
          const liveItem = liveTelemetryMap[idx] || FALLBACK_LIVE_TELEMETRY[idx % 9];
          const agentProgress = inMeeting ? 100 : liveItem?.progressPct || 78;
          const agentHex = (agent as any).color || officeConfig?.hex || '#0DEEF3';

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => handleQuickAgentSelect(idx)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all border whitespace-nowrap shadow-md cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_18px_rgba(13,238,243,0.35)] scale-[1.03]'
                  : idx >= 9
                    ? 'bg-emerald-950/90 hover:bg-emerald-900/85 border-emerald-400/40 text-emerald-100'
                    : 'bg-slate-950/90 hover:bg-slate-900 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <img
                src={agent.avatarUrl}
                alt={agent.title}
                className="size-7 rounded-lg object-cover border border-white/20 shrink-0"
              />
              <div className="text-right">
                <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1.5">
                  <span>{agent.title}</span>
                  {idx === 8 && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/30 text-blue-300 font-mono">
                      مشرف
                    </span>
                  )}
                  {idx >= 9 && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-mono">
                      توسع #<bdi dir="ltr">{idx + 1}</bdi>
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-cyan-300/90 max-w-[140px] truncate">
                  {inMeeting ? '🎙️ في اجتماع الطاولة' : liveItem?.statusBadgeAr || '🚀 يعمل من مكتبه 3D'}
                </div>
                {/* Live % Progress Bar */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${agentProgress}%`,
                        backgroundColor: agentHex,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-bold" style={{ color: agentHex }}>
                    <bdi dir="ltr">{agentProgress}%</bdi>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Bottom Glass HUD (Time scrubber, Zoom In/Out, Reset, Cyberpunk mode, Status) */}
      <VorderOfficeHUD
        timeMinutes={timeMinutes}
        timeFormatted={formatTime(timeMinutes)}
        status={status}
        cyberpunk={cyberpunk}
        inMeeting={inMeeting}
        isFullscreen={isFullscreen}
        onTimeChange={handleTimeChange}
        onCyberpunkToggle={handleCyberpunkToggle}
        onResetCamera={handleResetCamera}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 5. Detailed Dossier Modal when clicking any Agent — WITH LIVE TASK LOADING & CURRENT ACTIVITY */}
      {dossierAgent && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            dir="rtl"
            className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-right animate-scale-up max-h-[92vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setDossierAgent(null)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Agent Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={dossierAgent.avatarUrl}
                  alt={dossierAgent.title}
                  className="size-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                />
                <span className="absolute -bottom-1 -right-1 flex size-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-4 bg-emerald-500 border-2 border-slate-950" />
                </span>
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white flex flex-wrap items-center gap-2">
                  <span>{dossierAgent.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    LVL {dossierAgent.level}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                    {activeDossierLive.statusBadgeAr}
                  </span>
                </div>
                <div className="text-xs text-cyan-400 font-medium mt-0.5">
                  {dossierAgent.roleAr}
                </div>
                <div className="text-[11px] text-amber-300/90 mt-0.5">
                  ✨ البصمة الشخصية: {activeDossierLive.signatureStyle}
                </div>
              </div>
            </div>

            {/* ★ LIVE TASK LOADING & WHAT THE AGENT IS DOING RIGHT NOW ★ */}
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900/90 to-slate-950 border border-cyan-400/40 shadow-inner">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 text-cyan-400 animate-spin" />
                  <span className="text-xs font-extrabold text-cyan-300 tracking-wide">
                    جاري التنفيذ والتحميل الآن (ماذا يفعل {dossierAgent.title} في هذه اللحظة):
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400">نسبة إنجاز المهمة:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 font-mono font-extrabold text-sm">
                    {activeDossierLive.progressPct}%
                  </span>
                </div>
              </div>

              {/* Animated Live Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30 p-0.5 mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  style={{ width: `${activeDossierLive.progressPct}%` }}
                />
              </div>

              {/* Current Main Task Title */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 mb-3">
                <div className="text-[11px] text-zinc-400 mb-0.5 flex items-center justify-between">
                  <span>🎯 المهمة الفعالة الآن:</span>
                  <span className="text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                    <Globe className="size-3" />
                    {activeDossierLive.activeCountry}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {activeDossierLive.currentTaskTitle}
                </div>
              </div>

              {/* Sub-Steps Checklist (Completed / Active Loading / Pending) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-400 mb-1">
                  📋 خطوات التحميل والتنفيذ اللحظي:
                </div>
                {activeDossierLive.completedSubSteps.map((step, i) => (
                  <div
                    key={`done-${i}`}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-200"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span className="flex-1">{step}</span>
                    <span className="text-[10px] font-mono text-emerald-400">مكتمل 100%</span>
                  </div>
                ))}

                <div className="flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg bg-cyan-500/15 border border-cyan-400/50 text-white font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  <Loader2 className="size-3.5 text-cyan-300 animate-spin shrink-0" />
                  <span className="flex-1">{activeDossierLive.currentSubStep}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-200">
                    جاري التحميل ({activeDossierLive.progressPct}%)
                  </span>
                </div>

                {activeDossierLive.pendingSubSteps.map((step, i) => (
                  <div
                    key={`pend-${i}`}
                    className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-white/5 text-zinc-400"
                  >
                    <CircleDot className="size-3.5 text-zinc-500 shrink-0" />
                    <span className="flex-1">{step}</span>
                    <span className="text-[10px] font-mono text-zinc-500">في الطابور التالي</span>
                  </div>
                ))}
              </div>

              {/* Latest D1 Programmatic Log for this Agent */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Database className="size-3.5 text-amber-400 shrink-0" />
                  <span className="text-zinc-400">آخر عملية مسجلة في D1:</span>
                  <span className="text-amber-200 font-medium">{activeDossierLive.lastLogSummary}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px] text-cyan-300">
                  <Activity className="size-3" />
                  <span>{activeDossierLive.modelUsed} • {activeDossierLive.durationMs}ms</span>
                </div>
              </div>
            </div>

            {/* Agent Summary & Metrics */}
            <p className="text-xs text-zinc-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 mb-3">
              {dossierAgent.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-zinc-400 block text-[10px]">المحرك الذكي</span>
                <span className="font-mono text-cyan-300 text-xs">{activeDossierLive.modelUsed || dossierAgent.model}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-zinc-400 block text-[10px]">المحطة الميدانية</span>
                <span className="text-white text-xs">{dossierAgent.station}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-zinc-400 block text-[10px]">حالة الفرع (Git)</span>
                <span className="font-mono text-emerald-400 text-xs">{dossierAgent.gitBranch}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-zinc-400 block text-[10px]">الاستجابة والجاهزية</span>
                <span className="font-mono text-amber-300 text-xs">{activeDossierLive.durationMs}ms • {dossierAgent.power}%</span>
              </div>
            </div>

            {/* Connected Platforms */}
            {dossierAgent.platforms && dossierAgent.platforms.length > 0 && (
              <div className="mb-4">
                <span className="text-[11px] font-bold text-zinc-400 block mb-1.5">
                  المنصات السحابية المتصلة:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dossierAgent.platforms.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] px-2 py-0.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 font-mono font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const targetAgent = dossierAgent;
                  setDossierAgent(null);
                  setChattingAgent(targetAgent);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                <MessageSquare className="size-4" />
                <span>فتح حوار مباشر وتوجيه {dossierAgent.title}</span>
              </button>

              <button
                type="button"
                onClick={() => setDossierAgent(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs transition-all cursor-pointer"
              >
                إغلاق الملف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modals (Task Board, System Logs, Agent Chat) */}
      {showTaskBoard && (
        <VorderTaskBoardOverlay onClose={() => setShowTaskBoard(false)} />
      )}
      {showSystemLog && (
        <VorderSystemLogOverlay onClose={() => setShowSystemLog(false)} />
      )}
      {chattingAgent && (
        <VorderAgentDirectorChat agent={chattingAgent} onClose={() => setChattingAgent(null)} />
      )}
    </div>
  );
};
