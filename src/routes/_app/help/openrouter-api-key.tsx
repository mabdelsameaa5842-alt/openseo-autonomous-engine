import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/help/openrouter-api-key")({
  component: GeminiAiStudioHelpPage,
});

function GeminiAiStudioHelpPage() {
  return (
    <div className="px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <h1 className="text-2xl font-semibold">
              Google Gemini AI Studio Integration
            </h1>
            <p className="text-sm text-base-content/70">
              Vorder & OpenSEO run 100% natively on Google Gemini AI Studio and
              Google OAuth 2.0. Go to Project Settings &rarr; Integrations to
              sign in with Google or connect your Gemini AI Studio credential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
