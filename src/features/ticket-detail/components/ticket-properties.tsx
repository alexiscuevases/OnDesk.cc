import type { Dispatch, SetStateAction } from "react";
import { Tag, AlertCircle, User, Users, Mail, Calendar, Edit2, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { StatusBadge } from "@/shared/components/status-badge";
import type { Ticket } from "@/features/tickets/api/tickets-api";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import type { Team } from "@/features/teams/api/teams-api";
import type { Contact } from "@/features/contacts/api/contacts-api";
import type { Workspace } from "@/features/workspaces/api/workspaces-api";
import type { Company } from "@/features/companies/api/companies-api";
import type { EmailRecipient } from "@/features/tickets/api/tickets-api";
import { TicketAiStatePanel } from "./ticket-ai-state-panel";

interface TicketPropertiesProps {
	ticket: Ticket;
	assignee: WorkspaceMember | null;
	team: Team | null;
	contact: Contact | null;
	workspace: Workspace;
	companies: Company[];
	ccList: EmailRecipient[];
	setCcList: Dispatch<SetStateAction<EmailRecipient[]>>;
	bccList: EmailRecipient[];
	setBccList: Dispatch<SetStateAction<EmailRecipient[]>>;
	ccInput: string;
	setCcInput: Dispatch<SetStateAction<string>>;
	bccInput: string;
	setBccInput: Dispatch<SetStateAction<string>>;
	showBcc: boolean;
	setShowBcc: Dispatch<SetStateAction<boolean>>;
	onEditStatus: () => void;
	onEditPriority: () => void;
	onEditAssignee: () => void;
	onEditTeam: () => void;
	onEditRequester: () => void;
}

export function TicketProperties({
	ticket,
	assignee,
	team,
	contact,
	workspace,
	companies,
	ccList,
	setCcList,
	bccList,
	setBccList,
	ccInput,
	setCcInput,
	bccInput,
	setBccInput,
	showBcc,
	setShowBcc,
	onEditStatus,
	onEditPriority,
	onEditAssignee,
	onEditTeam,
	onEditRequester,
}: TicketPropertiesProps) {
	function getInitials(name: string) {
		return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
	}

	function addCcFromInput() {
		const email = ccInput.trim();
		if (!email) return;
		if (!ccList.find((r) => r.address === email)) {
			setCcList((prev) => [...prev, { name: email, address: email }]);
		}
		setCcInput("");
	}

	function addBccFromInput() {
		const email = bccInput.trim();
		if (!email) return;
		if (!bccList.find((r) => r.address === email)) {
			setBccList((prev) => [...prev, { name: email, address: email }]);
		}
		setBccInput("");
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Ticket Properties */}
			<Card className="border-0 shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Tag className="size-3.5" />
								Status
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={onEditStatus}
								className="h-7 text-[11px] px-2 gap-1.5 hover:bg-secondary rounded-lg font-medium">
								<StatusBadge status={ticket.status} showIcon size="md" />
								<Edit2 className="size-3 opacity-50" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<AlertCircle className="size-3.5" />
								Priority
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 gap-1.5 -mr-2 hover:bg-secondary"
								onClick={onEditPriority}>
								<PriorityBadge priority={ticket.priority} variant="indicator" />
								<Edit2 className="size-3 text-muted-foreground" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<User className="size-3.5" />
								Assignee
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 gap-2 -mr-2 hover:bg-secondary"
								onClick={onEditAssignee}>
								<div className="flex items-center gap-2">
									<Avatar className="size-5 rounded-md">
										<AvatarImage src={assignee?.logo_url ?? workspace.logo_url ?? undefined} className="object-cover rounded-md" />
										<AvatarFallback className="rounded-md bg-primary text-primary-foreground text-[8px] font-bold">
											{assignee ? getInitials(assignee.name) : "?"}
										</AvatarFallback>
									</Avatar>
									<span className="text-xs font-medium">{assignee?.name ?? "Unassigned"}</span>
								</div>
								<Edit2 className="size-3 text-muted-foreground" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Users className="size-3.5" />
								Team
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 gap-2 -mr-2 hover:bg-secondary"
								onClick={onEditTeam}>
								<div className="flex items-center gap-2">
									<Avatar className="size-5 rounded-md">
										<AvatarImage src={team?.logo_url ?? undefined} className="object-cover rounded-md" />
										<AvatarFallback className="rounded-md bg-primary text-primary-foreground text-[8px] font-bold">
											{team ? getInitials(team.name) : "?"}
										</AvatarFallback>
									</Avatar>
									<span className="text-xs font-medium">{team?.name ?? "No team"}</span>
								</div>
								<Edit2 className="size-3 text-muted-foreground" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Mail className="size-3.5" />
								Created
							</div>
							<span className="text-xs font-medium">
								{format(new Date(ticket.created_at * 1000), "MMM d, yyyy")}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* People */}
			<Card className="border-0 shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">People</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Primary contact */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Primary contact</span>
							<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onEditRequester}>
								<Edit2 className="size-3 text-muted-foreground" />
								<span className="sr-only">Change contact</span>
							</Button>
						</div>
						{contact ? (
							<>
								<div className="flex items-center gap-3 mb-2">
									<Avatar className="size-9 rounded-xl">
										<AvatarImage src={contact.logo_url ?? companies.find((c) => c.id === contact.company_id)?.logo_url ?? undefined} className="object-cover rounded-xl" />
										<AvatarFallback className="rounded-xl bg-secondary text-secondary-foreground text-sm font-bold">
											{getInitials(contact.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<p className="text-sm font-medium truncate">{contact.name}</p>
										<p className="text-[11px] text-muted-foreground truncate">{contact.email}</p>
									</div>
								</div>
								{contact.phone && (
									<div className="rounded-lg bg-secondary/50 px-3 py-2">
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Phone</span>
											<span className="font-medium">{contact.phone}</span>
										</div>
									</div>
								)}
							</>
						) : (
							<div className="flex items-center gap-3">
								<Avatar className="size-9 rounded-xl">
									<AvatarFallback className="rounded-xl bg-secondary text-secondary-foreground text-sm font-bold">
										?
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="text-xs text-muted-foreground">No contact assigned</p>
									<button onClick={onEditRequester} className="text-[11px] text-primary hover:underline">
										Assign contact
									</button>
								</div>
							</div>
						)}
					</div>

					<Separator />

					{/* CC / BCC */}
					<div className="space-y-2">
						<div className="flex items-center gap-1.5 rounded-md border border-input px-2 py-1 text-xs">
							<span className="shrink-0 font-medium text-muted-foreground w-7">CC</span>
							<div className="flex flex-wrap gap-1 flex-1">
								{ccList.map((r) => (
									<span key={r.address} className="flex items-center gap-0.5 bg-muted rounded px-1.5 py-0.5 text-[11px]">
										{r.address}
										<button type="button" onClick={() => setCcList((prev) => prev.filter((x) => x.address !== r.address))} className="hover:text-destructive ml-0.5">
											<X className="size-2.5" />
										</button>
									</span>
								))}
								<input
									type="email"
									value={ccInput}
									onChange={(e) => setCcInput(e.target.value)}
									onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCcFromInput(); } }}
									onBlur={addCcFromInput}
									placeholder="Add email..."
									className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground/50 text-[11px]"
								/>
							</div>
							{!showBcc && (
								<button type="button" onClick={() => setShowBcc(true)} className="shrink-0 text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-[11px]">
									BCC <ChevronDown className="size-3" />
								</button>
							)}
						</div>
						{showBcc && (
							<div className="flex items-center gap-1.5 rounded-md border border-input px-2 py-1 text-xs">
								<span className="shrink-0 font-medium text-muted-foreground w-7">BCC</span>
								<div className="flex flex-wrap gap-1 flex-1">
									{bccList.map((r) => (
										<span key={r.address} className="flex items-center gap-0.5 bg-muted rounded px-1.5 py-0.5 text-[11px]">
											{r.address}
											<button type="button" onClick={() => setBccList((prev) => prev.filter((x) => x.address !== r.address))} className="hover:text-destructive ml-0.5">
												<X className="size-2.5" />
											</button>
										</span>
									))}
									<input
										type="email"
										value={bccInput}
										onChange={(e) => setBccInput(e.target.value)}
										onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addBccFromInput(); } }}
										onBlur={addBccFromInput}
										placeholder="Add email..."
										className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground/50 text-[11px]"
									/>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<TicketAiStatePanel ticketId={ticket.id} />

			{/* Activity Timeline */}
			<Card className="border-0 shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="relative space-y-4 pl-5">
						<div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
						{[
							{ label: "Ticket created", time: ticket.created_at },
							{ label: "Last updated", time: ticket.updated_at },
						].map((event, i) => (
							<div key={i} className="relative flex items-start gap-3">
								<div className="absolute -left-5 top-1 size-3.5 rounded-full bg-card border-2 border-primary/30" />
								<div className="min-w-0">
									<p className="text-xs font-medium">{event.label}</p>
									<p className="text-[10px] text-muted-foreground">
										<Calendar className="inline size-2.5 mr-0.5" />
										{format(new Date(event.time * 1000), "MMM d, h:mm a")}
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
