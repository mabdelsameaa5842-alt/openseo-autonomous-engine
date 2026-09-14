import { createFileRoute } from "@tanstack/react-router";
import { SearchConsoleConnectionCard } from "@/client/features/gsc/SearchConsoleConnectionCard";
import { GoogleAnalyticsConnectionCard } from "@/client/features/ga4/GoogleAnalyticsConnectionCard";
import { GoogleAdsConnectionCard } from "@/client/features/google-ads/GoogleAdsConnectionCard";
import { FlowiseAutomationConnectionCard } from "@/client/features/integrations/FlowiseAutomationConnectionCard";

export const Route = createFileRoute(
  "/_project/p/$projectId/settings/integrations",
)({
  component: ProjectIntegrationsRoute,
});

function ProjectIntegrationsRoute() {
  const { projectId } = Route.useParams();

  return (
    <div className="space-y-8">
      {/* The ids are the targets old #search-console / #google-analytics / #google-ads / #workflow-automation deep
          links are redirected to from the settings index. */}
      <section id="workflow-automation" className="scroll-mt-6 space-y-3">
        <h2 className="text-sm font-medium text-base-content/50">
          Workflow Automation
        </h2>
        <FlowiseAutomationConnectionCard
          projectId={projectId}
          heading={
            <h2 className="text-sm font-medium text-base-content/50">
              Flowise AI Autonomous Engine
            </h2>
          }
        />
      </section>

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
    </div>
  );
}

