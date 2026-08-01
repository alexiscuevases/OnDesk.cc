// Permission keys used across the app. Catalog is fixed in code; custom roles
// just select which keys they grant.
export type Permission =
	| "tickets.view"
	| "tickets.create"
	| "tickets.edit"
	| "tickets.delete"
	| "tickets.assign"
	| "tickets.reply"
	| "tickets.note"
	| "contacts.view"
	| "contacts.manage"
	| "companies.view"
	| "companies.manage"
	| "teams.view"
	| "teams.manage"
	| "members.view"
	| "members.manage"
	| "canned_replies.manage"
	| "signatures.manage"
	| "automations.manage"
	| "sla.manage"
	| "kb.view"
	| "kb.manage"
	| "ai_agents.manage"
	| "marketplace.manage"
	| "billing.manage"
	| "security.manage"
	| "workspace.manage";

export const ALL_PERMISSIONS: Permission[] = [
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

// Built-in role presets used when a workspace_members.role is one of these legacy strings
export const BUILTIN_ROLE_PERMISSIONS: Record<string, Permission[]> = {
	owner: ALL_PERMISSIONS,
	admin: ALL_PERMISSIONS.filter((p) => p !== "billing.manage" && p !== "workspace.manage"),
	agent: [
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
};

// WorkspaceRoleRow and PublicWorkspaceRole lived here. The rows themselves are
// ondesk's now: a role hangs off the Pulse seat, and seats are the control
// plane's. What Pulse keeps is the vocabulary — the keys below are what it
// checks, and ondesk renders the very same catalogue in its role editor.
