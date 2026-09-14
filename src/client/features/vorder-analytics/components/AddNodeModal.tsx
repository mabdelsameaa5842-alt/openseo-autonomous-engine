import React, { useState } from "react";
import {
  X,
  Plus,
  Clock,
  Database,
  Zap,
  Sparkles,
  Globe,
  Search,
  Layers,
  MapPin,
  ShieldCheck,
  Bell,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { CanvasNode } from "./AutomationFlowCanvas";

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (node: CanvasNode) => void;
  isRtl?: boolean;
}

interface NodeTemplate {
  type: string;
  label: string;
  category: CanvasNode["category"];
  description: string;
  icon: any;
  defaultData: Record<string, any>;
}

const TEMPLATES: NodeTemplate[] = [
  // Triggers
  {
    type: "cronTrigger",
    label: "محفز الجدولة (Cron Trigger)",
    category: "trigger",
    description: "تشغيل التدفق على جدول زمني دوري (مثال: كل 30 دقيقة أو يومياً)",
    icon: Clock,
    defaultData: { schedule: "*/30 * * * *", cron: "*/30 * * * *", watchdogMinutes: 15 },
  },
  {
    type: "webhookTrigger",
    label: "محفز الويب هوك (Webhook Event)",
    category: "trigger",
    description: "تشغيل التدفق فور تلقي إشعار أو حدث خارجي عبر HTTP POST",
    icon: Zap,
    defaultData: { endpoint: "/api/automation/trigger-run", method: "POST" },
  },

  // SEO Sources
  {
    type: "gscSource",
    label: "Google Search Console API",
    category: "source",
    description: "استخراج معدلات النقر والظهور وترتيب الكلمات الفعلية في جوجل",
    icon: Search,
    defaultData: { metrics: ["clicks", "impressions", "ctr", "position"], days: 28 },
  },
  {
    type: "googleAds",
    label: "Google Ads Keyword Planner",
    category: "source",
    description: "حصاد الكلمات المفتاحية مع أحجام البحث وتكلفة النقرة CPC",
    icon: Database,
    defaultData: { harvestCount: 500, minVolume: 100 },
  },
  {
    type: "competitorSpy",
    label: "رادار المنافسين في السيرب",
    category: "source",
    description: "مسح منافسي النطاق في نتائج البحث واستخراج الكلمات المستهدفة",
    icon: Search,
    defaultData: { competitorsCount: 5, targetMarket: "sa" },
  },
  {
    type: "mapsSource",
    label: "Google Maps Local Grid",
    category: "source",
    description: "استعلام بيانات الظهور الجغرافي وخرائط جوجل للفروع والمناطق",
    icon: MapPin,
    defaultData: { radiusKm: 10, targetCity: "الرياض" },
  },

  // AI & Models
  {
    type: "geminiStudio",
    label: "Gemini 2.0 Content Studio",
    category: "ai",
    description: "صياغة مقالات سيو متقدمة مع جداول ومخططات Mermaid وبيانات Schema",
    icon: Sparkles,
    defaultData: {
      model: "gemini-2.0-flash",
      brandTone: "Saudi Authority B2B",
      features: ["FAQ Schema", "Mermaid Diagram", "Brand Tables"],
    },
  },
  {
    type: "eeatAuditor",
    label: "مدقق E-E-A-T ومكافحة التزييف",
    category: "ai",
    description: "فحص الأدلة والمصادر وجودة المحتوى لضمان مطابقة خوارزميات جوجل",
    icon: ShieldCheck,
    defaultData: { checkDepth: "Strict Evidence Check", requireCitations: true },
  },

  // Outputs
  {
    type: "publisher",
    label: "ناشر المدونة المباشر (Vercel Live)",
    category: "output",
    description: "نشر المقال المولد مباشرة في قاعدة المقالات وتحديث خرائط السايت ماب",
    icon: Globe,
    defaultData: { sitemapSynced: true, totalLive: 76 },
  },
  {
    type: "alertDispatcher",
    label: "مركز التنبيهات والإشعارات",
    category: "output",
    description: "إرسال تقرير فوري بنتيجة الدورة عبر Telegram Webhook أو الإيميل",
    icon: Bell,
    defaultData: { channel: "Dashboard & Telegram", notifyOnSuccess: true },
  },

  // Audits
  {
    type: "googleRank",
    label: "مدقق الترتيب المباشر (SERP Tracker)",
    category: "audit",
    description: "التحقق الميداني الفوري من ترتيب المقال والكلمات في Google SERP",
    icon: TrendingUp,
    defaultData: { instantCheck: true, engine: "SERP Real-Time Scraper" },
  },
  {
    type: "decayDetector",
    label: "كاشف تراجع الترتيب (Decay Auditor)",
    category: "audit",
    description: "رصد الصفحات التي فقدت مراكزها وإعادتها فورياً لطابور التحديث",
    icon: TrendingDown,
    defaultData: { dropThreshold: 3, autoRequeue: true },
  },
];

export const AddNodeModal: React.FC<AddNodeModalProps> = ({
  isOpen,
  onClose,
  onAddNode,
  isRtl = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: isRtl ? "كافة العقد" : "All" },
    { id: "trigger", label: isRtl ? "المحفزات" : "Triggers" },
    { id: "source", label: isRtl ? "مصادر السيو" : "Sources" },
    { id: "ai", label: isRtl ? "الذكاء الاصطناعي" : "AI & Logic" },
    { id: "output", label: isRtl ? "النشر والمخرجات" : "Publishing" },
    { id: "audit", label: isRtl ? "التدقيق والفحص" : "Audits" },
  ];

  const filtered = TEMPLATES.filter((tpl) => {
    const matchesCat = activeCategory === "all" || tpl.category === activeCategory;
    const matchesSearch =
      tpl.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectTemplate = (tpl: NodeTemplate) => {
    const newNode: CanvasNode = {
      id: `node_${Date.now().toString(36)}`,
      type: tpl.type,
      label: tpl.label,
      category: tpl.category,
      x: 350 + Math.floor(Math.random() * 200),
      y: 150 + Math.floor(Math.random() * 150),
      data: { ...tpl.defaultData },
      status: "idle",
    };
    onAddNode(newNode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {isRtl ? "مكتبة عقد Flowise المتاحة (Component Library)" : "Add Node to Workflow"}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {isRtl ? "اختر العقدة لإدراجها وتخصيصها على لوحة الرسم" : "Pick a node to insert onto canvas"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRtl ? "ابحث عن عقدة (مثال: محفز، Gemini، خرائط...)" : "Search nodes..."}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === c.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Templates */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <div
                key={i}
                onClick={() => handleSelectTemplate(tpl)}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:border-indigo-500/50 transition cursor-pointer shadow-sm group"
              >
                <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/60 dark:border-zinc-700/60 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Icon className="h-4 w-4 text-indigo-500 group-hover:text-white transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {tpl.label}
                    </h4>
                    <span className="text-[9px] font-mono uppercase text-zinc-400">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            {isRtl ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
