import { useState } from "react";
import { User, KeyRound, Palette, ShieldCheck, Bell, ChevronRight } from "lucide-react";
import { PageHeader } from "@/shared/components/console";
import { ProfileInfoSection } from "./profile-info-section";
import { AccountSection } from "./account-section";
import { AppearanceSection } from "./appearance-section";
import { ProfileSecuritySection } from "./profile-security-section";
import { ProfileNotificationsSection } from "./profile-notifications-section";

type ProfileSection = "profile" | "account" | "appearance" | "security" | "notifications";

const sections: { id: ProfileSection; label: string; icon: typeof User; desc: string }[] = [
	{ id: "profile", label: "Profile", icon: User, desc: "Your name, photo and bio" },
	{ id: "account", label: "Account", icon: KeyRound, desc: "Email, password and danger zone" },
	{ id: "appearance", label: "Appearance", icon: Palette, desc: "Theme, density and language" },
	{ id: "notifications", label: "Notifications", icon: Bell, desc: "Email and push preferences" },
	{ id: "security", label: "Security", icon: ShieldCheck, desc: "2FA and active sessions" },
];

export function ProfileView() {
	const [activeSection, setActiveSection] = useState<ProfileSection>("profile");

	return (
		<div className="flex flex-col gap-6">
			<PageHeader tag="08 — Profile" title="Account Settings" description="Manage your profile and personal preferences" />

			<div className="grid gap-6 lg:grid-cols-4">
				<div className="lg:col-span-1">
					<nav className="flex flex-col border border-border bg-card divide-y divide-border">
						{sections.map((section) => {
							const Icon = section.icon;
							const isActive = activeSection === section.id;
							return (
								<button
									key={section.id}
									onClick={() => setActiveSection(section.id)}
									className={`relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
										isActive
											? "bg-primary text-primary-foreground dark:bg-secondary dark:text-foreground"
											: "hover:bg-secondary/60 text-foreground"
									}`}>
									{isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent" />}
									<Icon className={`size-4 shrink-0 ${isActive ? "" : "text-muted-foreground"}`} />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">{section.label}</p>
										<p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/70 dark:text-muted-foreground" : "text-muted-foreground"}`}>
											{section.desc}
										</p>
									</div>
									<ChevronRight className={`size-3.5 shrink-0 ${isActive ? "text-primary-foreground/60 dark:text-accent" : "text-muted-foreground/40"}`} />
								</button>
							);
						})}
					</nav>
				</div>

				<div className="lg:col-span-3">
					{activeSection === "profile" && <ProfileInfoSection />}
					{activeSection === "account" && <AccountSection />}
					{activeSection === "appearance" && <AppearanceSection />}
					{activeSection === "notifications" && <ProfileNotificationsSection />}
					{activeSection === "security" && <ProfileSecuritySection />}
				</div>
			</div>
		</div>
	);
}
