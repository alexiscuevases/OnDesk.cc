import { createFileRoute, redirect } from "@tanstack/react-router";
import { apiGetWorkspace } from "@/features/workspaces/api/workspaces-api";
import { WorkspaceProvider } from "@/context/workspace-context";
import { WorkspaceShell } from "@/shell/workspace-shell";

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
		return { workspace };
	},
	component: WorkspaceLayout,
});

function WorkspaceLayout() {
	const { workspace } = Route.useRouteContext();
	return (
		<WorkspaceProvider workspace={workspace}>
			<WorkspaceShell />
		</WorkspaceProvider>
	);
}
