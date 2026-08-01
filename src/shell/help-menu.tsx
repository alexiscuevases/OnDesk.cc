import { useState, type ElementType } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	HelpCircle,
	Sparkles,
	ExternalLink,
	Ticket,
	Users,
	Mail,
	Bot,
	Bell,
	UserCircle,
	ShieldCheck,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ConsoleTag } from "@/shared/components/console";
import { useWorkspace } from "@/context/workspace-context";

/**
 * The help menu, and what it deliberately is not.
 *
 * It is not a link to a documentation site, because there isn't one — a "Read the
 * docs" button pointing at a 404 is worse than no button. What it is instead: the
 * questions people actually arrive with, each wired to the screen that answers it.
 *
 * Until now this was an icon with no handler on it in all four products. The other
 * three grew the same component at the same time; the topics differ, the shape does
 * not.
 *
 * The shortcut list holds only shortcuts that exist. ⌘B is real — it comes from
 * the sidebar primitive in components/ui/sidebar.tsx — and inventing a second one
 * to make the list look fuller would be a keystroke that does nothing.
 */

const ONDESK_URL = import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc";

/** The literal route strings TanStack can type-check. */
type HelpRoute =
	| "/w/$slug/tickets"
	| "/w/$slug/teams"
	| "/w/$slug/settings"
	| "/w/$slug/notifications"
	| "/w/$slug/profile";

interface HelpTopic {
	icon: ElementType;
	label: string;
	description: string;
	/** In-app destination, or an absolute URL on the control plane. */
	to?: HelpRoute;
	href?: string;
}

export function HelpMenu({ onAskNova }: { onAskNova: () => void }) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const { workspace } = useWorkspace();
	const slug = workspace.slug;

	const topics: HelpTopic[] = [
		{
			icon: Ticket,
			label: "How do I assign a ticket?",
			description: "Open it and set the assignee or the team on the right",
			to: "/w/$slug/tickets",
		},
		{
			icon: Mail,
			label: "How does email become a ticket?",
			description: "Connect a Gmail or Microsoft mailbox in Settings → Integrations",
			to: "/w/$slug/settings",
		},
		{
			icon: Users,
			label: "What are teams for?",
			description: "A ticket assigned to a team notifies everyone in it",
			to: "/w/$slug/teams",
		},
		{
			icon: Bot,
			label: "What does an AI agent do?",
			description: "It answers inbound tickets and escalates the ones it can't",
			to: "/w/$slug/settings",
		},
		{
			icon: Bell,
			label: "Why am I getting these emails?",
			description: "Every notification maps to one switch in your profile",
			to: "/w/$slug/profile",
		},
		{
			icon: ShieldCheck,
			label: "Where do I change my password or 2FA?",
			description: "On OnDesk — Pulse never sees a password",
			href: `${ONDESK_URL}/account/security`,
		},
		{
			icon: UserCircle,
			label: "Where do I change my name or avatar?",
			description: "On OnDesk — they're shared across every product",
			href: `${ONDESK_URL}/account`,
		},
		{
			icon: Users,
			label: "Who can invite someone?",
			description: "An owner or admin, on OnDesk",
			href: `${ONDESK_URL}/workspaces/${slug}/members`,
		},
	];

	function follow(topic: HelpTopic) {
		setOpen(false);
		if (topic.href) {
			window.open(topic.href, "_blank", "noopener,noreferrer");
			return;
		}
		if (topic.to) navigate({ to: topic.to, params: { slug } });
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="size-8">
					<HelpCircle className="size-4" />
					<span className="sr-only">Help</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-88 p-0" align="end" sideOffset={8}>
				<div className="border-b border-border px-4 py-3">
					<ConsoleTag className="text-primary dark:text-accent">Help</ConsoleTag>
					<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
						The questions this product gets asked most, and where each one is answered.
					</p>
				</div>

				<div className="max-h-80 divide-y divide-border overflow-y-auto">
					{topics.map((topic) => (
						<button
							key={topic.label}
							onClick={() => follow(topic)}
							className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary/60">
							<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center border border-border bg-secondary/60">
								<topic.icon className="size-3.5 text-muted-foreground" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs font-medium">{topic.label}</p>
								<p className="text-[10px] leading-relaxed text-muted-foreground">{topic.description}</p>
							</div>
							{topic.href && <ExternalLink className="mt-1 size-3 shrink-0 text-muted-foreground/50" />}
						</button>
					))}
				</div>

				<div className="border-t border-border px-4 py-3">
					<ConsoleTag>Shortcuts</ConsoleTag>
					<div className="mt-2 flex items-center justify-between">
						<span className="text-[11px] text-muted-foreground">Show or hide the sidebar</span>
						<kbd className="border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px]">
							⌘ / Ctrl + B
						</kbd>
					</div>
				</div>

				<div className="border-t border-border p-2">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-full justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary hover:bg-primary/5 hover:text-primary/80 dark:text-accent dark:hover:bg-accent/10"
						onClick={() => {
							setOpen(false);
							onAskNova();
						}}>
						<Sparkles className="size-3.5" />
						Ask Nova instead
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
