import { createFileRoute } from "@tanstack/react-router";
import PricingPage from "@/features/frontend/pricing";

export const Route = createFileRoute("/pricing")({
	component: () => <PricingPage />,
});
