import { useMemo, useState } from "react";
import {
	Search,
	Package,
	CheckCircle2,
	Zap,
	Settings2,
	Plus,
	Pencil,
	Trash2,
	Route,
	Boxes,
	AlertTriangle,
	PowerOff,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDeleteModal } from "@/shared/components";
import { PageHeader, StatGrid, StatTile, EmptyState } from "@/shared/components/console";
import { useWorkspace } from "@/context/workspace-context";

import { useMarketplaceProducts, useWorkspaceProducts } from "../hooks/use-marketplace-queries";
import {
	useCreateConnector,
	useDeleteConnector,
	useInstallProduct,
	useUninstallProduct,
	useUpdateConnector,
} from "../hooks/use-marketplace-mutations";
import { ConnectorFormModal } from "../modals/connector-form-modal";
import { ConnectorEndpointsModal } from "../modals/connector-endpoints-modal";
import { ConfigureConnectorModal } from "../modals/configure-connector-modal";
import { ToolActivityPanel } from "./tool-activity-panel";
import type { ConnectorInput, PublicProduct, PublicWorkspaceProduct } from "../api/marketplace-api";

type Tab = "catalog" | "installed" | "activity";

type Modal =
	| { type: "closed" }
	| { type: "create" }
	| { type: "edit"; connector: PublicProduct }
	| { type: "endpoints"; connector: PublicProduct }
	| { type: "configure"; install: PublicWorkspaceProduct };

const CATEGORY_LABELS: Record<string, string> = {
	scheduling: "Scheduling",
	payments: "Payments",
	crm: "CRM",
	ecommerce: "E-commerce",
	communication: "Communication",
	internal: "Internal",
	other: "Other",
};

export function MarketplaceView() {
	const { workspace } = useWorkspace();
	const workspaceId = workspace.id;
	const slug = workspace.slug;

	const { data: products = [], isLoading: loadingProducts } = useMarketplaceProducts(workspaceId);
	const { data: installs = [], isLoading: loadingInstalls } = useWorkspaceProducts(slug);

	const createConnector = useCreateConnector(workspaceId, slug);
	const updateConnector = useUpdateConnector(workspaceId, slug);
	const deleteConnector = useDeleteConnector(workspaceId, slug);
	const installProduct = useInstallProduct(workspaceId, slug);
	const uninstallProduct = useUninstallProduct(workspaceId, slug);

	const [tab, setTab] = useState<Tab>("catalog");
	const [search, setSearch] = useState("");
	const [modal, setModal] = useState<Modal>({ type: "closed" });
	const [deletingConnector, setDeletingConnector] = useState<PublicProduct | null>(null);
	const [uninstalling, setUninstalling] = useState<PublicWorkspaceProduct | null>(null);

	const isLoading = loadingProducts || loadingInstalls;
	const installsByProduct = useMemo(
		() => new Map(installs.map((install) => [install.id, install])),
		[installs],
	);

	const totalEndpoints = products.reduce((sum, product) => sum + product.actions.length, 0);
	const customCount = products.filter((product) => product.is_custom).length;
	const needsAttention = installs.filter(
		(install) => install.config_fields.some((f) => f.required && f.secret && !install.credential_keys.includes(f.key)),
	).length;

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return products;
		return products.filter(
			(product) =>
				product.name.toLowerCase().includes(query) ||
				(product.description ?? "").toLowerCase().includes(query) ||
				product.actions.some((action) => action.name.includes(query)),
		);
	}, [products, search]);

	// Keep the open modal in sync with refetched data (new endpoints, saved creds).
	const liveModal = useMemo<Modal>(() => {
		if (modal.type === "edit" || modal.type === "endpoints") {
			const fresh = products.find((product) => product.id === modal.connector.id);
			return fresh ? { ...modal, connector: fresh } : { type: "closed" };
		}
		if (modal.type === "configure") {
			const fresh = installs.find((install) => install.workspace_product_id === modal.install.workspace_product_id);
			return fresh ? { type: "configure", install: fresh } : { type: "closed" };
		}
		return modal;
	}, [modal, products, installs]);

	const closeModal = () => setModal({ type: "closed" });

	const handleCreate = (input: ConnectorInput) => {
		createConnector.mutate(input, {
			onSuccess: (product) => {
				toast.success(`${product.name} created — now register its endpoints`);
				setModal({ type: "endpoints", connector: product });
			},
			onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create connector"),
		});
	};

	const handleUpdate = (productId: string, input: ConnectorInput) => {
		updateConnector.mutate(
			{ productId, input },
			{
				onSuccess: () => {
					toast.success("Connector updated");
					closeModal();
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update connector"),
			},
		);
	};

	const handleInstall = (product: PublicProduct) => {
		installProduct.mutate(product.id, {
			onSuccess: (install) => {
				toast.success(`${product.name} installed`);
				// Straight into configuration — an install without credentials is inert.
				if (install) setModal({ type: "configure", install });
			},
			onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to install"),
		});
	};

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				tag="05 — Marketplace"
				title="Marketplace"
				description="Connect any REST API and give your AI agents controlled access to it"
				actions={
					<Button onClick={() => setModal({ type: "create" })} className="text-xs">
						<Plus className="mr-1 size-3.5" />
						New connector
					</Button>
				}
			/>

			<StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
				<StatTile
					label="Available"
					icon={Package}
					value={isLoading ? <Skeleton className="h-8 w-10" /> : products.length}
					hint="Catalog + your connectors"
				/>
				<StatTile
					label="Installed"
					icon={CheckCircle2}
					tone="accent"
					value={isLoading ? <Skeleton className="h-8 w-10" /> : installs.length}
					hint="Active in this workspace"
				/>
				<StatTile
					label="Endpoints"
					icon={Zap}
					value={isLoading ? <Skeleton className="h-8 w-10" /> : totalEndpoints}
					hint="Actions agents can call"
				/>
				<StatTile
					label="Custom"
					icon={Boxes}
					tone={needsAttention > 0 ? "warning" : "default"}
					value={isLoading ? <Skeleton className="h-8 w-10" /> : customCount}
					hint={needsAttention > 0 ? `${needsAttention} need credentials` : "Built by your team"}
				/>
			</StatGrid>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
					<TabsList>
						<TabsTrigger value="catalog">Catalog</TabsTrigger>
						<TabsTrigger value="installed">
							Installed
							{installs.length > 0 && <span className="ml-1.5 font-mono text-[10px] text-accent">{installs.length}</span>}
						</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
					</TabsList>
				</Tabs>

				{tab === "catalog" && (
					<div className="relative w-full max-w-xs">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search connectors…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-9 pl-9 text-sm"
						/>
					</div>
				)}
			</div>

			{tab === "catalog" &&
				(isLoading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Skeleton key={i} className="h-52 w-full" />
						))}
					</div>
				) : filtered.length === 0 ? (
					<EmptyState
						icon={Search}
						title={search ? "No connectors found" : "No connectors yet"}
						description={
							search ? "Try a different search term" : "Create a connector to give your agents access to an API."
						}
						className="py-20"
						action={
							!search ? (
								<Button size="sm" onClick={() => setModal({ type: "create" })} className="text-xs">
									<Plus className="mr-1 size-3.5" />
									New connector
								</Button>
							) : undefined
						}
					/>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filtered.map((product) => (
							<ConnectorCard
								key={product.id}
								product={product}
								install={installsByProduct.get(product.id)}
								installing={installProduct.isPending}
								onInstall={() => handleInstall(product)}
								onConfigure={(install) => setModal({ type: "configure", install })}
								onEndpoints={() => setModal({ type: "endpoints", connector: product })}
								onEdit={() => setModal({ type: "edit", connector: product })}
								onDelete={() => setDeletingConnector(product)}
							/>
						))}
					</div>
				))}

			{tab === "installed" &&
				(isLoading ? (
					<Skeleton className="h-40 w-full" />
				) : installs.length === 0 ? (
					<EmptyState
						icon={Package}
						title="Nothing installed"
						description="Install a connector from the catalog, then assign it to an AI agent."
						className="py-20"
					/>
				) : (
					<ul className="divide-y border border-border">
						{installs.map((install) => {
							const missing = install.config_fields.filter(
								(field) => field.required && field.secret && !install.credential_keys.includes(field.key),
							);
							return (
								<li key={install.workspace_product_id} className="group relative flex items-start justify-between gap-3 p-4">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<p className="truncate text-sm font-medium">{install.name}</p>
											<Badge variant="outline" className="text-[9px] text-muted-foreground">
												{CATEGORY_LABELS[install.category] ?? install.category}
											</Badge>
											{install.status !== "enabled" && (
												<Badge variant="outline" className="gap-1 text-[9px] text-muted-foreground">
													<PowerOff className="size-2.5" />
													Disabled
												</Badge>
											)}
											{missing.length > 0 && (
												<Badge variant="outline" className="gap-1 border-warning/40 text-[9px] text-warning">
													<AlertTriangle className="size-2.5" />
													Needs credentials
												</Badge>
											)}
											{install.last_test_at !== null && install.last_test_ok === false && (
												<Badge variant="outline" className="border-destructive/40 text-[9px] text-destructive">
													Last call failed
												</Badge>
											)}
										</div>
										<p className="mt-1 font-mono text-[10px] text-muted-foreground">{install.base_url}</p>
										<p className="mt-1 font-mono text-[10px] text-muted-foreground tabular-nums">
											{install.actions.length} action{install.actions.length === 1 ? "" : "s"} · installed{" "}
											{new Date(install.installed_at * 1000).toLocaleDateString()}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-1">
										<Button
											size="sm"
											variant="outline"
											className="h-8 text-xs"
											onClick={() => setModal({ type: "configure", install })}
										>
											<Settings2 className="mr-1 size-3" />
											Configure
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="size-8 text-destructive"
											onClick={() => setUninstalling(install)}
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>
									<span className="scan-line" />
								</li>
							);
						})}
					</ul>
				))}

			{tab === "activity" && <ToolActivityPanel workspaceId={workspaceId} />}

			{/* ── Modals ───────────────────────────────────────────────── */}
			{liveModal.type === "create" && (
				<ConnectorFormModal
					open
					onOpenChange={(o) => !o && closeModal()}
					connector={null}
					onSubmit={handleCreate}
					isPending={createConnector.isPending}
				/>
			)}

			{liveModal.type === "edit" && (
				<ConnectorFormModal
					open
					onOpenChange={(o) => !o && closeModal()}
					connector={liveModal.connector}
					onSubmit={(input) => handleUpdate(liveModal.connector.id, input)}
					isPending={updateConnector.isPending}
				/>
			)}

			{liveModal.type === "endpoints" && (
				<ConnectorEndpointsModal
					open
					onOpenChange={(o) => !o && closeModal()}
					connector={liveModal.connector}
					workspaceId={workspaceId}
					slug={slug}
				/>
			)}

			{liveModal.type === "configure" && (
				<ConfigureConnectorModal
					open
					onOpenChange={(o) => !o && closeModal()}
					install={liveModal.install}
					workspaceId={workspaceId}
					slug={slug}
				/>
			)}

			<ConfirmDeleteModal
				open={!!deletingConnector}
				onOpenChange={(o) => !o && setDeletingConnector(null)}
				title="Delete connector"
				description={`"${deletingConnector?.name}" and all of its endpoints will be deleted, and it will be removed from every agent using it.`}
				confirmLabel="Delete"
				onConfirm={() => {
					if (!deletingConnector) return;
					deleteConnector.mutate(deletingConnector.id, {
						onSuccess: () => {
							toast.success("Connector deleted");
							setDeletingConnector(null);
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
					});
				}}
			/>

			<ConfirmDeleteModal
				open={!!uninstalling}
				onOpenChange={(o) => !o && setUninstalling(null)}
				title="Uninstall connector"
				description={`"${uninstalling?.name}" and its stored credentials will be removed from this workspace, and every agent will lose access to it.`}
				confirmLabel="Uninstall"
				onConfirm={() => {
					if (!uninstalling) return;
					uninstallProduct.mutate(uninstalling.workspace_product_id, {
						onSuccess: () => {
							toast.success("Connector uninstalled");
							setUninstalling(null);
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to uninstall"),
					});
				}}
			/>
		</div>
	);
}

function ConnectorCard({
	product,
	install,
	installing,
	onInstall,
	onConfigure,
	onEndpoints,
	onEdit,
	onDelete,
}: {
	product: PublicProduct;
	install?: PublicWorkspaceProduct;
	installing: boolean;
	onInstall: () => void;
	onConfigure: (install: PublicWorkspaceProduct) => void;
	onEndpoints: () => void;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const readOnlyCount = product.actions.filter((action) => action.is_read_only).length;
	const writeCount = product.actions.length - readOnlyCount;

	return (
		<Card className="group relative flex flex-col transition-colors hover:border-accent/60">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-9 shrink-0 items-center justify-center border border-border bg-primary/10">
							<Package className="size-4 text-primary" />
						</div>
						<div className="min-w-0">
							<CardTitle className="text-sm font-semibold leading-tight">{product.name}</CardTitle>
							<p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
								{CATEGORY_LABELS[product.category] ?? product.category} · {product.actions.length} actions
							</p>
						</div>
					</div>
					<div className="flex shrink-0 flex-col items-end gap-1">
						{install && (
							<Badge className="gap-1 border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
								<CheckCircle2 className="size-2.5" />
								Installed
							</Badge>
						)}
						{product.is_custom && (
							<Badge variant="outline" className="text-[9px] text-muted-foreground">
								Custom
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="grow pb-3">
				<p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
				<p className="mt-2 truncate font-mono text-[10px] text-muted-foreground">{product.base_url}</p>
				<div className="mt-3 flex flex-wrap gap-1">
					{product.actions.slice(0, 3).map((action) => (
						<Badge key={action.id} variant="outline" className="h-5 px-1.5 font-mono text-[10px] font-normal">
							{action.name}
						</Badge>
					))}
					{product.actions.length > 3 && (
						<Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground">
							+{product.actions.length - 3} more
						</Badge>
					)}
					{product.actions.length === 0 && (
						<Badge variant="outline" className="h-5 gap-1 border-warning/40 px-1.5 text-[10px] font-normal text-warning">
							<AlertTriangle className="size-2.5" />
							No endpoints yet
						</Badge>
					)}
				</div>
				{writeCount > 0 && (
					<p className="mt-2 font-mono text-[10px] text-muted-foreground">
						{readOnlyCount} read · {writeCount} write
					</p>
				)}
			</CardContent>

			<CardFooter className="flex-col gap-2 pt-0">
				<div className="flex w-full gap-2">
					{install ? (
						<Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => onConfigure(install)}>
							<Settings2 className="size-3" />
							Configure
						</Button>
					) : (
						<Button size="sm" className="flex-1 text-xs" onClick={onInstall} disabled={installing}>
							{installing ? "Installing…" : "Install"}
						</Button>
					)}
					{product.is_custom && (
						<Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onEndpoints}>
							<Route className="size-3" />
							{product.actions.length}
						</Button>
					)}
				</div>
				{product.is_custom && (
					<div className="flex w-full gap-2">
						<Button size="sm" variant="ghost" className="flex-1 gap-1.5 text-[10px]" onClick={onEdit}>
							<Pencil className="size-3" />
							Edit
						</Button>
						<Button size="sm" variant="ghost" className="flex-1 gap-1.5 text-[10px] text-destructive" onClick={onDelete}>
							<Trash2 className="size-3" />
							Delete
						</Button>
					</div>
				)}
			</CardFooter>
			<span className="scan-line" />
		</Card>
	);
}
