import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateProductConfig } from "../hooks/useWorkspaceProducts";
import type { PublicWorkspaceProduct } from "../../../../functions/_lib/types";
import { toast } from "sonner";

interface ProductConfigDialogProps {
	slug: string;
	product: PublicWorkspaceProduct;
	trigger: React.ReactNode;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const ProductConfigDialog: React.FC<ProductConfigDialogProps> = ({
	slug,
	product,
	trigger,
	defaultOpen = false,
	onOpenChange,
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		onOpenChange?.(open);
	};
	const [config, setConfig] = useState<Record<string, string>>(product.configuration || {});
	const updateConfigMutation = useUpdateProductConfig(slug);

	const handleSave = async () => {
		try {
			await updateConfigMutation.mutateAsync({
				workspaceProductId: product.workspace_product_id,
				configuration: config,
			});
			toast.success(`${product.name} configured successfully`);
			setIsOpen(false);
		} catch (error) {
			toast.error("Failed to update configuration");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Configure {product.name}</DialogTitle>
					<DialogDescription>
						Provide the required credentials and settings to enable this tool for your agents.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{product.auth_type === "api_key" && (
						<div className="space-y-2">
							<Label htmlFor="apiKey">API Key</Label>
							<Input
								id="apiKey"
								type="password"
								placeholder="Enter your API Key"
								value={config.apiKey || ""}
								onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
							/>
						</div>
					)}
					
					{/* Add more auth types or settings as needed */}
					
					<div className="pt-4">
						<h4 className="text-sm font-semibold mb-2">Available Actions</h4>
						<ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
							{product.actions.map((action) => (
								<li key={action.name}>
									<span className="font-medium text-foreground">{action.name}</span>: {action.description}
								</li>
							))}
						</ul>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={updateConfigMutation.isPending}>
						{updateConfigMutation.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
