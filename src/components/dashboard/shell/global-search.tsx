import { useState } from "react";
import { Search, Hash, User, Users } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { tickets, agents, teams } from "@/lib/data";

export function GlobalSearch() {
	const [globalSearch, setGlobalSearch] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const navigate = useNavigate();

	const searchResults = {
		tickets: tickets
			.filter(
				(t) =>
					globalSearch &&
					(t.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
						t.subject.toLowerCase().includes(globalSearch.toLowerCase()) ||
						t.requester.toLowerCase().includes(globalSearch.toLowerCase())),
			)
			.slice(0, 3),
		agents: agents
			.filter(
				(a) =>
					globalSearch &&
					(a.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
						a.email.toLowerCase().includes(globalSearch.toLowerCase())),
			)
			.slice(0, 3),
		teams: teams
			.filter((t) => globalSearch && t.name.toLowerCase().includes(globalSearch.toLowerCase()))
			.slice(0, 3),
	};

	const hasResults =
		searchResults.tickets.length > 0 || searchResults.agents.length > 0 || searchResults.teams.length > 0;

	return (
		<Popover open={searchOpen && globalSearch.length > 0} onOpenChange={setSearchOpen}>
			<PopoverTrigger asChild>
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search tickets, teams, or users..."
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
			<PopoverContent
				className="w-[400px] p-0"
				align="start"
				sideOffset={8}
				onOpenAutoFocus={(e) => e.preventDefault()}>
				{hasResults ? (
					<div className="max-h-96 overflow-y-auto">
						{searchResults.tickets.length > 0 && (
							<div className="p-2">
								<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
									<Hash className="size-3" />
									Tickets
								</div>
								{searchResults.tickets.map((ticket) => (
									<button
										key={ticket.id}
										onClick={() => {
											navigate({ to: "/dashboard/tickets/$id", params: { id: ticket.id } });
											setSearchOpen(false);
											setGlobalSearch("");
										}}
										className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors text-left">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<span className="text-xs font-mono font-semibold text-primary/70">{ticket.id}</span>
											</div>
											<p className="text-sm font-medium truncate">{ticket.subject}</p>
											<p className="text-xs text-muted-foreground truncate">{ticket.requester}</p>
										</div>
									</button>
								))}
							</div>
						)}
						{searchResults.agents.length > 0 && (
							<div className="p-2 border-t">
								<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
									<User className="size-3" />
									Agents
								</div>
								{searchResults.agents.map((agent) => (
									<div
										key={agent.id}
										className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors">
										<Avatar className="size-7 rounded-lg">
											<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
												{agent.initials}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">{agent.name}</p>
											<p className="text-xs text-muted-foreground truncate">{agent.role}</p>
										</div>
									</div>
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
									<div
										key={team.id}
										className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors">
										<Avatar className="size-7 rounded-lg">
											<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[9px] font-bold">
												{team.avatar}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium">{team.name}</p>
											<p className="text-xs text-muted-foreground truncate">{team.description}</p>
										</div>
									</div>
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
