import { SiteLayout } from "./site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Phone, CheckCircle2, Clock, MapPin, Globe, Zap, Shield, Users, ArrowRight } from "lucide-react";
import { useState } from "react";

const CONTACT_OPTIONS = [
	{
		icon: MessageSquare,
		title: "Sales",
		desc: "Talk to our team about plans, pricing, or a custom demo.",
		detail: "sales@supportdesk365.com",
		badge: "Replies in < 4 hours",
		badgeStyle: "bg-success/10 text-success border-success/20",
	},
	{
		icon: Phone,
		title: "Enterprise",
		desc: "Custom contracts, data residency, and white-glove onboarding.",
		detail: "enterprise@supportdesk365.com",
		badge: "Dedicated team",
		badgeStyle: "bg-primary/10 text-primary border-primary/20",
	},
	{
		icon: Mail,
		title: "Press",
		desc: "Media inquiries, interviews, and press kit requests.",
		detail: "press@supportdesk365.com",
		badge: "Replies in < 24 hours",
		badgeStyle: "bg-muted text-muted-foreground border-border",
	},
];

const OFFICES = [
	{ city: "London", address: "Remote-first HQ · 14 countries" },
	{ city: "Seattle", address: "Engineering hub" },
];

const TRUST = [
	{ icon: Clock, text: "< 4h response for sales" },
	{ icon: Shield, text: "SOC 2 Type II certified" },
	{ icon: Users, text: "1,200+ customers worldwide" },
	{ icon: Zap, text: "99.97% uptime" },
];

export default function ContactPage() {
	const [submitted, setSubmitted] = useState(false);
	const [reason, setReason] = useState("");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitted(true);
	}

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center max-w-2xl">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Clock className="size-3.5" />
						Average response time: 4 business hours
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Get in touch</h1>
					<p className="text-xl text-muted-foreground leading-relaxed text-pretty">
						Whether you want to see a demo, talk pricing, or need help — we respond within one business day.
					</p>
				</div>
			</section>

			{/* Contact channels */}
			<section className="border-b border-border">
				<div className="container mx-auto px-4 py-10">
					<div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
						{CONTACT_OPTIONS.map(({ icon: Icon, title, desc, detail, badge, badgeStyle }) => (
							<div
								key={title}
								className="flex flex-col gap-3 p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
								<div className="flex items-start justify-between gap-2">
									<div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
										<Icon className="size-5 text-primary" />
									</div>
									<span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeStyle}`}>{badge}</span>
								</div>
								<div>
									<p className="font-semibold mb-0.5">{title}</p>
									<p className="text-sm text-muted-foreground leading-relaxed mb-2">{desc}</p>
									<p className="text-sm text-primary font-medium">{detail}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Form + sidebar */}
			<section className="container mx-auto px-4 py-20 md:py-28">
				<div className="max-w-5xl mx-auto grid md:grid-cols-[1.2fr_1fr] gap-14 items-start">
					{/* Left: form */}
					<div>
						{submitted ? (
							<div className="flex flex-col items-center justify-center text-center gap-5 py-16 px-8 rounded-2xl border border-border bg-card">
								<div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
									<CheckCircle2 className="size-8 text-primary" />
								</div>
								<div>
									<h2 className="text-2xl font-bold mb-2">Message received</h2>
									<p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
										Thanks for reaching out. Someone from our team will be in touch within one business day.
									</p>
								</div>
								<div className="flex flex-col sm:flex-row gap-3">
									<Button variant="outline" onClick={() => setSubmitted(false)}>
										Send another message
									</Button>
									<Button asChild>
										<a href="/help">
											Browse help center
											<ArrowRight className="ml-2 size-4" />
										</a>
									</Button>
								</div>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<h2 className="text-2xl font-bold mb-1">Send us a message</h2>
									<p className="text-sm text-muted-foreground">We read every submission and respond personally.</p>
								</div>

								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="first">First name</Label>
										<Input id="first" placeholder="Elena" required />
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="last">Last name</Label>
										<Input id="last" placeholder="Torres" required />
									</div>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="email">Work email</Label>
									<Input id="email" type="email" placeholder="elena@company.com" required />
								</div>

								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="company">Company</Label>
										<Input id="company" placeholder="Contoso Ltd." />
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="size">Team size</Label>
										<Select>
											<SelectTrigger id="size">
												<SelectValue placeholder="Select..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1-10">1–10 agents</SelectItem>
												<SelectItem value="11-50">11–50 agents</SelectItem>
												<SelectItem value="51-200">51–200 agents</SelectItem>
												<SelectItem value="200+">200+ agents</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="reason">Reason for contact</Label>
									<Select onValueChange={setReason}>
										<SelectTrigger id="reason">
											<SelectValue placeholder="Select a reason..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="demo">Request a demo</SelectItem>
											<SelectItem value="pricing">Pricing & plans</SelectItem>
											<SelectItem value="enterprise">Enterprise inquiry</SelectItem>
											<SelectItem value="support">Account support</SelectItem>
											<SelectItem value="press">Press inquiry</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="message">Message</Label>
									<Textarea
										id="message"
										placeholder={
											reason === "demo"
												? "Tell us about your team size, current tools, and what you want to see..."
												: "Tell us how we can help..."
										}
										rows={5}
										required
									/>
								</div>

								<Button type="submit" size="lg" className="w-full h-11 group">
									Send message
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</Button>

								<p className="text-xs text-muted-foreground text-center">
									By submitting you agree to our{" "}
									<a href="/privacy" className="underline hover:text-foreground transition-colors">
										Privacy Policy
									</a>
									. We never sell your data.
								</p>
							</form>
						)}
					</div>

					{/* Right: info */}
					<div className="space-y-5 md:pt-14">
						{/* Trust indicators */}
						<div className="grid grid-cols-2 gap-3">
							{TRUST.map(({ icon: Icon, text }) => (
								<div key={text} className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card">
									<div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
										<Icon className="size-4 text-primary" />
									</div>
									<p className="text-xs font-medium leading-tight">{text}</p>
								</div>
							))}
						</div>

						{/* Office locations */}
						<div className="p-5 rounded-xl border border-border bg-card">
							<h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
								<Globe className="size-4 text-primary" />
								Where we are
							</h3>
							<div className="space-y-3">
								{OFFICES.map(({ city, address }) => (
									<div key={city} className="flex items-start gap-2 text-sm">
										<MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
										<div>
											<p className="font-medium">{city}</p>
											<p className="text-muted-foreground text-xs">{address}</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Response time */}
						<div className="p-5 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground leading-relaxed">
							<strong className="text-foreground block mb-1">Response time</strong>
							Sales and enterprise inquiries: <strong className="text-foreground">{"< 4 business hours"}</strong>. General questions:{" "}
							<strong className="text-foreground">1 business day</strong>. Support issues: handled directly in-app.
						</div>

						{/* Help center link */}
						<div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-4">
							<div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
								<MessageSquare className="size-5 text-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-semibold mb-0.5">Looking for support?</p>
								<p className="text-xs text-muted-foreground">Check our Help Center for instant answers.</p>
							</div>
							<Button size="sm" variant="outline" asChild className="shrink-0">
								<a href="/help">
									Help Center
									<ArrowRight className="ml-1.5 size-3.5" />
								</a>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
