import { SiteLayout } from "./site-layout";

const SECTIONS = [
	{
		title: "Acceptance of terms",
		body: `By accessing or using SupportDesk 365 (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.

These Terms apply to all visitors, users, and others who access or use the Service. By using the Service on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.`,
	},
	{
		title: "Use of the service",
		body: `You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to:

• Use the Service in any way that violates any applicable law or regulation.
• Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, or invasive of another's privacy.
• Attempt to gain unauthorized access to any portion of the Service or any systems connected to the Service.
• Use the Service to send unsolicited communications (spam).
• Reverse engineer, disassemble, or decompile any part of the Service.
• Resell, sublicense, or otherwise transfer your access to the Service to any third party without our prior written consent.`,
	},
	{
		title: "Accounts",
		body: `You are responsible for safeguarding the password used to access the Service and for any activities or actions under your account. We encourage you to use a strong password and to enable multi-factor authentication.

You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. We will not be liable for any loss or damage arising from your failure to comply with this obligation.`,
	},
	{
		title: "Subscription and billing",
		body: `Certain features of the Service are available on a paid subscription basis. By subscribing, you authorize us to charge your payment method on a recurring basis.

Fees are non-refundable except as required by law or as expressly provided in these Terms. We may change subscription fees at any time, but we will provide at least 30 days' notice before any increase takes effect.

If your payment fails, we may suspend access to the Service until payment is received. After 14 days of non-payment, we reserve the right to terminate your account.`,
	},
	{
		title: "Intellectual property",
		body: `The Service and its original content, features, and functionality are and will remain the exclusive property of SupportDesk 365 Ltd. and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws.

You retain ownership of all content you submit, post, or display on or through the Service ("Customer Content"). By submitting Customer Content, you grant us a worldwide, non-exclusive, royalty-free license to use, process, and display such content solely to provide the Service.`,
	},
	{
		title: "Confidentiality",
		body: `Each party agrees to keep confidential all non-public information of the other party that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information.

This obligation does not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was known to the receiving party before disclosure; (c) is independently developed by the receiving party without use of the confidential information.`,
	},
	{
		title: "Service availability",
		body: `We aim to provide 99.9% monthly uptime for the Service, as described in our Service Level Agreement. Scheduled maintenance windows are excluded from uptime calculations and will be communicated at least 48 hours in advance.

In the event of a service outage, our status page (status.supportdesk365.com) will be updated in real time. Credits for downtime below the SLA threshold are available to customers on Professional and Enterprise plans upon request.`,
	},
	{
		title: "Data processing",
		body: `By using the Service, you authorize us to process Customer Content in accordance with our Privacy Policy and, where applicable, the Data Processing Agreement ("DPA") available to Enterprise customers.

For customers subject to the GDPR, we act as a Data Processor with respect to personal data contained in Customer Content. Our Privacy Policy describes how we handle such data.`,
	},
	{
		title: "Disclaimer of warranties",
		body: `THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.`,
	},
	{
		title: "Limitation of liability",
		body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SUPPORTDESK 365 LTD. BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES.

OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED US DOLLARS ($100).`,
	},
	{
		title: "Termination",
		body: `We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you breach these Terms.

Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including intellectual property provisions, warranty disclaimers, and limitations of liability.

You may terminate your account at any time by contacting us. Upon termination, we will provide a 30-day window to export your data before it is deleted.`,
	},
	{
		title: "Changes to terms",
		body: `We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through a prominent notice in the Service at least 30 days before the changes take effect.

Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes.`,
	},
	{
		title: "Governing law",
		body: `These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.

Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
	},
	{
		title: "Contact",
		body: `If you have any questions about these Terms, please contact us at legal@supportdesk365.com or at:

SupportDesk 365 Ltd.
123 Innovation Way
London, EC2A 4NE
United Kingdom`,
	},
];

export default function TermsPage() {
	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-24 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 max-w-3xl">
					<h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Terms of Service</h1>
					<p className="text-muted-foreground">
						Last updated: <span className="font-medium text-foreground">February 1, 2025</span>
					</p>
					<p className="text-muted-foreground mt-3 leading-relaxed">
						Please read these Terms of Service carefully before using SupportDesk 365. These Terms constitute a legally binding agreement between
						you and SupportDesk 365 Ltd.
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
