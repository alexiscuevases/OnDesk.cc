// Re-export from feature module so all consumers stay in sync
export type { Notification, NotificationType } from "@/features/notifications/api/notifications-api";

export interface ConfigTeam {
	id: string;
	name: string;
	description: string;
	image: string;
	members: number;
	lead: string;
	leaderId?: string;
	memberIds?: string[];
	autoAssign: boolean;
}

export interface CannedReply {
	id: string;
	title: string;
	shortcut: string;
	content: string;
}

export interface Signature {
	id: string;
	name: string;
	isDefault: boolean;
	content: string;
}
