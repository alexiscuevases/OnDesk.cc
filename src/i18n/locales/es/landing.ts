import type { LandingDict } from "../en/landing";

// Note on the hero: the English pun ("never skips a beat") maps onto the same
// heartbeat metaphor in Spanish — "no pierde el ritmo" — so the highlighted
// word is the verb rather than the English position.
//
// Job titles use common-gender noun phrases ("Consultoría independiente")
// instead of gendered ones, so the fictional customer quotes don't assign a
// gender the source copy never stated.

const landing: LandingDict = {
	hero: {
		eyebrow: "EN VIVO — SISTEMA OPERATIVO DE SOPORTE CON IA",
		headline: {
			lead: "Soporte que no",
			highlight: "pierde",
			trail: "el ritmo.",
		},
		seeHow: "Ver cómo funciona",
		ctaPrimary: "Empieza gratis — 14 días",
		ctaSecondary: "Ver precios",
	},

	personas: {
		supportTeams: {
			label: "Equipos de soporte",
			desc: "Gestiona colas de alto volumen con automatización, enrutamiento y analítica en tiempo real.",
		},
		agencies: {
			label: "Agencias",
			desc: "Lleva el soporte de varios clientes desde un único espacio de trabajo ordenado.",
		},
		solo: {
			label: "Autónomos y equipos pequeños",
			desc: "Mantén cada solicitud ordenada, sin complicaciones. Listo en minutos.",
		},
	},

	console: {
		feed: "PULSE://LIVE_FEED",
		rec: "REC",
		statusResolving: "⚡ IA RESOLVIENDO",
		statusResolved: "✓ RESUELTO",
		statusOpen: "○ ABIERTO",
		latency: "LATENCIA 0,3S",
		aiResolved: "RESUELTO POR IA 68%",
		uptime: "DISPONIBILIDAD 99,99%",
		agentAi: "Agente IA",
		agentUnassigned: "Sin asignar",
		priority: {
			high: "alta",
			medium: "media",
			low: "baja",
		},
		tickets: {
			invoice: "No recibí la factura después del pago",
			onboarding: "Ayuda con la incorporación — Acme Inc.",
			darkMode: "Sugerencia: modo oscuro",
			dashboard: "No puedo acceder al panel de mi cuenta",
			refund: "Solicitud de reembolso — pedido #8812",
			passwordReset: "No llega el correo para restablecer la contraseña",
			siteDown: "Urgente: el sitio del cliente no responde",
		},
		time: {
			now: "ahora",
		},
	},

	ticker: [
		"CONTOSO ▲ 70% MÁS RÁPIDO AL RESOLVER",
		"FABRIKAM ▲ 8 CLIENTES · UNA BANDEJA",
		"NORTHWIND ▲ 12K TICKETS / MES",
		"TAILWIND ▲ 96% CSAT",
		"LITWARE ▲ LISTO EN 5 MIN",
		"WINGTIP ▲ 99,99% DISPONIBILIDAD",
		"PROSEWARE ▲ 41% AUTORRESUELTO",
		"ADVENTURE WORKS ▲ COBERTURA 24/7",
	],

	stats: {
		fasterResolution: { label: "MÁS RÁPIDO AL RESOLVER", sub: "frente a un helpdesk tradicional" },
		ticketsPerMonth: { label: "TICKETS / MES", sub: "gestionados entre todos los espacios" },
		satisfaction: { label: "SATISFACCIÓN DEL CLIENTE", sub: "puntuación CSAT media" },
		scale: { label: "DE AUTÓNOMO A EMPRESA", sub: "escala con tu equipo" },
	},

	bento: {
		sectionLabel: "PLATAFORMA",
		sectionTitle: "Diseñado para cómo trabajas de verdad",
		sectionRight: "4 MÓDULOS / 1 SISTEMA",
		intro: "Cuatro módulos, un mismo pulso. Todo lo que tu operación de soporte necesita — y nada de lo que no.",
		unification: {
			label: "Unificación",
			title: "Todos tus canales, en un solo lugar",
			description:
				"Correo, chat, widgets web — todo llega a una sola bandeja. Sin saltar entre pestañas, sin mensajes perdidos.",
			bullets: ["Bandeja unificada para cada canal", "Sincronización multiorigen", "La misma experiencia en todas partes"],
		},
		automation: {
			label: "Automatización",
			title: "Clasifica, enruta y resuelve automáticamente",
			description:
				"La IA clasifica los tickets entrantes, los envía al lugar correcto y resuelve los más habituales — al instante.",
			bullets: ["Clasificación inteligente con IA", "Reglas de enrutamiento dinámicas", "Autorresolución de principio a fin"],
		},
		marketplace: {
			label: "Marketplace",
			title: "Amplíalo con las herramientas que ya usas",
			description:
				"Conecta tu CRM, tu sistema de facturación o cualquier herramienta de la que dependas. Un ecosistema de integraciones en crecimiento.",
			bullets: ["Integraciones en un clic", "Ecosistema de apps propias", "API extensible"],
		},
		platform: {
			label: "Plataforma",
			title: "Gestiona personas, colas y flujos de trabajo",
			description:
				"Ya sea una persona o cien, Pulse te da el control para mantener el orden y repartir la carga.",
			bullets: ["Equilibrio de carga y equipos", "Constructor avanzado de flujos", "Analítica de rendimiento"],
		},
	},

	visuals: {
		aiAgent: {
			header: "AI_AGENT // RESOLUCIÓN_MEDIA 18S",
			steps: {
				received: { label: "Ticket recibido", detail: '"No recibí la factura después del pago"' },
				classifying: { label: "IA clasificando…", detail: "Categoría: Facturación · Prioridad: Alta" },
				knowledge: { label: "Búsqueda en la base de conocimiento", detail: "2 artículos relevantes en 0,3s" },
				sent: { label: "Respuesta enviada", detail: "Resolución entregada. Encuesta CSAT en cola." },
			},
		},
		widget: { embed: "WIDGET.EMBED" },
		teams: {
			header: "RESUMEN_COLA",
			active: "4 ACTIVOS",
			ticketsLabel: "TICKETS",
			agentAi: "Agente IA",
		},
	},

	process: {
		sectionLabel: "03 — PROCESO",
		sectionRight: "SOLICITUD → RESUELTO",
		headline: { lead: "De la solicitud a la resolución —", highlight: "en segundos." },
		subhead: "Tres pasos. Funciona a cualquier escala.",
		steps: {
			connect: {
				title: "Conecta tus canales",
				desc: "Reúne cada conversación en un solo lugar — correo, chat, formularios. Minutos, no días.",
			},
			sort: {
				title: "Deja que la IA ordene",
				desc: "Pulse clasifica, prioriza y enruta cada solicitud automáticamente. Sin triaje manual.",
			},
			resolve: {
				title: "Resuelve más rápido",
				desc: "Tu equipo se centra en lo que de verdad necesita a una persona. Del resto se encarga Pulse.",
			},
		},
	},

	testimonials: {
		sectionLabel: "04 — TRANSMISIONES",
		incoming: "ENTRANDO",
		logPrefix: "LOG_",
		items: {
			contoso: {
				quote:
					"Unificar nuestros canales con Pulse redujo el tiempo de resolución un 70%. Por fin el equipo puede respirar.",
				role: "Dirección de Éxito del Cliente",
				segment: "EQUIPOS DE SOPORTE",
			},
			bright: {
				quote:
					"Gestionar 8 clientes significaba 8 herramientas distintas. Pulse lo unificó en una sola. Nuestros clientes están más contentos y ganamos negocio nuevo por cómo se lo reportamos.",
				role: "Responsable de Operaciones",
				segment: "AGENCIAS",
			},
			torres: {
				quote:
					"Llevo el soporte de tres productos SaaS en solitario. Pulse es la primera herramienta que no parecía hecha para un equipo de 50 personas. La configuré en 10 minutos.",
				role: "Consultoría independiente",
				segment: "AUTÓNOMOS Y EQUIPOS PEQUEÑOS",
			},
		},
	},

	trust: {
		setup: { title: "LISTO EN 5 MIN", desc: "Sin equipo de IT" },
		compliance: { title: "SOC 2 Y GDPR", desc: "Seguridad de nivel empresarial" },
		uptime: { title: "SLA 99,9% DISPONIBILIDAD", desc: "Fiable a cualquier escala" },
		seats: { title: "1 O 1.000 LICENCIAS", desc: "De autónomo a multinacional" },
	},

	finalCta: {
		eyebrow: "05 — DESPLIEGA · SIN TARJETA · PRUEBA DE 14 DÍAS",
		headline: { lead: "Pon el soporte en", highlight: "modo automático." },
		subhead: "Funciona para autónomos, agencias y equipos en crecimiento. Operativo en cinco minutos.",
		ctaPrimary: "Empieza la prueba gratis",
		ctaSecondary: "Ver precios",
	},
};

export default landing;
