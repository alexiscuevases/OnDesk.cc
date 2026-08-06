import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/context/workspace-context";
import { platformApps, workspacesUrl } from "@/lib/ondesk";

/**
 * Shortcuts to the rest of the platform: the sibling products and the OnDesk
 * console. The session cookie lives on `.ondesk.cc`, so a hop is just a
 * navigation — no sign-in on the other side.
 *
 * Links carry the current workspace slug (every product serves its tenants
 * under /w/:slug), so switching apps stays inside the same workspace. Whether
 * that workspace holds a seat over there is the destination's question to
 * answer — this menu deliberately doesn't know, because the entitlement mirror
 * here only covers this product.
 */
const CURRENT_APP = "pulse";

export function AppSwitcher() {
	const { workspace } = useWorkspace();
	const apps = platformApps().filter((app) => app.id !== CURRENT_APP);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
					aria-label="Switch app">
					<LayoutGrid className="size-3.5" />
					<span className="hidden sm:inline">Apps</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-60" align="end" sideOffset={4}>
				<DropdownMenuLabel className="console-label">Switch to</DropdownMenuLabel>
				{apps.map((app) => (
					<DropdownMenuItem
						key={app.id}
						onClick={() => {
							window.location.href = `${app.url}/w/${workspace.slug}`;
						}}
						className="gap-2">
						<div className="flex size-6 items-center justify-center bg-primary/10 font-mono text-[10px] font-bold text-primary">
							{app.name.slice(0, 2).toUpperCase()}
						</div>
						<div className="grid flex-1 leading-tight">
							<span className="truncate text-sm">{app.name}</span>
							<span className="truncate text-[11px] text-muted-foreground">{app.tagline}</span>
						</div>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						window.location.href = workspacesUrl();
					}}
					className="gap-2 text-muted-foreground">
					<ArrowUpRight className="size-4" />
					OnDesk console
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
