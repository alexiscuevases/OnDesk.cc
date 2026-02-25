import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const themes = [
	{ id: "system", label: "System", description: "Follows your OS preference" },
	{ id: "light", label: "Light", description: "Always use light mode" },
	{ id: "dark", label: "Dark", description: "Always use dark mode" },
] as const;

type ThemeId = (typeof themes)[number]["id"];

export function AppearanceSection() {
	const [theme, setTheme] = useState<ThemeId>("system");
	const [density, setDensity] = useState("comfortable");
	const [language, setLanguage] = useState("en");

	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Theme</CardTitle>
					<CardDescription className="text-xs">Choose how the interface looks for you</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-2">
						{themes.map((t) => (
							<button
								key={t.id}
								onClick={() => setTheme(t.id)}
								className={`flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all ${
									theme === t.id
										? "border-primary bg-primary/5 shadow-sm"
										: "border-border hover:border-primary/40 hover:bg-secondary/50"
								}`}>
								<div
									className={`h-8 w-full rounded-lg border ${
										t.id === "light"
											? "bg-white border-gray-200"
											: t.id === "dark"
											? "bg-gray-900 border-gray-700"
											: "bg-gradient-to-r from-white to-gray-900 border-gray-300"
									}`}
								/>
								<p className={`text-xs font-medium ${theme === t.id ? "text-primary" : "text-foreground"}`}>{t.label}</p>
								<p className="text-[10px] text-muted-foreground">{t.description}</p>
							</button>
						))}
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Display Preferences</CardTitle>
					<CardDescription className="text-xs">Adjust density and language for your workflow</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Interface Density</Label>
							<p className="text-[10px] text-muted-foreground">Control spacing and element sizing</p>
						</div>
						<Select value={density} onValueChange={setDensity}>
							<SelectTrigger className="h-7 text-xs w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="compact">Compact</SelectItem>
								<SelectItem value="comfortable">Comfortable</SelectItem>
								<SelectItem value="spacious">Spacious</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Language</Label>
							<p className="text-[10px] text-muted-foreground">Interface language for your account</p>
						</div>
						<Select value={language} onValueChange={setLanguage}>
							<SelectTrigger className="h-7 text-xs w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="es">Español</SelectItem>
								<SelectItem value="pt">Português</SelectItem>
								<SelectItem value="fr">Français</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
