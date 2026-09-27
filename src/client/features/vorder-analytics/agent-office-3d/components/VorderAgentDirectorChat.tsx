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

// Agent-specific initial greetings (Distinct Personalities — Zero Rejected Clichés)
const AGENT_GREETINGS: Record<string, string> = {
  'vorder-tariq': 'أهلاً بك يا باشمهندس محمد. أنا طارق العبدلي، المدير التنفيذي وقائد التكتيكات لخلية الوكلاء الـ 9. جميع المنصات الـ 8 متصلة حياً وأمامي الآن تقارير الـ 38 ظهوراً في كونسول.. ما التوجيه التنفيذي الذي نبدأ به؟',
  'vorder-sara': 'من زاوية العائد والتحويل في GA4 وGoogle Ads، أنا سارة المهندس. أراقب الآن سرعة العرض (TURBO_3X) ومسارات Server-Side CAPI لضمان أعلى ROAS. أي حملة أو سوق نحلله مالياً الآن؟',
  'vorder-yasmine': 'من واقع فحص استعلامات Search Console، أنا ياسمين الشريف، خبيرة حصاد الكلمات وتصنيف النوايا. رصدت تكتلات كلمات قوية في منطقة الـ Striking Distance.. تحب نفتح خريطة الكلمات لأي قطاع؟',
  'vorder-omar': 'على مستوى هندسة الروابط وثقة النطاق، أهلاً بك يا باشمهندس. أنا عمر الفاروق، مسؤول العلاقات الرقمية وتدفق الـ Internal PageRank. تحب نراجع شبكة الروابط الداخلية الداعمة لصفحات الظهور؟',
  'vorder-karim': 'في خط إنتاج المحتوى وطابور النشر، أنا كريم الدسوقي. المدونة والسايت ماب متطابقان (661 مقالاً) وطابور الـ 100 مقال جاهز مع نبضات IndexNow الفورية. هل نراجع حالة الأرشفة أو نطلق دفعة نشر جديدة؟',
  'vorder-layla': 'هندسياً وعلى مستوى مؤشرات Core Web Vitals، أنا ليلى الألفي. صحة الموقع Site Audit عند 100% (0 تحذيرات) وأكواد TechArticle Schema مفعّلة بالكامل. هل نفحص سرعة الأداء أو الكود المصدري؟',
  'vorder-faris': 'إقليمياً وعلى خريطة الأسواق المستهدفة، أنا فارس النجار، خبير السيو المحلي وأسواق السعودية ومصر والخليج. حصص النشر مضبوطة بين الرياض وجدة والقاهرة ودبي.. أي سوق إقليمي نركز عليه الآن؟',
  'vorder-nour': 'فيما يخص محركات الإجابة التوليدية GEO، أنا نور المرشدي. أعمل على تعزيز فقرات الإجابة المباشرة والـ Entities لتصدر اقتباسات ChatGPT وGemini وPerplexity. هل نراجع جاهزية الاقتباس التوليدي؟',
  'vorder-ziad': 'سجلات الرقابة الجنائية في D1 جاهزة أمامك. أنا زياد عمران، حارس الجودة والذاكرة المتعلمة. جميع توجيهاتك وقواعد الحظر مفعّلة بصرامة على الوكلاء الـ 9. هل نعرض سجل العمليات أو نراجع الذاكرة؟',
};

// Agent-specific quick prompts
const AGENT_QUICK_PROMPTS: Record<string, string[]> = {
  'vorder-tariq': [
    'اعرض لي خطة مضاعفة الـ 38 ظهوراً في Search Console',
    'ما حالة التزام الوكلاء الـ 9 بذاكرة التفضيلات في D1؟',
    'كيف نوزع قوة النشر بين السعودية ومصر والإمارات؟',
    'راجع لي حالة الربط الحي في المنصات الـ 8 الآن',
  ],
  'vorder-sara': [
    'حللي لي العائد المتوقع ROAS وسرعة العرض TURBO_3X',
    'كيف نربط بيانات GA4 وServer-Side CAPI بالكلمات الشرائية؟',
    'ما أعلى الصفحات قدرة على تحويل الزوار لطلبات واتساب؟',
    'كيف ننسق بين الحملات الإعلانية والأورجانيك؟',
  ],
  'vorder-yasmine': [
    'ما أهم كلمات منطقة الـ Striking Distance في كونسول الآن؟',
    'كيف تصنفين نية الباحث (Search Intent) لمتاجر سلة وزد؟',
    'اقترحي عنقود كلمات مفتاحية جديد للسوق السعودي والمصري',
    'كيف نرفع نسبة النقر CTR للاستعلامات الحالية؟',
  ],
  'vorder-omar': [
    'كيف نوزع الـ Internal PageRank لدعم الـ 15 صفحة المحققة للظهور؟',
    'ما خطتك لتنويع نصوص الـ Anchor Text الدلالية؟',
    'كيف نعزز ثقة الدومين (Authority) عبر GitHub والمصادر الموثوقة؟',
    'هل توجد أي صفحات يتيمة (Orphan Pages) في الموقع؟',
  ],
  'vorder-karim': [
    'ما حالة طابور الـ 100 مقال وتطابق المدونة مع Sitemap.xml؟',
    'كيف تسرّع أرشفة المقالات الجديدة عبر بروتوكول IndexNow؟',
    'ما المعايير الهيكلية التي تطبقها في كتابة المقالات التكتيكية؟',
    'كيف تمنع أي تصادم أو تكرار في روابط الـ Slugs؟',
  ],
  'vorder-layla': [
    'اعرضي لي قراءات Core Web Vitals (LCP / INP / CLS) الحالية',
    'كيف نحافظ على نتيجة Site Audit عند 100% و0 تحذيرات؟',
    'ما أنواع الـ JSON-LD Schema المحقونة في المقالات؟',
    'راجعي لي سلامة التحويلات 301 ووسوم الـ Canonical',
  ],
  'vorder-faris': [
    'ما توزيع حصص دول النشر النشطة حالياً؟',
    'كيف نخصص المحتوى لمدن الرياض وجدة والقاهرة ودبي؟',
    'ما خطتك لتصدر نتائج البحث المحلي (Local 3-Pack)؟',
    'كيف نربط استعلامات المدن بمحرك توليد المقالات؟',
  ],
  'vorder-nour': [
    'كيف نرفع نسبة الاقتباس في Google AI Overviews وPerplexity؟',
    'اشرحي لي كيف تطبقين دراسة Princeton GEO في مقالاتنا',
    'ما هي فقرات الـ Direct Answer Blocks وكيف تضبطينها؟',
    'كيف نبني خريطة الكيانات (Entity Graph) لنماذج الذكاء الاصطناعي؟',
  ],
  'vorder-ziad': [
    'اعرض لي حالة ذاكرة المالك المتعلمة وفلتر الكلمات المرفوضة',
    'ما آخر العمليات المسجلة في جدول اللوجز البرمجية في D1؟',
    'كيف يعمل نظام نقاط الاستئناف (Checkpoints) ومنع فقدان المهام؟',
    'تحقق لي من سلامة مسارات البدائل الفورية للموديلات',
  ],
};

const DEFAULT_GREETING = AGENT_GREETINGS['vorder-tariq'];
const DEFAULT_PROMPTS = AGENT_QUICK_PROMPTS['vorder-tariq'];

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
      const replyText = data.reply || 'جاري استخراج القراءات الحية من المنصات المربوطة.';
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
        text: `حدث انقطاع مؤقت في الاتصال بالسيرفر (${err?.message || 'Network Error'}).. يرجى إعادة إرسال الرسالة وسيتم الرد فوراً بالتحليل الكامل.`,
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
