import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { GoogleAdsService } from "@/server/features/google-ads/services/GoogleAdsService";
import { hasSelfHostedGoogleOAuthConfig } from "@/server/features/google/oauth-config";
import {
  createSelfHostedGoogleAuthorizationUrl,
  GOOGLE_ADS_INTEGRATION,
} from "@/server/features/google/selfHostedOAuth";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { getPublicOrigin } from "@/server/mcp/public-origin";
import {
  requireAuthenticatedContext,
  requireProjectContext,
} from "@/serverFunctions/middleware";

const projectScopedSchema = z.object({ projectId: z.string().min(1) });
const setCustomerSchema = projectScopedSchema.extend({
  accountId: z.string().min(1),
  customerId: z.string().min(1),
  customerDescriptiveName: z.string().optional(),
});
const startSelfHostedLinkSchema = z.object({
  callbackURL: z.string().min(1),
});
const searchKeywordPlannerSchema = projectScopedSchema.extend({
  keywords: z.array(z.string().min(1)).min(1).max(20),
  locationCode: z.number().optional(),
  languageCode: z.string().optional(),
});

export const getGoogleAdsConnection = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(projectScopedSchema)
  .handler(async ({ context }) => {
    const [connection, currentUserHasGrant, hosted, adsConfigured] =
      await Promise.all([
        GoogleAdsService.getConnection(context.projectId),
        GoogleAdsService.userHasGrant(context.userId),
        isHostedServerAuthMode(),
        hasSelfHostedGoogleOAuthConfig(),
      ]);
    return {
      connected: Boolean(connection),
      currentUserHasGrant,
      googleOAuthConfigured: hosted || adsConfigured,
      customerId: connection?.customerId ?? null,
      customerDescriptiveName: connection?.customerDescriptiveName ?? null,
      currencyCode: connection?.currencyCode ?? null,
      timeZone: connection?.timeZone ?? null,
      connectedByEmail: connection?.connectedAccountEmail ?? null,
      connectedAt: connection?.createdAt ?? null,
    };
  });

export const listGoogleAdsCustomers = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(projectScopedSchema)
  .handler(async ({ context }) => {
    const [connection, accounts] = await Promise.all([
      GoogleAdsService.getConnection(context.projectId),
      GoogleAdsService.listCustomersForUser(context.userId),
    ]);

    return {
      accounts: accounts.map((grant) => ({
        ...grant,
        customers: grant.customers.map((c) => ({
          ...c,
          isSelected:
            connection?.googleAdsAccountId === grant.accountId &&
            connection.customerId === c.customerId,
        })),
      })),
    };
  });

export const setGoogleAdsCustomer = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(setCustomerSchema)
  .handler(async ({ data, context }) => {
    const connection = await GoogleAdsService.setCustomer({
      projectId: context.projectId,
      organizationId: context.organizationId,
      accountId: data.accountId,
      customerId: data.customerId,
      customerDescriptiveName: data.customerDescriptiveName,
      connectedByUserId: context.userId,
    });

    return {
      connected: true as const,
      customerId: connection.customerId,
      customerDescriptiveName: connection.customerDescriptiveName,
    };
  });

export const disconnectGoogleAds = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(projectScopedSchema)
  .handler(async ({ context }) => {
    await GoogleAdsService.disconnect(context.projectId);
    return { connected: false as const };
  });

export const startSelfHostedGoogleAdsLink = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(startSelfHostedLinkSchema)
  .handler(async ({ data, context }) => ({
    url: await createSelfHostedGoogleAuthorizationUrl({
      integration: GOOGLE_ADS_INTEGRATION,
      user: {
        userId: context.userId,
        userEmail: context.userEmail,
      },
      callbackURL: data.callbackURL,
      publicOrigin: getPublicOrigin(getRequest()),
    }),
  }));

export const searchKeywordPlanner = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(searchKeywordPlannerSchema)
  .handler(async ({ data, context }) => {
    const metrics = await GoogleAdsService.searchKeywordPlanner({
      projectId: context.projectId,
      keywords: data.keywords,
      locationCode: data.locationCode,
      languageCode: data.languageCode,
    });
    return { metrics };
  });
