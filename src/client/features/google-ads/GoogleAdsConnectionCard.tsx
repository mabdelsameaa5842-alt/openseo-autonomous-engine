import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GoogleGlyph } from "@/client/features/gsc/GoogleGlyph";
import { GoogleLinkErrorAlert } from "@/client/features/integrations/GoogleLinkErrorAlert";
import { IntegrationConnectionCard } from "@/client/features/integrations/IntegrationConnectionCard";
import { GoogleAdsLogo } from "@/client/features/integrations/GoogleProductLogos";
import { startGoogleLink } from "@/client/features/integrations/startGoogleLink";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  disconnectGoogleAds,
  getGoogleAdsConnection,
  listGoogleAdsCustomers,
  setGoogleAdsCustomer,
} from "@/serverFunctions/googleAds";
import { GOOGLE_ADS_SETUP_DOCS_URL } from "@/shared/google-ads";

export function GoogleAdsConnectionCard({
  projectId,
  onDismiss,
  dismissing = false,
  heading,
}: {
  projectId: string;
  onDismiss?: () => void;
  dismissing?: boolean;
  heading?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [picking, setPicking] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);

  const connectionKey = ["googleAdsConnection", projectId];
  const connectionQuery = useQuery({
    queryKey: connectionKey,
    queryFn: () => getGoogleAdsConnection({ data: { projectId } }),
  });

  const connection = connectionQuery.data;
  const connected = Boolean(connection?.connected);

  const customersQuery = useQuery({
    queryKey: ["googleAdsCustomers", projectId],
    queryFn: () => listGoogleAdsCustomers({ data: { projectId } }),
    enabled: Boolean(picking || (connection?.currentUserHasGrant && !connected)),
  });

  const accounts = React.useMemo(
    () => customersQuery.data?.accounts ?? [],
    [customersQuery.data?.accounts],
  );

  const invalidateConnectionState = () => {
    void queryClient.invalidateQueries({ queryKey: connectionKey });
    void queryClient.invalidateQueries({
      queryKey: ["dashboardActivation", projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["dashboardGoogleAdsReport", projectId],
    });
  };

  const setCustomerMutation = useMutation({
    mutationFn: (args: { accountId: string; customerId: string; descriptiveName?: string }) =>
      setGoogleAdsCustomer({ data: { projectId, ...args } }),
    onSuccess: () => {
      toast.success("Google Ads & Keyword Planner connected");
      setPicking(false);
      invalidateConnectionState();
    },
    onError: (error) => toast.error(getStandardErrorMessage(error)),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectGoogleAds({ data: { projectId } }),
    onSuccess: () => {
      toast.success("Google Ads disconnected");
      setPicking(false);
      setSelectedCustomerId(null);
      invalidateConnectionState();
    },
    onError: (error) => toast.error(getStandardErrorMessage(error)),
  });

  const handleConnect = () => void startGoogleLink("googleAds", window.location.href);

  return (
    <>
      {heading}
      <IntegrationConnectionCard
        title="Google Ads & Keyword Planner"
        icon={<GoogleAdsLogo className="size-5" />}
        status={
          connectionQuery.isLoading
            ? undefined
            : connected
              ? "connected"
              : "disconnected"
        }
      >
        <GoogleLinkErrorAlert provider="googleAds" className="mb-4" />
        {connectionQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-base-content/50">
            <span className="loading loading-spinner loading-sm" />
            Checking Google Ads connection…
          </div>
        ) : connected && !picking ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-base-300 bg-base-200/30 px-4 py-3.5">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">
                    Connected Google Ads Account
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {connection?.customerDescriptiveName ?? "Google Ads Customer"}
                  </p>
                </div>
                <span className="rounded-md border border-base-300 bg-base-100 px-2 py-1 font-mono text-[11px] text-base-content/60">
                  ID {connection?.customerId ?? "—"}
                </span>
              </div>

              <dl className="mt-3 grid gap-x-6 gap-y-2 border-t border-base-300/70 pt-3 text-xs sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-base-content/45">Keyword Planner Status</dt>
                  <dd className="mt-0.5 font-medium text-success flex items-center gap-1">
                    <span className="size-2 rounded-full bg-success inline-block" /> Active (Live Search Volumes)
                  </dd>
                </div>
                {connection?.connectedByEmail ? (
                  <div className="min-w-0">
                    <dt className="text-base-content/45">Account Email</dt>
                    <dd className="mt-0.5 truncate font-medium text-base-content/75">
                      {connection.connectedByEmail}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-outline btn-sm border-base-300 font-medium"
                onClick={() => setPicking(true)}
              >
                Change account
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm font-medium text-error hover:bg-error/10"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          </div>
        ) : picking || (connection?.currentUserHasGrant && !connected) ? (
          <div className="space-y-3">
            <p className="text-xs text-base-content/70">
              Select the Google Ads account to use for Keyword Planner data:
            </p>
            {customersQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-base-content/50">
                <span className="loading loading-spinner loading-sm" />
                Loading accounts…
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-md bg-base-200/50 p-3 text-xs text-base-content/70">
                No accessible Google Ads accounts found on this Google grant.
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.flatMap((grant) =>
                  grant.customers.map((c) => (
                    <button
                      key={c.customerId}
                      type="button"
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        selectedCustomerId === c.customerId
                          ? "border-primary bg-primary/5"
                          : "border-base-300 hover:bg-base-200/40"
                      }`}
                      onClick={() => {
                        setSelectedCustomerId(c.customerId);
                        setCustomerMutation.mutate({
                          accountId: grant.accountId,
                          customerId: c.customerId,
                          descriptiveName: c.descriptiveName,
                        });
                      }}
                      disabled={setCustomerMutation.isPending}
                    >
                      <div>
                        <p className="text-sm font-medium">{c.descriptiveName}</p>
                        <p className="text-xs text-base-content/50 font-mono">ID: {c.customerId}</p>
                      </div>
                      <span className="btn btn-primary btn-xs">Select</span>
                    </button>
                  )),
                )}
              </div>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-xs text-base-content/60"
              onClick={() => setPicking(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-base-content/70">
              Connect your Google Ads account to unlock <strong>Google Keyword Planner</strong> directly in OpenSEO. Access verified monthly search volumes, CPC ranges, and competition levels without third-party API roadblocks.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm inline-flex items-center gap-2"
                onClick={handleConnect}
              >
                <GoogleGlyph className="size-4" />
                Connect Google Ads
              </button>
              {onDismiss ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-base-content/60"
                  onClick={onDismiss}
                  disabled={dismissing}
                >
                  Dismiss
                </button>
              ) : null}
            </div>
          </div>
        )}
      </IntegrationConnectionCard>
    </>
  );
}
