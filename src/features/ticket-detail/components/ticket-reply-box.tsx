import { useState } from "react";
import { Send, Paperclip, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { useSendMessageMutation } from "@/features/tickets/hooks/use-ticket-mutations";
import { useSignatures } from "@/features/signatures/hooks/use-signature-queries";

interface TicketReplyBoxProps {
	ticketId: string;
	members?: { id: string; name: string }[];
}

export function TicketReplyBox({ ticketId, members = [] }: TicketReplyBoxProps) {
	const [reply, setReply] = useState("");
	const [isInternal, setIsInternal] = useState(false);

	const sendMessage = useSendMessageMutation(ticketId);
	const { data: signatures = [] } = useSignatures();
	const defaultSignature = signatures.find((s) => s.is_default) ?? null;

	async function handleSend() {
		const content = reply.trim();
		if (!content) return;
		await sendMessage.mutateAsync({ content, type: isInternal ? "note" : "message" });
		setReply("");
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
				<div className={`rounded-md border ${isInternal ? "border-warning/30" : "border-input"}`}>
					<TiptapEditor
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
									className="prose prose-sm max-w-none text-muted-foreground **:text-muted-foreground"
									dangerouslySetInnerHTML={{ __html: defaultSignature.content }}
								/>
							</div>
						</>
					)}
				</div>
				<div className="flex items-center justify-between mt-3">
					<Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground rounded-lg">
						<Paperclip className="size-3.5" />
						Attach
					</Button>
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
