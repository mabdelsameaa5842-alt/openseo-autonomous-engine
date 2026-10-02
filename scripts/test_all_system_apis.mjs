import { execSync } from "node:child_process";

const baseUrl = "https://open-seo.abdelsameaa.workers.dev";
const projectId = "cc58e018-8ef9-4be7-8f3a-2af2bc158d62";

const endpoints = [
  { name: "Unified Quota Status", url: `${baseUrl}/api/automation/unified-quota-status` },
  { name: "Platforms Telemetry (11 Platforms)", url: `${baseUrl}/api/automation/platforms-telemetry` },
  { name: "Agent Deliverables (Notion-Style)", url: `${baseUrl}/api/automation/agent-deliverables` },
  { name: "Dual Pipelines Telemetry", url: `${baseUrl}/api/automation/dual-pipelines-telemetry?projectId=${projectId}` },
  { name: "Campaign Performance (all, 3m)", url: `${baseUrl}/api/automation/campaign-performance?projectId=${projectId}&campaignId=all&timeframe=3m` },
  { name: "Campaign Performance (saudi, 3m)", url: `${baseUrl}/api/automation/campaign-performance?projectId=${projectId}&campaignId=camp_cc58e018_saudi_ecom&timeframe=3m` },
  { name: "Campaigns List", url: `${baseUrl}/api/automation/campaigns?projectId=${projectId}` },
  { name: "GSC Search Terms", url: `${baseUrl}/api/automation/gsc-search-terms?projectId=${projectId}` },
  { name: "Agent Meetings Chamber", url: `${baseUrl}/api/automation/agent-meetings?projectId=${projectId}` },
  { name: "Agent Target Countries", url: `${baseUrl}/api/automation/agent-target-countries?projectId=${projectId}` },
  { name: "Agent Programmatic Logs", url: `${baseUrl}/api/automation/agent-programmatic-logs?projectId=${projectId}` },
  { name: "Autonomous Queue", url: `${baseUrl}/api/automation/queue?projectId=${projectId}` },
  { name: "Harvested Keywords", url: `${baseUrl}/api/automation/harvested-keywords?projectId=${projectId}` },
  { name: "Site-Wide Rank Audit", url: `${baseUrl}/api/automation/site-wide-rank-audit?projectId=${projectId}` },
  { name: "Geo Radar Telemetry", url: `${baseUrl}/api/automation/geo-radar-telemetry?projectId=${projectId}` },
  { name: "Public Sitemap", url: `${baseUrl}/sitemap.xml?projectId=${projectId}` },
  { name: "Public Robots.txt", url: `${baseUrl}/robots.txt?projectId=${projectId}` },
  { name: "Public Articles API", url: `${baseUrl}/api/public/articles?projectId=${projectId}` },
  { name: "Portfolio Live Blog API", url: `https://mohamed-abdelsamee-portfolio.vercel.app/api/articles` },
];

console.log("=== COMPREHENSIVE FULL-SPECTRUM CURL AUDIT ===");
const results = [];

for (const ep of endpoints) {
  const t0 = Date.now();
  try {
    const raw = execSync(`curl -4 -s -m 10 "${ep.url}"`, { encoding: "utf8" });
    const durationMs = Date.now() - t0;
    let json = null;
    try {
      json = JSON.parse(raw);
    } catch {}

    results.push({
      name: ep.name,
      url: ep.url,
      status: 200,
      durationMs,
      isOk: true,
      summary: json ? summarizeJson(ep.name, json) : raw.slice(0, 150),
    });
  } catch (err) {
    results.push({
      name: ep.name,
      url: ep.url,
      status: "ERROR",
      durationMs: Date.now() - t0,
      isOk: false,
      error: err.message,
    });
  }
}

function summarizeJson(name, data) {
  if (Array.isArray(data)) {
    return { arrayLength: data.length, sampleSlug: data[0]?.slug, sampleTitle: data[0]?.title?.slice(0, 50) };
  }
  if (name.includes("Unified Quota")) {
    return {
      d1CircuitOpen: data.d1?.isCircuitOpen,
      kvThrottled: data.kv?.isThrottled,
      activeModelId: data.aiModels?.activeModelId,
      tableRows: data.consumptionTable?.map(r => ({ id: r.id, consumed: r.consumedDisplay, pct: r.percentage })),
    };
  }
  if (name.includes("Dual Pipelines")) {
    return {
      d1Published: data.gscIndexingTelemetry?.d1Published,
      indexedPages: data.gscIndexingTelemetry?.indexedPages,
      liveSitemapUrls: data.gscIndexingTelemetry?.liveSitemapUrls,
      flowiseTotal: data.flowisePipeline?.totalPublished,
    };
  }
  if (name.includes("Campaign Performance")) {
    return {
      metrics: data.metrics,
      timelinePoints: data.timeline?.length,
    };
  }
  if (name.includes("Agent Meetings")) {
    return {
      publishedCount: data.meeting?.consolidatedReport?.publishedCount,
      sitemapUrls: data.meeting?.consolidatedReport?.sitemapTotalUrls,
      totalMessagesCount: data.meeting?.totalMessagesCount,
      approvedAgents: data.meeting?.approvedExpansionAgents?.length,
    };
  }
  if (name.includes("Campaigns List")) {
    return {
      campaignsCount: data.campaigns?.length,
      sample: data.campaigns?.[0]?.name,
    };
  }
  return { keys: Object.keys(data).slice(0, 10) };
}

console.log(JSON.stringify(results, null, 2));
