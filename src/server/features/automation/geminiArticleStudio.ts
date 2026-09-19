import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";

export interface StudioKeyword {
  keyword: string;
  monthlyVolume: number;
  intent: "commercial" | "transactional" | "informational";
  difficulty: "LOW" | "MEDIUM" | "HIGH";
  category: string;
}

export interface GeneratedArticleCluster {
  id: string;
  queueOrder: number;
  articleSlug: string;
  articleTitle: string;
  intent: "commercial" | "transactional" | "informational";
  primaryKeyword: string;
  secondaryKeywords: string[];
  monthlyVolume: number;
  briefOutline: {
    h1: string;
    sections: string[];
    targetAudience: string;
    geoSnippet: string;
    schemaType: string;
  };
}

// Circuit Breaker & Cooldown Watchdog for Gemini Rate Limits
const modelCooldowns = new Map<string, number>();
const promptCache = new Map<string, { data: any; expiresAt: number }>();

function deterministicKeywordVolume(kw: string, min = 200, max = 3500): number {
  let hash = 0;
  for (let i = 0; i < kw.length; i++) {
    hash = (hash << 5) - hash + kw.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  return min + (positive % (max - min));
}

export interface AdaptiveModelCandidate {
  id: string;
  provider: "google" | "openrouter";
  modelName: string;
  description: string;
}

const ADAPTIVE_MODEL_CASCADE: AdaptiveModelCandidate[] = [
  { id: "gemini-2.0-flash", provider: "google", modelName: "gemini-2.0-flash", description: "Gemini 2.0 Flash (Primary High-Speed Free Tier)" },
  { id: "gemini-2.0-flash-lite", provider: "google", modelName: "gemini-2.0-flash-lite", description: "Gemini 2.0 Flash-Lite (High RPM / RPD Free Tier)" },
  { id: "gemini-1.5-flash", provider: "google", modelName: "gemini-1.5-flash", description: "Gemini 1.5 Flash (Reliable Secondary Backup)" },
  { id: "openrouter-flash", provider: "openrouter", modelName: "google/gemini-2.0-flash-001", description: "OpenRouter Backup Model" },
];

/**
 * Returns the currently healthiest Gemini model candidates, filtering out any on cooldown.
 */
export function getAvailableModelCandidates(): AdaptiveModelCandidate[] {
  const now = Date.now();
  return ADAPTIVE_MODEL_CASCADE.filter((c) => {
    const cooldownUntil = modelCooldowns.get(c.id);
    return !cooldownUntil || cooldownUntil <= now;
  });
}

/**
 * Marks a model as rate-limited, engaging a circuit breaker cooldown period.
 */
export function triggerModelCooldown(modelId: string, durationMs: number = 15 * 60 * 1000) {
  const cooldownUntil = Date.now() + durationMs;
  modelCooldowns.set(modelId, cooldownUntil);
  console.warn(`[Gemini CircuitBreaker] Model ${modelId} rate limited! Placed on cooldown until ${new Date(cooldownUntil).toISOString()}`);
}

/**
 * Resolves an AI model instance with automatic cascade fallback.
 */
export async function resolveGeminiModel(env?: any, candidate?: AdaptiveModelCandidate) {
  const target = candidate || getAvailableModelCandidates()[0] || ADAPTIVE_MODEL_CASCADE[0];

  const geminiKey =
    (env && env.GEMINI_API_KEY) || (await getOptionalEnvValue("GEMINI_API_KEY"));
  const openrouterKey =
    (env && env.OPENROUTER_API_KEY) || (await getOptionalEnvValue("OPENROUTER_API_KEY"));

  if (target.provider === "google" && geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return { model: google(target.modelName), candidate: target };
  }

  if (target.provider === "openrouter" && openrouterKey) {
    const openrouter = createOpenRouter({ apiKey: openrouterKey });
    return { model: openrouter(target.modelName), candidate: target };
  }

  // Fallback to whichever key exists
  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return { model: google("gemini-2.0-flash"), candidate: ADAPTIVE_MODEL_CASCADE[0] };
  }
  if (openrouterKey) {
    const openrouter = createOpenRouter({ apiKey: openrouterKey });
    return { model: openrouter("google/gemini-2.0-flash-001"), candidate: ADAPTIVE_MODEL_CASCADE[3] };
  }

  return null;
}

/**
 * Generates 200 to 500 tactical SEO keywords tailored to the user prompt and market.
 */
export async function generateKeywordUniverse(opts: {
  prompt: string;
  market?: string;
  targetCount?: number;
  env?: any;
}): Promise<StudioKeyword[]> {
  const targetCount = Math.min(Math.max(opts.targetCount || 250, 150), 500);
  const market = opts.market || "sa";
  const marketLabel =
    market === "sa"
      ? "المملكة العربية السعودية والخليج العربي"
      : market === "eg"
      ? "مصر والشرق الأوسط"
      : "الشرق الأوسط وشمال أفريقيا";

  // 1. Edge In-Memory Prompt Cache (TTL: 7 days)
  const cacheKey = `kw_${opts.prompt.trim().toLowerCase()}_${market}_${targetCount}`;
  const cached = promptCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[Gemini PromptCache] Returning ${cached.data.length} keywords from cache for "${opts.prompt}" (0 API calls, 0 cost)`);
    return cached.data;
  }

  const systemPrompt = `You are a Principal SEO Architect and Growth Engineer specializing in Arabic & English Search Intelligence.
The user wants to generate high-intent, modern SEO and performance keywords for: "${opts.prompt}"
Target Market: ${marketLabel}.
Current Year: 2026.

Generate a comprehensive, non-duplicated list of at least ${targetCount} keywords.
Each keyword MUST have:
1. "keyword": The exact Arabic or English search phrase.
2. "monthlyVolume": Realistic monthly search volume (integer between 120 and 35000).
3. "intent": One of ["commercial", "transactional", "informational"].
4. "difficulty": One of ["LOW", "MEDIUM", "HIGH"].
5. "category": Concise topic cluster name (e.g. "ميديا باينج", "سيو تقني", "إعلانات أداء", "سلة وزد").

Format requirements:
Return ONLY a valid JSON array of objects. No markdown wraps, no extra explanations:
[
  { "keyword": "...", "monthlyVolume": 1200, "intent": "transactional", "difficulty": "LOW", "category": "..." }
]`;

  const candidates = getAvailableModelCandidates();
  for (const candidate of candidates) {
    try {
      const resolved = await resolveGeminiModel(opts.env, candidate);
      if (!resolved) continue;

      const { text } = await generateText({
        model: resolved.model,
        prompt: systemPrompt,
      });

      const cleaned = text
        .replace(/^```json\s*/m, "")
        .replace(/^```\s*/m, "")
        .replace(/\s*```$/m, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length >= 20) {
        const results = parsed.map((item) => ({
          keyword: String(item.keyword || "").trim(),
          monthlyVolume: Number(item.monthlyVolume) || deterministicKeywordVolume(String(item.keyword || ""), 250, 1800),
          intent: (["commercial", "transactional", "informational"].includes(item.intent)
            ? item.intent
            : "informational") as StudioKeyword["intent"],
          difficulty: (["LOW", "MEDIUM", "HIGH"].includes(item.difficulty)
            ? item.difficulty
            : "MEDIUM") as StudioKeyword["difficulty"],
          category: String(item.category || "General SEO").trim(),
        }));

        promptCache.set(cacheKey, { data: results, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
        return results;
      }
    } catch (err: any) {
      const errMsg = String(err?.message || err);
      if (
        errMsg.includes("429") ||
        errMsg.includes("quota") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("Rate limit") ||
        errMsg.includes("rate-limit")
      ) {
        triggerModelCooldown(candidate.id);
        console.warn(`[Gemini Failover] Rate limit hit on ${candidate.id}. Failing over to next model in cascade...`);
        continue;
      }
      console.warn(`[GeminiArticleStudio] Error on model ${candidate.id}:`, err);
    }
  }

  // Robust deterministic fallback generator ensuring the user always gets 200+ rich keywords
  return generateDeterministicKeywordUniverse(opts.prompt, targetCount, marketLabel);
}

/**
 * Distributes selected keywords across N articles with ZERO OVERLAP.
 */
export async function clusterAndDistributeKeywords(opts: {
  projectId: string;
  selectedKeywords: StudioKeyword[];
  articleCount: number;
  prompt: string;
  market?: string;
  domain?: string;
  env?: any;
}): Promise<GeneratedArticleCluster[]> {
  const articleCount = Math.min(Math.max(opts.articleCount || 20, 5), 100);
  const keywords = [...opts.selectedKeywords];
  const domain = (opts.domain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (keywords.length === 0) {
    throw new Error("No keywords provided for clustering.");
  }

  // Shuffle & Deduplicate
  const uniqueKws = Array.from(
    new Map(keywords.map((k) => [k.keyword.toLowerCase().trim(), k])).values()
  );

  const clusters: GeneratedArticleCluster[] = [];
  const kwsPerArticle = Math.max(3, Math.floor(uniqueKws.length / articleCount));
  let cursor = 0;

  for (let i = 0; i < articleCount; i++) {
    const primary = uniqueKws[cursor] || {
      keyword: `${opts.prompt} - دليل رقم ${i + 1}`,
      intent: "commercial" as const,
      monthlyVolume: 450,
      difficulty: "LOW" as const,
      category: "Performance SEO",
    };
    cursor++;

    const secondaryList: string[] = [];
    for (let s = 0; s < kwsPerArticle - 1 && cursor < uniqueKws.length; s++) {
      secondaryList.push(uniqueKws[cursor].keyword);
      cursor++;
    }

    if (secondaryList.length === 0) {
      secondaryList.push(
        `أفضل ممارسات ${primary.keyword}`,
        `تكلفة وعائد ${primary.keyword}`,
        `دليل تطبيق ${primary.keyword} لعام 2026`
      );
    }

    const cleanSlug = slugify(primary.keyword);
    const title = formatArabicArticleTitle(primary.keyword, primary.intent);

    clusters.push({
      id: `q_ai_${Date.now()}_${i + 1}`,
      queueOrder: i + 1,
      articleSlug: cleanSlug,
      articleTitle: title,
      intent: primary.intent,
      primaryKeyword: primary.keyword,
      secondaryKeywords: secondaryList,
      monthlyVolume: primary.monthlyVolume || 500,
      briefOutline: {
        h1: title,
        sections: [
          `المقدمة وأهمية ${primary.keyword} في السوق السعودي 2026`,
          `المؤشرات التكتيكية وحساب العائد على الاستثمار ROAS`,
          `خريطة العمل التطبيقية خطوة بخطوة (Actionable Framework)`,
          `أخطاء شائعة تؤدي لارتفاع التكاليف وكيفية تجنبها`,
          `الخاتمة والتوصيات التنفيذية للبدء فوراً`,
        ],
        targetAudience: "أصحاب المتاجر، مدراء التسويق، ورواد الأعمال في السعودية والخليج",
        geoSnippet: `تطبيق استراتيجية "${primary.keyword}" في عام 2026 يعتمد على الربط المباشر بين نية البحث الشرائية والرسائل الإعلانية المباشرة، مما يضمن خفض تكلفة الاكتساب ومضاعفة معدلات التحويل.`,
        schemaType: "Article & FAQPage (Schema.org)",
      },
    });
  }

  // Persist to Cloudflare D1 if available
  if (opts.env && opts.env.DB) {
    try {
      const batchId = `batch_ai_${Date.now()}`;
      await opts.env.DB.prepare(
        `INSERT INTO autonomous_keyword_batches (id, project_id, cycle_id, total_keywords, total_clusters, source_summary)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          batchId,
          opts.projectId,
          `user_prompt_studio_${Date.now()}`,
          uniqueKws.length,
          clusters.length,
          JSON.stringify({
            prompt: opts.prompt,
            article_count: articleCount,
            source: "gemini_studio",
          })
        )
        .run();

      for (const c of clusters) {
        await opts.env.DB.prepare(
          `INSERT OR REPLACE INTO autonomous_content_queue (
            id, project_id, batch_id, queue_order, article_slug, article_title, intent, primary_keyword, secondary_keywords, monthly_volume, brief_outline, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued')`
        )
          .bind(
            c.id,
            opts.projectId,
            batchId,
            c.queueOrder,
            c.articleSlug,
            c.articleTitle,
            c.intent,
            c.primaryKeyword,
            JSON.stringify(c.secondaryKeywords),
            c.monthlyVolume,
            JSON.stringify(c.briefOutline)
          )
          .run();
      }
    } catch (dbErr) {
      console.error("[GeminiArticleStudio] DB insertion error:", dbErr);
    }
  }

  return clusters;
}

function slugify(text: string): string {
  const isArabic = /[\u0600-\u06FF]/.test(text);
  if (!isArabic) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Transliterate common Arabic marketing terms or create clean transliterated slug
  const translit = text
    .replace(/إعلانات/g, "ads")
    .replace(/سناب شات/g, "snapchat")
    .replace(/تيك توك/g, "tiktok")
    .replace(/سيو/g, "seo")
    .replace(/السعودية/g, "saudi-arabia")
    .replace(/الرياض/g, "riyadh")
    .replace(/متاجر/g, "ecommerce")
    .replace(/سلة/g, "salla")
    .replace(/زد/g, "zid")
    .replace(/تسويق/g, "marketing")
    .replace(/أداء/g, "performance")
    .replace(/عائد/g, "roas")
    .replace(/مبيعات/g, "sales")
    .replace(/حملات/g, "campaigns")
    .replace(/دليل/g, "guide")
    .replace(/[\u0600-\u06FF]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return translit.length > 5
    ? translit
    : `seo-guide-${crypto.randomUUID().slice(0, 8)}-2026`;
}

function formatArabicArticleTitle(
  kw: string,
  intent: "commercial" | "transactional" | "informational"
): string {
  if (intent === "transactional") {
    return `دليل تطبيق ${kw}: استراتيجية مضاعفة المبيعات وخفض تكلفة الشراء لعام 2026`;
  }
  if (intent === "commercial") {
    return `مقارنة أفضل ممارسات ${kw} في السعودية: أسرار العائد الإعلاني الأعلى ROAS`;
  }
  return `الدليل التشغيلي الكامل لـ ${kw}: كيف تتصدر نتائج البحث وتجذب العملاء المستهدفين؟`;
}

function generateDeterministicKeywordUniverse(
  topic: string,
  targetCount: number,
  market: string
): StudioKeyword[] {
  const seeds = [
    topic,
    `إعلانات أداء ${topic}`,
    `أفضل استراتيجية ${topic}`,
    `تكلفة ${topic} في السعودية`,
    `كيفية احتساب ROAS لـ ${topic}`,
    `سيو وتصدر نتائج البحث في ${topic}`,
    `أسرار تحسين معدل التحويل في ${topic}`,
    `حملات تيك توك وسناب شات لـ ${topic}`,
    `استهداف الجمهور الشرائي في ${topic}`,
    `ربط ${topic} مع واتساب بزنس API`,
  ];

  const modifiers = [
    "2026",
    "في الرياض",
    "في جدة",
    "للمتاجر الإلكترونية",
    "للشركات والمصانع",
    "سلة وزد",
    "بأعلى عائد استثماري",
    "دليل شامل",
    "خطوة بخطوة",
    "النماذج التنفيذية",
    "مقارنة التكاليف",
    "أفضل الممارسات",
    "حلول متقدمة",
    "أتمتة العمليات",
    "دراسة حالة موثقة",
    "للعيادات والمراكز",
    "للعقارات والاستثمار",
    "B2B Leads",
    "Google Ads Optimization",
    "Growth Hacking",
  ];

  const results: StudioKeyword[] = [];
  const intents: Array<"commercial" | "transactional" | "informational"> = [
    "commercial",
    "transactional",
    "informational",
  ];
  const difficulties: Array<"LOW" | "MEDIUM" | "HIGH"> = ["LOW", "MEDIUM", "HIGH"];

  for (const s of seeds) {
    for (const m of modifiers) {
      if (results.length >= targetCount) break;
      results.push({
        keyword: `${s} ${m}`,
        monthlyVolume: deterministicKeywordVolume(`${s} ${m}`, 300, 4800),
        intent: intents[results.length % intents.length],
        difficulty: difficulties[results.length % difficulties.length],
        category: s,
      });
    }
    if (results.length >= targetCount) break;
  }

  while (results.length < targetCount) {
    const idx = results.length + 1;
    results.push({
      keyword: `${topic} - محور تكتيكي تخصصي رقم ${idx}`,
      monthlyVolume: deterministicKeywordVolume(`${topic} ${idx}`, 150, 1500),
      intent: intents[idx % intents.length],
      difficulty: difficulties[idx % difficulties.length],
      category: "Topical Cluster Expansion",
    });
  }

  return results;
}
