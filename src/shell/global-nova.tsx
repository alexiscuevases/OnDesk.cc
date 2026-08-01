import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, BarChart2, Users, Ticket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/workspace-context";
import { streamWorkspaceAI, type AIChatMessage } from "@/features/tickets/api/ticket-ai-api";
import { NovaMarkup } from "@/features/nova/components/nova-markup";

/**
 * Nova — the assistant in the topbar. Renamed from "Ask AI": it is one assistant
 * with one name across the four products on this platform, and each of them gives
 * it a different set of eyes. Pulse's sees the helpdesk.
 *
 * The endpoint behind it is unchanged — `POST /api/workspaces/:slug/ai`, with
 * Vectorize-backed retrieval over tickets, contacts, companies and memories. Vault,
 * orbit and nexus reach theirs at `/api/nova?workspace_id=`, because those three
 * take a workspace id everywhere and pulse takes a slug; the two shapes are a
 * consequence of each product's own routing rather than a difference in the
 * assistant.
 */

const GREETING: AIChatMessage = {
	role: "assistant",
	content:
		"I'm Nova. I can see this workspace's tickets, contacts, companies, teams and agents.\n\nAsk me about ticket load, who is handling what, or where a contact's history is.",
};

const QUICK_ACTIONS = [
	{ label: "Ticket summary", icon: BarChart2, prompt: "Give me a summary of the current ticket status across the workspace" },
	{ label: "Open tickets", icon: Ticket, prompt: "List the open tickets in the workspace" },
	{ label: "Team overview", icon: Users, prompt: "Give me an overview of the agents and teams in this workspace" },
	{ label: "Find contacts", icon: Search, prompt: "List the most recent contacts added to the workspace" },
];

export function GlobalNova({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const [prompt, setPrompt] = useState("");
	const [messages, setMessages] = useState<AIChatMessage[]>([GREETING]);
	const [isLoading, setIsLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const { workspace } = useWorkspace();

	useEffect(() => {
		if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [messages, isLoading]);

	async function send(customPrompt?: string) {
		const text = (customPrompt ?? prompt).trim();
		if (!text || isLoading) return;

		const history = [...messages, { role: "user" as const, content: text }];
		setMessages([...history, { role: "assistant", content: "" }]);
		if (!customPrompt) setPrompt("");
		setIsLoading(true);

		try {
			let accumulated = "";
			// The greeting is ours, not part of the conversation — sending it back
			// would have Nova answering its own opening line.
			await streamWorkspaceAI(workspace.slug, history.slice(1), (token) => {
				accumulated += token;
				setMessages((prev) => {
					const next = [...prev];
					next[next.length - 1] = { role: "assistant", content: accumulated };
					return next;
				});
			});
		} catch (err) {
			const detail = err instanceof Error ? err.message : "Unknown error";
			setMessages((prev) => {
				const next = [...prev];
				next[next.length - 1] = { role: "assistant", content: `Something went wrong: ${detail}` };
				return next;
			});
		} finally {
			setIsLoading(false);
		}
	}

	const isEmpty = messages.length === 1;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex h-full w-100 flex-col gap-0 border-l-border bg-background p-0 sm:w-160">
				<SheetHeader className="border-b border-border px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center bg-(--pulse-ink)">
							<Sparkles className="size-5 text-(--pulse-lime)" />
						</div>
						<div>
							<span className="console-label text-primary dark:text-accent">Nova</span>
							<SheetTitle className="text-base font-bold tracking-tight">Ask about this workspace</SheetTitle>
							<SheetDescription className="text-xs">
								Tickets, contacts, teams and agents in {workspace.name}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<div ref={scrollRef} className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
					{messages.map((msg, i) => (
						<div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
							{msg.role === "assistant" && (
								<Avatar className="size-8 shrink-0 border border-border">
									<AvatarFallback className="bg-(--pulse-ink) text-(--pulse-lime)">
										<Sparkles className="size-4" />
									</AvatarFallback>
								</Avatar>
							)}
							<div
								className={`max-w-[85%] whitespace-pre-wrap px-4 py-2.5 text-[13px] leading-relaxed ${
									msg.role === "user"
										? "bg-primary text-primary-foreground"
										: "border border-border bg-secondary/60 text-foreground"
								}`}>
								<NovaMarkup text={msg.content} />
							</div>
						</div>
					))}

					{isLoading && messages[messages.length - 1]?.content === "" && (
						<div className="flex justify-start gap-3">
							<Avatar className="size-8 shrink-0 border border-border">
								<AvatarFallback className="bg-(--pulse-ink) text-(--pulse-lime)">
									<Sparkles className="size-4 animate-pulse" />
								</AvatarFallback>
							</Avatar>
							<div className="flex h-10 w-fit items-center gap-1.5 border border-border bg-secondary/60 px-4 py-3">
								<div className="size-1.5 animate-bounce rounded-full bg-primary opacity-50 dark:bg-accent" />
								<div className="size-1.5 animate-bounce rounded-full bg-primary opacity-50 [animation-delay:-0.15s] dark:bg-accent" />
								<div className="size-1.5 animate-bounce rounded-full bg-primary opacity-50 [animation-delay:-0.3s] dark:bg-accent" />
							</div>
						</div>
					)}
				</div>

				<div className="border-t border-border bg-background p-4">
					{isEmpty && (
						<div className="mb-3 grid grid-cols-2 gap-2">
							{QUICK_ACTIONS.map(({ label, icon: Icon, prompt: p }) => (
								<Button
									key={label}
									variant="secondary"
									size="sm"
									className="h-auto justify-start gap-1.5 border border-border bg-secondary/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wide hover:bg-secondary"
									onClick={() => send(p)}
									disabled={isLoading}>
									<Icon className="size-3 shrink-0" />
									{label}
								</Button>
							))}
						</div>
					)}

					<div className="relative flex gap-2 border border-input bg-secondary/40 p-1 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-ring/40">
						<textarea
							placeholder="Ask about tickets, contacts, agents…"
							className="max-h-30 min-h-11 flex-1 resize-none bg-transparent py-2.5 pl-3 pr-10 text-[13px] outline-none"
							rows={1}
							value={prompt}
							onChange={(e) => {
								setPrompt(e.target.value);
								e.target.style.height = "auto";
								e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									void send();
								}
							}}
						/>
						<Button
							size="icon"
							className="absolute bottom-2 right-2 size-7 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
							onClick={() => void send()}
							disabled={!prompt.trim() || isLoading}>
							<Send className="size-3.5" />
							<span className="sr-only">Send</span>
						</Button>
					</div>
					<p className="mt-2 text-center text-[10px] font-medium text-muted-foreground">
						Nova can be wrong. Please review what it tells you.
					</p>
				</div>
			</SheetContent>
		</Sheet>
	);
}
