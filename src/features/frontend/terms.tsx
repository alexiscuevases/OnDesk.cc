import { LegalPage, type LegalSection } from "./legal-page";

const SECTIONS: LegalSection[] = [
	{
		id: "acceptance-of-terms",
		title: "Acceptance of terms",
		body: [
			`By accessing or using Pulse (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.`,
			"These Terms apply to all visitors, users, and others who access or use the Service. By using the Service on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.",
		],
	},
	{
		id: "use-of-the-service",
		title: "Use of the service",
		body: [
			"You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to:",
			[
				"Use the Service in any way that violates any applicable law or regulation.",
				"Transmit any material that is abusive, harassing, tortious, defamatory, vulgar, or invasive of another's privacy.",
				"Attempt to gain unauthorized access to any portion of the Service or any systems connected to the Service.",
				"Use the Service to send unsolicited communications (spam).",
				"Reverse engineer, disassemble, or decompile any part of the Service.",
				"Resell, sublicense, or otherwise transfer your access to the Service to any third party without our prior written consent.",
			],
		],
	},
	{
		id: "accounts",
		title: "Accounts",
		body: [
			"You are responsible for safeguarding the password used to access the Service and for any activities or actions under your account. We encourage you to use a strong password and to enable multi-factor authentication.",
			"You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. We will not be liable for any loss or damage arising from your failure to comply with this obligation.",
		],
	},
	{
		id: "subscription-and-billing",
		title: "Subscription and billing",
		body: [
			"Certain features of the Service are available on a paid subscription basis. By subscribing, you authorize us to charge your payment method on a recurring basis.",
			"Fees are non-refundable except as required by law or as expressly provided in these Terms. We may change subscription fees at any time, but we will provide at least 30 days' notice before any increase takes effect.",
			"Your subscription may be billed on a per-agent or flat-rate basis depending on your selected plan. Please refer to the pricing page or your order confirmation for the billing model applicable to your account.",
			"If your payment fails, we may suspend access to the Service until payment is received. After 14 days of non-payment, we reserve the right to terminate your account.",
		],
	},
	{
		id: "intellectual-property",
		title: "Intellectual property",
		body: [
			`The Service and its original content, features, and functionality are and will remain the exclusive property of Pulse Intelligence Ltd. and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws.`,
			`You retain ownership of all content you submit, post, or display on or through the Service ("Customer Content"). By submitting Customer Content, you grant us a worldwide, non-exclusive, royalty-free license to use, process, and display such content solely to provide the Service.`,
		],
	},
	{
		id: "confidentiality",
		title: "Confidentiality",
		body: [
			"Each party agrees to keep confidential all non-public information of the other party that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information.",
			"This obligation does not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was known to the receiving party before disclosure; (c) is independently developed by the receiving party without use of the confidential information.",
		],
	},
	{
		id: "service-availability",
		title: "Service availability",
		body: [
			"We aim to provide 99.9% monthly uptime for the Service, as described in our Service Level Agreement. Scheduled maintenance windows are excluded from uptime calculations and will be communicated at least 48 hours in advance.",
			"In the event of a service outage, our status page (pulse.cc/status) will be updated in real time. Credits for downtime below the SLA threshold are available to customers on Starter, Professional, and Enterprise plans upon request.",
		],
	},
	{
		id: "data-processing",
		title: "Data processing",
		body: [
			`By using the Service, you authorize us to process Customer Content in accordance with our Privacy Policy and, where applicable, the Data Processing Agreement ("DPA") available to all customers. Enterprise customers may request an enhanced DPA with additional data residency and audit provisions.`,
			"For customers subject to the GDPR, we act as a Data Processor with respect to personal data contained in Customer Content. Our Privacy Policy describes how we handle such data.",
		],
	},
	{
		id: "disclaimer-of-warranties",
		title: "Disclaimer of warranties",
		body: [
			`THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
			"We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.",
		],
	},
	{
		id: "limitation-of-liability",
		title: "Limitation of liability",
		body: [
			"TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PULSE INTELLIGENCE LTD. BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES.",
			"OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED US DOLLARS ($100).",
		],
	},
	{
		id: "termination",
		title: "Termination",
		body: [
			"We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you breach these Terms.",
			"Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including intellectual property provisions, warranty disclaimers, and limitations of liability.",
			"You may terminate your account at any time by contacting us. Upon termination, we will provide a 30-day window to export your data before it is deleted.",
		],
	},
	{
		id: "changes-to-terms",
		title: "Changes to terms",
		body: [
			"We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through a prominent notice in the Service at least 30 days before the changes take effect.",
			"Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes.",
		],
	},
	{
		id: "governing-law",
		title: "Governing law",
		body: [
			"These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.",
			"Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
		],
	},
	{
		id: "contact",
		title: "Contact",
		body: [
			"If you have any questions about these Terms, please contact us at legal@pulse.cc or at:",
			["Pulse Intelligence Ltd.", "123 Innovation Way", "London, EC2A 4NE", "United Kingdom"],
		],
	},
];

export default function TermsPage() {
	return (
		<LegalPage
			code="TERMS_OF_SERVICE / REV 2025.03.01"
			heading="Terms of"
			headingHighlight="Service"
			lastUpdated="March 1, 2025"
			entity="Pulse Intelligence Ltd."
			description="Please read these Terms of Service carefully before using Pulse. These Terms constitute a legally binding agreement between you and Pulse Intelligence Ltd."
			secondaryLink={{ href: "/privacy", label: "Privacy Policy" }}
			aside={{ title: "LEGAL QUESTIONS?", desc: "Contact our legal team directly.", email: "legal@pulse.cc" }}
			sections={SECTIONS}
		/>
	);
}
