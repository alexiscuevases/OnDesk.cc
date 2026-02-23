import { z } from "zod";

export const editTitleSchema = z.object({
	title: z.string().min(1, "Title cannot be empty"),
});
export type EditTitleFormValues = z.infer<typeof editTitleSchema>;

export const changeRequesterSchema = z.object({
	customerId: z.string().min(1, "Please select a requester"),
});
export type ChangeRequesterFormValues = z.infer<typeof changeRequesterSchema>;

export const changeAssigneeSchema = z.object({
	agentId: z.string().min(1, "Please select an assignee"),
});
export type ChangeAssigneeFormValues = z.infer<typeof changeAssigneeSchema>;

export const manageTeamsSchema = z.object({
	teamNames: z.array(z.string()).min(1, "Select at least one team"),
});
export type ManageTeamsFormValues = z.infer<typeof manageTeamsSchema>;
