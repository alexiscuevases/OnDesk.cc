import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, BarChart2, Users, Ticket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/workspace-context";
import { streamWorkspaceAI, type AIChatMessage } from "@/features/tickets/api/ticket-ai-api";

const INITIAL_MESSAGE: AIChatMessage = {
	role: "assistant",
	content: "Hello! I'm your workspace AI assistant 🚀\nI have access to your tickets, contacts, agents, and teams. Ask me anything about your workspace!",
};

const QUICK_ACTIONS = [
	{ label: "Ticket summary", icon: BarChart2, prompt: "Give me a summary of the current ticket status across the workspace" },
	{ label: "Open tickets", icon: Ticket, prompt: "List the open tickets in the workspace" },
	{ label: "Team overview", icon: Users, prompt: "Give me an overview of the agents and teams in this workspace" },
	{ label: "Find contacts", icon: Search, prompt: "List the most recent contacts added to the workspace" },
];

export function GlobalAIAssistant() {
	const [isOpen, setIsOpen] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [messages, setMessages] = useState<AIChatMessage[]>([INITIAL_MESSAGE]);
	const [isLoading, setIsLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const { workspace } = useWorkspace();

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isLoading]);

	const handleSend = async (customPrompt?: string) => {
		const textToSend = customPrompt || prompt;
		if (!textToSend.trim() || isLoading) return;

		const userMessage: AIChatMessage = { role: "user", content: textToSend.trim() };
		const nextMessages = [...messages, userMessage];

		setMessages(nextMessages);
		if (!customPrompt) setPrompt("");
		setIsLoading(true);

		setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

		try {
			const history = nextMessages.slice(1);
			let accumulated = "";

			await streamWorkspaceAI(workspace.slug, history, (token) => {
				accumulated += token;
				setMessages((prev) => {
					const updated = [...prev];
					updated[updated.length - 1] = { role: "assistant", content: accumulated };
					return updated;
				});
			});
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : "Unknown error";
			setMessages((prev) => {
				const updated = [...prev];
				updated[updated.length - 1] = {
					role: "assistant",
					content: `⚠️ Something went wrong: ${errorMsg}`,
				};
				return updated;
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/5 dark:text-accent dark:hover:text-accent dark:hover:bg-accent/10 transition-colors"
				>
					<Sparkles className="size-3.5 animate-pulse" />
					Ask AI
				</Button>
			</SheetTrigger>
			<SheetContent className="w-100 sm:w-160 border-l-border p-0 flex flex-col h-full bg-background">
				<SheetHeader className="px-6 py-4 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center bg-(--pulse-ink)">
							<Sparkles className="size-5 text-(--pulse-lime)" />
						</div>
						<div>
							<span className="console-label text-primary dark:text-accent">AI — Assistant</span>
							<SheetTitle className="text-base font-bold tracking-tight">Workspace AI</SheetTitle>
							<SheetDescription className="text-xs">
								Ask anything about {workspace.name}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
					{messages.map((msg, i) => (
						<div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
							{msg.role === "assistant" && (
								<Avatar className="h-8 w-8 shrink-0 border border-border">
									<AvatarFallback className="bg-(--pulse-ink) text-(--pulse-lime)">
										<Bot className="size-4" />
									</AvatarFallback>
								</Avatar>
							)}
							<div className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed ${
								msg.role === "user"
									? "bg-primary text-primary-foreground"
									: "bg-secondary/60 text-foreground border border-border"
							}`}
								dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }}
							/>
						</div>
					))}

					{isLoading && messages[messages.length - 1]?.content === "" && (
						<div className="flex gap-3 justify-start">
							<Avatar className="h-8 w-8 shrink-0 border border-border">
								<AvatarFallback className="bg-(--pulse-ink) text-(--pulse-lime)">
									<Bot className="size-4 animate-pulse" />
								</AvatarFallback>
							</Avatar>
							<div className="bg-secondary/60 border border-border px-4 py-3 flex items-center gap-1.5 h-10 w-fit">
								<div className="w-1.5 h-1.5 rounded-full bg-primary opacity-50 animate-bounce dark:bg-accent" />
								<div className="w-1.5 h-1.5 rounded-full bg-primary opacity-50 animate-bounce [animation-delay:-0.15s] dark:bg-accent" />
								<div className="w-1.5 h-1.5 rounded-full bg-primary opacity-50 animate-bounce [animation-delay:-0.3s] dark:bg-accent" />
							</div>
						</div>
					)}
				</div>

				<div className="p-4 bg-background border-t border-border">
					{messages.length === 1 && (
						<div className="grid grid-cols-2 gap-2 mb-3">
							{QUICK_ACTIONS.map(({ label, icon: Icon, prompt: p }) => (
								<Button
									key={label}
									variant="secondary"
									size="sm"
									className="h-auto py-2 px-3 font-mono text-[10px] uppercase tracking-wide gap-1.5 border border-border bg-secondary/60 hover:bg-secondary justify-start"
									onClick={() => handleSend(p)}
									disabled={isLoading}
								>
									<Icon className="size-3 shrink-0" />
									{label}
								</Button>
							))}
						</div>
					)}

					<div className="flex gap-2 relative bg-secondary/40 border border-input focus-within:ring-1 focus-within:ring-ring/40 focus-within:border-primary transition-colors p-1">
						<textarea
							placeholder="Ask about tickets, contacts, agents..."
							className="flex-1 text-[13px] bg-transparent pl-3 pr-10 py-2.5 outline-none resize-none min-h-[44px] max-h-[120px]"
							rows={1}
							value={prompt}
							onChange={(e) => {
								setPrompt(e.target.value);
								e.target.style.height = "auto";
								e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
						/>
						<Button
							size="icon"
							className="absolute right-2 bottom-2 shrink-0 h-7 w-7 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
							onClick={() => handleSend()}
							disabled={!prompt.trim() || isLoading}
						>
							<Send className="size-3.5" />
						</Button>
					</div>
					<div className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
						AI can sometimes be incorrect. Please review the responses.
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
