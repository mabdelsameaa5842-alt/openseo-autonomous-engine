import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
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
  saveGoogleAdsDeveloperToken,
  setGoogleAdsCustomer,
} from "@/serverFunctions/googleAds";

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
  const [customCustomerIdInput, setCustomCustomerIdInput] = React.useState("");
  const [developerTokenInput, setDeveloperTokenInput] = React.useState("");
  const [showDevTokenEditor, setShowDevTokenEditor] = React.useState(false);

  const connectionKey = ["googleAdsConnection", projectId];
  const connectionQuery = useQuery({
    queryKey: connectionKey,
    queryFn: () => getGoogleAdsConnection({ data: { projectId } }),
  });

  const connection = connectionQuery.data;
  const connected = Boolean(connection?.connected);
  const hasGrant = Boolean(connection?.currentUserHasGrant);
  const devTokenConfigured = Boolean(connection?.developerTokenConfigured);

  const customersQuery = useQuery({
    queryKey: ["googleAdsCustomers", projectId],
    queryFn: () => listGoogleAdsCustomers({ data: { projectId } }),
    enabled: Boolean(picking || (hasGrant && !connected)),
  });

  const accounts = React.useMemo(
    () => customersQuery.data?.accounts ?? [],
    [customersQuery.data?.accounts],
  );

  const invalidateConnectionState = () => {
    void queryClient.invalidateQueries({ queryKey: connectionKey });
    void queryClient.invalidateQueries({ queryKey: ["googleAdsCustomers", projectId] });
    void queryClient.invalidateQueries({
      queryKey: ["dashboardActivation", projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["dashboardGoogleAdsReport", projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["allPlatformConnections", projectId],
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vorder-integrations-updated"));
    }
  };

  const setCustomerMutation = useMutation({
    mutationFn: (args: {
      accountId: string;
      customerId: string;
      customerDescriptiveName?: string;
      developerToken?: string;
    }) => setGoogleAdsCustomer({ data: { projectId, ...args } }),
    onSuccess: () => {
      toast.success("Google Ads & Keyword Planner connected with Full Access");
      setPicking(false);
      invalidateConnectionState();
    },
    onError: (error) => toast.error(getStandardErrorMessage(error)),
  });

  const saveDevTokenMutation = useMutation({
    mutationFn: (args: { developerToken: string; customerId?: string }) =>
      saveGoogleAdsDeveloperToken({
        data: {
          projectId,
          developerToken: args.developerToken,
          customerId: args.customerId,
        },
      }),
    onSuccess: () => {
      toast.success("تم حفظ مفتاح Google Ads Developer Token وتفعيل كامل الصلاحيات بنجاح!");
      setDeveloperTokenInput("");
      setShowDevTokenEditor(false);
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

  const renderDeveloperTokenBox = () => (
    <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-amber-500" />
          <span className="text-xs font-bold text-base-content">
            مفتاح مطور جوجل أدز (Google Ads Developer Token — Full API Access)
          </span>
        </div>
        {devTokenConfigured ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3" />
            Active ({connection?.maskedDeveloperToken || "Configured"})
          </span>
        ) : (
          <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            مطلوب لتفعيل كامل صلاحيات Keyword Planner
          </span>
        )}
      </div>

      {(!devTokenConfigured || showDevTokenEditor) ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const tok = developerTokenInput.trim();
            if (!tok) return;
            saveDevTokenMutation.mutate({
              developerToken: tok,
              customerId: customCustomerIdInput.trim() || connection?.customerId || "731-278-7991",
            });
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              dir="ltr"
              placeholder="Developer Token (e.g. EEROhkAvnYzdFv6kFkGlRQ)"
              value={developerTokenInput}
              onChange={(e) => setDeveloperTokenInput(e.target.value)}
              className="input input-bordered input-sm w-full font-mono text-xs"
            />
            <input
              type="text"
              dir="ltr"
              placeholder="Customer ID (e.g. 731-278-7991)"
              value={customCustomerIdInput || connection?.customerId || ""}
              onChange={(e) => setCustomCustomerIdInput(e.target.value)}
              className="input input-bordered input-sm w-full font-mono text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="btn btn-primary btn-xs"
              disabled={saveDevTokenMutation.isPending || !developerTokenInput.trim()}
            >
              {saveDevTokenMutation.isPending
                ? "جاري الحفظ..."
                : "حفظ Developer Token وتفعيل الصلاحيات الكاملة"}
            </button>
            {showDevTokenEditor && (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setShowDevTokenEditor(false)}
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between text-xs text-base-content/65">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            متصل بصلاحيات Google Ads API v17 &amp; Keyword Planner الكاملة
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-amber-600 dark:text-amber-400"
            onClick={() => setShowDevTokenEditor(true)}
          >
            تحديث Developer Token
          </button>
        </div>
      )}
    </div>
  );

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
              : hasGrant
                ? "setup_required"
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
                    Selected Property
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {connection?.customerDescriptiveName ?? "Google Ads Customer"}
                  </p>
                </div>
                <span className="rounded-md border border-base-300 bg-base-100 px-2 py-1 font-mono text-[11px] text-base-content/60">
                  ID {connection?.customerId ?? "—"}
                </span>
              </div>

              <dl className="mt-3 grid gap-x-6 gap-y-2 border-t border-base-300/70 pt-3 text-xs sm:grid-cols-3">
                <div className="min-w-0">
                  <dt className="text-base-content/45">Time zone</dt>
                  <dd className="mt-0.5 font-medium text-base-content/75">
                    {connection?.timeZone ?? "Africa/Cairo"}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-base-content/45">Currency</dt>
                  <dd className="mt-0.5 font-medium text-base-content/75">
                    {connection?.currencyCode ?? "EGP"}
                  </dd>
                </div>
                {connection?.connectedByEmail ? (
                  <div className="min-w-0">
                    <dt className="text-base-content/45">Connected account</dt>
                    <dd className="mt-0.5 truncate font-medium text-base-content/75">
                      {connection.connectedByEmail}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {renderDeveloperTokenBox()}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-outline btn-sm border-base-300 font-medium"
                onClick={() => setPicking(true)}
              >
                Change property
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm border-base-300 font-medium inline-flex items-center gap-1.5"
                onClick={handleConnect}
              >
                <GoogleGlyph className="size-3.5" />
                Re-authenticate Google OAuth
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
        ) : picking || (hasGrant && !connected) ? (
          <div className="space-y-3">
            <p className="text-xs text-base-content/70">
              Select the Google Ads account to bind to this project:
            </p>
            {customersQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-base-content/50">
                <span className="loading loading-spinner loading-sm" />
                Loading Google Ads accounts…
              </div>
            ) : (
              <div className="space-y-3">
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
                          customerDescriptiveName: c.descriptiveName,
                          developerToken: developerTokenInput.trim() || undefined,
                        });
                      }}
                      disabled={setCustomerMutation.isPending}
                    >
                      <div>
                        <p className="text-sm font-medium">{c.descriptiveName}</p>
                        <p className="text-xs text-base-content/50 font-mono">
                          ID: {c.customerId} {grant.email ? `• ${grant.email}` : ""}
                        </p>
                      </div>
                      <span className="btn btn-primary btn-xs">Save property</span>
                    </button>
                  )),
                )}

                <form
                  className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-300"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const cleaned = customCustomerIdInput.trim();
                    if (!cleaned) return;
                    const firstGrant = accounts[0];
                    setCustomerMutation.mutate({
                      accountId: firstGrant?.accountId || "google-ads",
                      customerId: cleaned,
                      customerDescriptiveName: `Google Ads (${cleaned})`,
                      developerToken: developerTokenInput.trim() || undefined,
                    });
                  }}
                >
                  <input
                    type="text"
                    placeholder="Or enter Customer ID (e.g. 731-278-7991)"
                    value={customCustomerIdInput}
                    onChange={(e) => setCustomCustomerIdInput(e.target.value)}
                    className="input input-bordered input-sm flex-1 font-mono text-xs"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={setCustomerMutation.isPending || !customCustomerIdInput.trim()}
                  >
                    Save ID
                  </button>
                </form>
              </div>
            )}

            {renderDeveloperTokenBox()}

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-outline btn-xs border-base-300"
                onClick={handleConnect}
              >
                <GoogleGlyph className="size-3.5" />
                Use another Google account
              </button>
              {connected ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-base-content/60"
                  onClick={() => setPicking(false)}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-base-content/70">
              Connect your Google Ads account to unlock <strong>Google Keyword Planner</strong> directly in OpenSEO. Access verified monthly search volumes, CPC ranges, and competition levels.
            </p>

            {renderDeveloperTokenBox()}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm inline-flex items-center gap-2"
                onClick={handleConnect}
              >
                <GoogleGlyph className="size-4" />
                Connect with Google
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
