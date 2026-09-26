import React from 'react';

const tickerItems = [
  { text: 'طارق العبدلي: قيادة الوكلاء الـ 9 في اجتماع الـ 9 كراسي وتوحيد الحقيقة الرقمية 360°', color: '#0DEEF3' },
  { text: 'كريم الدسوقي: تطابق 100%: المدونة (647) = السايت ماب (647 مقال + 2 ثابتة = 649) = قاعدة D1 (647)', color: '#00E676' },
  { text: 'ليلى الألفي: علاج ذاتي لـ 30 رابط -v2 عبر 301 Redirect ورفع Site Audit إلى 100% (0 تحذيرات)', color: '#FF5252' },
  { text: 'ياسمين الشريف: 485 كلمة دلالية مع 36 ظهوراً حياً في Google Search Console بمتوسط ترتيب 9.7', color: '#F5A623' },
  { text: 'سارة المهندس: مزامنة حملات Google Ads وGA4 مع Consent Mode v2 وتخفيض تكلفة الاستحواذ 28%', color: '#E040FB' },
  { text: 'نور المرشدي: أبحاث خبراء GEO 2026 وترشيح وكيل صائد اقتباسات AI Overviews & Perplexity', color: '#7C4DFF' },
  { text: 'عمر الفاروق: ربط مستودعات GitHub بصفحات المقالات عبر sameAs Schema لتعزيز سلطة النطاق', color: '#FF9100' },
  { text: 'فارس النجار: تصدر حزمة الخرائط الثلاثية Local 3-Pack في الرياض وجدة والقاهرة ودبي', color: '#CCDDEE' },
  { text: 'زياد عمران: حراسة Flowise وSupabase وCloudflare D1 بتكلفة $0.00 ونسبة فقد بيانات 0%', color: '#448AFF' },
];

const doubled = [...tickerItems, ...tickerItems];

export const VorderOfficeTicker: React.FC = () => {
  return (
    <div className="absolute top-3 left-0 right-0 z-20 pointer-events-none overflow-hidden h-7 bg-black/40 backdrop-blur-md border-y border-white/5 flex items-center">
      <div className="flex gap-8 whitespace-nowrap animate-ticker-scroll-ar">
        {doubled.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wide"
            style={{ color: item.color }}
          >
            <span className="opacity-70">◈</span>
            <span>{item.text}</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes tickerScrollAr {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        .animate-ticker-scroll-ar {
          animation: tickerScrollAr 45s linear infinite;
        }
      `}</style>
    </div>
  );
};
