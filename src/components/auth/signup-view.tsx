import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Headset, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

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
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 opacity-[0.02]">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
						backgroundSize: "64px 64px",
					}}
				/>
			</div>

			{/* Gradient orbs */}
			<div className="absolute top-20 right-20 size-96 bg-primary/20 rounded-full blur-[128px] opacity-30" />
			<div className="absolute bottom-20 left-20 size-96 bg-primary/10 rounded-full blur-[128px] opacity-30" />

			{/* Back to sign in */}
			<Link
				to="/auth/signin"
				className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
				<ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
				Back to sign in
			</Link>

			{/* Sign up card */}
			<div className="relative w-full max-w-md">
				<div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-primary/5">
					{/* Logo */}
					<div className="flex items-center justify-center gap-2 mb-8">
						<div className="size-10 rounded-xl bg-primary flex items-center justify-center">
							<Headset className="size-6 text-primary-foreground" />
						</div>
						<div className="flex flex-col items-start">
							<span className="text-xl font-bold leading-none">SupportDesk</span>
							<span className="text-[10px] text-muted-foreground leading-none">Microsoft 365</span>
						</div>
					</div>

					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold mb-2">Start your free trial</h1>
						<p className="text-muted-foreground">14 days free. No credit card required.</p>
					</div>

					{/* Microsoft SSO first */}
					<div className="space-y-3 mb-6">
						<Button variant="outline" className="w-full" type="button">
							<svg className="size-5 mr-2" viewBox="0 0 23 23" fill="none">
								<path fill="#f3f3f3" d="M0 0h23v23H0z" />
								<path fill="#f35325" d="M1 1h10v10H1z" />
								<path fill="#81bc06" d="M12 1h10v10H12z" />
								<path fill="#05a6f0" d="M1 12h10v10H1z" />
								<path fill="#ffba08" d="M12 12h10v10H12z" />
							</svg>
							Sign up with Microsoft 365
						</Button>
						<Button variant="outline" className="w-full" type="button">
							<svg className="size-5 mr-2" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Sign up with Google
						</Button>
					</div>

					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-card text-muted-foreground">Or sign up with email</span>
						</div>
					</div>

					{/* Sign up form */}
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
							<Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)} required />
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

					{/* Sign in link */}
					<div className="mt-6 text-center text-sm">
						<span className="text-muted-foreground">Already have an account? </span>
						<Link to="/auth/signin" className="text-primary hover:text-primary/80 font-medium transition-colors">
							Sign in
						</Link>
					</div>
				</div>

				{/* Trust indicators */}
				<div className="mt-8 text-center space-y-2">
					<p className="text-sm text-muted-foreground">Join 50,000+ teams delivering exceptional support</p>
					<p className="text-xs text-muted-foreground">Secured by Microsoft 365 • Enterprise-grade encryption</p>
				</div>
			</div>
		</div>
	);
}
