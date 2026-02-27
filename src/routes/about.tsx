import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "@/features/frontend/about";

export const Route = createFileRoute("/about")({
	component: () => <AboutPage />,
});
