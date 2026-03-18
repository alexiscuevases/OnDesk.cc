import { useState } from "react";
import { Search, Hash, User, Users } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspace } from "@/context/workspace-context";
import { useTickets } from "@/features/tickets/hooks/use-ticket-queries";
import { useTeams } from "@/features/teams/hooks/use-team-queries";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
import { useContacts } from "@/features/contacts/hooks/use-contact-queries";
import { useCompanies } from "@/features/companies/hooks/use-company-queries";

export function GlobalSearch() {
	const [globalSearch, setGlobalSearch] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const navigate = useNavigate();
	const { slug } = useParams({ strict: false });
	const { workspace } = useWorkspace();
	const workspaceId = workspace.id;

	const { data: allTickets = [] } = useTickets(workspaceId);
	const { data: allTeams = [] } = useTeams(workspaceId);
	const { data: allMembers = [] } = useWorkspaceMembers(workspaceId);
	const { data: allContacts = [] } = useContacts(workspaceId);
	const { data: allCompanies = [] } = useCompanies(workspaceId);

	const q = globalSearch.toLowerCase();

	const searchResults = {
		tickets: allTickets.filter((t) => q && (t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))).slice(0, 3),
		agents: allMembers.filter((a) => q && (a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))).slice(0, 3),
		teams: allTeams.filter((t) => q && t.name.toLowerCase().includes(q)).slice(0, 3),
		contacts: allContacts
			.filter((c) => q && (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)))
			.slice(0, 3),
	};

	const hasResults =
		searchResults.tickets.length > 0 ||
		searchResults.agents.length > 0 ||
		searchResults.contacts.length > 0 ||
		searchResults.teams.length > 0;

	function getContact(id: string | null) {
		if (!id) return null;
		return allContacts.find((c) => c.id === id) ?? null;
	}

	function getCompanyLogo(companyId: string | null) {
		if (!companyId) return null;
		return allCompanies.find((c) => c.id === companyId)?.logo_url ?? null;
	}

	function getInitials(name: string) {
		return name
			.split(" ")
			.map((w) => w[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	}

	return (
		<Popover open={searchOpen && globalSearch.length > 0} onOpenChange={setSearchOpen}>
			<PopoverTrigger asChild>
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search tickets, teams, agents, or contacts..."
						value={globalSearch}
						onChange={(e) => {
							setGlobalSearch(e.target.value);
							setSearchOpen(e.target.value.length > 0);
						}}
						onFocus={() => globalSearch.length > 0 && setSearchOpen(true)}
						className="pl-9 h-9 bg-secondary/60 border-0 rounded-lg focus-visible:bg-card focus-visible:ring-1"
					/>
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-[400px] p-0" align="start" sideOffset={8} onOpenAutoFocus={(e) => e.preventDefault()}>
				{hasResults ? (
					<div className="max-h-96 overflow-y-auto">
						{searchResults.tickets.length > 0 && (
							<div className="p-2">
								<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
									<Hash className="size-3" />
									Tickets
								</div>
								{searchResults.tickets.map((ticket) => {
									const contact = getContact(ticket.contact_id);
									const companyLogo = getCompanyLogo(contact?.company_id ?? null);
									return (
										<button
											key={ticket.id}
											onClick={() => {
												if (slug) {
													navigate({ to: "/w/$slug/tickets/$id", params: { slug, id: ticket.id } });
												}
												setSearchOpen(false);
												setGlobalSearch("");
											}}
											className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors text-left">
											<Avatar className="size-7 rounded-lg mt-0.5">
												<AvatarImage src={companyLogo ?? undefined} className="object-cover rounded-lg" />
												<AvatarFallback className="rounded-lg bg-secondary text-foreground text-[10px] font-bold">
													{contact ? getInitials(contact.name) : "?"}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<span className="text-xs font-mono font-semibold text-primary/70">{ticket.number}</span>
												</div>
												<p className="text-sm font-medium truncate">{ticket.subject}</p>
												<p className="text-xs text-muted-foreground truncate">{ticket.status}</p>
											</div>
										</button>
									);
								})}
							</div>
						)}
						{searchResults.contacts.length > 0 && (
							<div className="p-2 border-t">
								<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
									<User className="size-3" />
									Contacts
								</div>
								{searchResults.contacts.map((contact) => {
									const companyLogo = getCompanyLogo(contact.company_id ?? null);
									return (
										<button
											key={contact.id}
											onClick={() => {
												if (slug) {
													navigate({ to: "/w/$slug/tickets", params: { slug }, search: { contact: contact.id } });
												}
												setSearchOpen(false);
												setGlobalSearch("");
											}}
											className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors text-left">
											<Avatar className="size-7 rounded-lg">
												<AvatarImage
													src={contact.logo_url ?? companyLogo ?? undefined}
													className="object-cover rounded-lg"
												/>
												<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
													{getInitials(contact.name)}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate">{contact.name}</p>
												<p className="text-xs text-muted-foreground truncate">{contact.email}</p>
											</div>
										</button>
									);
								})}
							</div>
						)}
						{searchResults.agents.length > 0 && (
							<div className="p-2 border-t">
								<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
									<User className="size-3" />
									Agents
								</div>
								{searchResults.agents.map((agent) => (
									<button
										key={agent.id}
										onClick={() => {
											if (slug) {
												navigate({ to: "/w/$slug/tickets", params: { slug }, search: { assignee: agent.id } });
											}
											setSearchOpen(false);
											setGlobalSearch("");
										}}
										className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors text-left">
										<Avatar className="size-7 rounded-lg">
											<AvatarImage src={agent.logo_url ?? workspace.logo_url ?? undefined} className="object-cover rounded-lg" />
											<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
												{agent.name.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">{agent.name}</p>
											<p className="text-xs text-muted-foreground truncate">{agent.role}</p>
										</div>
									</button>
								))}
							</div>
						)}
						{searchResults.teams.length > 0 && (
							<div className="p-2 border-t">
								<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
									<Users className="size-3" />
									Teams
								</div>
								{searchResults.teams.map((team) => (
									<button
										key={team.id}
										onClick={() => {
											if (slug) {
												navigate({ to: "/w/$slug/teams", params: { slug }, search: { team: team.id } });
											}
											setSearchOpen(false);
											setGlobalSearch("");
										}}
										className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors text-left">
										<Avatar className="size-7 rounded-lg">
											<AvatarImage src={team.logo_url ?? undefined} className="object-cover rounded-lg" />
											<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[9px] font-bold">
												{team.name.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium">{team.name}</p>
											<p className="text-xs text-muted-foreground truncate">{team.description}</p>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
						<Search className="size-8 mb-2 opacity-30" />
						<p className="text-sm">No results found</p>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
