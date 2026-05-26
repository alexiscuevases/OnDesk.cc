import { createFileRoute } from "@tanstack/react-router";
import { SlaView } from "@/features/sla";

export const Route = createFileRoute("/w/$slug/sla")({
	component: SlaRoute,
});

function SlaRoute() {
	return <SlaView />;
}
