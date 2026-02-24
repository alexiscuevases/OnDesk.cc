"use client";

import { useState } from "react";
import { Plus, Mail, RefreshCw, Check, AlertCircle, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { type OutlookAccount } from "@/lib/data";

export function IntegrationsSection() {
	const [accounts, setAccounts] = useState<OutlookAccount[]>([]);
	const [disconnectOpen, setDisconnectOpen] = useState(false);
	const [disconnectTarget, setDisconnectTarget] = useState<OutlookAccount | null>(null);

	function handleResync(accountId: string) {
		setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, syncStatus: "syncing" as const, lastSync: new Date().toISOString() } : a)));
		setTimeout(() => {
			setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, syncStatus: "synced" as const } : a)));
		}, 2000);
	}

	function handleDisconnect() {
		if (!disconnectTarget) return;
		setAccounts((prev) => prev.filter((a) => a.id !== disconnectTarget.id));
		setDisconnectOpen(false);
		setDisconnectTarget(null);
	}

	function openDisconnect(account: OutlookAccount) {
		setDisconnectTarget(account);
		setDisconnectOpen(true);
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Microsoft Outlook</CardTitle>
							<CardDescription className="text-xs">Connected email accounts for ticket creation</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold">
							<Plus className="size-3.5" />
							Connect Account
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{accounts.map((account) => (
							<div key={account.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
									<Mail className="size-5 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{account.email}</p>
									<div className="flex items-center gap-1.5 mt-0.5">
										{account.syncStatus === "syncing" ? (
											<>
												<RefreshCw className="size-3 text-primary animate-spin" />
												<p className="text-[11px] text-primary">Syncing...</p>
											</>
										) : account.syncStatus === "synced" ? (
											<>
												<Check className="size-3 text-accent" />
												<p className="text-[11px] text-muted-foreground">Last sync: {new Date(account.lastSync).toLocaleString()}</p>
											</>
										) : (
											<>
												<AlertCircle className="size-3 text-destructive" />
												<p className="text-[11px] text-destructive">Sync error</p>
											</>
										)}
									</div>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<Button
										variant="outline"
										size="sm"
										className="h-7 gap-1.5 text-[11px] rounded-lg"
										onClick={() => handleResync(account.id)}
										disabled={account.syncStatus === "syncing"}>
										<RefreshCw className={`size-3 ${account.syncStatus === "syncing" ? "animate-spin" : ""}`} />
										Re-sync
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 gap-1.5 text-[11px] rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDisconnect(account)}>
										<X className="size-3" />
										Disconnect
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Disconnect Outlook Account?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to disconnect {disconnectTarget?.email}? Email tickets will no longer be created from this account.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDisconnect}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Disconnect
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
