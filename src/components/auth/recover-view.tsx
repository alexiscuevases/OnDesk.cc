import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function RecoverView() {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("[v0] Password recovery requested for:", email);
		setIsSubmitted(true);
	};

	return (
		<AuthLayout
			orbVariant="center"
			backLink={{ to: "/auth/signin", label: "Back to sign in" }}
			footer={<p className="text-sm text-muted-foreground">Secured by Microsoft 365 • Your data is protected</p>}>
			{!isSubmitted ? (
				<>
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold mb-2">Reset password</h1>
						<p className="text-muted-foreground">
							Enter your email address and we'll send you a link to reset your password
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
						</div>

						<Button type="submit" className="w-full" size="lg">
							Send recovery link
						</Button>
					</form>

					<div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
						<p className="text-sm text-muted-foreground">
							We'll send you an email with instructions to reset your password. The link will be valid for 1 hour.
						</p>
					</div>

					<div className="mt-6 text-center text-sm">
						<span className="text-muted-foreground">Remember your password? </span>
						<Link to="/auth/signin" className="text-primary hover:text-primary/80 font-medium transition-colors">
							Sign in
						</Link>
					</div>
				</>
			) : (
				<>
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
							<CheckCircle2 className="size-8 text-primary" />
						</div>
						<h1 className="text-3xl font-bold mb-2">Check your email</h1>
						<p className="text-muted-foreground">We've sent a password recovery link to</p>
						<p className="text-foreground font-medium mt-2">{email}</p>
					</div>

					<div className="space-y-4 mb-6">
						<div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
							{[
								"Open the email we sent to your inbox",
								"Click the recovery link (valid for 1 hour)",
								"Set your new password",
							].map((step, i) => (
								<div key={i} className="flex gap-3">
									<div className="flex-shrink-0 size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
										{i + 1}
									</div>
									<p className="text-sm text-muted-foreground">{step}</p>
								</div>
							))}
						</div>

						<p className="text-center text-sm text-muted-foreground">
							Didn't receive the email?{" "}
							<button
								type="button"
								onClick={() => setIsSubmitted(false)}
								className="text-primary hover:text-primary/80 font-medium transition-colors">
								Try again
							</button>
						</p>
					</div>

					<Button asChild className="w-full" size="lg">
						<Link to="/auth/signin">Back to sign in</Link>
					</Button>
				</>
			)}
		</AuthLayout>
	);
}
