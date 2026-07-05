import React from "react";
import { useMarketplaceProducts } from "./hooks/useMarketplaceProducts";
import { useWorkspaceProducts, useInstallProduct } from "./hooks/useWorkspaceProducts";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PageHeader, StatGrid, StatTile, EmptyState } from "@/shared/components/console";
import { ProductConfigDialog } from "./components/ProductConfigDialog";
import { Search, Package, CheckCircle2, Zap, Settings2 } from "lucide-react";

interface MarketplaceProps {
	slug: string;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ slug }) => {
	const { data: marketplaceProducts, isLoading: loadingMarketplace } = useMarketplaceProducts(slug);
	const { data: installedProducts, isLoading: loadingInstalled } = useWorkspaceProducts(slug);
	const installMutation = useInstallProduct(slug);
	const [installedProductId, setInstalledProductId] = React.useState<string | null>(null);
	const [installingId, setInstallingId] = React.useState<string | null>(null);
	const [search, setSearch] = React.useState("");

	const isLoading = loadingMarketplace || loadingInstalled;
	const installedCount = installedProducts?.length ?? 0;
	const totalActions = marketplaceProducts?.reduce((acc, p) => acc + p.actions.length, 0) ?? 0;

	const filteredProducts = marketplaceProducts?.filter(
		(p) =>
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			(p.description ?? "").toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader tag="05 — Marketplace" title="Marketplace" description="Install integrations to extend your AI Agent's capabilities" />

			{/* KPI Summary */}
			<StatGrid className="sm:grid-cols-3">
				<StatTile
					label="Available"
					icon={Package}
					value={isLoading ? <Skeleton className="h-8 w-10" /> : (marketplaceProducts?.length ?? 0)}
					hint="Integrations available"
				/>
				<StatTile
					label="Installed"
					icon={CheckCircle2}
					tone="accent"
					value={isLoading ? <Skeleton className="h-8 w-10" /> : installedCount}
					hint="Active integrations"
				/>
				<StatTile
					label="Actions"
					icon={Zap}
					value={isLoading ? <Skeleton className="h-8 w-10" /> : totalActions}
					hint="Total available actions"
				/>
			</StatGrid>

			{/* Search */}
			<div className="flex items-center gap-3">
				<div className="relative max-w-xs w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search integrations..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 h-9 text-sm"
					/>
				</div>
				{installedCount > 0 && (
					<Badge variant="secondary" className="gap-1.5 shrink-0">
						<CheckCircle2 className="size-3 text-accent" />
						{installedCount} installed
					</Badge>
				)}
			</div>

			{/* Products Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Skeleton key={i} className="h-52 w-full" />
					))}
				</div>
			) : filteredProducts?.length === 0 ? (
				<EmptyState icon={Search} title="No integrations found" description="Try a different search term" className="py-20" />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredProducts?.map((product) => {
						const installed = installedProducts?.find((ip) => ip.id === product.id);

						return (
							<Card key={product.id} className="group relative flex flex-col transition-colors hover:border-accent/60">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex items-center gap-3 min-w-0">
											<div className="flex size-9 items-center justify-center border border-border bg-primary/10 shrink-0">
												<Package className="size-4 text-primary" />
											</div>
											<div className="min-w-0">
												<CardTitle className="text-sm font-semibold leading-tight">{product.name}</CardTitle>
												<p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground mt-0.5">{product.actions.length} actions</p>
											</div>
										</div>
										{installed && (
											<Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] px-2 py-0.5 shrink-0 gap-1">
												<CheckCircle2 className="size-2.5" />
												Active
											</Badge>
										)}
									</div>
								</CardHeader>

								<CardContent className="grow pb-3">
									<p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{product.description}</p>
									<div className="flex flex-wrap gap-1 mt-3">
										{product.actions.slice(0, 3).map((a) => (
											<Badge key={a.name} variant="outline" className="text-[10px] px-1.5 h-5 font-normal">
												{a.name}
											</Badge>
										))}
										{product.actions.length > 3 && (
											<Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal text-muted-foreground">
												+{product.actions.length - 3} more
											</Badge>
										)}
									</div>
								</CardContent>

								<CardFooter className="pt-0">
									{installed ? (
										<ProductConfigDialog
											slug={slug}
											product={installed}
											trigger={
												<Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
													<Settings2 className="size-3" />
													Configure
												</Button>
											}
										/>
									) : (
										<Button
											size="sm"
											className="w-full text-xs"
											onClick={async () => {
												setInstallingId(product.id);
												try {
													await installMutation.mutateAsync(product.id);
													setInstalledProductId(product.id);
												} finally {
													setInstallingId(null);
												}
											}}
											disabled={installingId === product.id}
										>
											{installingId === product.id ? "Installing..." : "Install"}
										</Button>
									)}
									{installedProductId === product.id && installed && (
										<ProductConfigDialog
											slug={slug}
											product={installed}
											trigger={null}
											defaultOpen={true}
											onOpenChange={(open: boolean) => {
												if (!open) setInstalledProductId(null);
											}}
										/>
									)}
								</CardFooter>
								<span className="scan-line" />
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
};
