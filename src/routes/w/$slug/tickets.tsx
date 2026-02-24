import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$slug/tickets")({
	component: () => <Outlet />,
});
