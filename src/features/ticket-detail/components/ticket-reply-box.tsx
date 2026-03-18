import { useState, useRef, useEffect } from "react";
import { Send, Eye, MessageSquareQuote, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TiptapEditor, type TiptapEditorHandle } from "@/components/ui/tiptap-editor";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSendMessageMutation } from "@/features/tickets/hooks/use-ticket-mutations";
import { useSignatures } from "@/features/signatures/hooks/use-signature-queries";
import { useCannedReplies } from "@/features/canned-replies/hooks/use-canned-reply-queries";
import { useWorkspace } from "@/context/workspace-context";
import { TicketAIAssistant } from "./ticket-ai-assistant";
import type { Ticket, EmailRecipient } from "@/features/tickets/api/tickets-api";

interface TicketReplyBoxProps {
	ticketId: string;
	ticket?: Ticket | null;
	members?: { id: string; name: string }[];
	ccList?: EmailRecipient[];
	bccList?: EmailRecipient[];
	onBccClear?: () => void;
}

export function TicketReplyBox({ ticketId, ticket, members = [], ccList = [], bccList = [], onBccClear }: TicketReplyBoxProps) {
	const [reply, setReply] = useState("");
	const [isInternal, setIsInternal] = useState(false);
	const [cannedOpen, setCannedOpen] = useState(false);
	const [cannedSearch, setCannedSearch] = useState("");
	const [shortcutSuggestions, setShortcutSuggestions] = useState<typeof cannedReplies>([]);
	const [activeShortcutWord, setActiveShortcutWord] = useState("");
	const [suggestionIndex, setSuggestionIndex] = useState(0);
	const editorRef = useRef<TiptapEditorHandle>(null);
	const editorWrapperRef = useRef<HTMLDivElement>(null);

	const { workspace } = useWorkspace();
	const sendMessage = useSendMessageMutation(ticketId);

	const { data: signatures = [] } = useSignatures();
	const { data: cannedReplies = [] } = useCannedReplies(workspace.id);
	const defaultSignature = signatures.find((s) => s.is_default) ?? null;

	const filteredCannedReplies = cannedReplies.filter(
		(cr) => cr.name.toLowerCase().includes(cannedSearch.toLowerCase()) || (cr.shortcut && cr.shortcut.toLowerCase().includes(cannedSearch.toLowerCase())),
	);

	// Detect /shortcut pattern in editor text and show inline suggestions
	useEffect(() => {
		if (!reply) {
			setShortcutSuggestions([]);
			return;
		}
		const plain = new DOMParser().parseFromString(reply, "text/html").body.textContent ?? "";
		// Find last word — check if it starts with /
		const match = plain.match(/\/([\w-]*)$/);
		if (!match) {
			setShortcutSuggestions([]);
			setActiveShortcutWord("");
			return;
		}
		const typed = match[1].toLowerCase(); // e.g. "test" from "/test"
		setActiveShortcutWord(typed);
		// Shortcuts are stored with leading slash e.g. "/test", so compare against "/" + typed
		const matches = cannedReplies.filter((cr) => cr.shortcut && cr.shortcut.toLowerCase().startsWith("/" + typed));
		setShortcutSuggestions(matches);
		setSuggestionIndex(0);
	}, [reply, cannedReplies]);

	function handleSelectCannedReply(content: string) {
		editorRef.current?.insertHTML(content);
		setCannedOpen(false);
		setCannedSearch("");
	}

	function handleSelectShortcut(cr: (typeof cannedReplies)[number]) {
		editorRef.current?.replaceLastWord(activeShortcutWord ? `${activeShortcutWord}` : "", cr.content);
		setShortcutSuggestions([]);
		setActiveShortcutWord("");
	}

	function handleEditorKeyDown(e: React.KeyboardEvent) {
		if (shortcutSuggestions.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSuggestionIndex((i) => Math.min(i + 1, shortcutSuggestions.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSuggestionIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter" || e.key === "Tab") {
			e.preventDefault();
			handleSelectShortcut(shortcutSuggestions[suggestionIndex]);
		} else if (e.key === "Escape") {
			setShortcutSuggestions([]);
		}
	}

	function normalizeSignatureHtml(html: string): string {
		const doc = new DOMParser().parseFromString(html, "text/html");
		doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6").forEach((el) => {
			(el as HTMLElement).style.margin = "0";
			(el as HTMLElement).style.padding = "0";
		});
		return doc.body.innerHTML;
	}

	async function handleSend() {
		const content = reply.trim();
		if (!content) return;
		const fullContent =
			!isInternal && defaultSignature
				? `${content}<div style="margin-top:12px;overflow:hidden;">${normalizeSignatureHtml(defaultSignature.content)}</div>`
				: content;
		await sendMessage.mutateAsync({
			content: fullContent,
			type: isInternal ? "note" : "message",
			cc: !isInternal && ccList.length > 0 ? ccList : undefined,
			bcc: !isInternal && bccList.length > 0 ? bccList : undefined,
		});
		setReply("");
		onBccClear?.();
	}

	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="pt-5">
				<div className="flex items-center gap-2 mb-3">
					<Button
						variant={!isInternal ? "default" : "outline"}
						size="sm"
						className="h-7 text-[11px] rounded-full"
						onClick={() => setIsInternal(false)}>
						Reply
					</Button>
					<Button
						variant={isInternal ? "default" : "outline"}
						size="sm"
						className={`h-7 text-[11px] rounded-full ${isInternal ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}`}
						onClick={() => setIsInternal(true)}>
						<Eye className="size-3 mr-1" />
						Internal Note
					</Button>
				</div>

				<div ref={editorWrapperRef} className="relative" onKeyDown={handleEditorKeyDown}>
					{shortcutSuggestions.length > 0 && (
						<div className="absolute bottom-full mb-1 left-0 z-50 w-72 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
							<div className="px-2 py-1 border-b bg-muted/40">
								<span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
									Canned Replies · <span className="font-mono">/{activeShortcutWord}</span>
								</span>
							</div>
							<div className="max-h-52 overflow-y-auto">
								{shortcutSuggestions.map((cr, i) => (
									<button
										key={cr.id}
										type="button"
										className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
											i === suggestionIndex ? "bg-accent" : "hover:bg-accent/50"
										}`}
										onClick={() => handleSelectShortcut(cr)}
										onMouseEnter={() => setSuggestionIndex(i)}>
										<span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded shrink-0">{cr.shortcut}</span>
										<span className="text-xs font-medium text-foreground truncate">{cr.name}</span>
									</button>
								))}
							</div>
						</div>
					)}
					<div className={`rounded-md border ${isInternal ? "border-warning/30" : "border-input"}`}>
						<TiptapEditor
							ref={editorRef}
							content={reply}
							onChange={setReply}
							placeholder={isInternal ? "Write an internal note..." : "Type your reply..."}
							className={`border-0 rounded-b-none ${isInternal ? "bg-warning/5" : ""}`}
							minHeight="min-h-[96px]"
							members={members}
						/>
						{!isInternal && defaultSignature && (
							<>
								<div className="border-t border-dashed border-muted-foreground/20" />
								<div className="px-3 py-2 bg-muted/30 rounded-b-md text-xs text-muted-foreground">
									<p className="font-medium text-[10px] uppercase tracking-wide mb-1 text-muted-foreground/50">
										Signature · {defaultSignature.name}
									</p>
									<div
										className="prose prose-sm max-w-none text-muted-foreground **:text-muted-foreground overflow-hidden"
										dangerouslySetInnerHTML={{ __html: defaultSignature.content }}
									/>
								</div>
							</>
						)}
					</div>
				</div>
				<div className="flex items-center justify-between mt-3">
					<div className="flex items-center gap-1">
						<TicketAIAssistant 
							ticketId={ticketId} 
							onInsertContent={(content) => editorRef.current?.insertHTML(content)} 
						/>
						<Popover open={cannedOpen} onOpenChange={setCannedOpen}>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground rounded-lg">
									<MessageSquareQuote className="size-3.5" />
									Canned Replies
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-72 p-0" align="start">
								<div className="flex items-center border-b px-3 py-2 gap-2">
									<Search className="size-3.5 text-muted-foreground shrink-0" />
									<input
										type="text"
										placeholder="Search canned replies..."
										value={cannedSearch}
										onChange={(e) => setCannedSearch(e.target.value)}
										className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
									/>
								</div>
								<div className="max-h-60 overflow-y-auto">
									{filteredCannedReplies.length === 0 ? (
										<p className="px-3 py-4 text-xs text-center text-muted-foreground">No canned replies found.</p>
									) : (
										filteredCannedReplies.map((cr) => (
											<button
												key={cr.id}
												type="button"
												className="w-full flex flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-accent transition-colors"
												onClick={() => handleSelectCannedReply(cr.content)}>
												<span className="text-xs font-medium text-foreground">{cr.name}</span>
												{cr.shortcut && (
													<span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded">
														{cr.shortcut}
													</span>
												)}
											</button>
										))
									)}
								</div>
							</PopoverContent>
						</Popover>
					</div>
					<Button
						size="sm"
						className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
						onClick={handleSend}
						disabled={sendMessage.isPending || !reply.trim()}>
						<Send className="size-3.5" />
						{isInternal ? "Add Note" : "Send Reply"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
