import { useState } from "react";
import { Plus, Mail, RefreshCw, Check, AlertCircle, X, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useWorkspace } from "@/context/workspace-context";
import { useMailboxes } from "@/features/integrations/hooks/use-mailbox-queries";
import { useConnectMailboxMutation, useConnectGmailMutation, useDisconnectMailboxMutation } from "@/features/integrations/hooks/use-mailbox-mutations";
import type { MailboxIntegration } from "@/features/integrations/api/integrations-api";

function getProviderLabel(provider: MailboxIntegration["provider"]): string {
	return provider === "google" ? "Gmail" : "Outlook";
}

function getMailboxSyncStatus(mailbox: MailboxIntegration): "synced" | "pending" | "expired" {
	if (!mailbox.subscription_id) {
		// Gmail: use last_history_id as the indicator instead
		if (mailbox.provider === "google") {
			return mailbox.last_history_id ? "synced" : "pending";
		}
		return "pending";
	}
	if (mailbox.subscription_expires_at === null) return "pending";
	const nowSecs = Math.floor(Date.now() / 1000);
	if (mailbox.subscription_expires_at < nowSecs) return "expired";
	return "synced";
}

function MailboxList({
	mailboxes,
	onResync,
	onDisconnect,
	resyncingProvider,
	isDisconnecting,
}: {
	mailboxes: MailboxIntegration[];
	onResync: (provider: MailboxIntegration["provider"]) => void;
	onDisconnect: (mailbox: MailboxIntegration) => void;
	resyncingProvider: MailboxIntegration["provider"] | null;
	isDisconnecting: boolean;
}) {
	return (
		<div className="space-y-2">
			{mailboxes.map((mailbox) => {
				const syncStatus = getMailboxSyncStatus(mailbox);
				const isResyncing = resyncingProvider === mailbox.provider;
				return (
					<div
						key={mailbox.id}
						className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
						<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
							<Mail className="size-5 text-primary" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<p className="text-sm font-medium truncate">{mailbox.email}</p>
								<span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
									{getProviderLabel(mailbox.provider)}
								</span>
							</div>
							<div className="flex items-center gap-1.5 mt-0.5">
								{syncStatus === "synced" ? (
									<>
										<Check className="size-3 text-green-500" />
										<p className="text-[11px] text-muted-foreground">
											Active · since {new Date(mailbox.created_at * 1000).toLocaleDateString()}
										</p>
									</>
								) : syncStatus === "pending" ? (
									<>
										<AlertCircle className="size-3 text-amber-500" />
										<p className="text-[11px] text-amber-500">Connected · webhook pending (needs HTTPS)</p>
									</>
								) : (
									<>
										<AlertCircle className="size-3 text-destructive" />
										<p className="text-[11px] text-destructive">Subscription expired · reconnect to resume</p>
									</>
								)}
							</div>
						</div>
						<div className="flex items-center gap-1 shrink-0">
							<Button
								variant="outline"
								size="sm"
								className="h-7 gap-1.5 text-[11px] rounded-lg"
								onClick={() => onResync(mailbox.provider)}
								disabled={isResyncing}>
								<RefreshCw className="size-3" />
								Re-sync
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 gap-1.5 text-[11px] rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
								onClick={() => onDisconnect(mailbox)}
								disabled={isDisconnecting}>
								<X className="size-3" />
								Disconnect
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function IntegrationsSection() {
	const { workspace } = useWorkspace();
	const { data: mailboxes = [], isLoading } = useMailboxes(workspace.id);
	const outlookMutation = useConnectMailboxMutation(workspace.id, workspace.slug);
	const gmailMutation = useConnectGmailMutation(workspace.id, workspace.slug);
	const disconnectMutation = useDisconnectMailboxMutation(workspace.id);

	const [disconnectOpen, setDisconnectOpen] = useState(false);
	const [disconnectTarget, setDisconnectTarget] = useState<MailboxIntegration | null>(null);

	const isConnecting = outlookMutation.isPending || gmailMutation.isPending;
	const resyncingProvider: MailboxIntegration["provider"] | null = outlookMutation.isPending
		? "microsoft"
		: gmailMutation.isPending
			? "google"
			: null;

	function handleResync(provider: MailboxIntegration["provider"]) {
		if (provider === "google") gmailMutation.mutate();
		else outlookMutation.mutate();
	}

	function openDisconnect(mailbox: MailboxIntegration) {
		setDisconnectTarget(mailbox);
		setDisconnectOpen(true);
	}

	function handleDisconnect() {
		if (!disconnectTarget) return;
		disconnectMutation.mutate(disconnectTarget.id, {
			onSuccess: () => {
				setDisconnectOpen(false);
				setDisconnectTarget(null);
			},
		});
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Email Accounts</CardTitle>
							<CardDescription className="text-xs">Connect Microsoft Outlook or Gmail to receive tickets from email</CardDescription>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									size="sm"
									className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
									disabled={isConnecting}>
									<Plus className="size-3.5" />
									{isConnecting ? "Redirecting..." : "Connect Account"}
									<ChevronDown className="size-3.5 opacity-70" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-44">
								<DropdownMenuItem onClick={() => outlookMutation.mutate()} disabled={isConnecting}>
									<Mail className="size-4" />
									Microsoft Outlook
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => gmailMutation.mutate()} disabled={isConnecting}>
									<Mail className="size-4" />
									Gmail
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-6">
							<RefreshCw className="size-4 animate-spin text-muted-foreground" />
						</div>
					) : mailboxes.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-8 text-center">
							<div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
								<Mail className="size-5 text-muted-foreground" />
							</div>
							<p className="text-sm font-medium">No accounts connected</p>
							<p className="text-[11px] text-muted-foreground max-w-xs">
								Connect a Microsoft Outlook or Gmail account to start receiving tickets from email.
							</p>
						</div>
					) : (
						<MailboxList
							mailboxes={mailboxes}
							onResync={handleResync}
							onDisconnect={openDisconnect}
							resyncingProvider={resyncingProvider}
							isDisconnecting={disconnectMutation.isPending}
						/>
					)}
				</CardContent>
			</Card>

			<AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Disconnect {disconnectTarget?.provider === "google" ? "Gmail" : "Outlook"} Account?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to disconnect {disconnectTarget?.email}? Email tickets will no longer be created from this account.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDisconnect}
							disabled={disconnectMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							{disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
