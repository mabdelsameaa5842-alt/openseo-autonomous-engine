// Live Article Batch Publisher for OpenSEO & Portfolio Ecosystem
// Pushes high-converting, tactical articles to Supabase PostgreSQL & triggers live sync

const SUPABASE_PROD_URL = "https://cuffpkbuhwluirxuqmqk.supabase.co";
const SUPABASE_PROD_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZmZwa2J1aHdsdWlyeHVxbXFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTMxMjI2NywiZXhwIjoyMTAwODg4MjY3fQ.3f8Olv09NlwFBmvvCdmlhO7Z19fvA8IxmN6Ity4VA4g";

const PROOF_BOX = `> 💡 **شاهد نتائج وأرقام الحملات الفعلية بالأرقام:** يمكنك مراجعة [بورتفوليو ونتائج حملات م. محمد عبد السميع الموثقة](https://mohamed-abdelsamee-portfolio.vercel.app/#case-studies) للاطلاع على تفاصيل مضاعفة الـ ROAS حتى 21x وتحقيق مبيعات تتجاوز 120 مليون جنيه لمتاجر وعيادات كبرى في مصر والخليج.`;

const batch = [
  {
    id: "art_meta_capi_server_side_salla_2026",
    slug: "meta-capi-server-side-tracking-shopify-salla-2026",
    title: "دليل إعداد تتبع Meta CAPI السحابي لمتاجر سلة وشوبيفاي في السعودية ومصر 2026",
    focusKeyword: "تتبع Meta CAPI السحابي",
    category: "التتبع المتقدم والذكاء الاصطناعي",
    country: "السعودية ومصر",
    excerpt: "دليل تطبيقي متكامل لإعداد Conversion API من خادم التتبع السحابي Cloudflare و GTM لمتاجر سلة وشوبيفاي لحل مشكلة فقدان بيانات الإعلانات ورفع مطابقة البيانات EMQ فوق 8.5.",
    metaDescription: "دليل تطبيقي لإعداد تتبع Meta CAPI السحابي لمتاجر سلة وشوبيفاي في السعودية ومصر 2026 لرفع دقة تتبع البيانات ومضاعفة الـ ROAS.",
    content: `## الخلاصة التنفيذية (Direct Answer Block)
يُعد **تتبع Meta CAPI السحابي** حجر الزاوية لكل متجر إلكتروني يسعى لتفادي قيود التتبع في iOS وتجنب فقدان أكثر من 35% من أحداث الشراء. من خلال نقل تتبع التحويلات من متصفح العميل إلى خادم الحافة (Server-Side GTM)، يرتفع معدل جودة مطابقة الأحداث (Event Match Quality - EMQ) إلى أكثر من 8.5 من 10، مما يمنح خوارزميات ميتا القدرة على استهداف المشترين الفعليين بأقل تكلفة استحواذ ممكنة (CPA).

${PROOF_BOX}

## الفارق الجوهري بين التتبع من المتصفح والتتبع السحابي
تعتمد بيكسل ميتا التقليدية على تشغيل كود JavaScript داخل متصفح المستخدم، مما يعرضها للحجب بواسطة أدوات AdBlock أو قيود الخصوصية المطبقة في متصفحات Safari وChrome. في المقابل، يرسل التتبع السحابي (Server-Side) الأحداث مباشرة من خادم متجرك في سلة أو شوبيفاي إلى خوادم Meta عبر واجهة برمجية آمنة وموثقة.

| معيار المقارنة | بيكسل المتصفح التقليدي | تتبع Meta CAPI السحابي |
| :--- | :--- | :--- |
| **معدل وصول البيانات** | يفقد 25% - 40% من التحويلات | استقرار يتجاوز 98.5% |
| **جودة مطابقة الأحداث (EMQ)** | تتراوح بين 4.5 إلى 6.0 | تتراوح بين 8.2 إلى 9.4 |
| **التأثير على سرعة المتجر (LCP)** | يبطئ تحميل واجهة العميل | صفر تأثير على المتصفح |
| **الاستقرار مع إعلانات الأداء** | تقلبات متكررة في تكلفة الطلب | استقرار تام في تتبع الـ ROAS |

## خطوات التنفيذ الهندسية لربط CAPI على سلة وشوبيفاي
1. **إنشاء حاوية GTM السحابية (Server Container):** نشر حاوية على Google Cloud Platform أو Cloudflare Worker.
2. **تمرير المعرّفات الموحدة (External IDs):** تمرير معرّف الزائر ورقم الهاتف والبريد الإلكتروني المشفر بصيغة SHA256.
3. **تطبيق مطابقة إزالة التكرار (Deduplication Logic):** إرسال نفس \`event_id\` في المتصفح والخادم حتى تدمجهما ميتا كحدث واحد بدون مضاعفة الإحصاءات.
4. **ربط بوابة الدفع (COD / Fawry / Mada / Tamara):** تتبع حدث الشراء الحقيقي بعد نجاح الدفع أو تأكيد استلام الطلب.

## أسئلة شائعة حول تتبع Meta CAPI السحابي
### هل يحتاج التتبع السحابي إلى اشتراك خادم شهري مكلف؟
يمكن تشغيله بتكلفة شبه معدومة عبر باقات Cloudflare Workers المجانية أو خوادم Stape المخفضة، مما يجعله استثماراً عالي الجدوى من اليوم الأول.

### كم من الوقت يستغرق ظهور تحسن أداء الحملات بعد تفعيل CAPI؟
تحتاج خوارزمية ميتا من 5 إلى 7 أيام لإعادة التعلم واستيعاب البيانات المرتفعة، يليها انخفاض تدريجي ملحوظ في تكلفة الشراء المؤكد.`,
  },
  {
    id: "art_tiktok_shop_performance_marketing_gcc_2026",
    slug: "tiktok-shop-performance-marketing-gcc-playbook",
    title: "استراتيجيات إعلانات تيك توك وسكايلينج المبيعات لأسواق الخليج والسعودية 2026",
    focusKeyword: "إعلانات تيك توك في السعودية",
    category: "ميديا باينج وإعلانات الأداء",
    country: "السعودية والخليج",
    excerpt: "الدليل الشامل لإطلاق وتحجيم حملات تيك توك للمتاجر الإلكترونية في السعودية والإمارات، من صناعة المحتوى الإعلاني الـ UGC وحتى ضبط استهداف Spark Ads والـ Smart+ Campaigns.",
    metaDescription: "دليل احترافي لإطلاق وسكايلينج إعلانات تيك توك في السعودية والخليج 2026، لتحقيق أعلى عائد على الإنفاق الإعلاني ROAS ومبيعات مليونية.",
    content: `## الخلاصة التنفيذية (Direct Answer Block)
أصبحت **إعلانات تيك توك في السعودية** القناة الأسرع نمواً للمتاجر الإلكترونية بفضل قوة خوارزمية الفيديو القصير وسلوك الشراء المباشر للجمهور الخليجي. يعتمد النجاح في 2026 على الدمج بين فيديوهات المحتوى العفوي المصنوع بواسطة المستخدمين (UGC)، واستخدام إعلانات الشرارة (Spark Ads) عبر حسابات موثوقة، مع تطبيق خوارزمية العروض التلقائية Smart+ Campaigns لضمان استقرار تكلفة الطلب (Cost Per Purchase).

${PROOF_BOX}

## أعمدة النجاح الـ 4 لإعلانات تيك توك الخليجية
1. **صنّاع المحتوى المحليون (Local Saudi UGC):** الجمهور السعودي يثق في اللهجة المحلية والمراجعات الواقعية أكثر من الإعلانات التلفزيونية المصطنعة.
2. **الهوك البصري في أول 3 ثوانٍ:** إذا لم تلفت انتباه المشاهد قبل الثانية الثالثة، سينتقل فوراً للفيديو التالي وتخسر تكلفة الظهور.
3. **العروض الصريحة والضمان (No-Brainer Offer):** شحن مجاني، دفع عند الاستلام، أو تجربة مجانية مع إبراز سرعة التوصيل في مدن الرياض وجدة والدمام.
4. **تتبع الأحداث عبر TikTok Events API:** تفعيل التتبع الخادمي المباشر لضمان دقة احتساب عمليات الدفع عند الاستلام (COD).

| عنصر الإعلان | الأسلوب التقليدي الفاشل | الأسلوب الإبداعي الناجح (2026) |
| :--- | :--- | :--- |
| **الصوت والموسيقى** | موسيقى بدون كلام | صوت طبيعي يشرح المشكلة والحل |
| **المشهد الافتتاحي** | شعار المتجر لمدة 3 ثوانٍ | فتح الصندوق (Unboxing) أو مشهد صادم |
| **الدعوة للإجراء (CTA)** | رابط في الأسفل فقط | سهم توضيحي وعرض حصري ينتهي اليوم |`,
  },
  {
    id: "art_snapchat_ads_cod_ecommerce_optimization",
    slug: "snapchat-ads-cod-ecommerce-conversion-optimization",
    title: "مضاعفة العائد الإعلاني ROAS على سناب شات لمتاجر الدفع عند الاستلام COD",
    focusKeyword: "إعلانات سناب شات للمتاجر",
    category: "سكيلينج المتاجر والـ ROAS",
    country: "السعودية والخليج",
    excerpt: "كيف ترفع نسبة تأكيد طلبات الدفع عند الاستلام في السعودية وتقلل الارتجاع عبر هندسة إعلانات سناب شات وأتمتة تأكيد الطلبات بالواتساب والـ CRM.",
    metaDescription: "أسرار مضاعفة الـ ROAS على سناب شات لمتاجر الدفع عند الاستلام في السعودية، وتقليل نسبة الإلغاء والارتجاع إلى أقل من 12%.",
    content: `## الخلاصة التنفيذية (Direct Answer Block)
تظل **إعلانات سناب شات للمتاجر** في السعودية والخليج القوة الإعلانية الأكثر تأثيراً على شريحة النساء والشباب في قطاعات الأزياء والجمال ومستلزمات المنزل. والتحدي الأكبر في متاجر الدفع عند الاستلام (COD) ليس جلب الطلب، بل تأكيده واستلام قيمته. من خلال هندسة صفحة هبوط ذات خانات محدودة، وتفعيل التحقق عبر رسائل الواتساب الفورية، تنخفض نسبة الإلغاء من 45% إلى أقل من 12%.

${PROOF_BOX}

## خريطة تقليل ارتجاع الشحنات (COD Delivery Rate)
- **فلترة أرقام الهواتف الوهمية:** وضع نظام تحقق تلقائي (OTP أو تأكيد واتساب لحظي) قبل شحن الطلب.
- **التواصل خلال 10 دقائق من الطلب (Speed to Lead):** سرعة تواصل خدمة العملاء تزيد احتمالية استلام الشحنة بنسبة 65%.
- **استهداف الفئات العمرية الناضجة:** في سناب شات، الفئات من 25 إلى 45 سنة تحقق نسبة استلام للطلبات تفوق الفئات الأقل عمراً بمقدار الضعف.`,
  },
  {
    id: "art_google_performance_max_ecommerce_scaling",
    slug: "google-performance-max-ecommerce-scaling-saudi",
    title: "أسرار تحسين حملات Google Performance Max لمتاجر التجزئة في الرياض وجدة",
    focusKeyword: "حملات Google Performance Max",
    category: "ميديا باينج وإعلانات الأداء",
    country: "السعودية",
    excerpt: "دليل تقني لكيفية ضبط إشارات الجمهور (Audience Signals) وتغذية بيانات المنتجات (Google Merchant Center) لتحقيق أقصى ربحية ممكنة في التجارة الإلكترونية السعودية.",
    metaDescription: "دليل احترافي لإدارة وتوسيع حملات Google Performance Max في السعودية، وتحقيق ROAS يتجاوز 8x مع تحسين تدفق المبيعات على شوبيفاي وسلة.",
    content: `## الخلاصة التنفيذية (Direct Answer Block)
تعتبر **حملات Google Performance Max** في السعودية الأداة الأقوى لاقتناص المشترين الذين يبحثون بنية شرائية صريحة عبر بحث جوجل واليوتيوب وشبكة خرائط جوجل والـ Gmail في حملة ذكية موحدة. يعتمد نجاح الحملة في 2026 على تزويد خوارزميات جوجل بـ "بيانات العملاء ذوي القيمة العالية (Customer Match Lists)"، مع استبعاد الكلمات المفتاحية السلبية (Negative Keywords) لحماية الميزانية من النقرات غير المجدية.

${PROOF_BOX}

## الخطوات الذهبية لضبط حملة PMax رابحة
1. **تحسين بيانات التغذية (Product Feed Optimization):** كتابة عناوين منتجات تتضمن الكلمات المفتاحية الأكثر بحثاً في السعودية (مثل: ماركة، مقاس، لون، شحن سريع للرياض).
2. **تغذية إشارات الجمهور (Audience Signals):** رفع قوائم العملاء المشترين سابقاً لتدريب الذكاء الاصطناعي على استنساخهم (Lookalikes).
3. **تطبيق تتبع القيمة المحسنة (Value-Based Bidding):** توجيه المزايدة نحو المنتجات ذات هوامش الربح المرتفعة بدلاً من مجرد زيادة عدد المبيعات.`,
  },
  {
    id: "art_programmatic_seo_dynamic_landing_pages",
    slug: "programmatic-seo-dynamic-landing-pages-scale",
    title: "تصدر محركات البحث التوليدية وهندسة صفحات الهبوط البرمجية Programmatic SEO",
    focusKeyword: "صفحات الهبوط البرمجية Programmatic SEO",
    category: "سيو وميديا باينج متقدم",
    country: "مصر والخليج",
    excerpt: "كيف تبني معمارية سيو برمجية تولد آلاف صفحات الهبوط عالية السرعة متوافقة مع Google AI Overviews و Perplexity ومحركات البحث التقليدية بأداء 100/100 Core Web Vitals.",
    metaDescription: "الدليل المرجعي لهندسة وتوسيع صفحات الهبوط البرمجية Programmatic SEO لعام 2026 لتصدر نتائج البحث العضوي والذكاء الاصطناعي بمعدل ارتداد منخفض.",
    content: `## الخلاصة التنفيذية (Direct Answer Block)
يمثل **Programmatic SEO** أو السيو البرمجي ثورة حقيقية في بناء الأصول الرقمية، حيث يتم تحويل قاعدة بيانات منظمة إلى آلاف الصفحات المتخصصة التي تجيب بدقة متناهية على استفسارات البحث الطويلة (Long-Tail Queries). تتيح هذه المعمارية تصدر محركات الإجابة التوليدية (GEO مثل ChatGPT وGoogle Gemini وPerplexity) بمعدل تكلفة شبه منعدم للزائر مقارنة بالإعلانات المدفوعة.

${PROOF_BOX}

## معايير حماية السيو البرمجي من عقوبات المحتوى المكرر (Helpful Content System)
- **إدراج بيانات حصرية غير مكررة:** تضمين مؤشرات أسعار حقيقية، أوقات توصيل لكل مدينة، أو جداول مقارنة تقنية فريدة لكل صفحة.
- **التصميم فائق السرعة عبر الحافة السحابية (Edge SSR):** تقديم الصفحة في أقل من 50 ميلي ثانية لتحقيق 100/100 على PageSpeed Insights.
- **تطبيق Schema Markup الديناميكية:** حقن كود JSON-LD مهيكل لنوع الخدمة والموقع الجغرافي والأسئلة الشائعة في كل صفحة.`,
  },
];

async function run() {
  console.log(`Starting publish batch of ${batch.length} articles to Supabase...`);

  const payload = batch.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    focus_keyword: item.focusKeyword,
    category: item.category,
    country: item.country,
    excerpt: item.excerpt,
    meta_description: item.metaDescription,
    cover_image: "",
    content: item.content,
    published: true,
    read_time: "7 دقائق",
    project_id: "cc58e018-8ef9-4be7-8f3a-2af2bc158d62",
    word_count: item.content.split(/\s+/).filter(Boolean).length,
    status: "published",
    updated_at: new Date().toISOString(),
  }));

  const resp = await fetch(`${SUPABASE_PROD_URL}/rest/v1/vorder_articles`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PROD_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_PROD_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error("Supabase upsert failed:", resp.status, txt);
    process.exit(1);
  }

  const inserted = await resp.json();
  console.log(`✅ Successfully published ${inserted.length} articles to Supabase!`);
  for (const art of inserted) {
    console.log(` - ${art.title} (slug: ${art.slug})`);
  }

  // Also query count
  const countResp = await fetch(
    `${SUPABASE_PROD_URL}/rest/v1/vorder_articles?select=id&limit=1`,
    {
      headers: {
        apikey: SUPABASE_PROD_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_PROD_SERVICE_ROLE_KEY}`,
        Prefer: "count=exact",
      },
    }
  );
  console.log("Supabase Content-Range:", countResp.headers.get("content-range"));
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
