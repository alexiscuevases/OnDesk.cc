import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, CopyPlus, History, MessageSquareText, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TicketAIAssistantProps {
	ticketId: string;
	onInsertContent?: (content: string) => void;
}

export function TicketAIAssistant({ onInsertContent }: TicketAIAssistantProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
		{ 
            role: "assistant", 
            content: "Hello! I'm your AI super-assistant 🚀\nI can read this ticket's history and help you craft the perfect reply, summarize a long thread, or extract action items." 
        }
	]);
	const [isLoading, setIsLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isLoading]);

	const handleSend = async (customPrompt?: string) => {
		const textToSend = customPrompt || prompt;
        if (!textToSend.trim()) return;
		
		setMessages((prev) => [...prev, { role: "user", content: textToSend.trim() }]);
		if (!customPrompt) setPrompt("");
		setIsLoading(true);

		// Simulate AI delay
		setTimeout(() => {
			let aiResponse = "";
			const lowerMsg = textToSend.toLowerCase();
			if (lowerMsg.includes("summari") || lowerMsg.includes("resum")) {
				aiResponse = "<strong>Ticket Summary:</strong><br/>The customer is inquiring about the status of their refund for order #12345. It seems the returned package arrived at the warehouse 3 days ago, but no action has been taken yet.<br/><br/><strong>Suggested Action:</strong> Escalate to billing or manually trigger the refund.";
			} else if (lowerMsg.includes("draft") || lowerMsg.includes("respond") || lowerMsg.includes("respuest")) {
				aiResponse = "Hi there,<br><br>I've checked on your order #12345. Good news! We received your return on [Date]. I have just initiated your refund, which should appear in your account within 3-5 business days.<br><br>Let me know if you need anything else!<br><br>Best,";
			} else if (lowerMsg.includes("extract")) {
                aiResponse = "<strong>Action Items:</strong><ul><li>Verify return status for #12345 in the warehouse system.</li><li>Initiate Stripe refund of $49.99.</li><li>Reply to customer confirming the timeline.</li></ul>";
            } else {
				aiResponse = "I'm ready to help. You can tell me exactly what you want to write or ask me to summarize the thread!";
			}
			
			setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
			setIsLoading(false);
		}, 1500); // slightly longer for premium feel
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10 transition-all duration-200"
                >
					<Sparkles className="size-3.5 animate-pulse" />
					AI Assistant
				</Button>
			</SheetTrigger>
			<SheetContent className="w-100 sm:w-160 border-l-border/40 p-0 flex flex-col h-full bg-background/95 backdrop-blur-xl">
				<SheetHeader className="px-6 py-4 border-b border-border/50 bg-muted/20">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
							<Sparkles className="size-5 text-white" />
						</div>
						<div>
							<SheetTitle className="text-base font-semibold tracking-tight">AI Assistant</SheetTitle>
							<SheetDescription className="text-xs">
								Context-aware help for this specific ticket
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>
				
				<div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
					{messages.map((msg, i) => (
						<div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
							{msg.role === "assistant" && (
                                <Avatar className="h-8 w-8 shrink-0 rounded-lg border shadow-sm">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600">
                                        <Bot className="size-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            
                            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
								<div 
									className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
										msg.role === "user" 
											? "bg-indigo-600 text-white rounded-tr-sm" 
											: "bg-muted/50 text-foreground border border-border/50 rounded-tl-sm dark:bg-muted/20"
									}`}
									dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }}
								/>
								
                                {msg.role === "assistant" && i > 0 && onInsertContent && (
									<Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-[10px] gap-1.5 rounded-full px-3"
										onClick={() => {
											onInsertContent(msg.content);
											setIsOpen(false);
										}}
									>
                                        <CopyPlus className="size-3" />
										Insert into reply
									</Button>
								)}
							</div>
						</div>
					))}
					
                    {isLoading && (
						<div className="flex gap-3 justify-start">
                            <Avatar className="h-8 w-8 shrink-0 rounded-lg border shadow-sm">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600">
                                    <Bot className="size-4 animate-pulse" />
                                </AvatarFallback>
                            </Avatar>
							<div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 h-10 w-fit">
								<div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-50 animate-bounce" />
								<div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-50 animate-bounce [animation-delay:-0.15s]" />
								<div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-50 animate-bounce [animation-delay:-0.3s]" />
							</div>
						</div>
					)}
				</div>
				
				<div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
                    {/* Quick actions row */}
                    {messages.length === 1 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar hide-scrollbars whitespace-nowrap">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-7 text-[11px] rounded-full px-3 gap-1.5 bg-muted/60 hover:bg-muted"
                                onClick={() => handleSend("Summarize this thread")}
                            >
                                <History className="size-3" />
                                Summarize thread
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-7 text-[11px] rounded-full px-3 gap-1.5 bg-muted/60 hover:bg-muted"
                                onClick={() => handleSend("Draft a polite response")}
                            >
                                <MessageSquareText className="size-3" />
                                Draft reply
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-7 text-[11px] rounded-full px-3 gap-1.5 bg-muted/60 hover:bg-muted"
                                onClick={() => handleSend("Extract action items")}
                            >
                                <RefreshCcw className="size-3" />
                                Action items
                            </Button>
                        </div>
                    )}

					<div className="flex gap-2 relative bg-muted/30 rounded-xl border border-input focus-within:ring-1 focus-within:ring-indigo-500 transition-all p-1">
						<textarea
							placeholder="Tell AI what you want to write..."
							className="flex-1 text-[13px] bg-transparent rounded-lg pl-3 pr-10 py-2.5 outline-none resize-none min-h-[44px] max-h-[120px]"
                            rows={1}
							value={prompt}
							onChange={(e) => {
                                setPrompt(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
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
							className="absolute right-2 bottom-2 shrink-0 h-7 w-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-all" 
							onClick={() => handleSend()}
							disabled={!prompt.trim() || isLoading}
						>
							<Send className="size-3.5" />
						</Button>
					</div>
                    <div className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
                        AI can sometimes be incorrect. Please review the responses before sending.
                    </div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
