import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

export const getSeoApiKeyStatus = createServerFn({ method: "GET" })
  .middleware(requireAuthenticatedContext)
  .handler(() => {
    // DataForSEO decommissioned. Google Search Console, Google Analytics, and Google Ads operate directly ($0.00 zero cost).
    return { configured: true };
  });
