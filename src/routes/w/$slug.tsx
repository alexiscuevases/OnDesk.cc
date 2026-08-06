import { createFileRoute, redirect } from "@tanstack/react-router";
import { apiGetWorkspace } from "@/features/workspaces/api/workspaces-api";
import { WorkspaceProvider } from "@/context/workspace-context";
import { WorkspaceShell } from "@/shell/workspace-shell";
import { WorkspaceNotFound } from "@/components/not-found";

export const Route = createFileRoute("/w/$slug")({
	// A bad address inside a workspace 404s in the shell, sidebar intact.
	notFoundComponent: WorkspaceNotFound,
	beforeLoad: async ({ params, location }) => {
		// The endpoint 402s when the workspace has no live Pulse entitlement, so a
		// lapsed subscription lands here as a null and bounces to the picker.
		// Choosing a plan happens on OnDesk now — Pulse has no checkout to offer.
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
