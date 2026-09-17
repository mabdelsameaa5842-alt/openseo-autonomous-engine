import {
  createOpenRouter,
  type LanguageModelV3,
} from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  getOptionalEnvValue,
  getRequiredEnvValue,
} from "@/server/lib/runtime-env";

// OpenRouter model slug used for the in-app chat agents (onboarding + SAM).
// Override with OPENROUTER_MODEL to swap models without a code change.
const DEFAULT_CHAT_AGENT_MODEL = "openai/gpt-4o-mini";
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

export interface SupportedAIModel {
  id: string;
  mappedModel: string;
  name: string;
  tag: string;
  rpm: number;
  rpd: number;
  tpm: string;
  badge: string;
  recommended: boolean;
  description: string;
}

export const SUPPORTED_AI_MODELS: SupportedAIModel[] = [
  {
    id: "gemini-3.5-flash-lite",
    mappedModel: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    tag: "⚡ موصى به للسرعة",
    rpm: 10,
    rpd: 20,
    tpm: "250K",
    badge: "10 RPM | 20 RPD",
    recommended: true,
    description: "فائق السرعة (ضعف سرعة 3.6) ومثالي للمحادثة اليومية واستخراج الكلمات المفتاحية بأقل استهلاك.",
  },
  {
    id: "antigravity",
    mappedModel: "gemini-3.5-flash",
    name: "Antigravity Agents",
    tag: "🚀 أعلى سعة يومية",
    rpm: 60,
    rpd: 100,
    tpm: "100K",
    badge: "60 RPM | 100 RPD",
    recommended: false,
    description: "معدل تدفق استثنائي (60 طلب/دقيقة و 100 طلب/يوم) مخصص لمهام الوكلاء المستقلين والأتمتة.",
  },
  {
    id: "gemini-3.5-flash",
    mappedModel: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    tag: "🔥 سرعة وسعة متوازنة",
    rpm: 15,
    rpd: 1500,
    tpm: "1M",
    badge: "15 RPM | 1500 RPD",
    recommended: false,
    description: "أعلى رصيد طلبات مجاني متوازن (1,500 طلب يومياً) مع نافذة سياق عملاقة تتسع لمليون توكن.",
  },
  {
    id: "gemini-3.6-flash",
    mappedModel: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    tag: "🧠 تحليلي دقيق",
    rpm: 5,
    rpd: 20,
    tpm: "250K",
    badge: "5 RPM | 20 RPD",
    recommended: false,
    description: "نموذج تحليلي دقيق ومكثف. حده 5 RPM، وفي حال نفاد الكوتا يتحول النظام تلقائياً للبديل.",
  },
  {
    id: "gemini-flash-latest",
    mappedModel: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    tag: "✨ استدلالي محدث",
    rpm: 10,
    rpd: 50,
    tpm: "500K",
    badge: "10 RPM | 50 RPD",
    recommended: false,
    description: "نموذج استدلالي محدث بانتظام للتحليلات التنافسية ومراجعات الكود والمحتوى المعقد.",
  },
];

// Circuit Breaker tracker for models experiencing 429 rate limit
const modelCooldowns = new Map<string, number>();

export function reportModelRateLimited(modelId: string, cooldownMs = 60_000): void {
  const normalized = modelId.toLowerCase();
  modelCooldowns.set(normalized, Date.now() + cooldownMs);
  console.warn(`[openrouter] Model ${normalized} marked rate-limited until ${new Date(Date.now() + cooldownMs).toISOString()}`);
}

export function isModelRateLimited(modelId: string): boolean {
  const normalized = modelId.toLowerCase();
  const cooldownUntil = modelCooldowns.get(normalized);
  if (!cooldownUntil) return false;
  if (Date.now() >= cooldownUntil) {
    modelCooldowns.delete(normalized);
    return false;
  }
  return true;
}

export function normalizeModelId(rawModel?: string): string {
  if (!rawModel) return DEFAULT_GEMINI_MODEL;
  const m = rawModel.trim().toLowerCase();
  // Map deprecated 2.x models to active 3.x series
  if (m === "gemini-2.5-flash-lite" || m === "gemini-2.0-flash-lite" || m === "gemini-flash-lite") {
    return "gemini-3.5-flash-lite";
  }
  if (m === "gemini-2.0-flash" || m === "gemini-2-flash") {
    return "gemini-3.5-flash";
  }
  if (m === "gemini-2.5-flash") {
    return "gemini-3.6-flash";
  }
  return m;
}

export function resolveHealthyGeminiModel(requestedModel?: string): string {
  const normalized = normalizeModelId(requestedModel);
  const found = SUPPORTED_AI_MODELS.find((m) => m.id === normalized);
  const targetId = found ? found.id : normalized;
  const mappedModel = found ? found.mappedModel : normalized;

  if (!isModelRateLimited(targetId) && !isModelRateLimited(mappedModel)) {
    return mappedModel;
  }

  // Model is rate-limited (e.g. 3.6 Flash cooldown). Fall back to healthiest candidate:
  console.warn(`[openrouter] Model ${normalized} is on rate-limit cooldown. Resolving fallback.`);
  const fallbackOrder = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.6-flash",
  ];
  for (const fallbackId of fallbackOrder) {
    if (!isModelRateLimited(fallbackId)) {
      const fallbackDef = SUPPORTED_AI_MODELS.find((m) => m.id === fallbackId);
      return fallbackDef ? fallbackDef.mappedModel : fallbackId;
    }
  }

  return "gemini-3.5-flash-lite";
}

// Previous default; kept reachable via OPENROUTER_MODEL for rollback. Its
// routing needs the ZDR/provider tuning below.
const MINIMAX_M3 = "minimax/minimax-m3";

export function buildGeminiChatAgentModel(
  apiKey: string,
  modelId?: string,
): LanguageModelV3 {
  const google = createGoogleGenerativeAI({ apiKey });
  const model = resolveHealthyGeminiModel(modelId);
  return google(model) as unknown as LanguageModelV3;
}

export async function getChatAgentModel(): Promise<LanguageModelV3> {
  const geminiKey = await getOptionalEnvValue("GEMINI_API_KEY");
  if (geminiKey) {
    const geminiModel = await getOptionalEnvValue("GEMINI_MODEL");
    return buildGeminiChatAgentModel(geminiKey, geminiModel);
  }
  const apiKey = await getRequiredEnvValue("OPENROUTER_API_KEY");
  const modelId = await getOptionalEnvValue("OPENROUTER_MODEL");
  return buildChatAgentModel(apiKey, modelId);
}

/**
 * Returns the AI SDK LanguageModel for the chat agents. `usage: { include: true }`
 * turns on OpenRouter usage accounting so each response carries its real USD
 * cost (providerMetadata.openrouter.usage.cost) — which we meter against the
 * shared usage-credit pool.
 *
 * Default model: GPT-5.6 Luna at `reasoning.effort: "max"` — "max" is valid at
 * the OpenRouter API for GPT-5.x but missing from the SDK's effort union, so
 * the reasoning config rides in `extraBody`. Reasoning tokens stream on the
 * separate reasoning channel and are billed as output tokens, which the usage
 * accounting above captures.
 *
 * Sync on purpose: Think's `getModel()` hook is sync and runs on every turn,
 * so the SAM agent reads the key/model from its DO env and builds here.
 */
export function buildChatAgentModel(
  apiKey: string,
  modelId?: string,
): LanguageModelV3 {
  const model = modelId ?? DEFAULT_CHAT_AGENT_MODEL;
  const openrouter = createOpenRouter({ apiKey });

  // MiniMax M3 (env-override path only): `provider.order` prefers Together,
  // then Atlas Cloud (fp8); `zdr: true` restricts routing to Zero-Data-
  // Retention endpoints, which excludes MiniMax first-party — the account's
  // "Non-frontier requires ZDR" data policy enforces the same, this flag is
  // belt-and-braces. Fallbacks stay on within the ZDR set because pinning
  // providers caused a prod outage (Jul 2026: Together upstream-rate-limited
  // m3 and every chat turn 429'd). The explicit reasoning channel keeps m3's
  // `<think>` trace out of the visible answer text.
  if (model === MINIMAX_M3) {
    return openrouter(model, {
      usage: { include: true },
      reasoning: { effort: "medium" },
      provider: {
        order: ["together", "atlas-cloud/fp8"],
        zdr: true,
        allow_fallbacks: true,
      },
    });
  }

  const isReasoningModel =
    model.includes("gpt-5") || model.includes("o1") || model.includes("o3");

  return openrouter(model, {
    usage: { include: true },
    ...(isReasoningModel ? { extraBody: { reasoning: { effort: "max" } } } : {}),
  });
}
