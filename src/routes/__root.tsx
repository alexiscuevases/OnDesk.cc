import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/not-found";

export const Route = createRootRoute({
	component: () => <Outlet />,
	notFoundComponent: NotFoundPage,
});
