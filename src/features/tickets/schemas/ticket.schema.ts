import { z } from "zod";

export const newTicketSchema = z.object({
	subject: z.string().min(1, "Subject is required"),
	requesterEmail: z.string().email("Valid requester email required"),
	priority: z.enum(["low", "medium", "high", "critical"]),
	team: z.string().min(1, "Please assign a team"),
	description: z.string().optional(),
});
export type NewTicketFormValues = z.infer<typeof newTicketSchema>;

export const assignAgentSchema = z.object({
	agentId: z.string().min(1, "Please select an agent"),
});
export type AssignAgentFormValues = z.infer<typeof assignAgentSchema>;

export const assignTeamSchema = z.object({
	teamName: z.string().min(1, "Please select a team"),
});
export type AssignTeamFormValues = z.infer<typeof assignTeamSchema>;

export const mergeTicketSchema = z.object({
	targetTicketId: z.string().min(1, "Please select a ticket to merge into"),
});
export type MergeTicketFormValues = z.infer<typeof mergeTicketSchema>;
