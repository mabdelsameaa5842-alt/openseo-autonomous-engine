import { z } from "zod";
import { mcpResponse } from "@/server/mcp/formatters";
import { buildProjectMeta } from "@/server/mcp/context";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { projectIdSchema } from "@/server/mcp/schemas";
import { GoogleAdsService } from "@/server/features/google-ads/services/GoogleAdsService";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";

const inputSchema = {
  projectId: projectIdSchema,
  keywords: z
    .array(z.string().min(1))
    .min(1)
    .max(20)
    .describe(
      "1-20 seed keywords to fetch Google Keyword Planner ideas and search metrics for.",
    ),
  locationCode: z
    .number()
    .optional()
    .describe("Location code (e.g. 2682 for Saudi Arabia, 2818 for Egypt)."),
  languageCode: z.string().optional().describe("Language code (e.g. ar or en)."),
} as const;

type Args = z.infer<z.ZodObject<typeof inputSchema>>;

export const getGoogleAdsKeywordIdeasTool = {
  name: "get_google_ads_keyword_ideas",
  config: {
    title: "Get Google Ads Keyword Planner ideas",
    description:
      "Query Google Ads Keyword Planner (مخطط الكلمات المفتاحية) for official monthly search volumes, competition levels (LOW/MEDIUM/HIGH), and Top-of-page CPC bid ranges. Direct Google Ads integration with zero external 403 API blockers.",
    inputSchema,
    outputSchema: {
      metrics: z.array(looseObjectOutputSchema),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: Args, context) => {
    const metrics = await GoogleAdsService.searchKeywordPlanner({
      projectId: args.projectId,
      keywords: args.keywords,
      locationCode: args.locationCode,
      languageCode: args.languageCode,
    });

    const columns: McpTableColumn<(typeof metrics)[0]>[] = [
      { header: "keyword", value: (r) => r.keyword },
      { header: "volume", value: (r) => r.searchVolume },
      { header: "competition", value: (r) => r.competition },
      { header: "CPC", value: (r) => (r.cpc ? `$${r.cpc.toFixed(2)}` : "—") },
      {
        header: "lowBid",
        value: (r) => (r.lowTopOfPageBid ? `$${r.lowTopOfPageBid.toFixed(2)}` : "—"),
      },
      {
        header: "highBid",
        value: (r) =>
          r.highTopOfPageBid ? `$${r.highTopOfPageBid.toFixed(2)}` : "—",
      },
    ];

    const text = `## Google Keyword Planner Results (${metrics.length} keywords)\n\n${formatMcpTable(metrics, columns)}`;

    return mcpResponse({
      text,
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/keywords`,
      ),
      structuredContent: { metrics },
    });
  }),
};
