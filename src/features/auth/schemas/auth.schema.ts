import { z } from "zod";

export const signInSchema = z.object({
	email: z.string().email("Please enter a valid email"),
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean().default(false),
});
export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
	name: z.string().min(1, "Full name is required"),
	email: z.string().email("Please enter a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	agreeToTerms: z.boolean().refine((val) => val === true, {
		message: "You must agree to the terms",
	}),
});
export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const recoverSchema = z.object({
	email: z.string().email("Please enter a valid email"),
});
export type RecoverFormValues = z.infer<typeof recoverSchema>;
