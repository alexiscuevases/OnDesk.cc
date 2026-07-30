import { useQuery } from "@tanstack/react-query";
import { CreditCard, ExternalLink, Users, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWorkspace } from "@/context/workspace-context";

interface Entitlement {
	plan: string;
	status: string;
	agent_count: number;
	current_period_end: number | null;
	updated_at: number;
}

interface BillingResponse {
	entitlement: Entitlement | null;
	manage_url: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
	active: { label: "Active", variant: "default" },
	trialing: { label: "Trial", variant: "secondary" },
	past_due: { label: "Payment overdue", variant: "destructive" },
	canceled: { label: "Cancelled", variant: "destructive" },
	incomplete: { label: "Incomplete", variant: "secondary" },
};

const PLAN_LABELS: Record<string, string> = {
	starter: "Pulse Starter",
	core: "Pulse Core",
	enterprise: "Pulse Enterprise",
};

/**
 * Read-only view of this workspace's Pulse subscription.
 *
 * Plans are bought and changed on OnDesk: billing spans products, so a single
 * customer and a single invoice live at the platform level. Everything here is
 * mirrored state, and every action links out.
 */
export function BillingSection() {
	const { workspace } = useWorkspace();

	const { data, isLoading } = useQuery({
		queryKey: ["billing", workspace?.id],
		enabled: Boolean(workspace?.id),
		queryFn: async (): Promise<BillingResponse> => {
			const res = await fetch(`/api/billing?workspace_id=${workspace!.id}`, { credentials: "include" });
			if (!res.ok) throw new Error("Failed to load billing");
			return res.json() as Promise<BillingResponse>;
		},
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="text-muted-foreground size-5 animate-spin" />
			</div>
		);
	}

	const entitlement = data?.entitlement ?? null;
	const manageUrl = data?.manage_url ?? "https://ondesk.cc/workspaces";
	const status = entitlement ? (STATUS_LABELS[entitlement.status] ?? STATUS_LABELS.incomplete) : null;

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-4">
						<div>
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="size-4" />
								Subscription
							</CardTitle>
							<CardDescription>
								Managed on your OnDesk account, alongside every other product.
							</CardDescription>
						</div>
						{status && <Badge variant={status.variant}>{status.label}</Badge>}
					</div>
				</CardHeader>

				<CardContent className="flex flex-col gap-4">
					{entitlement ? (
						<>
							<div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
								<div>
									<p className="text-muted-foreground text-xs">Plan</p>
									<p className="font-medium">{PLAN_LABELS[entitlement.plan] ?? entitlement.plan}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Seats</p>
									<p className="flex items-center gap-1.5 font-medium">
										<Users className="size-3.5" />
										{entitlement.agent_count}
									</p>
								</div>
								{entitlement.current_period_end && (
									<div>
										<p className="text-muted-foreground text-xs">Renews</p>
										<p className="flex items-center gap-1.5 font-medium">
											<CalendarDays className="size-3.5" />
											{new Date(entitlement.current_period_end * 1000).toLocaleDateString()}
										</p>
									</div>
								)}
							</div>

							{entitlement.status === "past_due" && (
								<div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-md p-3 text-sm">
									<AlertCircle className="mt-0.5 size-4 shrink-0" />
									<span>
										The last payment failed. Update your payment method on OnDesk to keep this
										workspace active.
									</span>
								</div>
							)}
						</>
					) : (
						<p className="text-muted-foreground text-sm">
							This workspace has no Pulse subscription on record.
						</p>
					)}

					<Separator />

					<div className="flex flex-wrap gap-2">
						<Button asChild>
							<a href={manageUrl} target="_blank" rel="noreferrer">
								Manage on OnDesk
								<ExternalLink className="size-3.5" />
							</a>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default BillingSection;
