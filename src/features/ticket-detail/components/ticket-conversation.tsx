import { MessageSquare, Eye } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TicketMessage } from "@/lib/data";

interface TicketConversationProps {
	messages: TicketMessage[];
}

export function TicketConversation({ messages }: TicketConversationProps) {
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
						{messages.map((msg) => (
							<div key={msg.id} className={`flex gap-3 ${msg.isInternal ? "opacity-80" : ""}`}>
								<Avatar className="size-8 rounded-lg shrink-0 mt-0.5">
									<AvatarFallback
										className={`rounded-lg text-[10px] font-bold ${
											msg.authorRole === "agent"
												? "bg-primary text-primary-foreground"
												: msg.authorRole === "customer"
													? "bg-secondary text-secondary-foreground"
													: "bg-muted text-muted-foreground"
										}`}>
										{msg.authorInitials}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<div
										className={`rounded-xl p-3.5 ${
											msg.isInternal
												? "bg-warning/10 border border-warning/20 border-dashed"
												: msg.authorRole === "agent"
													? "bg-primary/5 border border-primary/10"
													: "bg-secondary/60 border border-border"
										}`}>
										<div className="flex items-center gap-2 mb-1.5">
											<span className="text-xs font-semibold">{msg.author}</span>
											{msg.isInternal && (
												<Badge
													variant="outline"
													className="text-[9px] px-1.5 py-0 rounded-full border-warning text-warning">
													<Eye className="size-2.5 mr-0.5" />
													Internal
												</Badge>
											)}
											<span className="text-[10px] text-muted-foreground ml-auto">
												{format(new Date(msg.timestamp), "MMM d, h:mm a")}
											</span>
										</div>
										<p className="text-sm leading-relaxed text-foreground/90">{msg.content}</p>
									</div>
								</div>
							</div>
						))}
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
