import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  PlatformIntegrationsService,
  type PlatformType,
} from "@/server/features/integrations/PlatformIntegrationsService";
import { requireProjectContext } from "@/serverFunctions/middleware";

const projectScopedSchema = z.object({ projectId: z.string().min(1) });

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

const saveIntegrationSchema = projectScopedSchema.extend({
  platform: platformEnum,
  config: z.object({
    apiKey: z.string().optional(),
    token: z.string().optional(),
    projectUrl: z.string().optional(),
    serviceRoleKey: z.string().optional(),
    repo: z.string().optional(),
    accountEmail: z.string().optional(),
    accountName: z.string().optional(),
    model: z.string().optional(),
    accountId: z.string().optional(),
    zoneId: z.string().optional(),
    selectedResource: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

const platformActionSchema = projectScopedSchema.extend({
  platform: platformEnum,
});

const testIntegrationSchema = platformActionSchema.extend({
  tempConfig: z
    .object({
      apiKey: z.string().optional(),
      token: z.string().optional(),
      projectUrl: z.string().optional(),
      serviceRoleKey: z.string().optional(),
      repo: z.string().optional(),
      accountEmail: z.string().optional(),
      accountName: z.string().optional(),
      model: z.string().optional(),
      accountId: z.string().optional(),
      zoneId: z.string().optional(),
      selectedResource: z.string().optional(),
    })
    .optional(),
});

export const getPlatformIntegrations = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(projectScopedSchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.getAllForProject(data.projectId);
  });

export const savePlatformIntegration = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(saveIntegrationSchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.saveIntegration(
      data.projectId,
      data.platform as PlatformType,
      data.config,
    );
  });

export const disconnectPlatformIntegration = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(platformActionSchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.disconnectIntegration(
      data.projectId,
      data.platform as PlatformType,
    );
  });

export const testPlatformIntegration = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(testIntegrationSchema)
  .handler(async ({ data }) => {
    return await PlatformIntegrationsService.testConnection(
      data.projectId,
      data.platform as PlatformType,
      data.tempConfig,
    );
  });
