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

// Agent-specific initial greetings (Spontaneous Egyptian Arabic)
const AGENT_GREETINGS: Record<string, string> = {
  'vorder-tariq': 'منور يا ريس! أنا طارق العبدلي، مدير الوكلاء الـ 9 وقائد الأوركسترا هنا. كل المنصات قدامي ع الرادار.. قولي تحب نوجه التيم على إيه دلوقتي؟',
  'vorder-sara': 'أهلاً بيك يا فندم! أنا سارة المحمود، عيني على Google Search Console والتريندات لحظة بلحظة عشان نلقط الكلمات اللي بتجيب عملاء بجد. تحب نركز على أنهي نيتش أو كلمات النهاردة؟',
  'vorder-yasmine': 'يا هلا بيك! أنا ياسمين الشامي، مسؤولة المحتوى واستوديو Gemini AI. بنطلع مقالات متكاملة بمعايير E-E-A-T تشد القارئ وتتصدر في جوجل. إيه الموضوع أو الزاوية اللي حابب نشتغل عليها؟',
  'vorder-omar': 'أهلاً يا باشمهندس! أنا عمر التميمي، ماسك خط الـ CI/CD والـ Commits على GitHub والبلدات على Vercel. السيرفرات تمام والـ Build أخضر، تحب نراجع آخر التحديثات ولا نعمل Deploy جديد؟',
  'vorder-karim': 'منور يا فندم! أنا كريم الدسوقي، بتابع عناكب جوجل والـ Sitemap وإشارات IndexNow عشان مفيش رابط يفلت من الأرشفة. تحب نفحص حالة الفهرسة والروابط دلوقتي؟',
  'vorder-layla': 'أهلاً بيك! أنا ليلى الصالح، مسؤولة قواعد بيانات Cloudflare D1 والكاش على الـ Edge. الاستعلامات عندنا بترد في أقل من 10ms وكله متأمن. تحب نراجع الجداول أو أداء الداتابيز؟',
  'vorder-faris': 'مساء الفل يا ريس! أنا فارس النجار، ماسك Google Ads وتحليل المنافسين. بنشوف المنافسين بيدفعوا فين وبنخطف الترافيك بأعلى عائد ROI. إيه خطتنا التنافسية النهاردة؟',
  'vorder-nour': 'أهلاً بحضرتك! أنا نور الهدى، بتابع سلوك الزوار والتحويلات جوه Google Analytics 4 لحظة بلحظة. تحب نشوف أكتر صفحات بتجيب تفاعل والناس بتقعد فيها قد إيه؟',
  'vorder-ziad': 'تمام يا فندم! أنا زياد مهران، مسؤول التأمين وجدار حماية Cloudflare WAF وتوثيق Supabase. كل التوكنات والمسارات متأمنة 100%. تحب نعمل فحص أمني سريع على الصلاحيات؟',
};

// Agent-specific quick prompts
const AGENT_QUICK_PROMPTS: Record<string, string[]> = {
  'vorder-tariq': [
    'إيه الأخبار عندك يا طارق في الـ 8 منصات؟',
    'عرفني بتيم الوكلاء الـ 9 وكل واحد ماسك إيه',
    'إيه خطتنا عشان نضاعف الزيارات الأسبوع ده؟',
    'راجعلي حالة الربط في كل المنصات دلوقتي',
  ],
  'vorder-sara': [
    'إيه أقوى الكلمات المفتاحية اللي عليها فرصة دلوقتي؟',
    'إزاي بنطلع الكلمات اللي فيها نية شراء عالية؟',
    'قوليلي وضعنا إيه في Google Search Console؟',
    'إزاي بتنسقي مع ياسمين وفارس في الكلمات؟',
  ],
  'vorder-yasmine': [
    'إزاي بتكتبي مقالات تتصدر في جوجل بمعايير E-E-A-T؟',
    'إيه الموديلات اللي شغالة معاكي في Gemini AI Studio؟',
    'اقترحي عليا خطة محتوى تقيلة للأسبوع ده',
    'إزاي بتتأكدي إن المقالات مفيهاش أي حشو أو هلوسة؟',
  ],
  'vorder-omar': [
    'إيه حالة الـ Builds والنشر على GitHub و Vercel؟',
    'إزاي خط النشر الأوتوماتيكي شغال مع باقي التيم؟',
    'إزاي بتضمن إن الموقع يفضل سريع وميقعش أبداً؟',
    'قولي آخر التحديثات البرمجية اللي تمت في السيستم',
  ],
  'vorder-karim': [
    'إيه أخبار أرشفة الصفحات والـ Sitemap في جوجل؟',
    'إزاي بتسرع دخول عناكب جوجل للمقالات الجديدة؟',
    'فيه أي صفحات فيها مشاكل أرشفة أو 404؟',
    'إزاي بتشتغل مع عمر وليلى عشان نضمن سرعة الزحف؟',
  ],
  'vorder-layla': [
    'إيه حالة قاعدة بيانات Cloudflare D1 والكوتا دلوقتي؟',
    'إزاي مخلية سرعة الاستعلامات أقل من 10ms؟',
    'احكيلي البيانات بتتحفظ وتتقسم إزاي في الجداول؟',
    'إزاي بتنسقي مع زياد عشان تأمين الداتابيز؟',
  ],
  'vorder-faris': [
    'إيه أغلى وأقوى الكلمات في Google Ads دلوقتي؟',
    'إزاي نخطف الترافيك من المنافسين بأقل تكلفة؟',
    'إيه رأيك ندمج خطة الإعلانات مع السيو الأورجانيك إزاي؟',
    'إيه حالة ربط حساب Google Ads والـ Developer Token؟',
  ],
  'vorder-nour': [
    'إيه أخبار تفاعل الزوار والـ Bounce Rate في GA4؟',
    'أنهي صفحات جايبة أعلى قراءة وتحويلات؟',
    'الزوار جايين أكتر من الموبايل ولا الديسكتوب؟',
    'إزاي بتبلغي ياسمين وسارة بالصفحات اللي محتاجة تحسين؟',
  ],
  'vorder-ziad': [
    'إيه حالة التأمين ومفاتيح الـ OAuth في الـ 8 منصات؟',
    'إزاي بتحمي السيستم بـ Cloudflare WAF و Supabase؟',
    'فيه أي توكن أو صلاحية محتاجة تحديث دلوقتي؟',
    'إزاي بتراقب شغل باقي الوكلاء عشان مفيش حاجة تتسرب؟',
  ],
};

const DEFAULT_GREETING = 'منور يا ريس! أنا طارق العبدلي، مدير الوكلاء الـ 9 وقائد الأوركسترا هنا. كل المنصات قدامي ع الرادار.. قولي تحب نوجه التيم على إيه دلوقتي؟';
const DEFAULT_PROMPTS = [
  'إيه الأخبار عندك يا طارق في الـ 8 منصات؟',
  'عرفني بتيم الوكلاء الـ 9 وكل واحد ماسك إيه',
  'إيه خطتنا عشان نضاعف الزيارات الأسبوع ده؟',
  'راجعلي حالة الربط في كل المنصات دلوقتي',
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

    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

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
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = (await res.json()) as { reply?: string; modelUsed?: string; durationMs?: number };
      const replyText = data.reply || 'معاك على الخط يا فندم، ثواني بنسحب أحدث قراءة من المنصات.';
      const modelUsed = data.modelUsed || 'gemini-2.5-flash';
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
      console.warn('Agent chat request error:', err);
      const errorMsg: Message = {
        id: `d_${Date.now()}`,
        sender: 'director',
        text: `حصلت تقطيعة بسيطة في الشبكة وأنا بكلم السيرفر يا ريس (${err?.message || 'Network Error'}).. جرب تبعتلي الرسالة تاني وهرد عليك فوراً بالتحليل الكامل!`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'network-retry',
      };
      setMessages((prev) => [...prev, errorMsg]);
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
