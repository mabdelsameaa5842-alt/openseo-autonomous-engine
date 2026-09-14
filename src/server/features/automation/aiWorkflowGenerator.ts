/**
 * aiWorkflowGenerator.ts
 * Gemini AI Workflow Co-Pilot Engine
 * Synthesizes Flowise-grade DAG automation workflows from natural language prompts.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import type { FlowNode, FlowEdge, FlowGraph, WorkflowType } from "./flowEngine";

export interface GenerateWorkflowInput {
  prompt: string;
  projectId: string;
  domain?: string;
  existingWorkflows?: string[];
  env?: any;
}

export interface GeneratedWorkflowOutput {
  success: boolean;
  graph: FlowGraph;
  explanationAr: string;
  highlights: string[];
}

/**
 * Resolves Gemini model provider.
 */
async function resolveGeminiModel(env?: any) {
  const geminiKey =
    (env && env.GEMINI_API_KEY) || (await getOptionalEnvValue("GEMINI_API_KEY"));
  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return google("gemini-2.0-flash");
  }

  const openrouterKey =
    (env && env.OPENROUTER_API_KEY) ||
    (await getOptionalEnvValue("OPENROUTER_API_KEY"));
  if (openrouterKey) {
    const openrouter = createOpenRouter({ apiKey: openrouterKey });
    return openrouter("google/gemini-2.0-flash-001");
  }

  return null;
}

/**
 * Fallback semantic generator when AI API is unavailable.
 */
function buildFallbackWorkflow(
  prompt: string,
  projectId: string,
  cleanDomain: string,
): GeneratedWorkflowOutput {
  const lower = prompt.toLowerCase();

  // 1. Competitor / Hijack
  if (lower.includes("منافس") || lower.includes("competitor") || lower.includes("تجسس") || lower.includes("spy")) {
    const nodes: FlowNode[] = [
      {
        id: `node_trig_${Date.now()}`,
        type: "cronTrigger",
        label: "محفز مسح المنافسين (Weekly Cron)",
        category: "trigger",
        position: { x: 50, y: 180 },
        data: { schedule: "أسبوعياً كل أحد 02:00 ص", cron: "0 2 * * 0" },
      },
      {
        id: `node_src_${Date.now()}`,
        type: "competitorSpy",
        label: "رادار المنافسين في السيرب (SERP Spy)",
        category: "source",
        position: { x: 340, y: 180 },
        data: { targetMarket: "Saudi / GCC", competitorsCount: 5 },
      },
      {
        id: `node_aud_${Date.now()}`,
        type: "gapAuditor",
        label: "كاشف فجوات الكلمات الذهبية",
        category: "audit",
        position: { x: 640, y: 180 },
        data: { filter: "High Search Volume + Missing on Domain" },
      },
      {
        id: `node_ai_${Date.now()}`,
        type: "geminiStudio",
        label: "صانع المقالات المتفوقة (Gemini 2.0)",
        category: "ai",
        position: { x: 940, y: 180 },
        data: { model: "gemini-2.0-flash", style: "10x Content Pillar & Comparison Tables" },
      },
      {
        id: `node_pub_${Date.now()}`,
        type: "publisher",
        label: "ناشر المقالات المباشر",
        category: "output",
        position: { x: 1240, y: 180 },
        data: { domain: cleanDomain, totalLive: 76 },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e1", source: nodes[0].id, target: nodes[1].id, animated: true, label: "إطلاق المسح" },
      { id: "e2", source: nodes[1].id, target: nodes[2].id, animated: true, label: "تحليل الفجوات" },
      { id: "e3", source: nodes[2].id, target: nodes[3].id, animated: true, label: "صياغة مقال متفوق" },
      { id: "e4", source: nodes[3].id, target: nodes[4].id, animated: true, label: "نشر فوري" },
    ];

    return {
      success: true,
      graph: {
        id: `flow_comp_${Date.now().toString(36)}`,
        projectId,
        name: "مسار قنص المنافسين وتوليد مقالات الفجوات التكتيكية",
        description: "مسار آلي ذكي يراقب أفضل 5 منافسين في السوق السعودي ويستخرج الكلمات التي يتصدرونها دون موقعك ويكتب مقالات متفوقة عنها تلقائياً.",
        workflowType: "competitor_spy",
        cronExpression: "0 2 * * 0",
        nodes,
        edges,
        isActive: true,
      },
      explanationAr: "تم إنشاء مسار قنص المنافسين التكتيكي ليرصد أفضل صفحات المنافسين أسبوعياً ويولد مقالات هجومية تتفوق عليها.",
      highlights: [
        "مسح أسبوعي شامل لمواقع المنافسين في السيرب السعودي والخليجي.",
        "استخراج تلقائي للفجوات ذات معدلات البحث العالية وصفر تنافسية داخلية.",
        "توليد ونشر مقالات مقارنة ودلائل شاملة 10x عبر Gemini 2.0.",
      ],
    };
  }

  // 2. Local Maps / Reviews
  if (lower.includes("خرائط") || lower.includes("maps") || lower.includes("محلي") || lower.includes("local") || lower.includes("فروع")) {
    const nodes: FlowNode[] = [
      {
        id: `node_trig_${Date.now()}`,
        type: "cronTrigger",
        label: "محفز السيو المحلي (Monthly Cron)",
        category: "trigger",
        position: { x: 50, y: 180 },
        data: { schedule: "شهرياً أول يوم 00:00 UTC", cron: "0 0 1 * *" },
      },
      {
        id: `node_src_${Date.now()}`,
        type: "mapsGrid",
        label: "ماسح نقاط التغطية المحلية (Maps Grid)",
        category: "source",
        position: { x: 340, y: 180 },
        data: { radiusKm: 10, targetCity: "الرياض وجدة" },
      },
      {
        id: `node_ai_${Date.now()}`,
        type: "geminiStudio",
        label: "مهندس Schema والبيانات المحلية",
        category: "ai",
        position: { x: 640, y: 180 },
        data: { model: "gemini-2.0-flash", schemaTypes: ["LocalBusiness", "PostalAddress"] },
      },
      {
        id: `node_pub_${Date.now()}`,
        type: "publisher",
        label: "محدث صفحات الفروع والمناطق",
        category: "output",
        position: { x: 940, y: 180 },
        data: { domain: cleanDomain, updateBranches: true },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e1", source: nodes[0].id, target: nodes[1].id, animated: true, label: "فحص الظهور" },
      { id: "e2", source: nodes[1].id, target: nodes[2].id, animated: true, label: "بناء البيانات" },
      { id: "e3", source: nodes[2].id, target: nodes[3].id, animated: true, label: "حقن التحديثات" },
    ];

    return {
      success: true,
      graph: {
        id: `flow_local_${Date.now().toString(36)}`,
        projectId,
        name: "مسار تعزيز السيو المحلي وخرائط جوجل (Local Maps Booster)",
        description: "تحليل مراكز الفروع في محيط 10 كم وبناء هياكل Schema المحلية لدعم الظهور في صندوق الـ 3-Pack لخرائط جوجل.",
        workflowType: "local_booster",
        cronExpression: "0 0 1 * *",
        nodes,
        edges,
        isActive: true,
      },
      explanationAr: "تم تكوين مسار السيو المحلي لدعم تصدر فروعك وموقعك في نتائج خرائط جوجل وبحث الجوال القريب.",
      highlights: [
        "فحص شبكة التغطية الجغرافية لنتائج البحث المحلية (Local Rank Grid).",
        "توليد وسوم بيانات منظمة LocalBusiness Schema غنية بالإحداثيات ومواعيد العمل.",
        "تحديث دوري لصفحات الفروع يعزز ثقة خوارزميات جوجل المحلية.",
      ],
    };
  }

  // 3. Default Customized Flow based on Prompt
  const nodes: FlowNode[] = [
    {
      id: `node_trig_${Date.now()}`,
      type: "cronTrigger",
      label: "محفز الدورة المخصصة (Custom Schedule)",
      category: "trigger",
      position: { x: 50, y: 180 },
      data: { schedule: "كل 6 ساعات (4 دورات يومياً)", cron: "0 */6 * * *" },
    },
    {
      id: `node_src_${Date.now()}`,
      type: "gscSource",
      label: "مستكشف مؤشرات Google Search Console",
      category: "source",
      position: { x: 340, y: 180 },
      data: { metrics: ["Impressions", "Clicks", "Position"], domain: cleanDomain },
    },
    {
      id: `node_ai_${Date.now()}`,
      type: "geminiStudio",
      label: "استوديو Gemini لصياغة المحتوى المتخصص",
      category: "ai",
      position: { x: 640, y: 180 },
      data: { model: "gemini-2.0-flash", promptFocus: prompt },
    },
    {
      id: `node_pub_${Date.now()}`,
      type: "publisher",
      label: "ناشر المدونة المباشر (Vercel Live)",
      category: "output",
      position: { x: 940, y: 180 },
      data: { domain: cleanDomain, totalLive: 76 },
    },
    {
      id: `node_rank_${Date.now()}`,
      type: "googleRank",
      label: "مدقق الترتيب المباشر في السيرب",
      category: "audit",
      position: { x: 1240, y: 180 },
      data: { instantCheck: true },
    },
  ];

  const edges: FlowEdge[] = [
    { id: "e1", source: nodes[0].id, target: nodes[1].id, animated: true, label: "استدعاء الفرص" },
    { id: "e2", source: nodes[1].id, target: nodes[2].id, animated: true, label: "توجيه البيانات للذكاء الاصطناعي" },
    { id: "e3", source: nodes[2].id, target: nodes[3].id, animated: true, label: "نشر فوري" },
    { id: "e4", source: nodes[3].id, target: nodes[4].id, animated: true, label: "التحقق من الترتيب" },
  ];

  return {
    success: true,
    graph: {
      id: `flow_custom_${Date.now().toString(36)}`,
      projectId,
      name: `مسار مخصص: ${prompt.slice(0, 45)}...`,
      description: `مسار أتمتة تم إنشاؤه مخصصاً لتنفيذ: ${prompt}`,
      workflowType: "custom",
      cronExpression: "0 */6 * * *",
      nodes,
      edges,
      isActive: true,
    },
    explanationAr: `تم تكوين مسار مخصص يلبي طلبك: "${prompt}" مع ربطه المباشر بـ Google Search Console واستوديو Gemini 2.0 ومحرك النشر والتحقق.`,
    highlights: [
      "جدولة مرنة تعمل تلقائياً مع قابلية التعديل اللحظي.",
      "ربط متسلسل غير حلقي (DAG) من مصادر البيانات حتى النشر المباشر والتدقيق.",
      "جاهز للتفعيل المباشر أو المعاينة على القماش وتعديل بارامتراته يدوياً.",
    ],
  };
}

/**
 * Generates an AI-synthesized Flowise workflow graph from natural language.
 */
export async function generateAiWorkflow(
  opts: GenerateWorkflowInput,
): Promise<GeneratedWorkflowOutput> {
  const cleanDomain = (opts.domain || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  const model = await resolveGeminiModel(opts.env);

  if (!model) {
    return buildFallbackWorkflow(opts.prompt, opts.projectId, cleanDomain);
  }

  const systemPrompt = `You are a Principal Flowise Automation Architect and Senior SEO Systems Engineer.
The user wants to generate an executable Flowise DAG automation workflow for automated SEO.

Return ONLY a valid JSON object matching this exact schema:
{
  "name": "اسم التدفق بالعربية (عنوان احترافي موجز)",
  "description": "وصف دقيق للمسار وأهدافه بالعربية",
  "workflowType": "continuous_publishing" | "rank_auditor" | "competitor_spy" | "local_booster" | "custom",
  "cronExpression": "e.g. */30 * * * * or 0 4 * * *",
  "nodes": [
    {
      "id": "node_...",
      "type": "cronTrigger" | "webhookTrigger" | "googleAds" | "gscSource" | "competitorSpy" | "contentQueue" | "flowiseEngine" | "geminiStudio" | "eeatAuditor" | "publisher" | "googleRank" | "alertDispatcher",
      "label": "عنوان العقدة بالعربية",
      "category": "trigger" | "source" | "engine" | "ai" | "output" | "audit",
      "position": { "x": 50, "y": 180 },
      "data": {}
    }
  ],
  "edges": [
    {
      "id": "e_...",
      "source": "node_...",
      "target": "node_...",
      "animated": true,
      "label": "وصف الحركة بالعربية"
    }
  ],
  "explanationAr": "شرح من فقرة واحدة يوضح كيف يحقق هذا المسار هدف المستخدم",
  "highlights": ["ميزة 1", "ميزة 2", "ميزة 3"]
}

Rules:
1. Always calculate 'x' positions starting from 50 and incrementing by 280-320px for each sequential node (e.g. 50, 340, 640, 940, 1240). Set 'y' around 180.
2. Every node must connect via valid edges in a Directed Acyclic Graph (DAG) topology.
3. NEVER reference Make.com. The core engine must always be Flowise Native or Gemini AI.
4. Target Domain is: "${cleanDomain}".
5. Return ONLY JSON without markdown fences.`;

  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: `Generate an SEO automation workflow for the following requirement: "${opts.prompt}"`,
      temperature: 0.2,
    });

    const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
      const graph: FlowGraph = {
        id: `flow_ai_${Date.now().toString(36)}`,
        projectId: opts.projectId,
        name: parsed.name || `مسار ذكي: ${opts.prompt.slice(0, 30)}`,
        description: parsed.description || opts.prompt,
        workflowType: parsed.workflowType || "custom",
        cronExpression: parsed.cronExpression || "0 */6 * * *",
        nodes: parsed.nodes,
        edges: Array.isArray(parsed.edges) ? parsed.edges : [],
        isActive: true,
      };

      return {
        success: true,
        graph,
        explanationAr: parsed.explanationAr || "تم توليد المسار بنجاح وفقاً لمواصفات طلبك.",
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [
          "تدفق متكامل من المحفز حتى النشر والتحقق.",
          "متوافق بالكامل مع بيئة Flowise السحابية المستقلة.",
          "توليد فوري ومتاح للتعديل اليدوي على القماش.",
        ],
      };
    }
  } catch (err) {
    console.warn("[aiWorkflowGenerator] LLM generation error, falling back to deterministic generator:", err);
  }

  return buildFallbackWorkflow(opts.prompt, opts.projectId, cleanDomain);
}
