import type { HelpDict } from "../en/help";

const help: HelpDict = {
	hero: {
		eyebrow: "BASE_CONOCIMIENTO — MÁS DE 350 ARTÍCULOS INDEXADOS",
		headline: { lead: "¿Cómo podemos", highlight: "ayudarte?" },
		subhead: "Encuentra respuestas, consulta guías o escríbenos: estamos aquí para cualquier tipo de usuario de Pulse.",
		queryLabel: "CONSULTA",
		docsIndexed: "{count}+ DOCS INDEXADOS",
		searchPlaceholder: "Busca en el índice...",
		noResults: "Ningún artículo coincide.",
		contactSupport: "Contactar con soporte",
		stats: {
			response: { value: "< 1 H", label: "TIEMPO MEDIO DE RESPUESTA" },
			satisfaction: { value: "98%", label: "ÍNDICE DE SATISFACCIÓN" },
			articles: { value: "350+", label: "ARTÍCULOS PUBLICADOS" },
		},
	},

	popularQueries: [
		"Restablecer contraseña",
		"Conectar Gmail",
		"Dominio de correo propio",
		"Exportar tickets a CSV",
		"Doble factor",
		"Alerta de incumplimiento de SLA",
	],

	quickAccess: {
		sectionLabel: "01 — ACCESO RÁPIDO",
		sectionRight: "ATAJOS",
		links: {
			video: { label: "Tutoriales en vídeo", description: "Más de 25 recorridos" },
			api: { label: "Referencia de la API", description: "Docs de REST y webhooks" },
			releases: { label: "Notas de versión", description: "Qué cambió y por qué" },
			community: { label: "Foro de la comunidad", description: "Pregunta a otros usuarios" },
		},
	},

	index: {
		sectionLabel: "ÍNDICE",
		sectionTitle: "Explora por categoría",
		sectionRight: "{count} CATEGORÍAS / MÁS DE 350 DOCS",
		docsCount: "{count} DOCS",
		popularBadge: "POPULAR",
		viewAll: "Ver los {count} artículos",
	},

	categories: {
		gettingStarted: {
			label: "Primeros pasos",
			description: "Configura tu espacio de trabajo, invita a tu equipo y conecta tus canales.",
			articles: {
				account: "Crear tu cuenta de Pulse",
				channel: "Conectar tu primer canal",
				team: "Invitar a tu equipo y asignar roles",
				import: "Importar tickets existentes desde Zendesk / Freshdesk",
			},
		},
		aiCore: {
			label: "Pulse AI Core",
			description: "Despliegue y ajuste fino de agentes de resolución autónoma.",
			articles: {
				triage: "Cómo clasifican los agentes de IA los tickets entrantes",
				escalation: "Configurar reglas de escalación",
				training: "Entrenar la IA con tu base de conocimiento",
				review: "Revisar y editar las respuestas redactadas por la IA",
			},
		},
		automations: {
			label: "Automatizaciones y SLA",
			description: "Flujos de trabajo, políticas de SLA y reglas de enrutamiento.",
			articles: {
				sla: "Crear tu primera política de SLA",
				triggers: "Crear reglas de automatización con disparadores",
				routing: "Configurar el enrutamiento por competencias",
				reference: "Referencia de reglas de automatización",
			},
		},
		teams: {
			label: "Equipos y roles",
			description: "Permisos, turnos y gestión de la carga de trabajo.",
			articles: {
				rbac: "Entender el control de acceso basado en roles",
				heatmaps: "Configurar mapas de calor de carga del equipo",
				shifts: "Configurar horarios de turnos",
				supervisor: "Paneles de supervisión y monitorización en vivo",
			},
		},
		analytics: {
			label: "Analítica e informes",
			description: "CSAT, NPS, tendencias de volumen y exportaciones.",
			articles: {
				csat: "Entender tu panel de CSAT",
				export: "Exportar informes a Excel / Power BI",
				forecast: "Configurar alertas de previsión de volumen",
				performance: "Guía del informe de rendimiento de agentes",
			},
		},
		billing: {
			label: "Facturación y planes",
			description: "Suscripciones, facturas y gestión de licencias.",
			articles: {
				plan: "Subir o bajar de plan",
				seats: "Gestionar licencias y añadir usuarios",
				invoices: "Descargar facturas",
				cycle: "Facturación anual frente a mensual",
			},
		},
	},

	finalCta: {
		tag: "03 — ESCALAR · SOPORTE HUMANO",
		headline: { lead: "Habla con una", highlight: "persona." },
		desc: "Nuestro equipo de soporte suele responder en menos de 2 horas en días laborables.",
		primary: "Contactar con soporte",
		secondary: "Ver el estado del sistema",
	},
};

export default help;
