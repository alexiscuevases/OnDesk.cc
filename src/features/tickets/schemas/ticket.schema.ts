import { z } from "zod";

export const newTicketSchema = z.object({
	subject: z.string().min(1, { message: "Subject is required" }),
	contact_id: z.string().optional().default(""),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
	team_id: z.string().optional().default(""),
});

export type NewTicketFormValues = z.infer<typeof newTicketSchema>;
