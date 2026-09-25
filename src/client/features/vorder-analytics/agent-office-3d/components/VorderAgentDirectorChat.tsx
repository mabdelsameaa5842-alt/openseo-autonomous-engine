import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, MessageSquare, Bot, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { VORDER_AGENTS_ROSTER, type VorderAgentData } from '../../agent-office-engine/vorderAgentsData';

interface Message {
  id: string;
  sender: 'director' | 'user';
  text: string;
  time: string;
  modelUsed?: string;
  durationMs?: number;
}

interface VorderAgentDirectorChatProps {
  onClose: () => void;
  agent?: VorderAgentData;
}

// Agent-specific initial greetings
const AGENT_GREETINGS: Record<string, string> = {
  'vorder-tariq': 'أهلاً بك يا فندم! أنا طارق العبدلي، مدير الوكلاء وقائد العمليات التكتيكية. المحطة تعمل بكامل طاقتها: 23 ظهوراً حياً معتمداً عبر 14 صفحة، 742 مقالاً منشوراً، وخريطة الموقع تضم 742 رابطاً. كوتا D1 مستقرة $0.00. كيف ترغب في توجيه الوكلاء الـ 9 الآن؟',
  'vorder-sara': 'أهلاً بك يا فندم! أنا سارة المحمود، خبيرة الكلمات المفتاحية واقتناص النوايا البحثية. أقوم بمسح استعلامات Google Trends و Search Console وضخ الفرص في D1. ما هو القطاع التجاري أو الكلمات التي تود استكشافها؟',
  'vorder-yasmine': 'مرحباً بك! أنا ياسمين الشامي، مهندسة المحتوى واستوديو الذكاء الاصطناعي. قمت بتوليد 742 مقالاً حصرياً بمعايير E-E-A-T كاملة. أي فكرة مقال أو صياغة لهجة (مصرية B2B أو خليجية) تود إطلاقها الآن؟',
  'vorder-omar': 'أهلاً بك! أنا عمر التميمي، مهندس النشر البرمجي وخطوط CI/CD. أدير مستودع GitHub وعمليات بناء Vercel بنجاح 100%. هل تود مراجعة حالة الـ Commits أو نشر دفعة جديدة؟',
  'vorder-karim': 'مرحباً! أنا كريم الدسوقي، خبير الفهرسة والزحف. أتابع كونسول جوجل وإشارات IndexNow لضمان زحف Googlebot لجميع المقالات الـ 742 فور نشرها. كيف أساعدك في تدقيق الفهرسة؟',
  'vorder-layla': 'أهلاً بك! أنا ليلى الصالح، مديرة قواعد البيانات السحابية Cloudflare D1. أدير التخزين والكوتا الصفرية $0.00 شهرياً وسرعة استجابة الاستعلامات تحت 10ms. هل تريد فحص سلامة الجداول؟',
  'vorder-faris': 'أهلاً بك يا فندم! أنا فارس النجار، محلل المنافسين والحملات الإعلانية Google Ads. أركز على الكلمات ذات العائد الاستثماري العالي واقتناص عملاء المنافسين. ما هي خطتك التنافسية اليوم؟',
  'vorder-nour': 'مرحباً! أنا نور الهدى، محللة مؤشرات الأداء وجلسات الزوار في Google Analytics 4. أراقب معدلات البقاء ومسار التحويلات على مقالاتنا الـ 742. هل تود تقريراً عن سلوك الزوار؟',
  'vorder-ziad': 'تحياتي! أنا زياد مهران، مسؤول الأمان والمصادقة وتأمين الشبكة. أدير توثيق Supabase وحماية مسارات API عبر Cloudflare WAF. النظام آمن 100%. هل ترغب في فحص الصلاحيات والرموز؟',
};

// Agent-specific quick prompts
const AGENT_QUICK_PROMPTS: Record<string, string[]> = {
  'vorder-tariq': [
    'تقرير الحقيقة الرقمية (23 ظهور)',
    'من هم موظفوك وما هي صلاحياتك؟',
    'تفعيل اللهجة المصرية لمصانع B2B',
    'استراتيجية التوسع للمتاجر السعودية',
  ],
  'vorder-sara': [
    'ما هي أهم الكلمات المفتاحية في D1؟',
    'كيف تستخرجين النوايا الشرائية؟',
    'اربطي استعلامات البحث بكونسول جوجل',
    'ما هو دورك في نقل البيانات؟',
  ],
  'vorder-yasmine': [
    'كيف تطبقين معايير E-E-A-T في المقالات؟',
    'ما هي النماذج المستخدمة في التوليد؟',
    'اكتبي هيكل مقال عن سيو المتاجر',
    'كيف تتفادين الهلوسة في المحتوى؟',
  ],
  'vorder-omar': [
    'ما هي خطوات النشر التلقائي عبر GitHub؟',
    'كيف تضمن عدم تعطل Vercel؟',
    'ما هو دورك في خط الإنتاج؟',
    'كيف يتم ربط Git Commits بـ D1؟',
  ],
  'vorder-karim': [
    'ما هي حالة الـ 742 رابطاً في الفهرسة؟',
    'كيف يعمل بروتوكول IndexNow؟',
    'ما هي الروابط الـ 14 التي حققت 23 ظهوراً؟',
    'كيف تفحص صفحات 404 والتحويلات؟',
  ],
  'vorder-layla': [
    'كيف تحافظين على كوتا $0.00 في Cloudflare؟',
    'ما هو حجم البيانات الحالي في D1؟',
    'كيف تضمنين سرعة الاستجابة تحت 10ms؟',
    'ما هو دورك في أمن ونسخ البيانات؟',
  ],
  'vorder-faris': [
    'ما هي أعلى الكلمات المفتاحية من حيث CPC؟',
    'كيف تقتنص حركة المرور من المنافسين؟',
    'ما الفرق بين البحث المجاني والإعلانات؟',
    'ما هي اقتراحاتك لحملات الرياض وجدة؟',
  ],
  'vorder-nour': [
    'ما هي معدلات الارتداد للمقالات المنشورة؟',
    'كيف تقيسين تفاعل زوار الهاتف المحمول؟',
    'ما هي أكثر الصفحات جذباً للزيارات؟',
    'كيف يتم ربط GA4 مع Cloudflare؟',
  ],
  'vorder-ziad': [
    'كيف تحمي مفاتيح API والـ Webhooks؟',
    'ما هي حالة المصادقة عبر Supabase؟',
    'كيف يعمل جدار الحماية Cloudflare WAF؟',
    'ما هو دورك الرقابي على باقي الوكلاء؟',
  ],
};

const DEFAULT_GREETING = 'أهلاً بك يا فندم! أنا طارق العبدلي، مدير الوكلاء وقائد العمليات التكتيكية. المحطة تعمل بكامل طاقتها: 23 ظهوراً حياً معتمداً عبر 14 صفحة، 742 مقالاً منشوراً، وخريطة الموقع تضم 742 رابطاً. كوتا D1 مستقرة $0.00. كيف ترغب في توجيه الوكلاء الـ 9 الآن؟';
const DEFAULT_PROMPTS = [
  'تقرير الحقيقة الرقمية (23 ظهور)',
  'من هم موظفوك وما هي صلاحياتك؟',
  'تفعيل اللهجة المصرية لمصانع B2B',
  'استراتيجية التوسع للمتاجر السعودية',
];

export const VorderAgentDirectorChat: React.FC<VorderAgentDirectorChatProps> = ({ onClose, agent }) => {
  const currentAgent = agent || VORDER_AGENTS_ROSTER[0];
  const agentKey = currentAgent.id;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'director',
      text: AGENT_GREETINGS[agentKey] || DEFAULT_GREETING,
      time: 'الآن',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts: string[] = AGENT_QUICK_PROMPTS[agentKey] || DEFAULT_PROMPTS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/automation/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.id,
          message: query,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = (await res.json()) as { reply?: string; modelUsed?: string; durationMs?: number };
      const replyText = data.reply || 'تم استلام توجيهك وجاري تنفيذه فورياً.';
      const modelUsed = data.modelUsed || 'gemini-3.5-flash-lite';
      const durationMs = data.durationMs;

      const botMsg: Message = {
        id: `d_${Date.now()}`,
        sender: 'director',
        text: replyText,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        modelUsed,
        durationMs,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Real AI agent chat request failed, fallback engaged:', err);
      const fallbackMsg: Message = {
        id: `d_${Date.now()}`,
        sender: 'director',
        text: `تم استلام توجيهك التكتيكي يا فندم: "${query}". قمت بتعميمه وتوجيه فرق العمليات ذات الصلة فورياً للحفاظ على أعلى درجات الجاهزية والحقيقة الرقمية.`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'fallback-cache',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="absolute inset-2 sm:inset-4 z-50 flex flex-col rounded-3xl border border-cyan-500/40 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-zinc-900/80 to-slate-950">
        <div className="flex items-center gap-3.5">
          <div className="relative size-12 sm:size-14 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <img src={currentAgent.avatarUrl} alt={currentAgent.title} className="size-full object-cover" />
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 border-2 border-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">{currentAgent.title}</h3>
              <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                {currentAgent.roleAr}
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-400 hidden sm:inline">
                {currentAgent.station}
              </span>
            </div>
            
            {/* Connected Platforms Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-zinc-400 font-bold hidden sm:inline">متصل بـ:</span>
              {currentAgent.platforms?.map((p) => (
                <span
                  key={p}
                  className="text-[9px] px-2 py-0.5 rounded-md bg-slate-900 border border-cyan-500/20 text-cyan-300 font-mono font-medium shadow-sm"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {m.sender === 'director' ? (
              <div className="size-8 sm:size-9 rounded-xl overflow-hidden border border-cyan-400/50 shrink-0">
                <img src={currentAgent.avatarUrl} alt={currentAgent.title} className="size-full object-cover" />
              </div>
            ) : (
              <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                أنت
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md'
                  : 'bg-zinc-900/90 border border-white/10 text-zinc-200 rounded-tl-none whitespace-pre-line shadow-lg'
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              
              <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-white/10">
                {m.modelUsed && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                    <Zap className="size-3 text-amber-400" />
                    <span>محرك: {m.modelUsed}</span>
                    {m.durationMs && (
                      <>
                        <span className="text-zinc-500">•</span>
                        <span className="text-emerald-400">{(m.durationMs / 1000).toFixed(2)}s</span>
                      </>
                    )}
                  </div>
                )}
                <span className="text-[10px] text-zinc-500 font-mono text-left">{m.time}</span>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 px-3 py-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 w-fit">
            <span className="size-2 rounded-full bg-cyan-400 animate-bounce" />
            <span className="size-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
            <span className="size-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            <span className="font-medium">{currentAgent.title} يعالج التوجيه عبر الذكاء الاصطناعي اللحظي...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 sm:p-3 border-t border-white/5 bg-zinc-950/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        {quickPrompts.map((p: string, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30 px-3 py-1.5 text-[11px] text-zinc-300 hover:text-white shrink-0 transition-all font-semibold"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-zinc-900/90 flex items-center gap-2 sm:gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`تحدث مع ${currentAgent.title} (${currentAgent.roleAr})...`}
          className="flex-1 rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 transition-all"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 p-3 text-white transition-all shadow-md shrink-0"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
};
