import React from "react";
import { useMarketplaceProducts } from "./hooks/useMarketplaceProducts";
import { useWorkspaceProducts, useInstallProduct } from "./hooks/useWorkspaceProducts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-balance">Marketplace</h1>
				<p className="text-sm text-muted-foreground mt-1">Install integrations to extend your AI Agent's capabilities</p>
			</div>

			{/* KPI Summary */}
			<div className="grid gap-4 sm:grid-cols-3">
				<Card className="relative overflow-hidden border-0 shadow-sm">
					<div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardDescription className="text-xs font-semibold uppercase tracking-wider">Available</CardDescription>
						<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
							<Package className="size-4 text-primary" />
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-10" />
						) : (
							<div className="text-3xl font-bold tracking-tight">{marketplaceProducts?.length ?? 0}</div>
						)}
						<p className="text-xs text-muted-foreground mt-1">Integrations available</p>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-0 shadow-sm">
					<div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardDescription className="text-xs font-semibold uppercase tracking-wider">Installed</CardDescription>
						<div className="flex size-8 items-center justify-center rounded-lg bg-accent/10">
							<CheckCircle2 className="size-4 text-accent" />
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-10" />
						) : (
							<div className="text-3xl font-bold tracking-tight">{installedCount}</div>
						)}
						<p className="text-xs text-muted-foreground mt-1">Active integrations</p>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-0 shadow-sm">
					<div className="absolute top-0 left-0 right-0 h-0.5 bg-chart-2" />
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardDescription className="text-xs font-semibold uppercase tracking-wider">Actions</CardDescription>
						<div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
							<Zap className="size-4 text-secondary-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-10" />
						) : (
							<div className="text-3xl font-bold tracking-tight">{totalActions}</div>
						)}
						<p className="text-xs text-muted-foreground mt-1">Total available actions</p>
					</CardContent>
				</Card>
			</div>

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
						<Skeleton key={i} className="h-52 w-full rounded-xl" />
					))}
				</div>
			) : filteredProducts?.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<div className="flex size-12 items-center justify-center rounded-xl bg-secondary mb-3">
						<Search className="size-5 text-muted-foreground" />
					</div>
					<p className="text-sm font-medium">No integrations found</p>
					<p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredProducts?.map((product) => {
						const installed = installedProducts?.find((ip) => ip.id === product.id);

						return (
							<Card key={product.id} className="flex flex-col border-0 shadow-sm hover:shadow-md transition-all duration-300">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex items-center gap-3 min-w-0">
											<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
												<Package className="size-4 text-primary" />
											</div>
											<div className="min-w-0">
												<CardTitle className="text-sm font-semibold leading-tight">{product.name}</CardTitle>
												<p className="text-[10px] text-muted-foreground mt-0.5">{product.actions.length} actions</p>
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
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
};
