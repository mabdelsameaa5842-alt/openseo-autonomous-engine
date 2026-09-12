import { createFileRoute } from "@tanstack/react-router";
import { VorderStudioPage } from "@/client/features/vorder-analytics/VorderStudioPage";

export const Route = createFileRoute(
  "/_project/p/$projectId/vorder-studio",
)({
  component: VorderStudioRoute,
});

function VorderStudioRoute() {
  const { projectId } = Route.useParams();
  return <VorderStudioPage projectId={projectId} />;
}
