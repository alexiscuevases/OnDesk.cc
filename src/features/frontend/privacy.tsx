import { SiteLayout } from "./site-layout";

const SECTIONS = [
	{
		title: "Information we collect",
		body: `We collect information you provide directly to us, such as when you create an account, submit a support ticket, or contact us. This includes:
    
• Account information: name, email address, company name, and password.
• Ticket content: messages, attachments, and metadata submitted through SupportDesk 365.
• Usage data: log files, IP addresses, browser type, pages viewed, and actions taken within the platform.
• Payment information: processed securely by Stripe; we do not store raw card numbers.

We also collect information automatically through cookies and similar technologies when you use our services.`,
	},
	{
		title: "How we use your information",
		body: `We use the information we collect to:

• Provide, maintain, and improve SupportDesk 365.
• Process transactions and send related information, including confirmations and invoices.
• Send technical notices, updates, security alerts, and support messages.
• Respond to your comments and questions.
• Monitor and analyze trends, usage, and activities in connection with our services.
• Detect, investigate, and prevent fraudulent transactions and other illegal activities.
• Comply with legal obligations.`,
	},
	{
		title: "Data sharing",
		body: `We do not sell your personal data. We may share your information with:

• Service providers: third parties that perform services on our behalf (e.g., cloud hosting, payment processing, email delivery). These parties are bound by confidentiality obligations.
• Microsoft: where you choose to connect your Microsoft 365 tenant, data flows through Microsoft's infrastructure subject to Microsoft's privacy terms.
• Legal requirements: if required by law, court order, or governmental authority.
• Business transfers: in connection with a merger, acquisition, or sale of all or a portion of our assets.`,
	},
	{
		title: "Data retention",
		body: `We retain your personal data for as long as your account is active or as needed to provide services. Upon account deletion, we delete or anonymize your data within 90 days, except where we are required to retain it for legal or compliance purposes.

Ticket data and conversation history may be retained for up to 7 years for customers on Enterprise plans with audit log requirements.`,
	},
	{
		title: "Security",
		body: `We use industry-standard security measures including:

• TLS 1.3 encryption for all data in transit.
• AES-256 encryption for data at rest.
• SOC 2 Type II certified infrastructure hosted on Microsoft Azure.
• Role-based access controls and audit logging.
• Regular third-party penetration testing.

No method of transmission over the Internet is 100% secure. We strive to protect your information but cannot guarantee absolute security.`,
	},
	{
		title: "Your rights",
		body: `Depending on your location, you may have the right to:

• Access the personal data we hold about you.
• Correct inaccurate or incomplete data.
• Request deletion of your personal data.
• Object to or restrict processing of your data.
• Data portability — receive a copy of your data in a structured, machine-readable format.
• Withdraw consent at any time where processing is based on consent.

To exercise these rights, contact us at privacy@supportdesk365.com. We will respond within 30 days.`,
	},
	{
		title: "Cookies",
		body: `We use cookies and similar tracking technologies to operate and improve our services. You can control cookies through your browser settings. Disabling cookies may limit certain features of SupportDesk 365.

We use:
• Strictly necessary cookies: required for core platform functionality.
• Analytics cookies: to understand how users interact with our service (e.g., Plausible Analytics, which is GDPR-compliant and cookie-free by default).
• Preference cookies: to remember your settings and preferences.`,
	},
	{
		title: "International transfers",
		body: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.

Enterprise customers can select their data residency region (US, EU, or APAC) from within the platform settings.`,
	},
	{
		title: "Contact",
		body: `If you have any questions about this Privacy Policy, please contact us:

Email: privacy@supportdesk365.com
Post: SupportDesk 365, Data Protection Office, 123 Innovation Way, London, EC2A 4NE, United Kingdom

For EU residents, our Data Protection Officer can be reached at dpo@supportdesk365.com.`,
	},
];

export default function PrivacyPage() {
	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-24 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 max-w-3xl">
					<h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Privacy Policy</h1>
					<p className="text-muted-foreground">
						Last updated: <span className="font-medium text-foreground">February 1, 2025</span>
					</p>
					<p className="text-muted-foreground mt-3 leading-relaxed">
						This Privacy Policy describes how SupportDesk 365 Ltd. collects, uses, and shares information about you when you use our services.
					</p>
				</div>
			</section>

			{/* Body */}
			<section className="container mx-auto px-4 py-16 md:py-24">
				<div className="max-w-3xl mx-auto">
					{/* Table of contents */}
					<div className="mb-12 p-6 rounded-xl border border-border bg-muted/30">
						<p className="text-sm font-semibold mb-3">Table of contents</p>
						<ol className="space-y-1.5 list-decimal list-inside">
							{SECTIONS.map((s) => (
								<li key={s.title}>
									<a href={`#${s.title.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm text-primary hover:underline">
										{s.title}
									</a>
								</li>
							))}
						</ol>
					</div>

					{/* Sections */}
					<div className="space-y-12">
						{SECTIONS.map((s) => (
							<section key={s.title} id={s.title.toLowerCase().replace(/\s+/g, "-")}>
								<h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">{s.title}</h2>
								<div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</div>
							</section>
						))}
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
