import React from "react";
import { useProjectMarket } from "@/client/features/projects/useProjectMarket";
import { VorderOrganicAdsHub } from "./GoogleAdsStyleHub";

export function SkillsHubPage({ projectId }: { projectId: string }) {
  const projectMarket = useProjectMarket(projectId);
  const projectDomain = (projectMarket as any)?.domain || "mohamed-abdelsamee-portfolio.vercel.app";

  return <VorderOrganicAdsHub projectId={projectId} projectDomain={projectDomain} />;
}
