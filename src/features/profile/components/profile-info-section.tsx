import { useState } from "react";
import { Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";

export function ProfileInfoSection() {
	const { user } = useAuth();
	const [name, setName] = useState(user?.name ?? "");
	const [bio, setBio] = useState("");

	const initials =
		user?.name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.slice(0, 2)
			.toUpperCase() ?? "??";

	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Profile Picture</CardTitle>
					<CardDescription className="text-xs">Your photo is visible to customers and teammates</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<div className="relative">
							<Avatar className="size-16 rounded-xl">
								<AvatarImage src={undefined} className="object-cover rounded-xl" />
								<AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-lg font-bold">
									{initials}
								</AvatarFallback>
							</Avatar>
							<button className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-background border shadow-sm hover:bg-secondary transition-colors">
								<Camera className="size-3 text-muted-foreground" />
							</button>
						</div>
						<div className="flex flex-col gap-1.5">
							<Button variant="outline" size="sm" className="h-7 text-xs">
								Upload photo
							</Button>
							<p className="text-[10px] text-muted-foreground">JPG, PNG or GIF · Max 2MB</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
					<CardDescription className="text-xs">Update your name and profile details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-1.5">
						<Label htmlFor="full-name" className="text-xs">Full Name</Label>
						<Input
							id="full-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-8 text-xs"
							placeholder="Your full name"
						/>
					</div>
					<Separator />
					<div className="grid gap-1.5">
						<Label htmlFor="bio" className="text-xs">Bio</Label>
						<textarea
							id="bio"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							rows={3}
							className="flex w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
							placeholder="A short description about you..."
						/>
					</div>
					<div className="flex justify-end">
						<Button size="sm" className="h-7 text-xs">Save changes</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
