import React from 'react';

export interface VorderTickerItem {
  text: string;
  color: string;
}

interface VorderOfficeTickerProps {
  items?: VorderTickerItem[];
}

const fallbackTickerItems: VorderTickerItem[] = [
  { text: 'طارق العبدلي: قيادة الوكلاء الـ 9 واعتماد خطة تسريع قوة العرض (Impression Velocity = TURBO_3X)', color: '#0DEEF3' },
  { text: 'كريم الدسوقي: مزامنة المقالات الحية بين المدونة والسايت ماب وقاعدة بيانات Cloudflare D1 بنسبة 100%', color: '#00E676' },
  { text: 'ليلى الألفي: صحة الفحص التقني Site Audit = 100% وحقن TechArticle & FAQPage Schema', color: '#FF5252' },
  { text: 'ياسمين الشريف: حصاد الكلمات المفتاحية وتحليل استعلامات Google Search Console الحية', color: '#F5A623' },
  { text: 'سارة المهندس: مزامنة نوايا الشراء في GA4 وServer-Side CAPI لتعظيم العائد ROAS', color: '#E040FB' },
  { text: 'نور المرشدي: تطبيق معايير دراسة Princeton GEO لرفع الاقتباس التوليدي في Google AI Overviews وPerplexity', color: '#7C4DFF' },
  { text: 'عمر الفاروق: تدوير سلطة النطاق (Internal PageRank) لدعم الصفحات المحققة للظهور وفق دراسة Zyppy', color: '#FF9100' },
  { text: 'فارس النجار: ضبط حصص دول النشر النشطة (السعودية 35% • مصر 25% • الإمارات 20% • الكويت 10% • قطر 10%)', color: '#CCDDEE' },
  { text: 'زياد عمران: تفعيل فلتر الحماية البرمجي (Post-Generation Guardrail) وتوثيق التحسينات في D1', color: '#448AFF' },
];

export const VorderOfficeTicker: React.FC<VorderOfficeTickerProps> = ({ items }) => {
  const sourceItems = items && items.length > 0 ? items : fallbackTickerItems;
  const doubled = [...sourceItems, ...sourceItems];

  return (
    <div
      dir="ltr"
      className="absolute top-0 left-0 right-0 z-20 pointer-events-none overflow-hidden h-8 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 flex items-center"
    >
      <div className="flex gap-10 whitespace-nowrap animate-ticker-scroll-ar px-4">
        {doubled.map((item, idx) => (
          <span
            key={idx}
            dir="rtl"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold tracking-normal"
            style={{ color: item.color }}
          >
            <span className="opacity-80">◈</span>
            <span>{item.text}</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes tickerScrollAr {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-scroll-ar {
          animation: tickerScrollAr 55s linear infinite;
        }
      `}</style>
    </div>
  );
};
