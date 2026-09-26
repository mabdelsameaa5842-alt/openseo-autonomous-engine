import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/help/dataforseo-api-key")({
  component: GoogleNativeSeoHelpPage,
});

function GoogleNativeSeoHelpPage() {
  return (
    <div className="px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <h1 className="text-2xl font-semibold">
              Google Search Console &amp; Google Ads Keyword Planner
            </h1>
            <p className="text-sm text-base-content/70">
              Vorder &amp; OpenSEO use live Google Search Console, Google
              Analytics 4, and Google Ads Keyword Planner connections via Google
              OAuth 2.0 and your Google Ads Developer Token. Connect your
              accounts in Project Settings &rarr; Integrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
