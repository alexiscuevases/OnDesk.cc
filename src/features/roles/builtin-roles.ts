import type { Permission } from "./api/roles-api";

const ALL: Permission[] = [
	"tickets.view",
	"tickets.create",
	"tickets.edit",
	"tickets.delete",
	"tickets.assign",
	"tickets.reply",
	"tickets.note",
	"contacts.view",
	"contacts.manage",
	"companies.view",
	"companies.manage",
	"teams.view",
	"teams.manage",
	"members.view",
	"members.manage",
	"canned_replies.manage",
	"signatures.manage",
	"automations.manage",
	"sla.manage",
	"kb.view",
	"kb.manage",
	"ai_agents.manage",
	"marketplace.manage",
	"billing.manage",
	"security.manage",
	"workspace.manage",
];

export const BUILTIN_ROLES: {
	key: string;
	name: string;
	description: string;
	permissions: Permission[];
}[] = [
	{
		key: "owner",
		name: "Owner",
		description: "Full access to the workspace — manage billing, members, and all settings.",
		permissions: ALL,
	},
	{
		key: "admin",
		name: "Admin",
		description: "Manage everything except billing and core workspace settings.",
		permissions: ALL.filter((p) => p !== "billing.manage" && p !== "workspace.manage"),
	},
	{
		key: "agent",
		name: "Agent",
		description: "Day-to-day support work: tickets, replies, internal notes, KB read.",
		permissions: [
			"tickets.view",
			"tickets.create",
			"tickets.edit",
			"tickets.assign",
			"tickets.reply",
			"tickets.note",
			"contacts.view",
			"companies.view",
			"teams.view",
			"members.view",
			"kb.view",
		],
	},
];
