// Integrations registry. Connector names (Gmail, Stripe, Jira …) are product
// names and stay in the component, as do their emoji logos and badge *ids*.
// Only category names, descriptions and badge labels are localized.

const integrations = {
	hero: {
		eyebrow: "MARKETPLACE — CONNECTOR REGISTRY",
		headline: { lead: "Connect the tools", highlight: "you already use" },
		subhead: "Whether you use Gmail or Microsoft 365, Stripe or Salesforce — Pulse connects to your stack in minutes.",
		cta: "Get started free",
		stats: {
			partners: "ECOSYSTEM PARTNERS",
			automations: "WORKFLOW AUTOMATIONS",
			setup: "NATIVE SETUP",
			reliability: "DELIVERY RELIABILITY",
			setupValue: "< {count} MIN",
		},
	},

	protocol: {
		sectionLabel: "01 — PROTOCOL",
		sectionRight: "CONNECT → MAP → LIVE",
		headline: { lead: "Deploy Marketplace tools", highlight: "in minutes." },
		steps: {
			connect: {
				title: "Connect in one click",
				desc: "Authorize the integration from your dashboard — no developer required for most tools.",
			},
			map: { title: "Map your data", desc: "Choose which fields, channels, or projects sync between Pulse and your tool." },
			live: { title: "Go live instantly", desc: "Events flow in real time. Everything is logged and auditable from day one." },
		},
	},

	registry: {
		sectionLabel: "REGISTRY",
		sectionTitle: "Every connector, indexed",
		sectionRight: "{connectors} CONNECTORS / {categories} CATEGORIES",
		itemCount: "{count} ITEMS",
		availableOnAllPlans: "✓ AVAILABLE ON ALL PLANS",
	},

	badges: {
		native: "Native",
		beta: "Beta",
		enterprise: "Enterprise",
	},

	categories: {
		google: {
			name: "Google Workspace",
			description: "First-class support for teams that live in Google — no complexity, just results.",
			items: {
				gmail: "Convert inbound Gmail messages into tickets automatically with full threading.",
				chat: "Receive and reply to support tickets directly inside Google Chat spaces.",
				drive: "Attach Drive files to tickets and share KB articles instantly.",
				sso: "One-click sign-in and user management via Google Identity.",
			},
		},
		microsoft: {
			name: "Microsoft 365",
			description: "First-class, native integrations built specifically for M365 — not bolted-on.",
			items: {
				teams: "Receive and reply to tickets directly inside Teams channels and chats.",
				outlook: "Convert inbound emails into tickets automatically with full threading.",
				sharepoint: "Attach SharePoint documents to tickets and link KB articles.",
				azureAd: "SSO, user sync, and role mapping via Azure AD groups.",
				copilot: "Surface ticket context and suggested replies inside Copilot.",
			},
		},
		communication: {
			name: "Communication",
			description: "Meet your customers where they are — any channel becomes a ticket.",
			items: {
				slack: "Get ticket alerts and manage escalations without leaving Slack.",
				twilio: "Turn SMS and WhatsApp messages into tickets instantly.",
				zendesk: "Migrate from Zendesk or run both systems side-by-side.",
				intercom: "Sync live chat conversations to your ticket queue.",
			},
		},
		crm: {
			name: "CRM & Sales",
			description: "Connect support data to your revenue systems for full customer context.",
			items: {
				salesforce: "Link tickets to accounts, contacts, and opportunities in Salesforce.",
				hubspot: "Create CRM contacts automatically from ticket submitters.",
				dynamics: "Bi-directional sync with Microsoft Dynamics CRM records.",
			},
		},
		commerce: {
			name: "E-commerce & Payments",
			description: "Bring order data, billing context, and payment status directly into every ticket.",
			items: {
				stripe: "See subscription status, payment history, and invoices inside any ticket.",
				shopify: "Surface order status, tracking, and returns without leaving Pulse.",
				paypal: "View transaction details and resolve billing disputes faster.",
				woocommerce: "Connect your WooCommerce store and handle order support in one place.",
			},
		},
		developer: {
			name: "Developer & DevOps",
			description: "Bridge support and engineering so bugs get fixed, not forgotten.",
			items: {
				github: "Link bug tickets to GitHub issues and track resolution progress.",
				jira: "Escalate tickets to Jira epics and stories with one click.",
				pagerduty: "Trigger on-call alerts from high-priority tickets.",
				webhook: "Send ticket events to any endpoint in real time.",
			},
		},
		ai: {
			name: "AI & Automation",
			description: "Extend AI capabilities and connect to thousands of apps with no code.",
			items: {
				azureOpenai: "Power AI agents with your own Azure OpenAI deployment for data sovereignty.",
				zapier: "Connect Pulse to 6,000+ apps via Zapier workflows.",
				powerAutomate: "Trigger Microsoft Power Automate flows from ticket events.",
			},
		},
	},

	security: {
		title: "High-performance connectivity for the Enterprise",
		desc: "Every Marketplace connection leverages sovereign security protocols, TLS 1.3 encryption, and signed HMAC-SHA256 payloads.",
		cta: "Security docs",
	},

	finalCta: {
		tag: "03 — BUILD · GRAPHQL API + DEVELOPER SDK",
		headline: { lead: "Build your own", highlight: "flow." },
		desc: "Extend Pulse with our robust GraphQL API and developer SDK. Build custom internal apps or connect proprietary legacy systems.",
		primary: "Request an integration",
		secondary: "View API docs",
	},
};

export type IntegrationsDict = typeof integrations;
export default integrations;
