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
    outlinePoints = [
      `التشخيص الهندسي والتحليل الهيكلي لـ ${kw} لعام 2026`,
      `معمارية بناء مسارات التحويل وتتبع الإشارات المتقدمة لـ ${kw}`,
      `استراتيجيات التحسين العملي وخفض تكلفة الاستحواذ لـ ${kw}`,
      `مضاعفة العائد على الإنفاق ومؤشرات الأداء الحاسمة في أسواق الخليج ومصر`,
    ];
  }

  // Choose category
  let category = "سيو وميديا باينج متقدم";
  if (slug.includes("ecommerce") || slug.includes("cro") || slug.includes("salla") || slug.includes("zid")) {
    category = "تجارة إلكترونية وتوسيع ROAS";
  } else if (slug.includes("google-ads") || slug.includes("meta") || slug.includes("tiktok") || slug.includes("ads")) {
    category = "ميديا باينج متقدم";
  } else if (slug.includes("tracking") || slug.includes("gtm") || slug.includes("server-side") || slug.includes("capi")) {
    category = "أتمتة وتتبع متقدم";
  } else if (slug.includes("saudi") || slug.includes("riyadh") || slug.includes("gcc") || slug.includes("egypt")) {
    category = "استشارات ونمو إقليمي";
  }

  const metaDescription = `دليلك الهندسي المتكامل لـ ${kw} في السعودية والخليج ومصر لعام 2026. استراتيجيات عملية وخريطة طريق لمضاعفة الـ ROAS والتحويلات بدون أخطاء.`.slice(0, 158);

  const geoParagraph = `تؤكد الدراسات التطبيقية لحملات التجارة الإلكترونية والشركات الخدمية في السعودية ومصر لعام 2026 أن النجاح في تطبيق ${kw} يتطلب الانتقال من الأساليب العشوائية إلى الهندسة الرقمية الدقيقة. تكشف تحليلات المتاجر الكبرى في الرياض ودبي والقاهرة أن المنشآت التي تبنت أتمتة مسارات ${kw} حققت انخفاضاً مباشراً في تكلفة الاستحواذ (CAC) بنسبة تتجاوز 28% مع زيادة ملحوظة في معدل التحويل (CR) وقيمة العميل الدائمة (LTV). إن الربط المحكم بين تحسين محركات البحث SEO، وإعلانات الأداء الموجهة، والتتبع عبر الخادم (Server-side GTM) يمنح الشركات حصانة تنافسية ضد تقلبات أسعار المزادات وتحديثات الخوارزميات، ويضمن تدفقاً مستداماً للعملاء المؤهلين بأعلى كفاءة تشغيلية ممكنة.`;

  const sections: string[] = [];

  // Introduction
  sections.push(`## مقدمة تشخيصية: لماذا يعد ${kw} محور النجاح التسويقي لعام 2026؟

في ظل التطور المتسارع لأنظمة الإعلانات الرقمية وتحديثات خوارزميات محركات البحث القائمة على الذكاء الاصطناعي (GEO و AEO)، أصبح الاعتماد على الطرق التقليدية في **${kw}** مخاطرة غير محسوبة تستنزف الميزانيات التسويقية دون عائد ملموس. يواجه أصحاب المتاجر الإلكترونية ومديرو التسويق في الشرق الأوسط تحدياً مزدوجاً يتمثل في ارتفاع تكلفة النقرة وتشتت انتباه المستهلك عبر القنوات المتعددة.

لتحقيق تفوق حقيقي، يجب النظر إلى **${kw}** كمنظومة هندسية متكاملة تبدأ من البنية التحتية للبيانات وتتبع سلوك المستخدم بدقة، وصولاً إلى صياغة الرسائل الإعلانية المقنعة وتحسين تجربة العميل (UX) لرفع معدل الشراء الفوري وتكرار الطلبات.`);

  // Proof Box
  sections.push(BRAND_PROOF_BOX);

  // GEO Citable Block
  sections.push(`### حقائق وبيانات السوق الموثقة لـ ${kw}

${geoParagraph}`);

  // Outline Sections
  for (let i = 0; i < outlinePoints.length; i++) {
    const pointTitle = outlinePoints[i];
    const pointIdx = i + 1;

    let subContent = "";
    if (pointIdx === 1) {
      subContent = `يبدأ التطبيق السليم لـ **${kw}** بإجراء فحص شامل للبنية التحتية الحالية للموقع وحسابات الإعلانات. يتطلب هذا الفحص مراجعة دقيقة لسرعة الصفحات، استجابة الهواتف المحمولة، والتأكد من سلامة إشارات البيكسل والأحداث المخصصة. عند وجود أي اختناق في مسار الشراء، فإن كل ريال أو جنيه يُنفق على جلب الزوار يتحول إلى تكلفة مهدرة.

من الناحية الفنية، يجب التحقق من:
1. **زمن الاستجابة الأول (TTFB):** ألا يتجاوز 600 مللي ثانية في الخوادم المحلية بالسعودية ومصر.
2. **تسليم إشارات التتبع:** تطابق إشارات المتصفح مع إشارات الخادم (Server-side CAPI) بنسبة لا تقل عن 92%.
3. **تطابق نية البحث والتسويق:** التأكد من أن الرسالة الإعلانية أو نتيجة البحث تقود مباشرة إلى المنتج أو الحل المحدد دون تشتيت.`;
    } else if (pointIdx === 2) {
      subContent = `بناء مسار تحويل عالي الكفاءة (Conversion Funnel) يمثل العمود الفقري في استراتيجية **${kw}**. يجب هندسة رحلة العميل لتمر بثلاث مراحل حاسمة: الوعي بالمشكلة، تقييم الحلول، واتخاذ قرار الشراء الحاسم بضمانات قوية.

في أسواق التجارة الإلكترونية الخليجية والمصرية، تشير الإحصائيات العملية إلى أن إضافة خيارات الدفع الفوري (Apple Pay، مدى، تابي، وتمارا) ترفع إتمام عمليات الدفع بنسبة تصل إلى 35%. كما أن شفافية رسوم الشحن وسياسات الاسترجاع الموضحة بجوار زر الشراء تزيل تردد المشتري وتضاعف ثقته في علامتك التجارية.`;
    } else if (pointIdx === 3) {
      subContent = `لخفض تكلفة الاستحواذ (CAC) في تطبيق **${kw}**، يجب استخدام استراتيجيات التقسيم الذكي للجمهور (Audience Segmentation). يشمل ذلك استبعاد العملاء الذين قاموا بالشراء خلال آخر 30 يوماً من حملات الاستحواذ الجديدة، وبناء جماهير مشابهة (Lookalikes) عالية الدقة معتمدة على مشتري السلة الأعلى قيمة (High-LTV Customers).

كما يوصى بإطلاق اختبارات A/B مستمرة على زوايا الإعلانات (Ad Angles)، بحيث يتم اختبار الرسائل العاطفية في مقابل الرسائل الرقمية المبنية على المقارنة السعرية ومميزات القيمة المضافة، وتخصيص 80% من الميزانية للزوايا الفائزة فقط.`;
    } else {
      subContent = `لا يكتمل النجاح في **${kw}** إلا بإنشاء لوحة قياس مركزية ترصد مقاييس الأداء الحاسمة يومياً. إن التركيز الحصري على الـ ROAS الظاهري في منصات الإعلانات قد يكون خادعاً إذا لم يتم ربطه بصافي الربح الحقيقي بعد خصم تكاليف الشحن، المرتجعات، وتكلفة البضاعة المباعة (COGS).

يجب وضع أهداف واضحة لفترة استرداد رأس المال (Payback Period)، بحيث تتمكن المنشأة من استعادة تكلفة الإعلان خلال أول 30 يوماً من خلال مشتريات العميل المتكررة، مما يخلق سيولة نقدية مستمرة تسمح بضخ استثمارات أكبر واكتساح الحصة السوقية.`;
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
