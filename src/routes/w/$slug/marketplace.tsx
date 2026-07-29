import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceView } from "@/features/marketplace";

export const Route = createFileRoute("/w/$slug/marketplace")({
	component: MarketplaceRoute,
});

function MarketplaceRoute() {
	return <MarketplaceView />;
}
