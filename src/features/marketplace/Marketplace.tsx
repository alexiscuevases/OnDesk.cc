import React from "react";
import { useMarketplaceProducts } from "./hooks/useMarketplaceProducts";
import { useWorkspaceProducts, useInstallProduct } from "./hooks/useWorkspaceProducts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductConfigDialog } from "./components/ProductConfigDialog";

interface MarketplaceProps {
	slug: string;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ slug }) => {
	const { data: marketplaceProducts, isLoading: loadingMarketplace } = useMarketplaceProducts(slug);
	const { data: installedProducts, isLoading: loadingInstalled } = useWorkspaceProducts(slug);
	const installMutation = useInstallProduct(slug);
	const [installedProductId, setInstalledProductId] = React.useState<string | null>(null);

	if (loadingMarketplace || loadingInstalled) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-50 w-full" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold">Marketplace</h1>
				<p className="text-muted-foreground text-lg">
					Install tools and integrations to extend your AI Agent's capabilities.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{marketplaceProducts?.map((product) => {
					const installed = installedProducts?.find((ip) => ip.id === product.id);

					return (
						<Card key={product.id} className="flex flex-col">
							<CardHeader>
								<div className="flex justify-between items-start">
									<CardTitle>{product.name}</CardTitle>
									{installed && <Badge variant="secondary">Installed</Badge>}
								</div>
								<CardDescription>{product.description}</CardDescription>
							</CardHeader>
							<CardContent className="grow">
								<div className="text-sm space-y-2">
									<p className="font-semibold">Actions:</p>
									<div className="flex flex-wrap gap-1">
										{product.actions.slice(0, 3).map((a) => (
											<Badge key={a.name} variant="outline" className="text-[10px]">
												{a.name}
											</Badge>
										))}
										{product.actions.length > 3 && (
											<Badge variant="outline" className="text-[10px]">
												+{product.actions.length - 3} more
											</Badge>
										)}
									</div>
								</div>
							</CardContent>
							<CardFooter className="pt-0">
								{installed ? (
									<ProductConfigDialog
										slug={slug}
										product={installed}
										trigger={<Button className="w-full">Configure</Button>}
									/>
								) : (
									<Button
										className="w-full"
										onClick={async () => {
											await installMutation.mutateAsync(product.id);
											setInstalledProductId(product.id);
										}}
										disabled={installMutation.isPending}
									>
										{installMutation.isPending ? "Installing..." : "Install"}
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
		</div>
	);
};
