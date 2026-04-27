import { createFileRoute } from "@tanstack/react-router";
import { Marketplace } from "@/features/marketplace/Marketplace";
import { useWorkspace } from "@/context/workspace-context";

export const Route = createFileRoute("/w/$slug/marketplace")({
	component: MarketplaceRoute,
});

function MarketplaceRoute() {
	const { workspace } = useWorkspace();
	return <Marketplace slug={workspace.slug} />;
}
