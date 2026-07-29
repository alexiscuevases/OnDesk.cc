import type { IntegrationsDict } from "../en/integrations";

const integrations: IntegrationsDict = {
	hero: {
		eyebrow: "MARKETPLACE — REGISTRO DE CONECTORES",
		headline: { lead: "Conecta las herramientas", highlight: "que ya usas" },
		subhead: "Uses Gmail o Microsoft 365, Stripe o Salesforce, Pulse se conecta con tu stack en minutos.",
		cta: "Empieza gratis",
		stats: {
			partners: "SOCIOS DEL ECOSISTEMA",
			automations: "AUTOMATIZACIONES DE FLUJO",
			setup: "CONFIGURACIÓN NATIVA",
			reliability: "FIABILIDAD DE ENTREGA",
			setupValue: "< {count} MIN",
		},
	},

	protocol: {
		sectionLabel: "01 — PROTOCOLO",
		sectionRight: "CONECTAR → MAPEAR → EN VIVO",
		headline: { lead: "Despliega herramientas del Marketplace", highlight: "en minutos." },
		steps: {
			connect: {
				title: "Conecta en un clic",
				desc: "Autoriza la integración desde tu panel: en la mayoría de herramientas no necesitas a nadie de desarrollo.",
			},
			map: {
				title: "Mapea tus datos",
				desc: "Elige qué campos, canales o proyectos se sincronizan entre Pulse y tu herramienta.",
			},
			live: {
				title: "Actívalo al instante",
				desc: "Los eventos fluyen en tiempo real. Todo queda registrado y auditable desde el primer día.",
			},
		},
	},

	registry: {
		sectionLabel: "REGISTRO",
		sectionTitle: "Todos los conectores, indexados",
		sectionRight: "{connectors} CONECTORES / {categories} CATEGORÍAS",
		itemCount: "{count} ELEMENTOS",
		availableOnAllPlans: "✓ DISPONIBLE EN TODOS LOS PLANES",
	},

	badges: {
		native: "Nativo",
		beta: "Beta",
		enterprise: "Enterprise",
	},

	categories: {
		google: {
			name: "Google Workspace",
			description: "Soporte de primer nivel para equipos que viven en Google: sin complejidad, solo resultados.",
			items: {
				gmail: "Convierte los mensajes entrantes de Gmail en tickets automáticamente, con el hilo completo.",
				chat: "Recibe y responde tickets de soporte directamente en los espacios de Google Chat.",
				drive: "Adjunta archivos de Drive a los tickets y comparte artículos de la base de conocimiento al instante.",
				sso: "Inicio de sesión en un clic y gestión de usuarios con Google Identity.",
			},
		},
		microsoft: {
			name: "Microsoft 365",
			description: "Integraciones nativas de primer nivel creadas específicamente para M365, no añadidas a posteriori.",
			items: {
				teams: "Recibe y responde tickets directamente en los canales y chats de Teams.",
				outlook: "Convierte los correos entrantes en tickets automáticamente, con el hilo completo.",
				sharepoint: "Adjunta documentos de SharePoint a los tickets y enlaza artículos de la base de conocimiento.",
				azureAd: "SSO, sincronización de usuarios y asignación de roles mediante grupos de Azure AD.",
				copilot: "Muestra el contexto del ticket y las respuestas sugeridas dentro de Copilot.",
			},
		},
		communication: {
			name: "Comunicación",
			description: "Encuentra a tus clientes donde estén: cualquier canal se convierte en un ticket.",
			items: {
				slack: "Recibe alertas de tickets y gestiona escalaciones sin salir de Slack.",
				twilio: "Convierte mensajes de SMS y WhatsApp en tickets al instante.",
				zendesk: "Migra desde Zendesk o mantén ambos sistemas en paralelo.",
				intercom: "Sincroniza las conversaciones de chat en vivo con tu cola de tickets.",
			},
		},
		crm: {
			name: "CRM y ventas",
			description: "Conecta los datos de soporte con tus sistemas de ingresos para tener el contexto completo del cliente.",
			items: {
				salesforce: "Vincula tickets con cuentas, contactos y oportunidades en Salesforce.",
				hubspot: "Crea contactos en el CRM automáticamente a partir de quien envía el ticket.",
				dynamics: "Sincronización bidireccional con los registros de Microsoft Dynamics CRM.",
			},
		},
		commerce: {
			name: "E-commerce y pagos",
			description: "Lleva los datos de pedidos, el contexto de facturación y el estado de pago directamente a cada ticket.",
			items: {
				stripe: "Consulta el estado de la suscripción, el historial de pagos y las facturas dentro de cualquier ticket.",
				shopify: "Muestra el estado del pedido, el seguimiento y las devoluciones sin salir de Pulse.",
				paypal: "Consulta los detalles de la transacción y resuelve disputas de facturación más rápido.",
				woocommerce: "Conecta tu tienda WooCommerce y gestiona el soporte de pedidos en un solo lugar.",
			},
		},
		developer: {
			name: "Desarrollo y DevOps",
			description: "Une soporte e ingeniería para que los errores se arreglen, no se olviden.",
			items: {
				github: "Vincula tickets de errores con issues de GitHub y sigue el progreso de la resolución.",
				jira: "Escala tickets a épicas e historias de Jira con un clic.",
				pagerduty: "Lanza alertas de guardia desde tickets de alta prioridad.",
				webhook: "Envía eventos de tickets a cualquier endpoint en tiempo real.",
			},
		},
		ai: {
			name: "IA y automatización",
			description: "Amplía las capacidades de IA y conecta con miles de aplicaciones sin escribir código.",
			items: {
				azureOpenai: "Impulsa los agentes de IA con tu propio despliegue de Azure OpenAI para mantener la soberanía de los datos.",
				zapier: "Conecta Pulse con más de 6.000 aplicaciones mediante flujos de Zapier.",
				powerAutomate: "Dispara flujos de Microsoft Power Automate desde eventos de tickets.",
			},
		},
	},

	security: {
		title: "Conectividad de alto rendimiento para la empresa",
		desc: "Cada conexión del Marketplace usa protocolos de seguridad soberanos, cifrado TLS 1.3 y cargas firmadas con HMAC-SHA256.",
		cta: "Documentación de seguridad",
	},

	finalCta: {
		tag: "03 — CONSTRUYE · API GRAPHQL + SDK PARA DESARROLLO",
		headline: { lead: "Crea tu propio", highlight: "flujo." },
		desc: "Amplía Pulse con nuestra robusta API GraphQL y el SDK para desarrollo. Crea aplicaciones internas a medida o conecta sistemas heredados propios.",
		primary: "Solicita una integración",
		secondary: "Ver documentación de la API",
	},
};

export default integrations;
