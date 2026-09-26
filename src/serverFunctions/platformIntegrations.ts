import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  PlatformIntegrationsService,
  type ManagedPlatformType,
  type PlatformType,
} from "@/server/features/integrations/PlatformIntegrationsService";
import { requireProjectContext } from "@/serverFunctions/middleware";

const projectScopedSchema = z.object({ projectId: z.string().min(1) });

const managedPlatformEnum = z.enum([
  "supabase",
  "github",
  "vercel",
  "google_ai_studio",
  "cloudflare",
]);

const platformEnum = z.enum([
  "gsc",
  "ga4",
  "google_ads",
  "supabase",
  "github",
  "vercel",
  "google_ai_studio",
  "cloudflare",
]);

const platformQuerySchema = projectScopedSchema.extend({
  platform: managedPlatformEnum,
});

const verifyCredentialsSchema = projectScopedSchema.extend({
  platform: managedPlatformEnum,
  credentials: z.object({
    token: z.string().optional(),
    apiKey: z.string().optional(),
    projectUrl: z.string().optional(),
    serviceRoleKey: z.string().optional(),
  }),
});

const setResourceSchema = projectScopedSchema.extend({
  platform: managedPlatformEnum,
  resourceId: z.string().min(1),
  resourceName: z.string().min(1),
  resourceMeta: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).optional(),
});

const disconnectSchema = projectScopedSchema.extend({
  platform: platformEnum,
});

export const getPlatformIntegrations = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(projectScopedSchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.getAllForProject(data.projectId);
  });

export const getPlatformConnection = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(platformQuerySchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.getConnectionState(
      data.projectId,
      data.platform as ManagedPlatformType,
    );
  });

export const verifyPlatformCredentials = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(verifyCredentialsSchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.verifyAndSaveGrant(
      data.projectId,
      data.platform as ManagedPlatformType,
      data.credentials,
    );
  });

export const listPlatformResources = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(platformQuerySchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.listResources(
      data.projectId,
      data.platform as ManagedPlatformType,
    );
  });

export const setPlatformResource = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(setResourceSchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.selectResource(
      data.projectId,
      data.platform as ManagedPlatformType,
      {
        resourceId: data.resourceId,
        resourceName: data.resourceName,
        resourceMeta: data.resourceMeta,
      },
    );
  });

export const getPlatformDashboardReport = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(platformQuerySchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.getLiveDashboardReport(
      data.projectId,
      data.platform as ManagedPlatformType,
    );
  });

export const disconnectPlatformIntegration = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(disconnectSchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.disconnectIntegration(
      data.projectId,
      data.platform as PlatformType,
    );
  });
