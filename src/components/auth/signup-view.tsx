import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthOAuthBlock } from "@/components/auth/auth-oauth-block";

export default function SignUpView() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [agreeToTerms, setAgreeToTerms] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("[v0] Sign up attempt:", { name, email, agreeToTerms });
	};

	return (
		<AuthLayout
			orbVariant="right-left"
			backLink={{ to: "/auth/signin", label: "Back to sign in" }}
			footer={
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground">Join 50,000+ teams delivering exceptional support</p>
					<p className="text-xs text-muted-foreground">Secured by Microsoft 365 • Enterprise-grade encryption</p>
				</div>
			}>
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Start your free trial</h1>
				<p className="text-muted-foreground">14 days free. No credit card required.</p>
			</div>

			<AuthOAuthBlock mode="signup" />

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Full Name</Label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							id="name"
							type="text"
							placeholder="John Doe"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="pl-10"
							required
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
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

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							id="password"
							type="password"
							placeholder="Create a strong password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="pl-10"
							required
							minLength={8}
						/>
					</div>
					<p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
				</div>

				<div className="flex items-start space-x-2 pt-2">
					<Checkbox
						id="terms"
						checked={agreeToTerms}
						onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
						required
					/>
					<Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
						I agree to the{" "}
						<span className="text-primary hover:text-primary/80 cursor-pointer">Terms of Service</span>
						{" "}and{" "}
						<span className="text-primary hover:text-primary/80 cursor-pointer">Privacy Policy</span>
					</Label>
				</div>

				<Button type="submit" className="w-full" size="lg">
					Create account
				</Button>
			</form>

			<div className="mt-6 text-center text-sm">
				<span className="text-muted-foreground">Already have an account? </span>
				<Link to="/auth/signin" className="text-primary hover:text-primary/80 font-medium transition-colors">
					Sign in
				</Link>
			</div>
		</AuthLayout>
	);
}
