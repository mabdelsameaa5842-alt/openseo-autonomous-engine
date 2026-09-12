import { createFileRoute } from "@tanstack/react-router";
import { SkillsHubPage } from "@/client/features/ai-skills-hub/SkillsHubPage";

export const Route = createFileRoute(
  "/_project/p/$projectId/skills-hub",
)({
  component: SkillsHubRoute,
});

function SkillsHubRoute() {
  const { projectId } = Route.useParams();
  return <SkillsHubPage projectId={projectId} />;
}
