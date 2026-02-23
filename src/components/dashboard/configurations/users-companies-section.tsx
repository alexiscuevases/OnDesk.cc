"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { type Company, type Customer } from "@/lib/data";
import { nextId } from "@/lib/config-data";

interface UsersCompaniesSectionProps {
	companies: Company[];
	setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
	customers: Customer[];
	setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export function UsersCompaniesSection({ companies, setCompanies, customers, setCustomers }: UsersCompaniesSectionProps) {
	const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
	const [companyDeleteOpen, setCompanyDeleteOpen] = useState(false);
	const [companyForm, setCompanyForm] = useState({ name: "", description: "", image: "" });
	const [selectedCompanyUsers, setSelectedCompanyUsers] = useState<string[]>([]);
	const [companyUserSelectOpen, setCompanyUserSelectOpen] = useState(false);
	const [editingCompany, setEditingCompany] = useState<Company | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

	const unassignedCustomers = customers.filter((c) => !c.companyId);

	function openAddCompany() {
		setEditingCompany(null);
		setCompanyForm({ name: "", description: "", image: "" });
		setSelectedCompanyUsers([]);
		setCompanyDialogOpen(true);
	}

	function openEditCompany(company: Company) {
		setEditingCompany(company);
		setCompanyForm({ name: company.name, description: company.description, image: company.image });
		const companyUserIds = customers.filter((c) => c.companyId === company.id).map((c) => c.id);
		setSelectedCompanyUsers(companyUserIds);
		setCompanyDialogOpen(true);
	}

	function openDeleteCompany(company: Company) {
		setDeleteTarget(company);
		setCompanyDeleteOpen(true);
	}

	function handleSaveCompany() {
		if (!companyForm.name) return;

		const companyId = editingCompany?.id || nextId("c");
		const companyImage =
			companyForm.image ||
			companyForm.name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();

		if (editingCompany) {
			setCompanies((prev) =>
				prev.map((c) =>
					c.id === editingCompany.id
						? { ...c, name: companyForm.name, description: companyForm.description, image: companyImage, userCount: selectedCompanyUsers.length }
						: c,
				),
			);
		} else {
			const newCompany: Company = {
				id: companyId,
				name: companyForm.name,
				description: companyForm.description,
				image: companyImage,
				userCount: selectedCompanyUsers.length,
				createdAt: new Date().toISOString(),
			};
			setCompanies((prev) => [...prev, newCompany]);
		}

		setCustomers((prev) =>
			prev.map((customer) => {
				if (selectedCompanyUsers.includes(customer.id)) {
					return { ...customer, companyId, companyName: companyForm.name };
				} else if (customer.companyId === companyId && !selectedCompanyUsers.includes(customer.id)) {
					return { ...customer, companyId: undefined, companyName: undefined };
				}
				return customer;
			}),
		);

		setCompanyDialogOpen(false);
	}

	function handleDeleteCompany() {
		if (!deleteTarget) return;
		setCustomers((prev) => prev.map((c) => (c.companyId === deleteTarget.id ? { ...c, companyId: undefined, companyName: undefined } : c)));
		setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
		setCompanyDeleteOpen(false);
		setDeleteTarget(null);
	}

	function assignToCompany(customerId: string, companyId: string) {
		const company = companies.find((c) => c.id === companyId);
		if (!company) return;
		setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, companyId, companyName: company.name } : c)));
		setCompanies((prev) => prev.map((c) => (c.id === companyId ? { ...c, userCount: c.userCount + 1 } : c)));
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Companies & Users</CardTitle>
							<CardDescription className="text-xs">
								{companies.length} companies, {customers.length} users
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
								Unassigned Users
								{unassignedCustomers.length > 0 && (
									<Badge variant="secondary" className="ml-1.5 text-[10px] rounded-full px-1.5">
										{unassignedCustomers.length}
									</Badge>
								)}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="companies" className="mt-4 space-y-2">
							{companies.map((company) => {
								const companyUsers = customers.filter((c) => c.companyId === company.id);
								return (
									<div key={company.id} className="rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
										<div className="flex items-center gap-3 mb-3">
											<Avatar className="size-10 rounded-lg">
												<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-bold">
													{company.image}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium">{company.name}</p>
												<p className="text-[11px] text-muted-foreground truncate">{company.description}</p>
											</div>
											<div className="text-center shrink-0">
												<p className="text-sm font-bold">{companyUsers.length}</p>
												<p className="text-[10px] text-muted-foreground">users</p>
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
										{companyUsers.length > 0 && (
											<div className="space-y-1 pl-2 border-l-2 border-border/50 ml-5">
												{companyUsers.map((user) => (
													<div key={user.id} className="flex items-center gap-2 text-xs text-muted-foreground">
														<div className="size-1 rounded-full bg-muted-foreground/40" />
														<span>{user.name}</span>
														<span className="text-[10px]">({user.email})</span>
													</div>
												))}
											</div>
										)}
									</div>
								);
							})}
						</TabsContent>
						<TabsContent value="unassigned" className="mt-4 space-y-2">
							{unassignedCustomers.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-10 text-center">
									<CheckCircle2 className="size-8 text-accent mb-2" />
									<p className="text-sm font-medium">All users assigned</p>
									<p className="text-[11px] text-muted-foreground">Every user belongs to a company</p>
								</div>
							) : (
								unassignedCustomers.map((user) => (
									<div
										key={user.id}
										className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
										<Avatar className="size-8 rounded-lg">
											<AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-[11px] font-bold">
												{user.name
													.split(" ")
													.map((w) => w[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium">{user.name}</p>
											<p className="text-[11px] text-muted-foreground">{user.email}</p>
										</div>
										<Select onValueChange={(companyId) => assignToCompany(user.id, companyId)}>
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
							<Label htmlFor="company-image" className="text-xs font-medium">
								Company Initials
							</Label>
							<Input
								id="company-image"
								value={companyForm.image}
								onChange={(e) => setCompanyForm({ ...companyForm, image: e.target.value.slice(0, 2).toUpperCase() })}
								placeholder="CI"
								maxLength={2}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Assign Users</Label>
							<Popover open={companyUserSelectOpen} onOpenChange={setCompanyUserSelectOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" role="combobox" className="h-auto min-h-9 rounded-lg justify-start text-left font-normal">
										<div className="flex flex-wrap gap-1 items-center">
											{selectedCompanyUsers.length === 0 ? (
												<span className="text-xs text-muted-foreground">Select users...</span>
											) : (
												selectedCompanyUsers.map((userId) => {
													const user = customers.find((c) => c.id === userId);
													if (!user) return null;
													return (
														<Badge key={userId} variant="secondary" className="text-[10px] rounded-md px-1.5 py-0.5">
															{user.name}
															<button
																type="button"
																onClick={(e) => {
																	e.stopPropagation();
																	setSelectedCompanyUsers((prev) => prev.filter((id) => id !== userId));
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
										<CommandInput placeholder="Search users..." className="h-9 text-xs" />
										<CommandList>
											<CommandEmpty className="py-6 text-center text-xs">No users found</CommandEmpty>
											<CommandGroup>
												{customers.map((user) => {
													const isSelected = selectedCompanyUsers.includes(user.id);
													return (
														<CommandItem
															key={user.id}
															onSelect={() => {
																setSelectedCompanyUsers((prev) =>
																	isSelected ? prev.filter((id) => id !== user.id) : [...prev, user.id],
																);
															}}
															className="text-xs">
															<Checkbox checked={isSelected} className="mr-2 size-4" />
															<div className="flex-1">
																<div className="font-medium">{user.name}</div>
																<div className="text-[10px] text-muted-foreground">{user.email}</div>
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
								{selectedCompanyUsers.length} user{selectedCompanyUsers.length !== 1 ? "s" : ""} selected
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
							Are you sure you want to delete {deleteTarget?.name}? All users will be unassigned from this company.
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
