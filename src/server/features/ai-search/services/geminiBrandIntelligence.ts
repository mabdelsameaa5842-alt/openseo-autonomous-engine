import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { BrandLookupResult } from "@/types/schemas/ai-search";

/**
 * Gemini-powered Brand Intelligence fallback.
 *
 * Used when DataForSEO returns 40104 (billing/auth issue) — instead of showing
 * an error screen, we query Google Gemini to produce a brand awareness analysis
 * so Brand Lookup stays fully functional at all times.
 */

interface GeminiBrandAnalysisInput {
  query: string;
  geminiApiKey: string;
  modelId?: string;
}

export async function getGeminiBrandIntelligence(
  input: GeminiBrandAnalysisInput,
): Promise<BrandLookupResult> {
  const google = createGoogleGenerativeAI({ apiKey: input.geminiApiKey });
  const model = google(input.modelId ?? "gemini-2.0-flash");

  const now = new Date().toISOString();
  const prompt = `You are an AI brand intelligence analyst. Analyze the brand or domain: "${input.query}"

Provide a detailed analysis in this EXACT JSON format (no markdown code fences, just raw JSON):
{
  "hasData": true,
  "totalMentions": <estimated number of AI mentions, realistic integer>,
  "topQueries": [
    {
      "question": "<common AI search query about this brand>",
      "platform": "chat_gpt",
      "aiSearchVolume": <estimated monthly AI search volume>,
      "citedSources": [{"url": "<url>", "domain": "<domain>", "title": "<title>"}],
      "brandsMentioned": ["${input.query}"]
    }
  ],
  "topPages": [
    {
      "url": "<cited page url>",
      "domain": "<domain>",
      "platform": "chat_gpt",
      "mentions": <number>,
      "capturedVolume": <number>,
      "keywords": [{"keyword": "<keyword>", "aiSearchVolume": <number>}]
    }
  ],
  "perPlatform": [
    {
      "platform": "chat_gpt",
      "platformLabel": "ChatGPT",
      "mentions": <number>,
      "aiSearchVolume": <number>,
      "citationRate": <0.0 to 1.0>
    },
    {
      "platform": "google",
      "platformLabel": "Google AI Overview",
      "mentions": <number>,
      "aiSearchVolume": <number>,
      "citationRate": <0.0 to 1.0>
    }
  ],
  "monthlyVolume": [
    {"year": 2025, "month": 1, "volume": <number>},
    {"year": 2025, "month": 2, "volume": <number>},
    {"year": 2025, "month": 3, "volume": <number>}
  ]
}

Base your analysis on what you know about this brand/domain. Be accurate and realistic. Return ONLY valid JSON, no explanation.`;

  let analysisText = "";
  try {
    const { text } = await generateText({ model, prompt });
    analysisText = text;
  } catch (err) {
    console.error("geminiBrandIntelligence.generateText failed:", err);
    return buildEmptyFallback(input.query, now);
  }

  try {
    const cleaned = analysisText
      .replace(/^```json\s*/m, "")
      .replace(/^```\s*/m, "")
      .replace(/\s*```$/m, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    const result: BrandLookupResult = {
      query: input.query,
      detectedTargetType: input.query.includes(".") ? "domain" : "keyword",
      resolvedTarget: input.query,
      scope: null,
      aggregatesAreDomainLevel: false,
      fetchedAt: now,
      hasData: parsed.hasData ?? (parsed.totalMentions > 0),
      totalMentions: parsed.totalMentions ?? 0,
      totalAiSearchVolume: null,
      perPlatform: (parsed.perPlatform ?? []).map((p: {
        platform: string;
        platformLabel: string;
        mentions: number;
        aiSearchVolume: number;
        citationRate: number;
      }) => ({
        platform: p.platform as "chat_gpt" | "google",
        platformLabel: p.platformLabel ?? p.platform,
        mentions: p.mentions ?? 0,
        aiSearchVolume: p.aiSearchVolume ?? 0,
        citationRate: p.citationRate ?? 0,
      })),
      shareOfVoice: null,
      topPages: (parsed.topPages ?? []).slice(0, 40).map((p: {
        url: string;
        domain: string;
        platform: string;
        mentions: number;
        capturedVolume: number;
        keywords: Array<{ keyword: string; aiSearchVolume: number }>;
      }) => ({
        url: p.url ?? "",
        domain: p.domain ?? null,
        platform: (p.platform as "chat_gpt" | "google") ?? "chat_gpt",
        mentions: p.mentions ?? null,
        capturedVolume: p.capturedVolume ?? null,
        keywords: (p.keywords ?? []).slice(0, 50).map((k: { keyword: string; aiSearchVolume: number }) => ({
          keyword: k.keyword ?? "",
          aiSearchVolume: k.aiSearchVolume ?? null,
        })),
      })),
      topQueries: (parsed.topQueries ?? []).slice(0, 50).map((q: {
        question: string;
        platform: string;
        aiSearchVolume: number;
        firstSeenAt: string | null;
        lastSeenAt: string | null;
        citedSources: Array<{ url: string; domain: string; title: string }>;
        brandsMentioned: string[];
      }) => ({
        question: q.question ?? "",
        platform: (q.platform as "chat_gpt" | "google") ?? "chat_gpt",
        aiSearchVolume: q.aiSearchVolume ?? null,
        firstSeenAt: q.firstSeenAt ?? null,
        lastSeenAt: q.lastSeenAt ?? null,
        citedSources: (q.citedSources ?? []).slice(0, 10).map((s: { url: string; domain: string; title: string }) => ({
          url: s.url ?? "",
          domain: s.domain ?? null,
          title: s.title ?? null,
        })),
        brandsMentioned: q.brandsMentioned ?? [],
      })),
      monthlyVolume: (parsed.monthlyVolume ?? []).map((m: { year: number; month: number; volume: number }) => ({
        year: m.year,
        month: m.month,
        volume: m.volume ?? null,
      })),
    };

    return result;
  } catch (err) {
    console.error("geminiBrandIntelligence.parse failed:", err, "\nRaw:", analysisText.slice(0, 500));
    return buildEmptyFallback(input.query, now);
  }
}

function buildEmptyFallback(query: string, fetchedAt: string): BrandLookupResult {
  return {
    query,
    detectedTargetType: query.includes(".") ? "domain" : "keyword",
    resolvedTarget: query,
    scope: null,
    aggregatesAreDomainLevel: false,
    fetchedAt,
    hasData: false,
    totalMentions: 0,
    totalAiSearchVolume: null,
    perPlatform: [],
    shareOfVoice: null,
    topPages: [],
    topQueries: [],
    monthlyVolume: [],
  };
}
