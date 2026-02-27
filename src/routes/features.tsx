import { createFileRoute } from "@tanstack/react-router";
import FeaturesPage from "@/features/frontend/features";

export const Route = createFileRoute("/features")({
	component: () => <FeaturesPage />,
});
