import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

export function AccountSection() {
	const { user } = useAuth();
	const [email, setEmail] = useState(user?.email ?? "");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Email Address</CardTitle>
					<CardDescription className="text-xs">Your login email and where notifications are sent</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-1.5">
						<Label htmlFor="email" className="text-xs">Email</Label>
						<div className="flex gap-2">
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="h-8 text-xs flex-1"
							/>
							<Badge variant="secondary" className="text-[10px] h-8 px-2 rounded-md shrink-0">Verified</Badge>
						</div>
					</div>
					<div className="flex justify-end">
						<Button size="sm" className="h-7 text-xs">Update email</Button>
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Change Password</CardTitle>
					<CardDescription className="text-xs">Use a strong password to keep your account secure</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-1.5">
						<Label htmlFor="current-password" className="text-xs">Current Password</Label>
						<Input
							id="current-password"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className="h-8 text-xs"
							placeholder="••••••••"
						/>
					</div>
					<Separator />
					<div className="grid gap-1.5">
						<Label htmlFor="new-password" className="text-xs">New Password</Label>
						<Input
							id="new-password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="h-8 text-xs"
							placeholder="••••••••"
						/>
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="confirm-password" className="text-xs">Confirm New Password</Label>
						<Input
							id="confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="h-8 text-xs"
							placeholder="••••••••"
						/>
					</div>
					<div className="flex justify-end">
						<Button size="sm" className="h-7 text-xs">Update password</Button>
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm border-destructive/20">
				<CardHeader>
					<CardTitle className="text-sm font-semibold text-destructive">Danger Zone</CardTitle>
					<CardDescription className="text-xs">Irreversible actions for your account</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium">Delete Account</p>
							<p className="text-[10px] text-muted-foreground">Permanently remove your account and all data</p>
						</div>
						<Button variant="destructive" size="sm" className="h-7 text-xs">Delete account</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
