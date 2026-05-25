import { z } from "zod";

export const signInSchema = z.object({
	email: z.string().email("Please enter a valid email"),
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean().default(false),
});
export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
	.object({
		name: z.string().min(1, "Full name is required"),
		email: z.string().email("Please enter a valid email"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
		agreeToTerms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the terms",
		}),
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const recoverSchema = z.object({
	email: z.string().email("Please enter a valid email"),
});
export type RecoverFormValues = z.infer<typeof recoverSchema>;

export const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
