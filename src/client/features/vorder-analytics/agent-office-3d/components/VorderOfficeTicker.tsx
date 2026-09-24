import React from 'react';

const tickerItems = [
  { text: 'طارق العبدلي: توجيه استراتيجية السيو التكتيكية ومطابقة الحقيقة الرقمية', color: '#0DEEF3' },
  { text: 'عمر الفاروق: 742 مقال منشور ومؤرشف حياً عبر شبكة الاستحواذ', color: '#FF9100' },
  { text: 'كريم الدسوقي: استهلاك Cloudflare D1 هو $0.00 وسرعة استجابة 9ms', color: '#00E676' },
  { text: 'ياسمين الشريف: 485 مصطلح مفهرس مع 23 ظهور معتمد في الكونسول', color: '#F5A623' },
  { text: 'سارة المهندس: إطلاق حملات الإعلانات العضوية لسلة وزد بدون إنفاق', color: '#E040FB' },
  { text: 'ليلى الألفي: اختبارات Core Web Vitals بنسبة نجاح 100% و0 أخطاء', color: '#FF5252' },
  { text: 'فارس النجار: مزامنة دورات الأتمتة كل 30 دقيقة (48 دورة/يوم)', color: '#CCDDEE' },
  { text: 'نور المرشدي: تحسين مسارات الشراء ومعدلات التحويل CRO بنسبة +34%', color: '#7C4DFF' },
  { text: 'زياد الخطيب: استهداف 10 مدن رئيسية في رادار الانتشار الجغرافي', color: '#448AFF' },
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
