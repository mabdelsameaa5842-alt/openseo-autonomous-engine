import { createFileRoute } from "@tanstack/react-router";
import { SearchConsoleConnectionCard } from "@/client/features/gsc/SearchConsoleConnectionCard";
import { GoogleAnalyticsConnectionCard } from "@/client/features/ga4/GoogleAnalyticsConnectionCard";
import { GoogleAdsConnectionCard } from "@/client/features/google-ads/GoogleAdsConnectionCard";
import { FlowiseAutomationConnectionCard } from "@/client/features/integrations/FlowiseAutomationConnectionCard";
import {
  GeminiAiStudioConnectionCard,
  SupabaseConnectionCard,
  GitHubConnectionCard,
  VercelConnectionCard,
  CloudflareConnectionCard,
} from "@/client/features/integrations/PlatformAuthenticConnectionCard";

export const Route = createFileRoute(
  "/_project/p/$projectId/settings/integrations",
)({
  component: ProjectIntegrationsRoute,
});

function ProjectIntegrationsRoute() {
  const { projectId } = Route.useParams();

  return (
    <div className="space-y-8">
      <section id="search-console" className="scroll-mt-6 space-y-3">
        <h2 className="text-sm font-medium text-base-content/50">
          Search Console
        </h2>
        <SearchConsoleConnectionCard projectId={projectId} />
      </section>

      <section id="google-analytics" className="scroll-mt-6 space-y-3">
        <GoogleAnalyticsConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              Analytics
            </h2>
          }
        />
      </section>

      <section id="google-ads" className="scroll-mt-6 space-y-3">
        <GoogleAdsConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              Google Ads & Keyword Planner
            </h2>
          }
        />
      </section>

      <section id="google-ai-studio" className="scroll-mt-6 space-y-3">
        <GeminiAiStudioConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              AI Models & Reasoning Engine
            </h2>
          }
        />
      </section>

      <section id="supabase" className="scroll-mt-6 space-y-3">
        <SupabaseConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              Database & Vector Storage
            </h2>
          }
        />
      </section>

      <section id="github" className="scroll-mt-6 space-y-3">
        <GitHubConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              Source Control & Repository
            </h2>
          }
        />
      </section>

      <section id="vercel" className="scroll-mt-6 space-y-3">
        <VercelConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              Frontend Hosting & Deployments
            </h2>
          }
        />
      </section>

      <section id="cloudflare" className="scroll-mt-6 space-y-3">
        <CloudflareConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              Edge Network, Workers & DNS
            </h2>
          }
        />
      </section>

      <section id="workflow-automation" className="scroll-mt-6 space-y-3">
        <FlowiseAutomationConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              Flowise AI Autonomous Engine
            </h2>
          }
        />
      </section>
    </div>
  );
}
