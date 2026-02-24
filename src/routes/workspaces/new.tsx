import { createFileRoute } from "@tanstack/react-router";
import { CreateWorkspaceView } from "@/features/workspaces/components/create-workspace-view";

export const Route = createFileRoute("/workspaces/new")({
	component: CreateWorkspaceView,
});
