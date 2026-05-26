import { createFileRoute } from "@tanstack/react-router";
import { RolesView } from "@/features/roles";

export const Route = createFileRoute("/w/$slug/roles")({
	component: RolesRoute,
});

function RolesRoute() {
	return <RolesView />;
}
