import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import {
  type GoogleModelDef,
  GOOGLE_AI_STUDIO_MODELS,
  getTextFallbackChain,
  getModelDefById,
} from "./GoogleAiStudioCatalog";

// ── In-Memory Token Bucket & Rate Limit Windows ──
interface ModelWindowUsage {
  minuteTimestamps: number[];
  dayCount: number;
  dayResetAt: number;
}

const modelUsages = new Map<string, ModelWindowUsage>();
const modelCooldowns = new Map<string, number>();

/**
 * Returns current timestamp for midnight Pacific Time (Google AI Studio reset boundary)
 */
function getMidnightPstTimestamp(): number {
  const now = new Date();
  const pstString = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  const pstDate = new Date(pstString);
  pstDate.setHours(24, 0, 0, 0); // Next midnight PST
  return now.getTime() + (pstDate.getTime() - new Date(pstString).getTime());
}

/**
 * Checks if a model candidate is currently healthy and within its local rate limits.
 */
export function isModelHealthy(modelId: string): boolean {
  const now = Date.now();
  const cooldownUntil = modelCooldowns.get(modelId);
  if (cooldownUntil && cooldownUntil > now) {
    return false;
  }

  const def = getModelDefById(modelId);
  if (!def) return false;

  const usage = modelUsages.get(modelId);
  if (!usage) return true;

  // Prune minute sliding window (older than 60s)
  usage.minuteTimestamps = usage.minuteTimestamps.filter((t) => now - t < 60000);

  // Check if minute limit reached (pre-emptive avoidance)
  if (def.rpm > 0 && usage.minuteTimestamps.length >= def.rpm) {
    return false;
  }

  // Check if daily limit reached
  if (now > usage.dayResetAt) {
    usage.dayCount = 0;
    usage.dayResetAt = getMidnightPstTimestamp();
  }
  if (def.rpd > 0 && usage.dayCount >= def.rpd) {
    return false;
  }

  return true;
}

/**
 * Records a successful request for a model in its local rate window.
 */
function recordModelUsage(modelId: string) {
  const now = Date.now();
  let usage = modelUsages.get(modelId);
  if (!usage) {
    usage = {
      minuteTimestamps: [],
      dayCount: 0,
      dayResetAt: getMidnightPstTimestamp(),
    };
    modelUsages.set(modelId, usage);
  }

  usage.minuteTimestamps.push(now);
  usage.dayCount += 1;
}

/**
 * Trips cooldown for a model upon receiving a 429 or quota error.
 * Distinguishes between RPM (62s cooldown) and RPD (PST midnight cooldown).
 */
export function tripModelCooldown(modelId: string, err?: any) {
  const errStr = String(err?.message || err || "").toLowerCase();
  const isDailyExhaustion =
    errStr.includes("daily") || errStr.includes("quota exceeded") || errStr.includes("limit: 20");

  const durationMs = isDailyExhaustion
    ? Math.max(60000, getMidnightPstTimestamp() - Date.now())
    : 62 * 1000; // 62 seconds for RPM reset (covers the 60s Google sliding window + 2s clock skew)

  const expiresAt = Date.now() + durationMs;
  modelCooldowns.set(modelId, expiresAt);

  console.warn(
    `[SubMillisecondFallback] ⚠️ Model ${modelId} tripped ${
      isDailyExhaustion ? "DAILY" : "MINUTE"
    } cooldown until ${new Date(expiresAt).toLocaleTimeString()}`
  );
}

/**
 * Resolves the absolute best and healthiest Google Gemini model instance with sub-millisecond priority routing.
 */
export async function resolveFastestModel(
  env?: any,
  preferredModelId?: string
): Promise<{ model: any; candidate: GoogleModelDef } | null> {
  const geminiKey =
    (env && env.GEMINI_API_KEY) || (await getOptionalEnvValue("GEMINI_API_KEY"));

  if (!geminiKey) {
    console.error("[SubMillisecondFallback] GEMINI_API_KEY is not defined in runtime environment!");
    return null;
  }

  const google = createGoogleGenerativeAI({ apiKey: geminiKey });
  const chain = getTextFallbackChain();

  // If a preferred model was requested and is healthy, use it
  if (preferredModelId && isModelHealthy(preferredModelId)) {
    const prefDef = getModelDefById(preferredModelId);
    if (prefDef) {
      return { model: google(prefDef.id), candidate: prefDef };
    }
  }

  // Otherwise pick the highest priority healthy candidate in the cascade
  for (const candidate of chain) {
    if (isModelHealthy(candidate.id)) {
      return { model: google(candidate.id), candidate };
    }
  }

  // If all primary models are on cooldown, fall back to Gemma 4 26B (14.4K RPD safety net)
  const gemmaFallback = getModelDefById("gemma-4-26b") || chain[0];
  return { model: google(gemmaFallback.id), candidate: gemmaFallback };
}

export interface TaskExecutionCheckpoint {
  taskId: string;
  projectId: string;
  agentId: string;
  previousModelsChain: string[];
  completedSteps: string[];
  partialOutputSummary: string;
  pendingSteps: string[];
  updatedAt: string;
}

export interface LearnedRuleItem {
  id: string;
  category: "like" | "dislike" | "binding_rule";
  text: string;
  learnedByAgent: string;
  createdAt: string;
}

export interface TeamLearnedMemory {
  projectId: string;
  likes: string[];
  dislikes: string[];
  bindingRules: LearnedRuleItem[];
  updatedAt: string;
}

const inMemoryCheckpoints = new Map<string, TaskExecutionCheckpoint>();
const inMemoryTeamRules = new Map<string, TeamLearnedMemory>();

const DEFAULT_TEAM_RULES: LearnedRuleItem[] = [
  {
    id: "rule_default_1",
    category: "binding_rule",
    text: "الاعتماد على الأرقام والقراءات الحقيقية من المنصات الـ 8 وتجنب المقدمات الإنشائية الطويلة.",
    learnedByAgent: "vorder-tariq",
    createdAt: new Date().toISOString(),
  },
  {
    id: "rule_default_2",
    category: "like",
    text: "يفضل القائد العناوين المباشرة الجاذبة للنقر والجداول المقارنة الواضحة وتقارير الإنجاز الهرمية.",
    learnedByAgent: "vorder-sara",
    createdAt: new Date().toISOString(),
  },
];

export async function getTeamLearnedMemory(
  projectId: string,
  env?: any
): Promise<TeamLearnedMemory> {
  const key = `team_memory:${projectId || "default"}`;
  try {
    if (env?.OAUTH_KV) {
      const raw = await env.OAUTH_KV.get(key);
      if (raw) {
        const parsed = JSON.parse(raw) as TeamLearnedMemory;
        inMemoryTeamRules.set(key, parsed);
        return parsed;
      }
    }
  } catch {}
  const cached = inMemoryTeamRules.get(key);
  if (cached) return cached;

  const initial: TeamLearnedMemory = {
    projectId: projectId || "default",
    likes: ["العناوين القوية المدعومة بالأرقام", "التقارير المختصرة المباشرة في صلب التخصص"],
    dislikes: ["الحشو الإنشائي والمقدمات الطويلة غير العملية"],
    bindingRules: [...DEFAULT_TEAM_RULES],
    updatedAt: new Date().toISOString(),
  };
  inMemoryTeamRules.set(key, initial);
  return initial;
}

export async function extractAndLearnUserPreferences(
  projectId: string,
  userMessage: string,
  activeAgentId: string,
  env?: any
): Promise<{ memory: TeamLearnedMemory; newlyLearnedRule?: LearnedRuleItem }> {
  const memory = await getTeamLearnedMemory(projectId, env);
  const msg = (userMessage || "").trim();
  if (!msg || msg.length < 4) return { memory };

  let newlyLearnedRule: LearnedRuleItem | undefined;
  const lower = msg.toLowerCase();

  // Detect explicit likes / preferences ("بحب", "أحب", "عاوز دايما", "افضل", "ركز على")
  if (
    msg.includes("بحب") ||
    msg.includes("أحب") ||
    msg.includes("احب") ||
    msg.includes("أفضل") ||
    msg.includes("عاوز دايما") ||
    msg.includes("اعتمد") ||
    lower.includes("i like") ||
    lower.includes("prefer")
  ) {
    if (!memory.likes.includes(msg)) {
      memory.likes.unshift(msg);
      memory.likes = memory.likes.slice(0, 15);
    }
    newlyLearnedRule = {
      id: `rule_${Date.now()}`,
      category: "like",
      text: `تفضيل القائد: ${msg}`,
      learnedByAgent: activeAgentId || "vorder-tariq",
      createdAt: new Date().toISOString(),
    };
    memory.bindingRules.unshift(newlyLearnedRule);
  }
  // Detect explicit dislikes / prohibitions ("مبحبش", "مش عاوز", "ممنوع", "لا تستخدم", "ابعد عن")
  else if (
    msg.includes("مبحبش") ||
    msg.includes("ما بحبش") ||
    msg.includes("لا أحب") ||
    msg.includes("مش عاوز") ||
    msg.includes("ممنوع") ||
    msg.includes("لا تستخدم") ||
    msg.includes("ابعد عن") ||
    lower.includes("don't") ||
    lower.includes("never")
  ) {
    if (!memory.dislikes.includes(msg)) {
      memory.dislikes.unshift(msg);
      memory.dislikes = memory.dislikes.slice(0, 15);
    }
    newlyLearnedRule = {
      id: `rule_${Date.now()}`,
      category: "dislike",
      text: `محظور تعلمته الفرقة: ${msg}`,
      learnedByAgent: activeAgentId || "vorder-tariq",
      createdAt: new Date().toISOString(),
    };
    memory.bindingRules.unshift(newlyLearnedRule);
  }
  // Detect explicit rule commands ("قاعدة", "خلوا بالكم", "لازم", "قانون")
  else if (
    msg.includes("قاعدة") ||
    msg.includes("قاعده") ||
    msg.includes("لازم") ||
    msg.includes("شرط أساسي")
  ) {
    newlyLearnedRule = {
      id: `rule_${Date.now()}`,
      category: "binding_rule",
      text: `قاعدة عمل ملزمة للوكلاء الـ 9: ${msg}`,
      learnedByAgent: activeAgentId || "vorder-tariq",
      createdAt: new Date().toISOString(),
    };
    memory.bindingRules.unshift(newlyLearnedRule);
  }

  if (newlyLearnedRule) {
    memory.bindingRules = memory.bindingRules.slice(0, 25);
    memory.updatedAt = new Date().toISOString();
    const key = `team_memory:${projectId || "default"}`;
    inMemoryTeamRules.set(key, memory);
    try {
      if (env?.OAUTH_KV) {
        await env.OAUTH_KV.put(key, JSON.stringify(memory), {
          expirationTtl: 60 * 60 * 24 * 90,
        });
      }
    } catch {}
  }

  return { memory, newlyLearnedRule };
}

export async function getTaskCheckpoint(
  projectId: string,
  taskId: string,
  env?: any
): Promise<TaskExecutionCheckpoint | null> {
  const key = `ctx_ledger:${projectId || "default"}:${taskId || "active"}`;
  try {
    if (env?.OAUTH_KV) {
      const raw = await env.OAUTH_KV.get(key);
      if (raw) return JSON.parse(raw) as TaskExecutionCheckpoint;
    }
  } catch {}
  return inMemoryCheckpoints.get(key) || null;
}

export async function saveTaskCheckpoint(
  checkpoint: TaskExecutionCheckpoint,
  env?: any
): Promise<void> {
  const key = `ctx_ledger:${checkpoint.projectId || "default"}:${checkpoint.taskId || "active"}`;
  inMemoryCheckpoints.set(key, checkpoint);
  try {
    if (env?.OAUTH_KV) {
      await env.OAUTH_KV.put(key, JSON.stringify(checkpoint), {
        expirationTtl: 60 * 60 * 24 * 7,
      });
    }
  } catch {}
}

export interface InstantExecutionResult {
  text: string;
  modelUsed: string;
  durationMs: number;
  fallbacksEngaged: number;
  checkpoint?: TaskExecutionCheckpoint;
  newlyLearnedRule?: LearnedRuleItem;
}

/**
 * Executes text generation with ZERO-LATENCY sub-millisecond fallback cascade
 * AND Stateful Context & Task Checkpoint Handover across all 50 models.
 */
export async function executeWithInstantFallback(opts: {
  prompt: string;
  systemPrompt?: string;
  preferredModelId?: string;
  env?: any;
  temperature?: number;
  projectId?: string;
  taskId?: string;
  agentId?: string;
  completedSteps?: string[];
  pendingSteps?: string[];
}): Promise<InstantExecutionResult> {
  const {
    prompt,
    systemPrompt,
    preferredModelId,
    env,
    temperature = 0.7,
    projectId = "default",
    taskId = "global_session",
    agentId = "vorder-tariq",
    completedSteps,
    pendingSteps,
  } = opts;
  const startTime = performance.now();

  const geminiKey =
    (env && env.GEMINI_API_KEY) || (await getOptionalEnvValue("GEMINI_API_KEY"));

  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment. Cannot execute AI pipeline.");
  }

  // 1. Load Team Learned Memory & Previous Model Checkpoint
  const { memory, newlyLearnedRule } = await extractAndLearnUserPreferences(
    projectId,
    prompt,
    agentId,
    env
  );
  const existingCheckpoint = await getTaskCheckpoint(projectId, taskId, env);

  const google = createGoogleGenerativeAI({ apiKey: geminiKey });
  const chain = getTextFallbackChain();

  // Prioritize preferred model at index 0 if specified
  const prioritizedCandidates: GoogleModelDef[] = [];
  if (preferredModelId) {
    const pref = getModelDefById(preferredModelId);
    if (pref) prioritizedCandidates.push(pref);
  }
  for (const c of chain) {
    if (!prioritizedCandidates.some((p) => p.id === c.id)) {
      prioritizedCandidates.push(c);
    }
  }

  let fallbacksEngaged = 0;
  let lastError: any = null;
  const attemptedChain: string[] = existingCheckpoint?.previousModelsChain
    ? [...existingCheckpoint.previousModelsChain]
    : [];

  // Build Stateful Context Handover Block so any model in the 50-model cascade resumes seamlessly
  const handoverContextBlock = `
[ذاكرة وقواعد الفريق المتعلمة من القائد (Learned Team Rules & Preferences)]
- ما يفضله القائد (Likes): ${memory.likes.join(" | ")}
- ما يرفضه القائد (Dislikes): ${memory.dislikes.join(" | ")}
- القواعد الملزمة للوكلاء الـ 9: ${memory.bindingRules.slice(0, 6).map((r) => r.text).join(" || ")}
${
  existingCheckpoint
    ? `
[سجل استمرارية السياق بين النماذج (Stateful Context Handover Ledger)]
- النماذج السابقة التي عملت على هذه المهمة: ${existingCheckpoint.previousModelsChain.slice(-4).join(" ➔ ")}
- ما تم إنجازه بالفعل (Completed Steps): ${existingCheckpoint.completedSteps.join(" ، ")}
- ملخص آخر مخرجات سابقة (Previous Output Summary): ${existingCheckpoint.partialOutputSummary}
- المطلوب استكماله الآن من حيث انتهى النموذج السابق (Pending Steps): ${(pendingSteps || existingCheckpoint.pendingSteps).join(" ، ")}
`
    : ""
}`.trim();

  const enrichedSystemPrompt = systemPrompt
    ? `${systemPrompt}\n\n${handoverContextBlock}`
    : handoverContextBlock;

  for (const candidate of prioritizedCandidates) {
    if (!isModelHealthy(candidate.id)) {
      fallbacksEngaged++;
      continue; // Pre-emptively skip model on cooldown without wasting network latency!
    }

    const modelAttemptStart = performance.now();
    try {
      const modelInstance = google(candidate.id);
      const res = await generateText({
        model: modelInstance,
        prompt,
        system: enrichedSystemPrompt,
        temperature,
      });

      if (res && res.text) {
        recordModelUsage(candidate.id);
        const durationMs = Math.round(performance.now() - startTime);
        if (!attemptedChain.includes(candidate.id)) {
          attemptedChain.push(candidate.id);
        }

        const updatedCheckpoint: TaskExecutionCheckpoint = {
          taskId,
          projectId,
          agentId,
          previousModelsChain: attemptedChain.slice(-8),
          completedSteps: completedSteps || [
            ...(existingCheckpoint?.completedSteps || []).slice(-4),
            `أنجز النموذج ${candidate.id} معالجة مهمة الوكيل ${agentId}`,
          ],
          partialOutputSummary: res.text.slice(0, 280),
          pendingSteps: pendingSteps || ["متابعة التنفيذ والمراقبة المستمرة مع بقية الوكلاء"],
          updatedAt: new Date().toISOString(),
        };
        await saveTaskCheckpoint(updatedCheckpoint, env);

        if (fallbacksEngaged > 0) {
          console.log(
            `[SubMillisecondFallback] 🚀 Stateful Handover SUCCESS! Delivered by ${candidate.id} in ${durationMs}ms (${fallbacksEngaged} fallbacks engaged)`
          );
        }

        return {
          text: res.text,
          modelUsed: candidate.id,
          durationMs,
          fallbacksEngaged,
          checkpoint: updatedCheckpoint,
          newlyLearnedRule,
        };
      }
    } catch (err: any) {
      lastError = err;
      const failoverLag = (performance.now() - modelAttemptStart).toFixed(2);
      fallbacksEngaged++;
      if (!attemptedChain.includes(`${candidate.id}(handover)`)) {
        attemptedChain.push(`${candidate.id}(handover)`);
      }

      const isRateLimit =
        err?.status === 429 ||
        String(err?.message || "").includes("429") ||
        String(err?.message || "").includes("RESOURCE_EXHAUSTED") ||
        String(err?.message || "").includes("quota");

      if (isRateLimit) {
        tripModelCooldown(candidate.id, err);
      } else {
        modelCooldowns.set(candidate.id, Date.now() + 10000);
      }

      console.warn(
        `[SubMillisecondFallback] ⚡ Stateful Failover: Model ${candidate.id} handed over context after ${failoverLag}ms. Switching to next candidate in same tick...`
      );
    }
  }

  const totalDuration = Math.round(performance.now() - startTime);
  console.error(
    `[SubMillisecondFallback] ❌ All ${prioritizedCandidates.length} models exhausted after ${totalDuration}ms. Last error:`,
    lastError
  );

  throw new Error(
    `AI Sub-Millisecond Fallback exhausted all ${prioritizedCandidates.length} models. Last error: ${
      lastError?.message || String(lastError)
    }`
  );
}

