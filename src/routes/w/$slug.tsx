import { createFileRoute, redirect } from "@tanstack/react-router";
import { apiGetWorkspace } from "@/features/workspaces/api/workspaces-api";
import { apiGetSubscription } from "@/features/configurations/api/billing-api";
import { WorkspaceProvider } from "@/context/workspace-context";
import { WorkspaceShell } from "@/shell/workspace-shell";
import { SelectPlanView } from "@/features/workspaces/components/select-plan-view";

export const Route = createFileRoute("/w/$slug")({
	beforeLoad: async ({ params, location }) => {
		const workspace = await apiGetWorkspace(params.slug).catch(() => null);
		if (!workspace) {
			throw redirect({ to: "/workspaces" });
		}
		// Redirect /w/:slug to /w/:slug/overview
		if (location.pathname === `/w/${params.slug}` || location.pathname === `/w/${params.slug}/`) {
			throw redirect({ to: "/w/$slug/overview", params: { slug: params.slug } });
		}
		const subscription = await apiGetSubscription(workspace.id).catch(() => null);
		return { workspace, subscription };
	},
	component: WorkspaceLayout,
});

function WorkspaceLayout() {
	const { workspace, subscription } = Route.useRouteContext();

	const needsSubscription =
		!subscription ||
		subscription.status === "canceled" ||
		subscription.status === "incomplete";

	if (needsSubscription) {
		return <SelectPlanView workspaceId={workspace.id} workspaceName={workspace.name} />;
	}

	return (
		<WorkspaceProvider workspace={workspace}>
			<WorkspaceShell />
		</WorkspaceProvider>
	);
}
