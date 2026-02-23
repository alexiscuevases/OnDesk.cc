import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthOAuthBlock } from "@/components/auth/auth-oauth-block";

export default function SignInView() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("[v0] Sign in attempt:", { email, rememberMe });
	};

	return (
		<AuthLayout
			orbVariant="left-right"
			backLink={{ to: "/auth/signin", label: "Back to home" }}
			footer={<p className="text-sm text-muted-foreground">Secured by Microsoft 365 • Enterprise-grade encryption</p>}>
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Welcome back</h1>
				<p className="text-muted-foreground">Sign in to access your support dashboard</p>
			</div>

			<AuthOAuthBlock mode="signin" />

			<form onSubmit={handleSubmit} className="space-y-4">
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
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Password</Label>
						<Link to="/auth/recover" className="text-sm text-primary hover:text-primary/80 transition-colors">
							Forgot password?
						</Link>
					</div>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="pl-10"
							required
						/>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
					<Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
						Remember me for 30 days
					</Label>
				</div>

				<Button type="submit" className="w-full" size="lg">
					Sign in
				</Button>
			</form>

			<div className="mt-6 text-center text-sm">
				<span className="text-muted-foreground">Don't have an account? </span>
				<Link to="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
					Sign up for free
				</Link>
			</div>
		</AuthLayout>
	);
}
