import { LegalPage, type LegalSection } from "./legal-page";

const SECTIONS: LegalSection[] = [
	{
		id: "information-we-collect",
		title: "Information we collect",
		body: [
			"We collect information you provide directly to us, such as when you create an account, submit a support ticket, or contact us. This includes:",
			[
				"Account information: name, email address, company name, and password.",
				"Ticket content: messages, attachments, and metadata submitted through Pulse.",
				"Usage data: log files, IP addresses, browser type, pages viewed, and actions taken within the platform.",
				"Payment information: processed securely by Stripe; we do not store raw card numbers.",
			],
			"We also collect information automatically through cookies and similar technologies when you use our services.",
		],
	},
	{
		id: "how-we-use-your-information",
		title: "How we use your information",
		body: [
			"We use the information we collect to:",
			[
				"Provide, maintain, and improve Pulse.",
				"Process transactions and send related information, including confirmations and invoices.",
				"Send technical notices, updates, security alerts, and support messages.",
				"Respond to your comments and questions.",
				"Monitor and analyze trends, usage, and activities in connection with our services.",
				"Detect, investigate, and prevent fraudulent transactions and other illegal activities.",
				"Comply with legal obligations.",
			],
		],
	},
	{
		id: "data-sharing",
		title: "Data sharing",
		body: [
			"We do not sell your personal data. We may share your information with:",
			[
				"Service providers: third parties that perform services on our behalf (e.g., cloud hosting, payment processing, email delivery). These parties are bound by confidentiality obligations.",
				"Microsoft: where you choose to connect your Microsoft 365 tenant, data flows through Microsoft's infrastructure subject to Microsoft's privacy terms.",
				"Legal requirements: if required by law, court order, or governmental authority.",
				"Business transfers: in connection with a merger, acquisition, or sale of all or a portion of our assets.",
			],
		],
	},
	{
		id: "data-retention",
		title: "Data retention",
		body: [
			"We retain your personal data for as long as your account is active or as needed to provide services. Upon account deletion, we delete or anonymize your data within 90 days, except where we are required to retain it for legal or compliance purposes.",
			"Ticket data and conversation history may be retained for up to 7 years where audit log requirements apply. Extended retention is available on all plans; Enterprise plans include additional compliance-grade audit log exports.",
		],
	},
	{
		id: "security",
		title: "Security",
		body: [
			"We use industry-standard security measures including:",
			[
				"TLS 1.3 encryption for all data in transit.",
				"AES-256 encryption for data at rest.",
				"SOC 2 Type II certified infrastructure hosted on Microsoft Azure.",
				"Role-based access controls and audit logging.",
				"Regular third-party penetration testing.",
			],
			"No method of transmission over the Internet is 100% secure. We strive to protect your information but cannot guarantee absolute security.",
		],
	},
	{
		id: "your-rights",
		title: "Your rights",
		body: [
			"Depending on your location, you may have the right to:",
			[
				"Access the personal data we hold about you.",
				"Correct inaccurate or incomplete data.",
				"Request deletion of your personal data.",
				"Object to or restrict processing of your data.",
				"Data portability — receive a copy of your data in a structured, machine-readable format.",
				"Withdraw consent at any time where processing is based on consent.",
			],
			"To exercise these rights, contact us at privacy@pulse.cc. We will respond within 30 days.",
		],
	},
	{
		id: "cookies",
		title: "Cookies",
		body: [
			"We use cookies and similar tracking technologies to operate and improve our services. You can control cookies through your browser settings. Disabling cookies may limit certain features of Pulse.",
			"We use:",
			[
				"Strictly necessary cookies: required for core platform functionality.",
				"Analytics cookies: to understand how users interact with our service (e.g., Plausible Analytics, which is GDPR-compliant and cookie-free by default).",
				"Preference cookies: to remember your settings and preferences.",
			],
		],
	},
	{
		id: "international-transfers",
		title: "International transfers",
		body: [
			"Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.",
			"Data residency region selection (US, EU, or APAC) is available to customers on the Enterprise plan from within the platform settings.",
		],
	},
	{
		id: "contact",
		title: "Contact",
		body: [
			"If you have any questions about this Privacy Policy, please contact us:",
			[
				"Email: privacy@pulse.cc",
				"Post: Pulse Intelligence Ltd., Data Protection Office, 123 Innovation Way, London, EC2A 4NE, United Kingdom",
			],
			"For EU residents, our Data Protection Officer can be reached at dpo@pulse.cc.",
		],
	},
];

export default function PrivacyPage() {
	return (
		<LegalPage
			code="PRIVACY_POLICY / REV 2025.03.01"
			heading="Privacy"
			headingHighlight="Policy"
			lastUpdated="March 1, 2025"
			entity="OnDesk.cc Ltd."
			description="This Privacy Policy describes how Pulse Intelligence Ltd. collects, uses, and shares information about you when you use our services."
			secondaryLink={{ href: "/security", label: "Security overview" }}
			aside={{ title: "PRIVACY QUESTIONS?", desc: "Contact our Data Protection Officer.", email: "dpo@pulse.cc" }}
			sections={SECTIONS}
		/>
	);
}
