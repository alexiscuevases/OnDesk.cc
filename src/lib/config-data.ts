import type { ConfigTeam, CannedReply, Signature } from "@/types/index";

export const initialTeams: ConfigTeam[] = [
	{
		id: "t1",
		name: "Email Support",
		description: "Handles all email-related issues",
		image: "ES",
		members: 4,
		lead: "Carlos Mendez",
		leaderId: "a1",
		memberIds: ["a1", "a5", "a3"],
		autoAssign: true,
	},
	{
		id: "t2",
		name: "Teams Support",
		description: "Microsoft Teams support",
		image: "TS",
		members: 3,
		lead: "Ana Torres",
		leaderId: "a2",
		memberIds: ["a2", "a6"],
		autoAssign: true,
	},
	{
		id: "t3",
		name: "SharePoint Support",
		description: "SharePoint and document management",
		image: "SP",
		members: 5,
		lead: "Miguel Reyes",
		leaderId: "a3",
		memberIds: ["a3", "a4", "a5"],
		autoAssign: false,
	},
	{
		id: "t4",
		name: "Identity & Access",
		description: "Azure AD and authentication",
		image: "IA",
		members: 3,
		lead: "Laura Diaz",
		leaderId: "a4",
		memberIds: ["a4", "a2"],
		autoAssign: true,
	},
];

export const initialCannedReplies: CannedReply[] = [
	{ id: "cr1", title: "Ticket Acknowledgment", shortcut: "/ack", content: "Thank you for contacting us. Your ticket {{ticket_id}} has been received..." },
	{ id: "cr2", title: "Request More Info", shortcut: "/info", content: "To better assist you, could you provide the following details..." },
	{ id: "cr3", title: "Escalation Notice", shortcut: "/esc", content: "Your ticket has been escalated to our senior team for further investigation..." },
	{
		id: "cr4",
		title: "Resolution Confirmation",
		shortcut: "/resolved",
		content: "Your ticket {{ticket_id}} has been resolved. If you need further assistance...",
	},
];

export const initialSignatures: Signature[] = [
	{ id: "s1", name: "Default Signature", isDefault: true, content: "Best regards,\\n{{agent_name}}\\nOnDesk.cc | {{team_name}}" },
	{ id: "s2", name: "Formal Signature", isDefault: false, content: "Kind regards,\\n{{agent_name}}\\n{{agent_role}} | OnDesk.cc" },
];

let _idCounter = 100;

export function nextId(prefix: string) {
	_idCounter++;
	return `${prefix}-${_idCounter}`;
}
