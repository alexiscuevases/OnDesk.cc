import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/features/frontend/landing";

export const Route = createFileRoute("/")({
	component: () => <LandingPage />,
});
