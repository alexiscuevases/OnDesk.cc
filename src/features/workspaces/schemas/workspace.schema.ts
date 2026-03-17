import { z } from "zod";

export const createWorkspaceSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
	slug: z
		.string()
		.min(3, "Slug must be at least 3 characters")
		.max(50, "Slug too long")
		.regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
	description: z.string().max(500, "Description too long").optional(),
	logo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	description: z.string().max(500).optional(),
	logo_url: z.string().url().optional().or(z.literal("")),
	workspace_prompt: z.string().max(10_000).optional(),
});

export type UpdateWorkspaceValues = z.infer<typeof updateWorkspaceSchema>;
