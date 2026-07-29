// Security page. Certification names (SOC 2, GDPR, HIPAA …) are standards and
// stay untranslated; issuing bodies, descriptions and badge labels localize.

const security = {
	hero: {
		eyebrow: "SECURITY_DOSSIER — SOC 2 / GDPR / HIPAA",
		headline: { lead: "Security you can", highlight: "stake your reputation", trail: "on" },
		subhead:
			"Built for everyone — from solo operators to global enterprises. Every layer is designed to protect your customers' data, with controls that scale to your needs.",
		ctaPrimary: "Request security review",
		ctaSecondary: "Contact security team",
		stats: {
			uptime: "UPTIME SLA",
			encryption: { value: "AES-256", label: "ENCRYPTION AT REST" },
			breaches: "DATA BREACHES TO DATE",
			regions: "DATA RESIDENCY REGIONS",
		},
	},

	compliance: {
		sectionLabel: "COMPLIANCE",
		sectionTitle: "Certifications & compliance",
		sectionRight: "INDEPENDENTLY AUDITED",
		intro: "Independently verified by third-party auditors. Full audit reports available to Enterprise customers under NDA.",
		badges: {
			certified: "CERTIFIED",
			compliant: "COMPLIANT",
			inProgress: "IN PROGRESS",
			baaAvailable: "BAA AVAILABLE",
			verified: "VERIFIED",
		},
		items: {
			soc2: {
				body: "AICPA",
				description:
					"Independently audited annually. Covers security, availability, processing integrity, confidentiality, and privacy.",
			},
			gdpr: {
				body: "EU Regulation 2016/679",
				description:
					"Full compliance with EU data protection regulation. DPA available for all customers. EU data residency included in Enterprise.",
			},
			ccpa: {
				body: "California Consumer Privacy Act",
				description: "Data subject rights fully supported. Deletion, export, and opt-out requests handled within 72 hours.",
			},
			iso27001: {
				body: "In progress — Q3 2025",
				description: "Information security management system audit underway. Expected certification Q3 2025.",
			},
			hipaa: {
				body: "US Healthcare",
				description:
					"BAA available for healthcare customers. Audit logging, data encryption at rest and in transit, and strict access controls.",
			},
			microsoft: {
				body: "Microsoft Partner Network",
				description: "Verified Azure Marketplace app. Reviewed and approved by Microsoft security teams.",
			},
		},
	},

	infrastructure: {
		sectionLabel: "02 — INFRASTRUCTURE",
		sectionRight: "DEFENSE IN DEPTH",
		headline: { lead: "Every layer,", highlight: "hardened." },
		subhead: "Built on Azure with defense-in-depth. Independently audited.",
		items: {
			hosting: {
				title: "Multi-region hosting",
				desc: "Deployed on Azure across US (East/West), EU (West Europe), and APAC (Southeast Asia). Data residency region selection is available on the Enterprise plan.",
			},
			encryption: {
				title: "Encryption at rest & in transit",
				desc: "All data encrypted at rest with AES-256. All data in transit encrypted with TLS 1.3. Encryption keys managed in Azure Key Vault with automatic rotation.",
			},
			uptime: {
				title: "99.97% uptime SLA",
				desc: "Contractual uptime guarantee backed by real-time monitoring. Automatic failover across availability zones. Status page updates within 5 minutes of any incident.",
			},
			cmek: {
				title: "Customer-managed encryption keys",
				desc: "Enterprise customers can supply their own encryption keys via Azure Key Vault BYOK. We never have access to unencrypted customer data with CMEK enabled.",
			},
			audit: {
				title: "Full audit logging",
				desc: "Every action — ticket view, status change, export, config update — is logged with timestamp, user, IP, and user-agent. Logs retained for 7 years by default.",
			},
			pentest: {
				title: "Penetration testing",
				desc: "Annual third-party penetration tests conducted by an independent security firm. Results and remediation timelines shared with Enterprise customers on request.",
			},
		},
	},

	accessAndData: {
		sectionLabel: "03 — ACCESS & DATA",
		sectionRight: "YOUR DATA BELONGS TO YOU",
		accessTitle: "Access controls",
		accessIntro: "Granular controls so the right people have access to exactly what they need — and nothing more.",
		accessControls: [
			"Role-based access control (RBAC) with custom permission sets",
			"Microsoft 365 SSO and SAML 2.0 on Professional and Enterprise",
			"Mandatory MFA enforcement at the organization level",
			"IP allowlisting for agent access",
			"Session timeout and device trust policies",
			"Least-privilege API token scopes",
			"Automated anomalous login detection and alerting",
			"Offboarding automation — deprovisioning in under 60 seconds",
		] as string[],
		dataTitle: "Data handling",
		dataIntro: "Your data belongs to you. Full stop.",
		dataHandling: {
			residency: {
				title: "Data residency",
				desc: "Enterprise plan customers can choose their data residency region: United States, European Union, or Asia-Pacific. Data never crosses regions without explicit consent.",
			},
			retention: {
				title: "Data retention",
				desc: "Configure custom retention periods per ticket type. Automatic deletion workflows run nightly. Customers can trigger immediate deletion via API.",
			},
			portability: {
				title: "Data portability",
				desc: "Export your full data archive at any time in JSON or CSV format. On account termination, data export window stays open for 90 days.",
			},
			subprocessors: {
				title: "Subprocessors",
				desc: "Full list of subprocessors published and kept up to date. 30-day advance notice for any new subprocessor. Opt-out available for Enterprise customers.",
			},
		},
	},

	disclosure: {
		sectionLabel: "04 — DISCLOSURE",
		sectionRight: "GOOD-FAITH RESEARCH WELCOME",
		title: "Responsible disclosure",
		intro:
			"We take every security report seriously. If you believe you have found a vulnerability in Pulse, please contact us before disclosing publicly.",
		steps: [
			"Report a vulnerability to security@pulse.cc",
			"We acknowledge receipt within 24 hours",
			"We assess severity and begin remediation within 72 hours for critical issues",
			"We credit researchers in our Hall of Fame upon fix publication",
			"We do not pursue legal action against good-faith researchers",
		] as string[],
		ctaPrimary: "Report a vulnerability",
		ctaSecondary: "Talk to our security team",
	},

	finalCta: {
		tag: "05 — REVIEW · DPA / AUDIT REPORTS / NDA",
		headline: { lead: "Security review for your", highlight: "team." },
		desc: "Need a custom security review, DPA, or audit report? Our security team is here to help — solo operator to global enterprise.",
		primary: "Request a review",
		secondary: "View status page",
	},
};

export type SecurityDict = typeof security;
export default security;
