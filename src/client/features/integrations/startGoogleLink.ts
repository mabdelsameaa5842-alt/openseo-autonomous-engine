import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { GOOGLE_LINK_ERROR_PARAM } from "@/client/features/integrations/googleLinkError";
import { authClient } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { startSelfHostedGa4Link } from "@/serverFunctions/ga4";
import { startSelfHostedGoogleAdsLink } from "@/serverFunctions/googleAds";
import { startSelfHostedGscLink } from "@/serverFunctions/gsc";
import { startSelfHostedGeminiLink } from "@/serverFunctions/platformIntegrations";
import { GA4_OAUTH_PROVIDER_ID } from "@/shared/ga4";
import { GOOGLE_ADS_OAUTH_PROVIDER_ID } from "@/shared/google-ads";
import { GSC_OAUTH_PROVIDER_ID } from "@/shared/gsc";

const googleProviders = {
  gsc: {
    providerId: GSC_OAUTH_PROVIDER_ID,
    startSelfHosted: startSelfHostedGscLink,
  },
  ga4: {
    providerId: GA4_OAUTH_PROVIDER_ID,
    startSelfHosted: startSelfHostedGa4Link,
  },
  googleAds: {
    providerId: GOOGLE_ADS_OAUTH_PROVIDER_ID,
    startSelfHosted: startSelfHostedGoogleAdsLink,
  },
  gemini: {
    providerId: "google-ai-studio",
    startSelfHosted: startSelfHostedGeminiLink,
  },
} as const;

function withGoogleLinkErrorParam(
  callbackURL: string,
  provider: "gsc" | "ga4" | "googleAds" | "gemini",
): string {
  const url = new URL(callbackURL, window.location.origin);
  url.searchParams.set(GOOGLE_LINK_ERROR_PARAM, provider);
  return url.toString();
}

let linkRedirectPending = false;

export async function startGoogleLink(
  provider: "gsc" | "ga4" | "googleAds" | "gemini",
  callbackURL: string,
): Promise<void> {
  if (linkRedirectPending) return;
  linkRedirectPending = true;
  let redirecting = false;
  try {
    const config = googleProviders[provider];
    let url: string | undefined;
    if (!isHostedClientAuthMode() || provider === "gemini") {
      const res = await config.startSelfHosted({ data: { callbackURL } });
      url = res.url;
    } else {
      const res = await authClient.oauth2.link({
        providerId: config.providerId,
        callbackURL,
        errorCallbackURL: withGoogleLinkErrorParam(callbackURL, provider),
      });
      if (res.error) {
        toast.error(res.error.message ?? "Could not start Google sign-in");
        return;
      }
      url = res.data?.url;
    }
    if (!url) return;

    redirecting = true;
    window.location.href = url;
    setTimeout(() => {
      linkRedirectPending = false;
    }, 15_000);
  } catch (error) {
    toast.error(getStandardErrorMessage(error));
  } finally {
    if (!redirecting) linkRedirectPending = false;
  }
}
