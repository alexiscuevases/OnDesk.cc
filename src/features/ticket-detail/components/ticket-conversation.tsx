import { MessageSquare, Eye } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TicketMessage } from "@/features/tickets/api/tickets-api";
import type { WorkspaceMember } from "@/features/users/api/users-api";

interface TicketConversationProps {
	messages: TicketMessage[];
	members: WorkspaceMember[];
}

export function TicketConversation({ messages, members }: TicketConversationProps) {
	function getAuthorName(msg: TicketMessage) {
		if (msg.author_type === "agent") {
			return members.find((m) => m.id === msg.author_id)?.name ?? "Agent";
		}
		return "Contact";
	}

	function getInitials(name: string) {
		return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
	}

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader className="pb-3">
				<div className="flex items-center gap-2">
					<MessageSquare className="size-4 text-primary" />
					<CardTitle className="text-sm font-semibold">Conversation</CardTitle>
					<Badge variant="secondary" className="text-[10px] rounded-full px-2 ml-auto">
						{messages.length} message{messages.length !== 1 ? "s" : ""}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				{messages.length > 0 ? (
					<div className="space-y-4">
						{messages.map((msg) => {
							const isInternal = msg.type === "note";
							const isAgent = msg.author_type === "agent";
							const authorName = getAuthorName(msg);
							return (
								<div key={msg.id} className={`flex gap-3 ${isInternal ? "opacity-80" : ""}`}>
									<Avatar className="size-8 rounded-lg shrink-0 mt-0.5">
										<AvatarFallback
											className={`rounded-lg text-[10px] font-bold ${
												isAgent
													? "bg-primary text-primary-foreground"
													: "bg-secondary text-secondary-foreground"
											}`}>
											{getInitials(authorName)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div
											className={`rounded-xl p-3.5 ${
												isInternal
													? "bg-warning/10 border border-warning/20 border-dashed"
													: isAgent
														? "bg-primary/5 border border-primary/10"
														: "bg-secondary/60 border border-border"
											}`}>
											<div className="flex items-center gap-2 mb-1.5">
												<span className="text-xs font-semibold">{authorName}</span>
												{isInternal && (
													<Badge
														variant="outline"
														className="text-[9px] px-1.5 py-0 rounded-full border-warning text-warning">
														<Eye className="size-2.5 mr-0.5" />
														Internal
													</Badge>
												)}
												<span className="text-[10px] text-muted-foreground ml-auto">
													{format(new Date(msg.created_at * 1000), "MMM d, h:mm a")}
												</span>
											</div>
											<p className="text-sm leading-relaxed text-foreground/90">{msg.content}</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
						<MessageSquare className="size-8 mb-2 opacity-30" />
						<p className="text-sm">No messages yet</p>
						<p className="text-xs">Start the conversation below</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
