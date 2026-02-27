import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/context/workspace-context";
import { useCompanies } from "@/features/companies/hooks/use-company-queries";
import { useCreateCompanyMutation, useUpdateCompanyMutation, useDeleteCompanyMutation } from "@/features/companies/hooks/use-company-mutations";
import { useContacts, contactQueryKeys } from "@/features/contacts/hooks/use-contact-queries";
import { apiUpdateContact } from "@/features/contacts/api/contacts-api";
import { LogoUpload } from "@/shared/components";
import type { Company } from "@/features/companies/api/companies-api";

export function UsersCompaniesSection() {
	const { workspace } = useWorkspace();
	const queryClient = useQueryClient();
	const { data: companies = [] } = useCompanies(workspace.id);
	const { data: contacts = [] } = useContacts(workspace.id);
	const createCompany = useCreateCompanyMutation(workspace.id);
	const deleteCompanyMutation = useDeleteCompanyMutation(workspace.id);

	const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
	const [companyDeleteOpen, setCompanyDeleteOpen] = useState(false);
	const [companyForm, setCompanyForm] = useState({ name: "", description: "", domain: "", logoUrl: "" });
	const [selectedCompanyContacts, setSelectedCompanyContacts] = useState<string[]>([]);
	const [companyContactSelectOpen, setCompanyContactSelectOpen] = useState(false);
	const [editingCompany, setEditingCompany] = useState<Company | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

	const updateCompany = useUpdateCompanyMutation(editingCompany?.id ?? "", workspace.id);

	const unassignedContacts = contacts.filter((c) => !c.company_id);

	function openAddCompany() {
		setEditingCompany(null);
		setCompanyForm({ name: "", description: "", domain: "", logoUrl: "" });
		setSelectedCompanyContacts([]);
		setCompanyDialogOpen(true);
	}

	function openEditCompany(company: Company) {
		setEditingCompany(company);
		setCompanyForm({ name: company.name, description: company.description ?? "", domain: company.domain ?? "", logoUrl: company.logo_url ?? "" });
		const ids = contacts.filter((c) => c.company_id === company.id).map((c) => c.id);
		setSelectedCompanyContacts(ids);
		setCompanyDialogOpen(true);
	}

	function openDeleteCompany(company: Company) {
		setDeleteTarget(company);
		setCompanyDeleteOpen(true);
	}

	async function handleSaveCompany() {
		if (!companyForm.name) return;
		if (editingCompany) {
			updateCompany.mutate({
				name: companyForm.name,
				description: companyForm.description || undefined,
				domain: companyForm.domain || undefined,
				logo_url: companyForm.logoUrl || null,
			});
			// Reconcile contact assignments
			const previousIds = contacts.filter((c) => c.company_id === editingCompany.id).map((c) => c.id);
			const toAssign = selectedCompanyContacts.filter((id) => !previousIds.includes(id));
			const toUnassign = previousIds.filter((id) => !selectedCompanyContacts.includes(id));
			await Promise.all([
				...toAssign.map((id) => apiUpdateContact(id, { company_id: editingCompany.id })),
				...toUnassign.map((id) => apiUpdateContact(id, { company_id: null })),
			]);
			queryClient.invalidateQueries({ queryKey: contactQueryKeys.all(workspace.id) });
		} else {
			createCompany.mutate(
				{
					workspace_id: workspace.id,
					name: companyForm.name,
					description: companyForm.description || undefined,
					domain: companyForm.domain || undefined,
					logo_url: companyForm.logoUrl || undefined,
				},
				{
					onSuccess: async (newCompany) => {
						await Promise.all(selectedCompanyContacts.map((id) => apiUpdateContact(id, { company_id: newCompany.id })));
						queryClient.invalidateQueries({ queryKey: contactQueryKeys.all(workspace.id) });
					},
				},
			);
		}
		setCompanyDialogOpen(false);
	}

	function handleDeleteCompany() {
		if (!deleteTarget) return;
		deleteCompanyMutation.mutate(deleteTarget.id);
		setCompanyDeleteOpen(false);
		setDeleteTarget(null);
	}

	async function assignContactToCompany(contactId: string, companyId: string) {
		await apiUpdateContact(contactId, { company_id: companyId });
		queryClient.invalidateQueries({ queryKey: contactQueryKeys.all(workspace.id) });
	}

	const dialogInitials = companyForm.name
		? companyForm.name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "CO";

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Companies & Contacts</CardTitle>
							<CardDescription className="text-xs">
								{companies.length} companies, {contacts.length} contacts
							</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAddCompany}>
							<Plus className="size-3.5" />
							Add Company
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="companies" className="w-full">
						<TabsList className="w-full grid grid-cols-2 h-9">
							<TabsTrigger value="companies" className="text-xs">
								Companies
							</TabsTrigger>
							<TabsTrigger value="unassigned" className="text-xs">
								Unassigned Contacts
								{unassignedContacts.length > 0 && (
									<Badge variant="secondary" className="ml-1.5 text-[10px] rounded-full px-1.5">
										{unassignedContacts.length}
									</Badge>
								)}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="companies" className="mt-4 space-y-2">
							{companies.map((company) => {
								const companyContacts = contacts.filter((c) => c.company_id === company.id);
								const initials = company.name
									.split(" ")
									.map((w) => w[0])
									.join("")
									.slice(0, 2)
									.toUpperCase();
								return (
									<div key={company.id} className="rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
										<div className="flex items-center gap-3 mb-3">
											<Avatar className="size-10 rounded-lg">
												<AvatarImage src={company.logo_url ?? undefined} />
												<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-bold">
													{initials}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium">{company.name}</p>
												{company.description && <p className="text-[11px] text-muted-foreground truncate">{company.description}</p>}
											</div>
											<div className="text-center shrink-0">
												<p className="text-sm font-bold">{companyContacts.length}</p>
												<p className="text-[10px] text-muted-foreground">contacts</p>
											</div>
											<div className="flex items-center gap-1 shrink-0">
												<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEditCompany(company)}>
													<Pencil className="size-3" />
													<span className="sr-only">Edit company</span>
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
													onClick={() => openDeleteCompany(company)}>
													<Trash2 className="size-3" />
													<span className="sr-only">Delete company</span>
												</Button>
											</div>
										</div>
										{companyContacts.length > 0 && (
											<div className="space-y-1 pl-2 border-l-2 border-border/50 ml-5">
												{companyContacts.map((contact) => (
													<div key={contact.id} className="flex items-center gap-2 text-xs text-muted-foreground">
														<div className="size-1 rounded-full bg-muted-foreground/40" />
														<span>{contact.name}</span>
														<span className="text-[10px]">({contact.email})</span>
													</div>
												))}
											</div>
										)}
									</div>
								);
							})}
						</TabsContent>
						<TabsContent value="unassigned" className="mt-4 space-y-2">
							{unassignedContacts.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-10 text-center">
									<CheckCircle2 className="size-8 text-accent mb-2" />
									<p className="text-sm font-medium">All contacts assigned</p>
									<p className="text-[11px] text-muted-foreground">Every contact belongs to a company</p>
								</div>
							) : (
								unassignedContacts.map((contact) => (
									<div
										key={contact.id}
										className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
										<Avatar className="size-8 rounded-lg">
											<AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-[11px] font-bold">
												{contact.name
													.split(" ")
													.map((w) => w[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium">{contact.name}</p>
											<p className="text-[11px] text-muted-foreground">{contact.email}</p>
										</div>
										<Select onValueChange={(companyId) => assignContactToCompany(contact.id, companyId)}>
											<SelectTrigger className="w-40 h-7 rounded-lg text-[11px]">
												<SelectValue placeholder="Assign to company" />
											</SelectTrigger>
											<SelectContent>
												{companies.map((company) => (
													<SelectItem key={company.id} value={company.id} className="text-xs">
														{company.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								))
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			<Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
						<DialogDescription>{editingCompany ? "Update company information" : "Create a new company profile"}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<LogoUpload
							label="Company Logo"
							initials={dialogInitials}
							currentUrl={companyForm.logoUrl || null}
							folder="companies"
							onUpload={(url) => setCompanyForm((f) => ({ ...f, logoUrl: url }))}
						/>
						<div className="grid gap-2">
							<Label htmlFor="company-name" className="text-xs font-medium">
								Company Name
							</Label>
							<Input
								id="company-name"
								value={companyForm.name}
								onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="company-desc" className="text-xs font-medium">
								Description
							</Label>
							<Textarea
								id="company-desc"
								value={companyForm.description}
								onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
								placeholder="Brief description of the company"
								className="min-h-20 rounded-lg resize-none"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="company-domain" className="text-xs font-medium">
								Domain
							</Label>
							<Input
								id="company-domain"
								value={companyForm.domain}
								onChange={(e) => setCompanyForm({ ...companyForm, domain: e.target.value })}
								placeholder="example.com"
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Assign Contacts</Label>
							<Popover open={companyContactSelectOpen} onOpenChange={setCompanyContactSelectOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" role="combobox" className="h-auto min-h-9 rounded-lg justify-start text-left font-normal">
										<div className="flex flex-wrap gap-1 items-center">
											{selectedCompanyContacts.length === 0 ? (
												<span className="text-xs text-muted-foreground">Select contacts...</span>
											) : (
												selectedCompanyContacts.map((contactId) => {
													const contact = contacts.find((c) => c.id === contactId);
													if (!contact) return null;
													return (
														<Badge key={contactId} variant="secondary" className="text-[10px] rounded-md px-1.5 py-0.5">
															{contact.name}
															<button
																type="button"
																onClick={(e) => {
																	e.stopPropagation();
																	setSelectedCompanyContacts((prev) => prev.filter((id) => id !== contactId));
																}}
																className="ml-1 hover:text-destructive">
																×
															</button>
														</Badge>
													);
												})
											)}
										</div>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[300px] p-0" align="start">
									<Command>
										<CommandInput placeholder="Search contacts..." className="h-9 text-xs" />
										<CommandList>
											<CommandEmpty className="py-6 text-center text-xs">No contacts found</CommandEmpty>
											<CommandGroup>
												{contacts.map((contact) => {
													const isSelected = selectedCompanyContacts.includes(contact.id);
													return (
														<CommandItem
															key={contact.id}
															onSelect={() => {
																setSelectedCompanyContacts((prev) =>
																	isSelected ? prev.filter((id) => id !== contact.id) : [...prev, contact.id],
																);
															}}
															className="text-xs">
															<Checkbox checked={isSelected} className="mr-2 size-4" />
															<div className="flex-1">
																<div className="font-medium">{contact.name}</div>
																<div className="text-[10px] text-muted-foreground">{contact.email}</div>
															</div>
														</CommandItem>
													);
												})}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							<p className="text-[10px] text-muted-foreground">
								{selectedCompanyContacts.length} contact{selectedCompanyContacts.length !== 1 ? "s" : ""} selected
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCompanyDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSaveCompany} disabled={!companyForm.name} className="rounded-lg text-xs font-semibold">
							{editingCompany ? "Save Changes" : "Create Company"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={companyDeleteOpen} onOpenChange={setCompanyDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Company?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete {deleteTarget?.name}? All contacts will be unassigned from this company.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteCompany}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Company
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
