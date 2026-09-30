import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyButton } from "@/client/features/ai-mcp/SetupControls";
import { captureClientEvent } from "@/client/lib/posthog";
import type { DashboardActivation } from "@/server/features/dashboard/services/DashboardService";
import { dismissDashboardMcpCard } from "@/serverFunctions/dashboard";

function firstPrompts(domain: string | null): string[] {
  const site = domain ?? "my site";
  return [
    `Review ${site}. Ideas for what keywords we could target? Use OpenSEO`,
    "Research my competitors top pages and keywords and tell me what's working. Use OpenSEO",
  ];
}

/**
 * The MCP activation card. Pitches the agent workflow and links to the
 * AI & MCP page for setup; disappears for good after the org's first
 * external tool call (or an explicit "I already connected").
 */
export function McpConnectCard({
  projectId,
  activation,
}: {
  projectId: string;
  activation: DashboardActivation;
}) {
  const queryClient = useQueryClient();
  const dismissMutation = useMutation({
    mutationFn: () => dismissDashboardMcpCard({ data: { projectId } }),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["dashboardActivation", projectId],
      }),
  });

  if (activation.mcp.firstToolCallAt || activation.mcp.cardDismissedAt) {
    return null;
  }

  const connected = activation.mcp.authorizedAt !== null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121215]/90 shadow-xl shadow-black/20 backdrop-blur-md transition-all duration-200 hover:border-white/15">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Connect your AI agent
        </h2>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#30D158]/30 bg-[#30D158]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#30D158]">
              Connected
            </span>
          ) : null}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            disabled={dismissMutation.isPending}
            onClick={() => {
              captureClientEvent("dashboard:mcp_already_connected");
              dismissMutation.mutate();
            }}
          >
            I already connected
          </button>
        </div>
      </div>
      <div className="space-y-3 p-5">
        {connected ? (
          <>
            <p className="text-xs text-zinc-400">
              Your agent is connected. Try asking it:
            </p>
            <ul className="space-y-2">
              {firstPrompts(activation.domain).map((prompt) => (
                <li
                  key={prompt}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
                >
                  <span className="min-w-0 truncate text-xs text-zinc-300 font-mono">
                    {prompt}
                  </span>
                  <CopyButton
                    value={prompt}
                    successMessage="Prompt copied"
                    iconOnly
                    onCopy={() =>
                      captureClientEvent("dashboard:mcp_prompt_copy")
                    }
                  />
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-zinc-500 font-mono">
              Waiting for your first call — this card disappears once your agent
              talks to OpenSEO.
            </p>
          </>
        ) : (
          <>
            <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
              <p>
                OpenSEO is designed to give your AI agent the data it needs to
                build a great SEO strategy and help you execute it.
              </p>
              <p>
                This way you aren&rsquo;t limited on &ldquo;AI credits&rdquo;.
              </p>
              <p>
                You can work with your agent to figure out what automations make
                sense for you and it can help you write content too.
              </p>
            </div>
            <Link
              to="/ai"
              className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:underline pt-1"
              onClick={() => captureClientEvent("dashboard:mcp_setup_open")}
            >
              Set up in AI &amp; MCP →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
