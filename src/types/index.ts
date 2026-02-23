export interface Notification {
	id: string;
	title: string;
	description: string;
	time: string;
	read: boolean;
	type: "ticket" | "assign" | "sla" | "resolved";
}

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
