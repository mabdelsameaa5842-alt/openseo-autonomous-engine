import React from "react";
import { useProjectMarket } from "@/client/features/projects/useProjectMarket";
import { GoogleAdsStyleHub } from "./GoogleAdsStyleHub";

export function SkillsHubPage({ projectId }: { projectId: string }) {
  const projectMarket = useProjectMarket(projectId);
  const projectDomain = (projectMarket as any)?.domain || "open-seo.org";

  return <GoogleAdsStyleHub projectId={projectId} projectDomain={projectDomain} />;
}
