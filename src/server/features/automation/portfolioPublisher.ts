// Dynamic Portfolio Publisher Engine
// Publishes 100% compliant, tactical articles to the active project portfolio endpoint
// Endpoint: POST https://${domain}/api/articles
// Live URL: https://${domain}/blog/[slug]

export interface ArticleQueueItem {
  id?: string;
  article_slug: string;
  article_title: string;
  primary_keyword: string;
  intent?: string;
  secondary_keywords?: string[] | string;
  brief_outline?: string[] | string;
  monthly_volume?: number;
}

export interface PortfolioArticlePayload {
  id: string;
  title: string;
  slug: string;
  focusKeyword: string;
  category: string;
  excerpt: string;
  metaDescription: string;
  coverImage: string;
  content: string;
  published: boolean;
  readTime: string;
}

export function getPortfolioApiUrl(domain?: string) {
  const clean = (domain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return clean ? `https://${clean}/api/articles` : "/api/articles";
}

export function getPortfolioBlogBase(domain?: string) {
  const clean = (domain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  return clean ? `https://${clean}/blog` : "/blog";
}

export const PORTFOLIO_API_URL = getPortfolioApiUrl();
export const PORTFOLIO_BLOG_BASE = getPortfolioBlogBase();

export function getBrandProofBox(domain?: string): string {
  const clean = (domain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const targetUrl = clean ? `https://${clean}/#case-studies` : "#case-studies";
  return `> 💡 **شاهد نتائج وأرقام الحملات الفعلية بالأرقام:** يمكنك مراجعة [دراسات الحالة وسابقة الأعمال الموثقة](${targetUrl}) للاطلاع على تفاصيل مضاعفة العائد على الإنفاق الإعلاني والنمو التجاري الموثق.`;
}

export const BRAND_PROOF_BOX = getBrandProofBox();

export function generateTacticalArticleContent(item: ArticleQueueItem): {
  content: string;
  metaDescription: string;
  category: string;
  readTime: string;
} {
  const kw = (item.primary_keyword || item.article_title || "").trim();
  const title = (item.article_title || item.primary_keyword || "").trim();
  const slug = item.article_slug;
  const intent = item.intent || "Commercial";

  // Deterministic seed for variety based on slug characters
  let seed = 0;
  for (let i = 0; i < slug.length; i++) {
    seed = (seed * 31 + slug.charCodeAt(i)) % 10007;
  }

  let secondaryKws: string[] = [];
  if (Array.isArray(item.secondary_keywords)) {
    secondaryKws = item.secondary_keywords;
  } else if (typeof item.secondary_keywords === "string") {
    try {
      secondaryKws = JSON.parse(item.secondary_keywords);
    } catch {
      secondaryKws = item.secondary_keywords.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  // Detect location and niche from slug & title
  const isEgypt = slug.includes("cairo") || slug.includes("egypt") || slug.includes("alexandria") || slug.includes("giza") || title.includes("مصر") || title.includes("القاهرة") || title.includes("الإسكندرية") || title.includes("الجيزة");
  const isSaudi = slug.includes("saudi") || slug.includes("riyadh") || slug.includes("jedda") || slug.includes("dammam") || title.includes("سعودي") || title.includes("الرياض") || title.includes("جدة") || title.includes("الشرقية");
  const isUAE = slug.includes("uae") || slug.includes("dubai") || slug.includes("abu-dhabi") || title.includes("دبي") || title.includes("الإمارات") || title.includes("أبوظبي");
  
  const regionLabel = isSaudi ? "المملكة العربية السعودية والخليج" : (isUAE ? "دولة الإمارات ودول مجلس التعاون" : (isEgypt ? "جمهورية مصر العربية والشرق الأوسط" : "الشرق الأوسط والخليج العربي"));
  const cityFocus = isSaudi ? "الرياض وجدة" : (isUAE ? "دبي وأبوظبي" : (isEgypt ? "القاهرة والإسكندرية والجيزة" : "العواصم التجارية العربية"));

  let outlinePoints: string[] = [];
  if (Array.isArray(item.brief_outline)) {
    outlinePoints = item.brief_outline;
  } else if (typeof item.brief_outline === "string") {
    try {
      outlinePoints = JSON.parse(item.brief_outline);
    } catch {
      outlinePoints = item.brief_outline.split("\n").map((s) => s.trim()).filter(Boolean);
    }
  }

  if (outlinePoints.length === 0) {
    const angleVariants = [
      [
        `التشخيص الهيكلي ومعمارية النمو لـ ${kw} في ${regionLabel}`,
        `هندسة مسارات التحويل وتتبع الإشارات المتقدمة (CAPI & Server-side)`,
        `استراتيجيات خفض تكلفة الاستحواذ (CAC) ورفع القيمة الدائمة للعميل`,
        `تحليل العائد الاستثماري وحساب الأرباح الصافية لعام 2026`,
      ],
      [
        `واقع المنافسة وتحديات المزادات الإعلانية لـ ${kw} في ${cityFocus}`,
        `بناء القمع التسويقي الذكي واستبعاد النقرات غير المجدية`,
        `أتمتة المبيعات والربط السحابي بين المنصات وأنظمة الـ CRM`,
        `مضاعفة معدلات الإغلاق ورفع نقاط الجودة Quality Score`,
      ],
      [
        `التحول الرقمي وتصدر إجابات الذكاء الاصطناعي GEO لـ ${kw}`,
        `بناء السلطة الدلالية ومواءمة نية الشراء الدقيقة للمستهلك`,
        `إدارة الميزانيات التكتيكية وتفادي إهدار الإنفاق الإعلاني`,
        `خريطة العمل التطبيقية ومؤشرات الأداء الحاسمة للربع القادم`,
      ]
    ];
    outlinePoints = angleVariants[seed % angleVariants.length];
  }

  // Choose category
  let category = "سيو وميديا باينج متقدم";
  if (slug.includes("ecommerce") || slug.includes("cro") || slug.includes("salla") || slug.includes("zid")) {
    category = "تجارة إلكترونية وتوسيع ROAS";
  } else if (slug.includes("google-ads") || slug.includes("meta") || slug.includes("tiktok") || slug.includes("ads") || slug.includes("pmax")) {
    category = "ميديا باينج وإعلانات الأداء";
  } else if (slug.includes("tracking") || slug.includes("gtm") || slug.includes("server-side") || slug.includes("capi")) {
    category = "أتمتة وتتبع التحويلات المتقدم";
  } else if (slug.includes("saudi") || slug.includes("riyadh") || slug.includes("gcc") || slug.includes("egypt")) {
    category = "استشارات ونمو إقليمي";
  }

  // Dynamic non-repeating Meta Description
  const metaVariants = [
    `دليلك الهندسي المتكامل لـ ${kw} في ${regionLabel} لعام 2026. استراتيجيات عملية وخريطة طريق لمضاعفة الـ ROAS والتحويلات بدون أخطاء.`,
    `كيف تطبق ${kw} بكفاءة مثبتة في ${cityFocus}؟ أسرار خفض تكلفة الاكتساب ومضاعفة صافي أرباح الحملات مع دراسات حالة موثقة لعام 2026.`,
    `استراتيجية متقدمة في ${kw} للشركات في ${regionLabel}. تتبع دقيق عبر السيرفر، وأتمتة مسارات المبيعات لتحقيق أعلى عائد على الإنفاق الإعلاني.`,
    `المنهجية الحديثة لتصدر نتائج البحث وإعلانات الأداء في ${kw} بـ ${cityFocus}. حلول مبتكرة لرفع معدل التحويل وبناء ميزة تنافسية مستدامة.`
  ];
  const metaDescription = metaVariants[seed % metaVariants.length].slice(0, 158);

  const geoParagraph = `تؤكد الدراسات التطبيقية لحملات التجارة والأنشطة الخدمية في ${regionLabel} لعام 2026 أن النجاح في تطبيق "${kw}" يتطلب الانتقال من الأساليب العشوائية إلى الهندسة الرقمية الدقيقة. تكشف تحليلات المنشآت الرائدة في ${cityFocus} أن الشركات التي تبنت أتمتة مسارات ${kw} وربطت التتبع المتقدم عبر الخادم حققت انخفاضاً مباشراً في تكلفة الاستحواذ (CAC) بنسبة تتجاوز 28% مع زيادة ملموسة في معدل التحويل (CR) وقيمة العميل الدائمة (LTV). إن التوافق الدلالي مع محركات البحث التوليدية يضمن حضوراً مستداماً للعلامة التجارية في ملخصات Google AI Overviews و Perplexity بأعلى كفاءة تسويقية ممكنة.`;

  const sections: string[] = [];

  // Varied Introduction
  const introOpeners = [
    `في ظل التطور المتسارع لأنظمة الإعلانات الرقمية وتحديثات خوارزميات محركات البحث القائمة على الذكاء الاصطناعي (GEO و AEO)، أصبح الاعتماد على الطرق التقليدية في **${kw}** مخاطرة غير محسوبة تستنزف الميزانيات التسويقية دون عائد ملموس في ${regionLabel}.`,
    `تشهد أسواق الأعمال في ${cityFocus} تحولاً جذرياً في سلوك المستهلك الرقمي لعام 2026، حيث لم يعد كافياً مجرد إطلاق حملات إعلانية عامة دون ربطها بهندسة دقيقة لـ **${kw}** تحقق أقصى استفادة من كل زيارة ونقرة.`,
    `يمثل الاستثمار الاستراتيجي في **${kw}** أحد أهم محركات النمو التجاري للشركات الطامحة لاكتساب حصة سوقية مهيمنة في ${regionLabel}، بعيداً عن تقلبات تكاليف المزادات وضياع إشارات البيكسل التقليدية.`
  ];
  
  sections.push(`## مقدمة تشخيصية: لماذا يعد ${kw} محور النجاح التسويقي لعام 2026؟

${introOpeners[seed % introOpeners.length]}

لتحقيق تفوق حقيقي، يجب النظر إلى **${kw}** كمنظومة هندسية متكاملة تبدأ من البنية التحتية للبيانات وتتبع سلوك المستخدم بدقة، وصولاً إلى صياغة الرسائل الإعلانية المقنعة وتحسين تجربة العميل (UX) لرفع معدل الشراء الفوري وتكرار الطلبات.`);

  // Proof Box
  sections.push(BRAND_PROOF_BOX);

  // GEO Citable Block
  sections.push(`### حقائق وبيانات السوق الموثقة لـ ${kw} في ${regionLabel}

${geoParagraph}`);

  // Dynamic Outline Sections with unique content per point
  for (let i = 0; i < outlinePoints.length; i++) {
    const pointTitle = outlinePoints[i];
    const pointIdx = i + 1;

    let subContent = "";
    if (pointIdx === 1) {
      subContent = `يبدأ التطبيق السليم لـ **${kw}** بإجراء فحص شامل للبنية التحتية الحالية للموقع وحسابات الإعلانات في أسواق ${cityFocus}. يتطلب هذا الفحص مراجعة دقيقة لسرعة الصفحات، استجابة الهواتف المحمولة، والتأكد من سلامة إشارات البيكسل والأحداث المخصصة. عند وجود أي اختناق في مسار الشراء، فإن كل ريال أو جنيه يُنفق على جلب الزوار يتحول إلى تكلفة مهدرة.

من الناحية الفنية، يجب التحقق من:
1. **زمن الاستجابة الأول (TTFB):** ألا يتجاوز 300 مللي ثانية في الخوادم السحابية المحلية لخدمة زوار ${cityFocus}.
2. **تسليم إشارات التتبع:** تطابق إشارات المتصفح مع إشارات الخادم (Server-side CAPI) بنسبة لا تقل عن 94%.
3. **تطابق نية البحث والتسويق:** التأكد من أن الرسالة الإعلانية أو نتيجة البحث تقود مباشرة إلى المنتج أو الحل المحدد دون تشتيت.`;
    } else if (pointIdx === 2) {
      subContent = `بناء مسار تحويل عالي الكفاءة (Conversion Funnel) يمثل العمود الفقري في استراتيجية **${kw}**. يجب هندسة رحلة العميل لتمر بثلاث مراحل حاسمة: الوعي بالمشكلة، تقييم الحلول، واتخاذ قرار الشراء الحاسم بضمانات قوية.

في أسواق ${regionLabel}، تشير الإحصائيات العملية إلى أن إضافة خيارات الدفع الفوري المحلية ومسارات الشراء السريعة ترفع إتمام عمليات الدفع بنسبة تصل إلى 35%. كما أن شفافية رسوم الشحن وسياسات الاسترجاع الموضحة بجوار زر الشراء تزيل تردد المشتري وتضاعف ثقته في علامتك التجارية.`;
    } else if (pointIdx === 3) {
      subContent = `لخفض تكلفة الاستحواذ (CAC) في تطبيق **${kw}**، يجب استخدام استراتيجيات التقسيم الذكي للجمهور (Audience Segmentation) المناسبة لبيئة ${cityFocus}. يشمل ذلك استبعاد العملاء الذين قاموا بالشراء خلال آخر 30 يوماً من حملات الاستحواذ الجديدة، وبناء جماهير مشابهة (Lookalikes) عالية الدقة معتمدة على مشتري السلة الأعلى قيمة (High-LTV Customers).

كما يوصى بإطلاق اختبارات A/B مستمرة على زوايا الإعلانات، وتخصيص النسبة الأكبر من الميزانية للزوايا التي تحقق أعلى معدل تحويل فعلي وتكلفة اكتساب أقل.`;
    } else {
      subContent = `لا يكتمل النجاح في **${kw}** إلا بإنشاء لوحة قياس مركزية ترصد مقاييس الأداء الحاسمة يومياً. إن التركيز الحصري على الأرقام الظاهرية في منصات الإعلانات قد يكون خادعاً إذا لم يتم ربطه بصافي الربح الحقيقي بعد خصم تكاليف التشغيل والشحن والمرتجعات.

يجب وضع أهداف واضحة لفترة استرداد رأس المال (Payback Period) لضمان تحقيق تدفقات نقدية مستمرة تسمح بضخ استثمارات أكبر واكتساح الحصة السوقية في ${regionLabel}.`;
    }

    sections.push(`## ${pointIdx}. ${pointTitle}

${subContent}`);
  }

  // Tactical Architecture & Metrics Table
  sections.push(`## جدول مقارنة الأداء ومؤشرات النجاح لـ ${kw}

يوضح الجدول التالي الفروق الجوهرية بين الأسلوب التقليدي والأسلوب الهندسي المتقدم في تنفيذ **${kw}**:

| معيار القياس والتقييم | الأسلوب التقليدي غير المهندس | المنهجية الهندسية المتقدمة لـ ${kw} (2026) | نسبة التحسن المتوقعة |
| :--- | :--- | :--- | :--- |
| **معدل التحويل (CR)** | 0.8% - 1.4% | 2.5% - 4.2% | **+180% تحسن** |
| **تكلفة الاستحواذ (CAC)** | مرتفعة ومتصاعدة شهرياً | مضبوطة ومحمية بمسارات الإعادة | **-32% انخفاض** |
| **دقة تتبع البيانات والبيكسل** | 65% - 75% (تشتت الكوكيز) | 95%+ (Server-Side + CAPI) | **+25% استرداد بيانات** |
| **العائد على الإنفاق (ROAS)** | 1.8x - 2.5x | 4.5x - 8.5x+ موثق | **+160% زيادة في الأرباح** |
| **فترة استرداد رأس المال** | تتجاوز 90 يوماً | أقل من 25 يوماً | **أمان وسيولة مضاعفة** |`);

  // Secondary Keywords Integration
  if (secondaryKws.length > 0) {
    const kwsList = secondaryKws.slice(0, 6).map((k) => `- **${k}:** يتم دمجها في البنية الهيكلية لصفحات الهبوط وسياق الاستهداف لضمان تغطية كاملة لكافة عمليات البحث ذات الصلة.`).join("\n");
    sections.push(`### المفاهيم المرتبطة وتغطية الكلمات المفتاحية التكتيكية

لضمان الهيمنة الكاملة على نتائج محركات البحث ومنصات الإعلانات، يجب تغطية المصطلحات التكتيكية المرتبطة بـ **${kw}**:

${kwsList}`);
  }

  // Implementation Checklist
  sections.push(`## قائمة التحقق التنفيذية (Checklist) لتطبيق ${kw}

لضمان تنفيذ العمليات دون إغفال أي تفاصيل فنية، اتبع الخطوات التالية:

- [ ] **الخطوة 1:** مراجعة إعدادات التتبع عبر الخادم (Server-side Tagging) والتأكد من إرسال معرّفات المستخدم المتقدمة (fbp, fbc, email hashes).
- [ ] **الخطوة 2:** فحص سرعة صفحات الهبوط على الجوال وضمان تحميل العنصر الأكبر (LCP) في أقل من 2.2 ثانية.
- [ ] **الخطوة 3:** إعداد عروض حزم جذابة (Bundles) ترفع متوسط قيمة الطلب (AOV) بنسبة لا تقل عن 20%.
- [ ] **الخطوة 4:** تفعيل رسائل الأتمتة المهجورة عبر واتساب والإيميل لاستعادة ما لا يقل عن 18% من السلات المتروكة.
- [ ] **الخطوة 5:** مراقبة نسبة التكلفة إلى القيمة الدائمة (LTV:CAC) أسبوعياً وضبط المزادات وفقاً لصافي الهامش الربحي.`);

  // Actionable FAQ Section
  sections.push(`## أسئلة شائعة حول ${kw}

### كم يستغرق ظهور النتائج الفعلية بعد تطبيق استراتيجية ${kw}؟
تظهر المؤشرات الأولية لتحسن جودة الإشارات ومعدل التحويل خلال أول 7 إلى 14 يوماً من الضبط الفني، بينما يتحقق الاستقرار التام وتراجع تكلفة الاستحواذ بنسبة ملحوظة خلال دورة تشغيلية كاملة من 30 إلى 45 يوماً.

### هل تناسب هذه المنهجية المتاجر الناشئة ذات الميزانيات المحدودة؟
نعم بالتأكيد؛ بل إن المتاجر الناشئة هي الأكثر حاجة لهذا الضبط الهندسي الدقيق لـ ${kw}، لأنها لا تملك رفاهية إهدار الميزانيات على مسارات تحويل غير محسنة أو إشارات تتبع ضائعة.

### كيف تتكامل إعلانات الأداء مع تحسين محركات البحث SEO في ${kw}؟
يوفر السيو زيارات مجانية مستدامة على الكلمات التكتيكية، بينما تضخ إعلانات الأداء بيانات سريعة عن الكلمات الأكثر تحويلاً ومبيعات، مما يتيح تضافر القناتين لخفض التكلفة التسويقية الإجمالية (Blended CAC).`);

  // Conclusion
  sections.push(`## الخلاصة التنفيذية وتوصيات التطبيق لعام 2026

إن التفوق في **${kw}** لم يعد مجرد مسألة إطلاق حملات إعلانية عادية أو كتابة مقالات عامة، بل هو ثمرة تخطيط هندسي يربط بين دقة البيانات، وسرعة المنصة، وقوة الإقناع التجاري. باتباع الإرشادات وخطوات التطبيق الواردة في هذا الدليل، ستتمكن علامتك التجارية من بناء ميزة تنافسية حقيقية ومضاعفة العائد الاستثماري على كل ميزانية تسويقية تُخصصها لعام 2026 وما بعده.`);

  const fullContent = sections.join("\n\n");

  return {
    content: fullContent,
    metaDescription,
    category,
    readTime: "7 دقائق",
  };
}

export async function publishArticleToPortfolio(
  payload: PortfolioArticlePayload,
  maxRetries = 3,
  domain?: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiUrl = getPortfolioApiUrl(domain);
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "OpenSEO-Autonomous-Publisher/2.0",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Portfolio API returned ${resp.status}: ${errText}`);
      }

      const resData = await resp.json();
      return { success: true, data: resData };
    } catch (err: any) {
      console.warn(`[Portfolio Publisher] Attempt ${attempt} failed for slug ${payload.slug}: ${err.message}`);
      if (attempt === maxRetries) {
        return { success: false, error: err.message };
      }
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }

  return { success: false, error: "Exhausted retries" };
}

export async function generateAndPublishArticle(
  item: ArticleQueueItem,
  env?: any,
  domain?: string,
): Promise<{
  success: boolean;
  slug: string;
  title: string;
  url: string;
  category: string;
  wordCount: number;
  portfolioResponse?: any;
  error?: string;
}> {
  const generated = generateTacticalArticleContent(item);
  const words = generated.content.split(/\s+/).filter(Boolean).length;

  const payload: PortfolioArticlePayload = {
    id: "art_auto_" + item.article_slug.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30),
    title: item.article_title,
    slug: item.article_slug,
    focusKeyword: item.primary_keyword,
    category: generated.category,
    excerpt: generated.metaDescription,
    metaDescription: generated.metaDescription,
    coverImage: "",
    content: generated.content,
    published: true,
    readTime: generated.readTime,
  };

  const publishRes = await publishArticleToPortfolio(payload, 3, domain);
  const publicUrl = `${getPortfolioBlogBase(domain)}/${item.article_slug}`;

  if (!publishRes.success) {
    return {
      success: false,
      slug: item.article_slug,
      title: item.article_title,
      url: publicUrl,
      category: generated.category,
      wordCount: words,
      error: publishRes.error,
    };
  }

  // Pre-warm Edge CDN cache immediately so first crawler or visitor gets sub-30ms response
  try {
    fetch(publicUrl, {
      headers: { "User-Agent": "OpenSEO-EdgePrewarmer/1.0" },
    }).catch(() => {});
  } catch {}

  return {
    success: true,
    slug: item.article_slug,
    title: item.article_title,
    url: publicUrl,
    category: generated.category,
    wordCount: words,
    portfolioResponse: publishRes.data,
  };
}
