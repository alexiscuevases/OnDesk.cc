import { z } from "zod";

export const agentSchema = z.object({
	email: z.string().email("Valid email required"),
	role: z.enum(["Admin", "Senior Agent", "Agent"]),
});
export type AgentFormValues = z.infer<typeof agentSchema>;

export const teamSchema = z.object({
	name: z.string().min(1, "Team name is required"),
	description: z.string().optional().default(""),
	image: z.string().optional().default(""),
	leaderId: z.string().optional().default(""),
	memberIds: z.array(z.string()).default([]),
	autoAssign: z.boolean().default(true),
});
export type TeamFormValues = z.infer<typeof teamSchema>;

export const cannedReplySchema = z.object({
	title: z.string().min(1, "Title is required"),
	shortcut: z.string().min(1, "Shortcut is required"),
	content: z.string().min(1, "Content is required"),
});
export type CannedReplyFormValues = z.infer<typeof cannedReplySchema>;

export const signatureSchema = z.object({
	name: z.string().min(1, "Name is required"),
	content: z.string().min(1, "Content is required"),
	isDefault: z.boolean().default(false),
});
export type SignatureFormValues = z.infer<typeof signatureSchema>;
