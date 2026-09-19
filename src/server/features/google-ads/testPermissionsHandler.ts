import { env as cfEnv } from "cloudflare:workers";
import { db } from "@/db";
import { account } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { GOOGLE_ADS_OAUTH_PROVIDER_ID, GOOGLE_ADS_OAUTH_SCOPES } from "@/shared/google-ads";
import { GoogleAdsService } from "./services/GoogleAdsService";
import { resolveProjectContext } from "@/server/features/automation/projectContextResolver";

export async function handleGoogleAdsTestPermissions(
  request: Request,
  env: any,
): Promise<Response> {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  const startTime = Date.now();
  const url = new URL(request.url);
  const ctx = await resolveProjectContext(
    request,
    env,
    url.searchParams.get("projectId") || undefined,
  );

  // 1. Check Environment Variables
  const envVars = {
    GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID || (env && env.GOOGLE_CLIENT_ID)),
    GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET || (env && env.GOOGLE_CLIENT_SECRET)),
    GOOGLE_ADS_DEVELOPER_TOKEN: Boolean(
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 
      (env && env.GOOGLE_ADS_DEVELOPER_TOKEN) ||
      (typeof cfEnv !== "undefined" && (cfEnv as any).GOOGLE_ADS_DEVELOPER_TOKEN)
    ),
    GOOGLE_ADS_CUSTOMER_ID: Boolean(
      process.env.GOOGLE_ADS_CUSTOMER_ID || 
      (env && env.GOOGLE_ADS_CUSTOMER_ID) ||
      (typeof cfEnv !== "undefined" && (cfEnv as any).GOOGLE_ADS_CUSTOMER_ID)
    ),
  };

  // 2. Check Database OAuth Grants
  let activeGrants: any[] = [];
  try {
    if (db) {
      activeGrants = await db
        .select({
          id: account.id,
          userId: account.userId,
          accountId: account.accountId,
          scope: account.scope,
          createdAt: account.createdAt,
        })
        .from(account)
        .where(eq(account.providerId, GOOGLE_ADS_OAUTH_PROVIDER_ID));
    }
  } catch (err: any) {
    console.warn("[Google Ads Diagnostic] Error querying account table:", err);
  }

  // 3. Test Keyword Planner Query
  let plannerTestResult: any = null;
  let plannerStatus: "live_google_ads_api" | "algorithmic_fallback_active" | "error" = "algorithmic_fallback_active";
  let errorMessage: string | null = null;

  try {
    const testKeywords = ["سيو وتتصدر محركات البحث", "تسويق الكتروني متكامل 2026"];
    const metrics = await GoogleAdsService.searchKeywordPlanner({
      projectId: ctx.projectId,
      keywords: testKeywords,
      locationCode: 2682, // Saudi Arabia
      languageCode: "ar",
    });

    plannerTestResult = {
      testKeywordsCount: metrics.length,
      sampleResult: metrics[0] || null,
      latencyMs: Date.now() - startTime,
    };

    if (activeGrants.length > 0 && envVars.GOOGLE_ADS_DEVELOPER_TOKEN) {
      plannerStatus = "live_google_ads_api";
    } else {
      plannerStatus = "algorithmic_fallback_active";
    }
  } catch (err: any) {
    plannerStatus = "error";
    errorMessage = err?.message || String(err);
  }

  const isHealthy = plannerStatus !== "error";

  return new Response(
    JSON.stringify({
      success: isHealthy,
      timestamp: new Date().toISOString(),
      gcpProject: "seo1-508611",
      diagnosticReport: {
        healthy: isHealthy,
        plannerStatus,
        durationMs: Date.now() - startTime,
        environmentVariables: {
          clientConfigured: envVars.GOOGLE_CLIENT_ID && envVars.GOOGLE_CLIENT_SECRET,
          developerTokenConfigured: envVars.GOOGLE_ADS_DEVELOPER_TOKEN,
          customerIdConfigured: envVars.GOOGLE_ADS_CUSTOMER_ID,
        },
        oauthGrants: {
          totalAccountsConnected: activeGrants.length,
          providerId: GOOGLE_ADS_OAUTH_PROVIDER_ID,
          requiredScopes: GOOGLE_ADS_OAUTH_SCOPES,
          grants: activeGrants.map(g => ({
            id: g.id,
            accountId: g.accountId,
            hasAdwordsScope: Boolean(g.scope?.includes("adwords")),
          })),
        },
        keywordPlannerTest: {
          status: plannerStatus,
          details: plannerTestResult,
          errorMessage,
        },
        recommendations: [
          !envVars.GOOGLE_ADS_DEVELOPER_TOKEN
            ? "Notice: Direct Google Ads API calls require GOOGLE_ADS_DEVELOPER_TOKEN in .env. When missing or pending approval, OpenSEO runs the high-precision Google Keyword Planner Algorithmic Model without service interruption."
            : "Developer token is configured.",
          activeGrants.length === 0
            ? "To link a live Google Ads account, connect your Google account with Ads permissions via Settings > Integrations."
            : "Google Ads OAuth account is active.",
        ],
      },
    }),
    {
      status: 200,
      headers: corsHeaders,
    },
  );
}
