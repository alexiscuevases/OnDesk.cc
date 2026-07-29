import type { FeaturesDict } from "../en/features";

const features: FeaturesDict = {
	hero: {
		eyebrow: "SYS.MODULES — ÍNDICE COMPLETO DE CAPACIDADES",
		headline: { lead: "Diseñado para la", highlight: "nueva era", trail: "del soporte" },
		subhead:
			"Desde la bandeja unificada hasta la automatización con IA: todo lo que necesitas para dar un gran soporte, trabajes en solitario o en un equipo global.",
		ctaPrimary: "Empieza la prueba gratis",
		ctaSecondary: "Ver precios",
	},

	stats: {
		autoResolved: "AUTORRESUELTO",
		routingLatency: "LATENCIA DE ENRUTAMIENTO",
		uptimeSla: "SLA DE DISPONIBILIDAD",
		businessImpact: "IMPACTO EN EL NEGOCIO",
	},

	index: {
		sectionLabel: "ÍNDICE DE CAPACIDADES",
		sectionTitle: "El ecosistema Pulse",
		sectionRight: "{count} MÓDULOS REGISTRADOS",
		intro: "Los pilares de la plataforma de orquestación de soporte más avanzada. Filtra por área.",
	},

	tabs: {
		all: "Todo",
		omnichannel: "Omnicanal",
		aiAutomation: "Automatización IA",
		marketplace: "Marketplace",
		intelligence: "Inteligencia",
		security: "Seguridad",
	},

	modules: {
		resolution: {
			title: "Resolución autónoma",
			description:
				"La IA de Pulse resuelve hasta el 80% del volumen de soporte sin intervención humana. Pulse se encarga de lo rutinario para que tu equipo se centre en lo que de verdad necesita a una persona.",
			bullets: [
				"Detección de intención y sentimiento",
				"Autorresolución sin latencia",
				"Traspaso fluido al agente",
				"Motor de resolución que aprende solo",
			],
			statLabel: "RESOLUCIÓN AUTÓNOMA",
		},
		routing: {
			title: "Enrutamiento inteligente",
			description:
				"Equilibrio dinámico de la carga que asigna cada ticket según la especialidad del agente, la prioridad y la capacidad operativa en tiempo real.",
			bullets: [
				"Emparejamiento por competencias",
				"Cumplimiento predictivo del SLA",
				"Orquestación de colas por prioridad",
				"Distribución según capacidad",
			],
			statLabel: "LATENCIA MÁX. DE ENRUTAMIENTO",
		},
		omnichannel: {
			title: "Unificación omnicanal",
			description:
				"Reúne WhatsApp, correo, Teams y voz en un único hilo unificado. Sin silos, solo conversaciones fluidas.",
			bullets: [
				"WhatsApp y Teams nativos",
				"Contexto unificado del cliente",
				"Historial entre canales",
				"Cambio de canal instantáneo",
			],
			statLabel: "CANALES UNIFICADOS",
		},
		marketplace: {
			title: "Pulse Marketplace",
			description:
				"Da a tus agentes un ecosistema de integraciones que lleva los datos del negocio directamente al flujo de soporte.",
			bullets: [
				"Enlaces directos a CRM y facturación",
				"SDK para desarrollar apps propias",
				"Activación de herramientas en un clic",
				"Acciones de flujo automatizadas",
			],
			statLabel: "INTEGRACIONES DISPONIBLES",
		},
		intelligence: {
			title: "Inteligencia predictiva",
			description:
				"Ve más allá de los informes descriptivos. Usa la IA para prever tendencias de volumen e identificar puntos de fricción antes de que escalen.",
			bullets: [
				"Modelos de previsión de volumen",
				"Análisis automático de fricción",
				"Puntuación del rendimiento de agentes",
				"Informes de impacto en el negocio",
			],
			statLabel: "IMPACTO MEDIO EN CSAT",
		},
		security: {
			title: "Seguridad y fiabilidad",
			description:
				"SOC 2, GDPR y 99,99% de disponibilidad — hecho para equipos que no pueden permitirse caídas, a cualquier escala.",
			bullets: [
				"Cumplimiento SOC 2 Tipo II",
				"Residencia regional de datos",
				"RBAC avanzado y SSO",
				"Cifrado de datos de extremo a extremo",
			],
			statLabel: "GARANTÍA DE DISPONIBILIDAD",
		},
	},

	fieldReports: {
		sectionLabel: "02 — INFORMES DE CAMPO",
		sectionRight: "CLIENTES VERIFICADOS",
		logPrefix: "LOG_0",
		items: {
			torres: {
				quote:
					"Pasé de tres bandejas de correo distintas a Pulse en un fin de semana. Ahora todo está en un solo lugar y no se me escapa ninguna solicitud.",
				role: "Consultoría independiente, Torres Digital",
			},
			bright: {
				quote:
					"Pulse Core le dio a nuestra agencia justo lo que necesitábamos: flujos separados por cliente y visibilidad real de lo que pasa en todas las cuentas.",
				role: "Responsable de Operaciones, BrightSupport Agency",
			},
			finstream: {
				quote:
					"Pulse convirtió nuestro soporte de un centro de coste en un motor de CSAT. El enrutamiento autónomo se amortizó en la primera semana.",
				role: "Dirección de Operaciones, FinStream",
			},
		},
	},

	finalCta: {
		tag: "03 — DESPLIEGA · 14 DÍAS DE PRUEBA · SIN COMPROMISO",
		headline: { lead: "Despliega Pulse en", highlight: "minutos." },
		desc: "Descubre la potencia del soporte autónomo. Prueba con acceso completo, sin compromiso.",
		primary: "Empieza la prueba gratis",
		secondary: "Habla con ventas",
	},
};

export default features;
