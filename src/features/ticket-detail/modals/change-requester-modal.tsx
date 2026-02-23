import { useState } from "react";
import { Search, User, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomers, queryKeys } from "@/lib/queries";
import type { Customer } from "@/lib/data";
import { getInitials } from "@/lib/format";

interface ChangeRequesterModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (customerId: string) => void;
}

export function ChangeRequesterModal({ open, onOpenChange, onSave }: ChangeRequesterModalProps) {
	const { data: customers = [] } = useQuery({ queryKey: queryKeys.customers.all, queryFn: fetchCustomers });
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<Customer | null>(null);

	const filtered = customers.filter(
		(c) =>
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.email.toLowerCase().includes(search.toLowerCase()),
	);

	function handleSave() {
		if (selected) {
			onSave(selected.id);
			setSelected(null);
			setSearch("");
			onOpenChange(false);
		}
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			setSelected(null);
			setSearch("");
		}
		onOpenChange(open);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-base">Change Requester</DialogTitle>
					<DialogDescription className="text-xs">
						Select a user from your Users & Companies to assign as the ticket requester
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							placeholder="Search by name or email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9 h-9 rounded-lg"
						/>
					</div>
					<div className="max-h-[300px] overflow-y-auto rounded-lg border">
						{filtered.length > 0 ? (
							<div className="p-1">
								{filtered.map((customer) => (
									<button
										key={customer.id}
										onClick={() => setSelected(customer)}
										className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors ${
											selected?.id === customer.id ? "bg-secondary" : ""
										}`}>
										<Avatar className="size-8 rounded-lg">
											<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
												{getInitials(customer.name)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0 text-left">
											<p className="text-sm font-medium truncate">{customer.name}</p>
											<p className="text-xs text-muted-foreground truncate">{customer.email}</p>
											{customer.companyName && (
												<p className="text-[10px] text-muted-foreground truncate">{customer.companyName}</p>
											)}
										</div>
										{selected?.id === customer.id && (
											<CheckCircle2 className="size-4 text-primary shrink-0" />
										)}
									</button>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
								<User className="size-8 mb-2 opacity-30" />
								<p className="text-sm">No users found</p>
							</div>
						)}
					</div>
				</div>
				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-lg">
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!selected} className="rounded-lg">
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
