import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceSelectorView } from "@/features/workspaces/components/workspace-selector-view";

export const Route = createFileRoute("/workspaces/")({
	component: WorkspaceSelectorView,
});
