export interface MailboxIntegration {
	id: string;
	workspace_id: string;
	email: string;
	ms_user_id: string;
	subscription_id: string | null;
	subscription_expires_at: number | null;
	created_at: number;
}

export async function apiGetOAuthUrl(workspaceId: string, slug: string): Promise<{ url: string }> {
	const params = new URLSearchParams({ workspace_id: workspaceId, slug });
	const res = await fetch(`/api/integrations/microsoft/oauth-url?${params}`, {
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to get OAuth URL");
	}
	return res.json() as Promise<{ url: string }>;
}

export async function apiGetMailboxes(workspaceId: string): Promise<MailboxIntegration[]> {
	const params = new URLSearchParams({ workspace_id: workspaceId });
	const res = await fetch(`/api/integrations/mailboxes?${params}`, {
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch mailboxes");
	}
	const data = (await res.json()) as { mailboxes: MailboxIntegration[] };
	return data.mailboxes;
}

export async function apiDisconnectMailbox(id: string, workspaceId: string): Promise<void> {
	const params = new URLSearchParams({ workspace_id: workspaceId });
	const res = await fetch(`/api/integrations/mailboxes/${id}?${params}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to disconnect mailbox");
	}
}
