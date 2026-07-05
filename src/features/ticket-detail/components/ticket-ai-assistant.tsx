import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, CopyPlus, History, MessageSquareText, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { streamTicketAI, plainTextToHtml, type AIChatMessage } from "@/features/tickets/api/ticket-ai-api";

interface TicketAIAssistantProps {
	ticketId: string;
	onInsertContent?: (content: string) => void;
}

const INITIAL_MESSAGE = {
	role: "assistant" as const,
	content:
		"Hello! I'm your AI super-assistant 🚀\nI can read this ticket's history and help you craft the perfect reply, summarize a long thread, or extract action items.",
};

export function TicketAIAssistant({ ticketId, onInsertContent }: TicketAIAssistantProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [messages, setMessages] = useState<AIChatMessage[]>([INITIAL_MESSAGE]);
	const [isLoading, setIsLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isLoading]);

	const handleSend = async (customPrompt?: string) => {
		const textToSend = customPrompt || prompt;
		if (!textToSend.trim() || isLoading) return;

		// Build new chat history including the user message
		const userMessage = { role: "user" as const, content: textToSend.trim() };
		const nextMessages = [...messages, userMessage];

		setMessages(nextMessages);
		if (!customPrompt) setPrompt("");
		setIsLoading(true);

		// Placeholder for the streaming assistant reply
		const assistantPlaceholder = { role: "assistant" as const, content: "" };
		setMessages((prev) => [...prev, assistantPlaceholder]);

		try {
			// Send chat history (excluding the initial greeting) to the backend
			const history = nextMessages.slice(1); // Remove the system greeting from context
			let accumulated = "";

			await streamTicketAI(ticketId, history, (token) => {
				accumulated += token;
				// Update the last message (the streaming placeholder) in real time
				setMessages((prev) => {
					const updated = [...prev];
					updated[updated.length - 1] = {
						role: "assistant",
						content: accumulated,
					};
					return updated;
				});
			});
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : "Unknown error";
			// Replace the placeholder with an error message
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
					className="h-8 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 dark:text-accent dark:hover:text-accent dark:hover:bg-accent/10 transition-all duration-200">
					<Sparkles className="size-3.5 animate-pulse" />
					Ask AI
				</Button>
			</SheetTrigger>
			<SheetContent className="w-100 sm:w-160 border-l-border p-0 flex flex-col h-full bg-background">
				<SheetHeader className="px-6 py-4 border-b border-border bg-muted/20">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center bg-primary">
							<Sparkles className="size-5 text-primary-foreground" />
						</div>
						<div>
							<SheetTitle className="text-base font-black tracking-tight">AI Assistant</SheetTitle>
							<SheetDescription className="text-xs">Context-aware help for this specific ticket</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
					{messages.map((msg, i) => (
						<div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
							{msg.role === "assistant" && (
								<Avatar className="h-8 w-8 shrink-0 border">
									<AvatarFallback className="bg-primary/10 text-primary dark:text-accent">
										<Bot className="size-4" />
									</AvatarFallback>
								</Avatar>
							)}

							<div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
								<div
									className={`px-4 py-2.5 text-[13px] leading-relaxed ${
										msg.role === "user"
											? "bg-primary text-primary-foreground"
											: "bg-secondary/60 text-foreground border border-border"
									}`}
									dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }}
								/>

								{msg.role === "assistant" && i > 0 && msg.content && onInsertContent && (
									<Button
										variant="outline"
										size="sm"
										className="h-7 text-[10px] gap-1.5 px-3"
										onClick={() => {
											// Convert LLM plain text to structured HTML before inserting into TipTap
											onInsertContent(plainTextToHtml(msg.content));
											setIsOpen(false);
										}}>
										<CopyPlus className="size-3" />
										Insert into reply
									</Button>
								)}
							</div>
						</div>
					))}

					{/* Typing indicator shown while waiting for the first tokens */}
					{isLoading && messages[messages.length - 1]?.content === "" && (
						<div className="flex gap-3 justify-start">
							<Avatar className="h-8 w-8 shrink-0 border">
								<AvatarFallback className="bg-primary/10 text-primary dark:text-accent">
									<Bot className="size-4 animate-pulse" />
								</AvatarFallback>
							</Avatar>
							<div className="bg-secondary/60 border border-border px-4 py-3 flex items-center gap-1.5 h-10 w-fit">
								<div className="w-1.5 h-1.5 rounded-full bg-primary opacity-50 animate-bounce" />
								<div className="w-1.5 h-1.5 rounded-full bg-primary opacity-50 animate-bounce [animation-delay:-0.15s]" />
								<div className="w-1.5 h-1.5 rounded-full bg-primary opacity-50 animate-bounce [animation-delay:-0.3s]" />
							</div>
						</div>
					)}
				</div>

				<div className="p-4 bg-background border-t border-border">
					{/* Quick action chips shown only at the start of a conversation */}
					{messages.length === 1 && (
						<div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar hide-scrollbars whitespace-nowrap">
							<Button
								variant="secondary"
								size="sm"
								className="h-7 text-[11px] px-3 gap-1.5 bg-muted/60 hover:bg-muted"
								onClick={() => handleSend("Summarize this ticket thread")}
								disabled={isLoading}>
								<History className="size-3" />
								Summarize thread
							</Button>
							<Button
								variant="secondary"
								size="sm"
								className="h-7 text-[11px] px-3 gap-1.5 bg-muted/60 hover:bg-muted"
								onClick={() => handleSend("Draft a polite professional response to the customer")}
								disabled={isLoading}>
								<MessageSquareText className="size-3" />
								Draft reply
							</Button>
							<Button
								variant="secondary"
								size="sm"
								className="h-7 text-[11px] px-3 gap-1.5 bg-muted/60 hover:bg-muted"
								onClick={() => handleSend("Extract action items from this ticket")}
								disabled={isLoading}>
								<RefreshCcw className="size-3" />
								Action items
							</Button>
						</div>
					)}

					<div className="flex gap-2 relative bg-muted/30 border border-input focus-within:ring-1 focus-within:ring-ring transition-all p-1">
						<textarea
							placeholder="Tell AI what you want to write..."
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
							className="absolute right-2 bottom-2 shrink-0 h-7 w-7 transition-all"
							onClick={() => handleSend()}
							disabled={!prompt.trim() || isLoading}>
							<Send className="size-3.5" />
						</Button>
					</div>
					<div className="font-mono text-[10px] text-center text-muted-foreground mt-2">
						AI can sometimes be incorrect. Please review the responses before sending.
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
