import * as React from "react";

export type Language = "ar" | "en";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;
  dir: "rtl" | "ltr";
}

const I18nContext = React.createContext<I18nContextType | null>(null);

const STORAGE_KEY = "openseo-language-preference";

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Top Bar & Global
    "app.title": "أوبن سيو",
    "project.connected": "المشروع متصل بنجاح",
    "project.not_connected": "المشروع غير متصل",
    "language.switch_to_en": "English",
    "language.switch_to_ar": "العربية",
    "language.toggle_label": "English",

    // Action Command Bar
    "action_bar.title": "الأوامر التنفيذية الداخلية",
    "action_bar.trigger_automation": "تشغيل الأتمتة",
    "action_bar.sync_snapshot": "مزامنة اللقطة",
    "action_bar.connect_apis": "ربط الواجهات",
    "action_bar.services": "حالة الخدمات السحابية",

    // Dashboard Cards Titles & Subtitles
    "card.search_performance.title": "أداء مؤشرات البحث",
    "card.search_performance.subtitle": "مؤشرات قوقل سيرش كونسول للـ 28 يوماً الأخيرة",
    "card.organic_traffic.title": "الزيارات الطبيعية",
    "card.organic_traffic.subtitle": "جلسات تحليلات قوقل المباشرة للـ 28 يوماً الأخيرة",
    "card.autonomous_engine.title": "محرك الأتمتة المستقل",
    "card.autonomous_engine.subtitle": "حالة تكامل الأتمتة الذاتية",
    "card.google_ads.title": "إعلانات قوقل ومخطط الكلمات",
    "card.google_ads.subtitle": "أدوات البحث والتحليل المباشر",
    "card.site_audit.title": "الفحص والتدقيق الفني",
    "card.site_audit.subtitle": "صحة الموقع والمشاكل المكتشفة",
    "card.backlinks.title": "الروابط الخلفية",
    "card.backlinks.subtitle": "مراقبة نبض الروابط والمصادر",

    // Metrics & Labels
    "metric.gsc_clicks": "نقرات البحث",
    "metric.impressions": "مرات الظهور",
    "metric.ctr": "نسبة النقر للظهور",
    "metric.avg_position": "متوسط الترتيب",
    "metric.ga4_sessions": "جلسات التحليلات",
    "metric.site_health": "صحة الموقع",
    "metric.issues": "المشاكل",
    "metric.issues_identified": "مشاكل مكتشفة",
    "metric.problems_identified": "مشكلات محددة",
    "metric.warning": "تحذيرات",
    "metric.critical": "مشكلات حرجة",
    "metric.passed": "عناصر سليمة",
    "metric.ready": "جاهز للاستخدام",
    "metric.connected": "متصل ونشط",
    "metric.coverage": "نسبة التغطية",
    "metric.daily_tactical_article": "مقال تكتيكي يومياً",
    "metric.schedule_12h": "كل 12 ساعة",

    // Inputs & Placeholders
    "input.lookup_ads": "فحص إعلانات الكلمات...",
    "input.keyword_planner": "مخطط الكلمات المفتاحية...",
    "input.check": "فحص",

    // Autonomous Engine Details
    "make.badge": "تكامل ميك متصل ونشط",
    "make.connected_integration": "تكامل نشط ومتصل",
    "make.schedule_info": "الجدولة الزمنية (كل 12 ساعة)",
    "make.daily_publishing": "النشر التلقائي الذاتي (مقال تكتيكي يومياً)",
    "make.keyword_harvest": "500 كلمة نية عالية ● 100 مقال مجدول",
    "make.robots_sitemap_sync": "تحديث الروبوتات وخريطة الموقع (AI Bots)",
    "make.google_sync": "تزامن فوري مع Search Console و GA4",
    "make.ci_cd_status": "تكامل النشر والفحص (سليم 100%)",
    "make.check_readiness": "فحص الجاهزية",
    "make.download_blueprint": "تحميل مخطط السيناريو",
    "make.open_scenario": "فتح السيناريو في ميك",
    "make.disconnect": "قطع الاتصال",
    "make.connected_email": "الحساب المتصل",

    // Sidebar Navigation
    "nav.overview": "نظرة عامة",
    "nav.dashboard": "لوحة التحكم",
    "nav.growth_performance": "النمو والأداء",
    "nav.roas_performance": "الأداء",
    "nav.skills_hub": "اورجانيك ادز",
    "nav.my_site": "موقعي",
    "nav.gsc_insights": "رؤى مؤشرات البحث",
    "nav.rank_tracking": "تتبع تصنيف الكلمات",
    "nav.saved_keywords": "الكلمات المفتاحية المحفوظة",
    "nav.site_audit": "فحص وتدقيق الموقع",
    "nav.research": "البحث والتحليل",
    "nav.keyword_research": "بحث الكلمات المفتاحية",
    "nav.domain_overview": "نظرة عامة على النطاق",
    "nav.backlinks": "الروابط الخلفية",
    "nav.brand_lookup": "حضور العلامة التجارية",
    "nav.prompt_explorer": "مستكشف الأوامر الذكية",
    "nav.connect": "الربط والتكامل",
    "nav.ai_mcp": "الذكاء الاصطناعي والأدوات",
    "nav.help": "المساعدة والدعم",
    "nav.settings": "الإعدادات",
    "nav.billing": "الفواتير والاشتراك",
    "nav.organization": "المؤسسة",
    "nav.browse": "تصفح",
    "nav.chat": "محادثة",
    "nav.super_admin": "مدير عام",
    "nav.secure_session": "جلسة آمنة ومشفرة",
    "nav.user_name": "م. محمد عبد السميع",
    "nav.logout": "تسجيل الخروج",

    // Brand Lookup
    "brand.title": "رادار حضور العلامة التجارية",
    "brand.subtitle": "استكشاف ذكر واستشهاد محركات الذكاء الاصطناعي بالعلامة التجارية أو النطاق",
    "brand.input_placeholder": "أدخل اسم العلامة التجارية أو النطاق...",
    "brand.competitors_placeholder": "أضف المنافسين (مفصولين بفواصل)...",
    "brand.lookup_button": "فحص الحضور",
    "brand.ai_analyzing": "جاري التحليل واستدعاء نماذج الذكاء الاصطناعي...",
    "brand.no_mentions_title": "لم يتم رصد إشارات في الذكاء الاصطناعي بعد",
    "brand.no_mentions_desc": "لم يُعثر بعد على استشهادات للنطاق عبر نماذج الذكاء الاصطناعي. يمكنك البدء في نشر مقالات لرفع نسبة الظهور.",
    "brand.verification_notice": "ملاحظة: حساب مزود البيانات يحتاج توثيقاً في منصة داتافورسيو. تم استخدام محرك الاستنتاج الذكي تلقائياً لتقديم التحليل.",

    // Time Labels
    "time.1am": "1 ص",
    "time.2am": "2 ص",
    "time.3pm": "3 م",
    "time.9pm": "9 م",
    "time.2pm": "2 م",

    // Search Performance (GSC)
    "gsc.page_title": "أداء البحث",
    "gsc.queries_tab": "الاستعلامات",
    "gsc.pages_tab": "الصفحات",
    "gsc.countries_tab": "الدول",
    "gsc.devices_tab": "الأجهزة",
    "gsc.date_range": "النطاق الزمني",
    "gsc.export": "تصدير",
    "gsc.last_7_days": "آخر 7 أيام",
    "gsc.last_28_days": "آخر 28 يوماً",
    "gsc.last_3_months": "آخر 3 أشهر",
    "gsc.filter_device": "تصفية حسب الجهاز",

    // Site Audit
    "audit.page_title": "الفحص والتدقيق الفني",
    "audit.run_audit": "بدء الفحص",
    "audit.pages_crawled": "الصفحات المفحوصة",
    "audit.issues_found": "المشاكل المكتشفة",
    "audit.critical_issues": "مشاكل حرجة",
    "audit.warnings": "تحذيرات",
    "audit.passed_pages": "صفحات سليمة",
    "audit.last_run": "آخر فحص",
    "audit.view_issues": "عرض المشاكل",
    "audit.view_pages": "عرض الصفحات",
    "audit.status_completed": "مكتمل",
    "audit.status_running": "جاري الفحص...",
    "audit.status_pending": "في الانتظار",

    // Backlinks
    "backlinks.page_title": "الروابط الخلفية",
    "backlinks.search_placeholder": "أدخل النطاق للبحث عن روابطه...",
    "backlinks.search_button": "بحث",
    "backlinks.total_backlinks": "إجمالي الروابط",
    "backlinks.referring_domains": "النطاقات المحيلة",
    "backlinks.new_backlinks": "روابط جديدة",
    "backlinks.lost_backlinks": "روابط مفقودة",
    "backlinks.domain_authority": "سلطة النطاق",
    "backlinks.anchor_text": "نص الرابط",
    "backlinks.source_url": "رابط المصدر",
    "backlinks.target_url": "رابط الهدف",

    // Keyword Research
    "keywords.page_title": "بحث الكلمات المفتاحية",
    "keywords.search_placeholder": "أدخل كلمة مفتاحية للبحث...",
    "keywords.search_button": "بحث",
    "keywords.monthly_volume": "الحجم الشهري",
    "keywords.competition": "المنافسة",
    "keywords.cpc": "سعر النقرة",
    "keywords.intent": "نية البحث",
    "keywords.difficulty": "صعوبة الكلمة",
    "keywords.save": "حفظ",
    "keywords.saved": "محفوظة",
    "keywords.intent.informational": "إعلامي",
    "keywords.intent.commercial": "تجاري",
    "keywords.intent.navigational": "ملاحي",
    "keywords.intent.transactional": "معاملاتي",

    // Saved Keywords
    "saved.page_title": "الكلمات المفتاحية المحفوظة",
    "saved.no_keywords": "لا توجد كلمات مفتاحية محفوظة بعد",
    "saved.delete": "حذف",
    "saved.export": "تصدير",
    "saved.tag": "وسم",
    "saved.bulk_delete": "حذف جماعي",

    // Domain Overview
    "domain.page_title": "نظرة عامة على النطاق",
    "domain.search_placeholder": "أدخل النطاق للتحليل...",
    "domain.organic_traffic": "الزيارات العضوية المقدرة",
    "domain.organic_keywords": "الكلمات العضوية",
    "domain.backlinks": "الروابط الخلفية",
    "domain.referring_domains": "النطاقات المحيلة",

    // Rank Tracking
    "rank.page_title": "تتبع الترتيب",
    "rank.add_keyword": "إضافة كلمة مفتاحية",
    "rank.current_position": "الترتيب الحالي",
    "rank.change": "التغيير",
    "rank.last_checked": "آخر فحص",
    "rank.desktop": "سطح المكتب",
    "rank.mobile": "الجوال",
    "rank.top3": "ضمن أول 3",
    "rank.top10": "ضمن أول 10",
    "rank.top100": "ضمن أول 100",

    // Settings
    "settings.page_title": "الإعدادات",
    "settings.general": "عام",
    "settings.integrations": "التكاملات",
    "settings.team": "الفريق",
    "settings.domain": "النطاق",
    "settings.save": "حفظ التغييرات",
    "settings.saved": "تم الحفظ",
    "settings.gsc_connect": "ربط Google Search Console",
    "settings.ga4_connect": "ربط Google Analytics 4",
    "settings.ads_connect": "ربط Google Ads",
    "settings.make_connect": "ربط Make.com",

    // Billing
    "billing.page_title": "الفواتير والاشتراك",
    "billing.current_plan": "الخطة الحالية",
    "billing.upgrade": "ترقية الخطة",
    "billing.usage": "الاستخدام",
    "billing.invoices": "الفواتير",

    // Auth
    "auth.signin_title": "تسجيل الدخول",
    "auth.signup_title": "إنشاء حساب",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.google_signin": "الدخول بواسطة قوقل",
    "auth.forgot_password": "نسيت كلمة المرور؟",

    // SAM AI Assistant
    "sam.page_title": "المساعد الذكي سام",
    "sam.input_placeholder": "اسألني عن استراتيجية السيو...",
    "sam.send": "إرسال",
    "sam.welcome": "مرحباً! أنا سام، مساعدك الذكي للسيو. كيف يمكنني مساعدتك؟",
    "sam.thinking": "جاري التفكير...",

    // Prompt Explorer
    "prompt.page_title": "مستكشف الأوامر الذكية",
    "prompt.input_placeholder": "أدخل أمراً للمقارنة بين النماذج الذكية...",
    "prompt.run": "تشغيل",

    // AI & MCP
    "ai.page_title": "الذكاء الاصطناعي وأدوات MCP",
    "ai.copy_command": "نسخ الأمر",
    "ai.copied": "تم النسخ",

    // Skills Hub Detailed
    "skills.page_title": "مركز استراتيجيات الذكاء الاصطناعي",
    "skills.run": "تشغيل",
    "skills.ready": "جاهز",
    "skills.hub_badge": "مركز المهارات والأتمتة الذكية · AI Skills Intelligence Hub",
    "skills.powered_by_agy": "مدعوم بـ Google Antigravity (AGY)",
    "skills.hero_title": "محرك تشغيل المهارات والتحليل الجنائي للسيو",
    "skills.hero_desc": "استدعاء مهارات OpenSEO التسع لـ Antigravity، تشغيل محرك الفحص السحابي الحقيقي، وتوليد الموجزات التكتيكية.",
    "skills.tab_agy": "وكيل Google Antigravity",
    "skills.tab_audit": "الفحص السحابي الحقيقي",
    "skills.tab_geo": "رادار الـ GEO",
    "skills.brief_title": "مولد العناقيد والموجز التكتيكي",
    "skills.brief_desc": "يستدعي مهارات seo-cluster و seo-content-brief لبناء هيكل المقال الأمثل.",
    "skills.target_keyword": "الكلمة المفتاحية المستهدفة:",
    "skills.target_market": "السوق المستهدف:",
    "skills.market_sa": "🇸🇦 المملكة العربية السعودية (سلة، زد، عيادات الرياض)",
    "skills.market_eg": "🇪🇬 جمهورية مصر العربية (التجارة المحلية والعيادات)",
    "skills.market_gulf": "🇯🇴 الأردن والخليج (السياحة العلاجية والتجارة)",
    "skills.copy_brief": "نسخ الموجز التكتيكي المكتمل",
    "skills.copied": "تم النسخ بنجاح!",
    "skills.enabled_skills": "مهارات Google Antigravity المفعلة:",
    "skills.preview_title": "معاينة الموجز التكتيكي التفاعلي (Tactical Brief Output)",
    "skills.ready_publish": "جاهز للنشر",
    "skills.standards_notice": "مطابق لمعايير E-E-A-T وموجه لمحركات البحث والذكاء الاصطناعي",
    "skills.view_live_article": "عرض المقال المنشور حياً",
    "skills.audit_title": "محرك الفحص السحابي الحقيقي (OpenSEO Cloud Audit Engine)",
    "skills.audit_desc": "تشغيل فحص شامل متزامن مع D1 و Google Lighthouse لاحتساب مؤشرات الأداء الحقيقية.",
    "skills.url_label": "رابط الموقع للفحص:",
    "skills.start_audit_btn": "إطلاق الفحص الحقيقي الآن",
    "skills.audit_running": "جاري الفحص السحابي...",
    "skills.live_logs_title": "سجلات المحرك اللحظية:",
    "skills.open_audit_results": "فتح نتائج الفحص الشاملة",
    "skills.geo_title": "رادار ظهور محركات الذكاء الاصطناعي (GEO & LLM Citations Radar)",
    "skills.geo_desc": "مراقبة ظهور النطاق واستشهادات نماذج Perplexity, ChatGPT, Claude, Gemini.",
    "skills.geo_citation_rate": "معدل الاستشهاد الذكي",
    "skills.geo_prompts_tracked": "أوامر يتم رصدها",
    "skills.geo_top_model": "أعلى نموذج مستشهد",
    "skills.geo_readiness": "جاهزية AEO",

    // Performance & Vorder Studio Detailed
    "perf.hero_badge": "متزامن حياً مع Google Cloud (GSC & GA4)",
    "perf.hero_title": "رادار أداء السيو وتحويلات البورتفوليو الحي",
    "perf.connected_domain": "الموقع المربوط:",
    "perf.sync_sitemaps": "تحديث الخرائط",
    "perf.visit_portfolio": "زيارة البورتفوليو",
    "perf.range_28d": "آخر 28 يوماً (المعتمد)",
    "perf.range_7d": "آخر 7 أيام",
    "perf.range_3m": "آخر 3 أشهر",
    "perf.card_articles": "المقالات المنشورة",
    "perf.card_articles_desc": "0% صور بنية SVG وبيانات بالكامل",
    "perf.card_articles_index": "فهرس المقالات الحية المتزامن",
    "perf.card_ctr": "معدل النقر (GSC CTR)",
    "perf.gsc_clicks": "نقرات البحث",
    "perf.gsc_impressions": "مرات الظهور",
    "perf.gsc_live": "سيرش كونسول المباشر",
    "perf.card_ga4": "جلسات وأحداث GA4",
    "perf.ga4_sessions": "جلسة",
    "perf.ga4_conversions": "أحداث تحويل مسجلة",
    "perf.ga4_direct": "اتصال تحليلات قوقل 4 المباشر",
    "perf.card_audit": "سلامة السيو والفحص",
    "perf.audit_status_done": "مكتمل",
    "perf.audit_pages_crawled": "صفحة تم فحصها",
    "perf.audit_zero_issues": "0 أخطاء فنية (سليم 100%)",
    "perf.engine_prescription_title": "محرك التوجيه والإنذار الهندسي (Smart Prescription Engine)",
    "perf.engine_prescription_desc": "مقارنة مستمرة للمؤشرات بالمقاييس المرجعية وتحديد مسارات التحسين المباشرة.",
    "perf.opp_striking_title": "فرصة صعود: كلمات المسافة القريبة",
    "perf.opp_striking_desc": "كلمات مفتاحية في المراكز من 4 إلى 18 بالسعودية ومصر تقترب من الصدارة.",
    "perf.opp_striking_action": "👉 تركيز الترويسات H2 والربط الداخلي الشبكي",
    "perf.opp_make_title": "محرك Make.com والنشر اليومي",
    "perf.opp_make_desc": "دمج GSC و GA4 و Ads تلقائياً، ونشر مقال تكتيكي يومياً عبر GitHub CI/CD.",
    "perf.opp_make_badge": "⚡ Make.com Autonomous Loop (Active)",
    "perf.opp_sitemap_title": "خريطة الموقع & الفهرسة",
    "perf.opp_sitemap_desc": "خرائط الموقع XML وملفات robots.txt و llms.txt متوافقة 100%.",
    "perf.opp_sitemap_status": "سليم (sitemap.xml & llms.txt)",
    "perf.telemetry_title": "رادار الأتمتة الذاتية وتيليميتري Make.com المباشر",
    "perf.telemetry_desc": "سحب فوري لسجلات التنفيذ، صحة الزحف، والربط المغلق مع خوادم Make.com و Cloudflare D1.",
    "perf.run_cycle_btn": "تشغيل دورة فورية الآن",
    "perf.running_cycle": "جارِ تشغيل الدورة...",
    "perf.open_make_scenario": "فتح السيناريو في Make",
    "perf.system_healthy_badge": "النظام سليم 100% (تم حل أخطاء Make)",
    "perf.active_loop_badge": "دورة نشطة (Active Loop)",
    "perf.stat_schedule": "جدولة الدورة التلقائية",
    "perf.stat_schedule_val": "كل 12 ساعة (06:00 / 18:00)",
    "perf.stat_keywords": "الكلمات المفتاحية النشطة",
    "perf.stat_keywords_sub": "مصر والسعودية (تتبع لحظي)",
    "perf.stat_pages": "الصفحات المؤكدة والمفحوصة",
    "perf.stat_pages_sub": "0 أخطاء فنية (سليم 100%)",
    "perf.stat_articles": "المقالات التكتيكية المنشورة",
    "perf.stat_articles_sub": "100% SVG صور خارجية 0%",
    "perf.table_title": "فهرس المقالات المنشورة ومؤشرات الأداء",
    "perf.table_search_placeholder": "بحث في المقالات والكلمات المفتاحية...",
    "perf.filter_all": "الكل",
    "perf.filter_success": "الناجحة فقط",
    "perf.filter_errors": "الأخطاء",
    "perf.col_article": "المقال",
    "perf.col_keyword": "الكلمة المفتاحية",
    "perf.col_intent": "النية",
    "perf.col_views": "الزيارات",
    "perf.col_clicks": "النقرات",
    "perf.col_impressions": "مرات الظهور",
    "perf.col_ctr": "معدل النقر",
    "perf.col_rank": "الترتيب",
    "perf.col_actions": "إجراءات",
    "perf.open_article": "فتح المقال",
    "perf.tab_all": "كافة المقالات",
    "perf.tab_autonomous_published": "مقالات الأتمتة المنشورة",
    "perf.tab_queue": "طابور المحتوى المجدول",
    "perf.btn_ai_generator": "توليد ونشر مقالات بالـ AI",
    "perf.btn_publish_now": "نشر فوري",
    "perf.col_status": "الحالة",
    "perf.col_order": "الترتيب",
    "perf.status_published": "منشور حياً",
    "perf.status_queued": "في الطابور",
    "perf.inspect_details": "معاينة التفاصيل",
    "perf.total_combined": "إجمالي المقالات",
    "perf.scheduled_in_queue": "جاهز في الطابور",
    "perf.monthly_searches": "بحث شهري",
    "perf.col_date": "تاريخ وحالة النشر",
    "perf.queued_schedule_hint": "مجدول للنشر عبر دورة Make.com التلقائية",
    "perf.secondary_keywords_label": "الكلمات الدلالية المكملة (LSI Keywords)",
    "perf.outline_hierarchy": "هيكل الترويسات الإلزامية (H2 & H3 Hierarchy)",
    "perf.geo_snippet_label": "مقتطف محركات الذكاء الاصطناعي (GEO Snippet):",
    "perf.view_live_article": "معاينة المقال في الموقع مباشرة",
    "perf.auto_schedule_note": "سيتم نشره تلقائياً ومزامنته مع Google Search Console.",
    "perf.publishing_now": "جاري النشر والمزامنة...",
    "perf.publish_now_btn": "⚡ نشر المقال الآن فورياً",
    "perf.modal_close": "إغلاق",
    "perf.empty_queue": "لا توجد مقالات في الطابور حالياً. يمكنك توليد حزمة جديدة بواسطة الذكاء الاصطناعي.",
    "perf.empty_published": "لم يتم نشر مقالات من الأتمتة بعد.",
    "studio.badge": "استوديو مقالات الذكاء الاصطناعي (Gemini)",

    // Theme
    "theme.light": "فاتح",
    "theme.dark": "داكن",
    "theme.system": "تلقائي"
  },
  en: {
    // Top Bar & Global
    "app.title": "OpenSEO",
    "project.connected": "Project Connected",
    "project.not_connected": "Project Disconnected",
    "language.switch_to_en": "English",
    "language.switch_to_ar": "العربية",
    "language.toggle_label": "عربي",

    // Action Command Bar
    "action_bar.title": "Internal Action Command",
    "action_bar.trigger_automation": "Trigger Automation",
    "action_bar.sync_snapshot": "Sync Snapshot",
    "action_bar.connect_apis": "Connect APIs",
    "action_bar.services": "Cloud Services Health",

    // Dashboard Cards Titles & Subtitles
    "card.search_performance.title": "Search Performance",
    "card.search_performance.subtitle": "Google Search Console metrics for the last 28 days",
    "card.organic_traffic.title": "Organic Traffic",
    "card.organic_traffic.subtitle": "Google Analytics live sessions for the last 28 days",
    "card.autonomous_engine.title": "Autonomous Engine",
    "card.autonomous_engine.subtitle": "Autonomous integration status",
    "card.google_ads.title": "Google Ads & Keyword Planner",
    "card.google_ads.subtitle": "Lookup tools tools",
    "card.site_audit.title": "Site Audit",
    "card.site_audit.subtitle": "Site health and issues",
    "card.backlinks.title": "Backlinks",
    "card.backlinks.subtitle": "Pulse monitoring backlinks",

    // Metrics & Labels
    "metric.gsc_clicks": "GSC clicks",
    "metric.impressions": "Impressions",
    "metric.ctr": "CTR",
    "metric.avg_position": "Avg Position",
    "metric.ga4_sessions": "GA4 sessions",
    "metric.site_health": "Site health",
    "metric.issues": "Issues",
    "metric.issues_identified": "Issues",
    "metric.problems_identified": "Identified problems",
    "metric.warning": "Warnings",
    "metric.critical": "Critical",
    "metric.passed": "Passed",
    "metric.ready": "Ready",
    "metric.connected": "Connected",
    "metric.coverage": "Source coverage",
    "metric.daily_tactical_article": "Daily tactical article",
    "metric.schedule_12h": "Every 12 hours",

    // Inputs & Placeholders
    "input.lookup_ads": "Lookup Ads",
    "input.keyword_planner": "Keyword Planner",
    "input.check": "Check",

    // Autonomous Engine Details
    "make.badge": "Make.com Connected integration",
    "make.connected_integration": "Connected integration",
    "make.schedule_info": "Schedule (Every 12 hours)",
    "make.daily_publishing": "Autonomous Publishing (1 tactical article daily)",
    "make.keyword_harvest": "500 High-Intent Keywords ● 100 Article Queue",
    "make.robots_sitemap_sync": "Robots.txt & Sitemap Synced (AI Crawlers)",
    "make.google_sync": "Google Search Console & GA4 Synced",
    "make.ci_cd_status": "Publishing & Verification (100% Healthy)",
    "make.check_readiness": "Check Readiness",
    "make.download_blueprint": "Download Blueprint",
    "make.open_scenario": "Open Make Scenario",
    "make.disconnect": "Disconnect",
    "make.connected_email": "Connected Account",

    // Sidebar Navigation
    "nav.overview": "Overview",
    "nav.dashboard": "Dashboard",
    "nav.growth_performance": "Growth & Performance",
    "nav.roas_performance": "Performance",
    "nav.skills_hub": "Organic Ads",
    "nav.my_site": "My Site",
    "nav.gsc_insights": "GSC Insights",
    "nav.rank_tracking": "Rank Tracking",
    "nav.saved_keywords": "Saved Keywords",
    "nav.site_audit": "Site Audit",
    "nav.research": "Research",
    "nav.keyword_research": "Keyword Research",
    "nav.domain_overview": "Domain Overview",
    "nav.backlinks": "Backlinks",
    "nav.brand_lookup": "Brand Lookup",
    "nav.prompt_explorer": "Prompt Explorer",
    "nav.connect": "Connect",
    "nav.ai_mcp": "AI & MCP",
    "nav.help": "Help & Community",
    "nav.settings": "Settings",
    "nav.billing": "Billing",
    "nav.organization": "Organization",
    "nav.browse": "Browse",
    "nav.chat": "Chat",
    "nav.super_admin": "Super Admin",
    "nav.secure_session": "Secure Session",
    "nav.user_name": "Eng. Mohamed Abdelsamee",
    "nav.logout": "Sign Out",

    // Brand Lookup
    "brand.title": "Brand Lookup",
    "brand.subtitle": "See how AI search cites any brand name or domain",
    "brand.input_placeholder": "Enter a brand name or domain...",
    "brand.competitors_placeholder": "Add competitors (comma-separated)...",
    "brand.lookup_button": "Look up",
    "brand.ai_analyzing": "Querying and analyzing AI models...",
    "brand.no_mentions_title": "No AI Mentions Detected Yet",
    "brand.no_mentions_desc": "No brand citations found yet for this target across ChatGPT, Claude, Gemini, or Perplexity. Regular publishing will build presence.",
    "brand.verification_notice": "DataForSEO account requires portal verification. Intelligent fallback AI estimation was engaged automatically.",

    // Time Labels
    "time.1am": "1am",
    "time.2am": "2am",
    "time.3pm": "3pm",
    "time.9pm": "9pm",
    "time.2pm": "2pm",

    // Search Performance (GSC)
    "gsc.page_title": "Search Performance",
    "gsc.queries_tab": "Queries",
    "gsc.pages_tab": "Pages",
    "gsc.countries_tab": "Countries",
    "gsc.devices_tab": "Devices",
    "gsc.date_range": "Date Range",
    "gsc.export": "Export",
    "gsc.last_7_days": "Last 7 days",
    "gsc.last_28_days": "Last 28 days",
    "gsc.last_3_months": "Last 3 months",
    "gsc.filter_device": "Filter by device",

    // Site Audit
    "audit.page_title": "Site Audit",
    "audit.run_audit": "Run Audit",
    "audit.pages_crawled": "Pages Crawled",
    "audit.issues_found": "Issues Found",
    "audit.critical_issues": "Critical Issues",
    "audit.warnings": "Warnings",
    "audit.passed_pages": "Passed Pages",
    "audit.last_run": "Last Run",
    "audit.view_issues": "View Issues",
    "audit.view_pages": "View Pages",
    "audit.status_completed": "Completed",
    "audit.status_running": "Running...",
    "audit.status_pending": "Pending",

    // Backlinks
    "backlinks.page_title": "Backlinks",
    "backlinks.search_placeholder": "Enter a domain to explore its backlinks...",
    "backlinks.search_button": "Search",
    "backlinks.total_backlinks": "Total Backlinks",
    "backlinks.referring_domains": "Referring Domains",
    "backlinks.new_backlinks": "New Backlinks",
    "backlinks.lost_backlinks": "Lost Backlinks",
    "backlinks.domain_authority": "Domain Authority",
    "backlinks.anchor_text": "Anchor Text",
    "backlinks.source_url": "Source URL",
    "backlinks.target_url": "Target URL",

    // Keyword Research
    "keywords.page_title": "Keyword Research",
    "keywords.search_placeholder": "Enter a keyword to research...",
    "keywords.search_button": "Search",
    "keywords.monthly_volume": "Monthly Volume",
    "keywords.competition": "Competition",
    "keywords.cpc": "CPC",
    "keywords.intent": "Intent",
    "keywords.difficulty": "Difficulty",
    "keywords.save": "Save",
    "keywords.saved": "Saved",
    "keywords.intent.informational": "Informational",
    "keywords.intent.commercial": "Commercial",
    "keywords.intent.navigational": "Navigational",
    "keywords.intent.transactional": "Transactional",

    // Saved Keywords
    "saved.page_title": "Saved Keywords",
    "saved.no_keywords": "No saved keywords yet",
    "saved.delete": "Delete",
    "saved.export": "Export",
    "saved.tag": "Tag",
    "saved.bulk_delete": "Bulk Delete",

    // Domain Overview
    "domain.page_title": "Domain Overview",
    "domain.search_placeholder": "Enter a domain to analyze...",
    "domain.organic_traffic": "Estimated Organic Traffic",
    "domain.organic_keywords": "Organic Keywords",
    "domain.backlinks": "Backlinks",
    "domain.referring_domains": "Referring Domains",

    // Rank Tracking
    "rank.page_title": "Rank Tracking",
    "rank.add_keyword": "Add Keyword",
    "rank.current_position": "Current Position",
    "rank.change": "Change",
    "rank.last_checked": "Last Checked",
    "rank.desktop": "Desktop",
    "rank.mobile": "Mobile",
    "rank.top3": "Top 3",
    "rank.top10": "Top 10",
    "rank.top100": "Top 100",

    // Settings
    "settings.page_title": "Settings",
    "settings.general": "General",
    "settings.integrations": "Integrations",
    "settings.team": "Team",
    "settings.domain": "Domain",
    "settings.save": "Save Changes",
    "settings.saved": "Saved",
    "settings.gsc_connect": "Connect Google Search Console",
    "settings.ga4_connect": "Connect Google Analytics 4",
    "settings.ads_connect": "Connect Google Ads",
    "settings.make_connect": "Connect Make.com",

    // Billing
    "billing.page_title": "Billing & Subscription",
    "billing.current_plan": "Current Plan",
    "billing.upgrade": "Upgrade Plan",
    "billing.usage": "Usage",
    "billing.invoices": "Invoices",

    // Auth
    "auth.signin_title": "Sign In",
    "auth.signup_title": "Create Account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.google_signin": "Sign in with Google",
    "auth.forgot_password": "Forgot password?",

    // SAM AI Assistant
    "sam.page_title": "SAM AI Assistant",
    "sam.input_placeholder": "Ask me about SEO strategy...",
    "sam.send": "Send",
    "sam.welcome": "Hi! I'm SAM, your AI SEO assistant. How can I help you today?",
    "sam.thinking": "Thinking...",

    // Prompt Explorer
    "prompt.page_title": "Prompt Explorer",
    "prompt.input_placeholder": "Enter a prompt to compare AI model responses...",
    "prompt.run": "Run",

    // AI & MCP
    "ai.page_title": "AI & MCP Tools",
    "ai.copy_command": "Copy Command",
    "ai.copied": "Copied",

    // Skills Hub Detailed
    "skills.page_title": "AI Strategy & Skills Hub",
    "skills.run": "Run",
    "skills.ready": "Ready",
    "skills.hub_badge": "AI Skills & Autonomous Intelligence Hub",
    "skills.powered_by_agy": "Powered by Google Antigravity (AGY)",
    "skills.hero_title": "AI Skills Engine & Forensic SEO Analysis",
    "skills.hero_desc": "Invoke OpenSEO skills for Google Antigravity, trigger real cloud audit engine, and synthesize tactical briefs.",
    "skills.tab_agy": "Google Antigravity Agent",
    "skills.tab_audit": "Live Cloud Audit",
    "skills.tab_geo": "GEO Visibility Radar",
    "skills.brief_title": "Topical Cluster & Tactical Brief Generator",
    "skills.brief_desc": "Invokes seo-cluster and seo-content-brief to construct optimized article architectures.",
    "skills.target_keyword": "Target Keyword:",
    "skills.target_market": "Target Market:",
    "skills.market_sa": "🇸🇦 Saudi Arabia (Salla, Zid, Riyadh Clinics)",
    "skills.market_eg": "🇪🇬 Egypt (Local Commerce & Clinics)",
    "skills.market_gulf": "🇯🇴 Jordan & GCC (Medical Tourism & Commerce)",
    "skills.copy_brief": "Copy Full Tactical Brief",
    "skills.copied": "Copied Successfully!",
    "skills.enabled_skills": "Active Google Antigravity Skills:",
    "skills.preview_title": "Interactive Tactical Brief Preview (Output)",
    "skills.ready_publish": "Ready to Publish",
    "skills.standards_notice": "E-E-A-T Compliant & AI-Engine Optimized",
    "skills.view_live_article": "View Live Published Article",
    "skills.audit_title": "Live Cloud Site Audit Engine (OpenSEO)",
    "skills.audit_desc": "Trigger comprehensive audit with D1 and Google Lighthouse for real Core Web Vitals.",
    "skills.url_label": "Website URL to Audit:",
    "skills.start_audit_btn": "Launch Live Audit Now",
    "skills.audit_running": "Cloud Audit in Progress...",
    "skills.live_logs_title": "Real-Time Engine Logs:",
    "skills.open_audit_results": "Open Detailed Audit Results",
    "skills.geo_title": "Generative Engine Optimization (GEO) Radar",
    "skills.geo_desc": "Track brand citations across Perplexity, ChatGPT, Claude, and Gemini.",
    "skills.geo_citation_rate": "AI Citation Rate",
    "skills.geo_prompts_tracked": "Tracked Prompts",
    "skills.geo_top_model": "Top Citing Model",
    "skills.geo_readiness": "AEO Readiness",

    // Performance & Vorder Studio Detailed
    "perf.hero_badge": "Live Sync with Google Cloud (GSC & GA4)",
    "perf.hero_title": "Live Portfolio SEO & Conversions Radar",
    "perf.connected_domain": "Connected Domain:",
    "perf.sync_sitemaps": "Sync Sitemaps",
    "perf.visit_portfolio": "Visit Portfolio",
    "perf.range_28d": "Last 28 Days (Standard)",
    "perf.range_7d": "Last 7 Days",
    "perf.range_3m": "Last 3 Months",
    "perf.card_articles": "Published Articles",
    "perf.card_articles_desc": "0% images, full SVG & structured data",
    "perf.card_articles_index": "Synchronized live articles index",
    "perf.card_ctr": "Click-Through Rate (CTR)",
    "perf.gsc_clicks": "Search Clicks",
    "perf.gsc_impressions": "Impressions",
    "perf.gsc_live": "Live Search Console",
    "perf.card_ga4": "GA4 Sessions & Events",
    "perf.ga4_sessions": "Sessions",
    "perf.ga4_conversions": "Recorded Conversion Events",
    "perf.ga4_direct": "Direct Google Analytics 4 Connection",
    "perf.card_audit": "SEO Health & Audit",
    "perf.audit_status_done": "Completed",
    "perf.audit_pages_crawled": "Pages Audited",
    "perf.audit_zero_issues": "0 Technical Issues (100% Healthy)",
    "perf.engine_prescription_title": "Smart Prescription & Architectural Guidance Engine",
    "perf.engine_prescription_desc": "Continuous benchmarking against core metrics with real-time optimization paths.",
    "perf.opp_striking_title": "Growth Opportunity: Striking-Distance Keywords",
    "perf.opp_striking_desc": "Keywords in positions 4-18 in Saudi Arabia and Egypt close to top ranking.",
    "perf.opp_striking_action": "👉 Focus H2 headings and contextual internal mesh linking",
    "perf.opp_make_title": "Make.com Autonomous Engine & Daily Publishing",
    "perf.opp_make_desc": "Automated GSC, GA4, and Ads integration with daily tactical article publishing via GitHub CI/CD.",
    "perf.opp_make_badge": "⚡ Make.com Autonomous Loop (Active)",
    "perf.opp_sitemap_title": "Sitemap & Indexation",
    "perf.opp_sitemap_desc": "XML sitemaps, robots.txt, and llms.txt are 100% compliant.",
    "perf.opp_sitemap_status": "Healthy (sitemap.xml & llms.txt)",
    "perf.telemetry_title": "Make.com Live Autonomous Telemetry & Operations Command",
    "perf.telemetry_desc": "Real-time execution logs, crawl health, and closed-loop sync with Make.com and Cloudflare D1.",
    "perf.run_cycle_btn": "Run Instant Cycle Now",
    "perf.running_cycle": "Running Cycle...",
    "perf.open_make_scenario": "Open Scenario in Make",
    "perf.system_healthy_badge": "System 100% Healthy (Make Errors Resolved)",
    "perf.active_loop_badge": "Active Loop",
    "perf.stat_schedule": "Autonomous Schedule",
    "perf.stat_schedule_val": "Every 12 Hours (06:00 / 18:00)",
    "perf.stat_keywords": "Active Monitored Keywords",
    "perf.stat_keywords_sub": "Saudi & Egypt (Live Tracking)",
    "perf.stat_pages": "Verified Audited Pages",
    "perf.stat_pages_sub": "0 Technical Issues (100% Healthy)",
    "perf.stat_articles": "Published Tactical Articles",
    "perf.stat_articles_sub": "100% SVG, 0% external images",
    "perf.table_title": "Published Articles Index & Performance Metrics",
    "perf.table_search_placeholder": "Search articles and keywords...",
    "perf.filter_all": "All",
    "perf.filter_success": "Successful Only",
    "perf.filter_errors": "Errors",
    "perf.col_article": "Article",
    "perf.col_keyword": "Focus Keyword",
    "perf.col_intent": "Intent",
    "perf.col_views": "Views",
    "perf.col_clicks": "Clicks",
    "perf.col_impressions": "Impressions",
    "perf.col_ctr": "CTR",
    "perf.col_rank": "Rank",
    "perf.col_actions": "Actions",
    "perf.open_article": "Open Article",
    "perf.tab_all": "All Articles",
    "perf.tab_autonomous_published": "Autonomous Published",
    "perf.tab_queue": "Scheduled Content Queue",
    "perf.btn_ai_generator": "Generate Articles with AI",
    "perf.btn_publish_now": "Publish Now",
    "perf.col_status": "Status",
    "perf.col_order": "Queue #",
    "perf.status_published": "Live Published",
    "perf.status_queued": "In Queue",
    "perf.inspect_details": "Inspect Details",
    "perf.total_combined": "Total Articles",
    "perf.scheduled_in_queue": "In Queue",
    "perf.monthly_searches": "monthly searches",
    "perf.col_date": "Publish Date & Status",
    "perf.queued_schedule_hint": "Scheduled for release via autonomous Make.com cycle",
    "perf.secondary_keywords_label": "Semantic Keywords (LSI Keywords)",
    "perf.outline_hierarchy": "Required Headings Hierarchy (H2 & H3)",
    "perf.geo_snippet_label": "AI Search Engine Citation (GEO Snippet):",
    "perf.view_live_article": "View Live Article in Portfolio",
    "perf.auto_schedule_note": "Will be published automatically and synchronized with Google Search Console.",
    "perf.publishing_now": "Publishing & Syncing...",
    "perf.publish_now_btn": "⚡ Publish Article Now",
    "perf.modal_close": "Close",
    "perf.empty_queue": "No articles in queue. Generate a new batch using AI.",
    "perf.empty_published": "No autonomous articles published yet.",
    "studio.badge": "AI Article Studio (Gemini)",

    // Theme
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System"
  }
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => {
    if (typeof window === "undefined") return "ar";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "ar" || stored === "en") return stored;
    } catch {}
    return "ar"; // Default to Arabic as primary native language requested
  });

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === "ar" ? "en" : "ar";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const isRtl = language === "ar";
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = React.useCallback(
    (key: string, fallback?: string): string => {
      const dict = translations[language];
      if (dict && dict[key]) {
        return dict[key];
      }
      if (translations.en[key]) {
        return translations.en[key];
      }
      return fallback ?? key;
    },
    [language]
  );

  const isRtl = language === "ar";
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isRtl,
      dir,
    }),
    [language, setLanguage, toggleLanguage, t, isRtl, dir]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    // Fallback safe context if rendered outside provider
    return {
      language: "ar" as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string, fallback?: string) => translations.ar[key] ?? fallback ?? key,
      isRtl: true,
      dir: "rtl" as const,
    };
  }
  return context;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, toggleLanguage, isRtl } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={isRtl ? "Switch to English" : "التبديل إلى العربية"}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1C1C1E] px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-[#2C2C2E] hover:text-white transition-all shadow-sm ${className}`}
    >
      <span className="text-zinc-400">🌐</span>
      <span>{language === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
