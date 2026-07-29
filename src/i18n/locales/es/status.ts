import type { StatusDict } from "../en/status";

const status: StatusDict = {
	hero: {
		eyebrowPrefix: "SYS.STATUS",
		allOperational: "TODOS LOS SISTEMAS OPERATIVOS",
		degraded: "RENDIMIENTO DEGRADADO",
		headline: { lead: "Cada sistema,", highlight: "a la vista" },
		subhead: "Estado en tiempo real e historial de rendimiento de todos los servicios globales de Pulse.",
		lastUpdated: "ÚLTIMA ACTUALIZACIÓN: 27 FEB 2026 · 08:00 UTC",
		ctaPrimary: "Suscribirse a las actualizaciones",
		ctaSecondary: "Ver documentación del SLA",
		stats: {
			uptime: "DISPONIBILIDAD GLOBAL (90 D)",
			active: "INCIDENCIAS ACTIVAS",
			incidents: "INCIDENCIAS (90 D)",
			resolution: "TIEMPO MEDIO DE RESOLUCIÓN",
			resolutionValue: "< {count} MIN",
		},
	},

	statusLabels: {
		operational: "OPERATIVO",
		degraded: "DEGRADADO",
		outage: "CAÍDA",
		maintenance: "MANTENIMIENTO",
	},

	services: {
		sectionLabel: "01 — SERVICIOS",
		sectionRight: "{count} ENDPOINTS MONITORIZADOS",
		columnService: "SERVICIO",
		columnUptime: "DISPONIBILIDAD (90 D)",
		columnStatus: "ESTADO",
		items: {
			ingestion: { name: "Recepción de tickets", description: "Creación de tickets por correo, Teams y API", uptime: "100,00%" },
			ai: { name: "Motor de IA", description: "Clasificación, enrutamiento y resolución automática con IA", uptime: "99,98%" },
			integrations: {
				name: "Integraciones de terceros",
				description: "Microsoft 365, Google Workspace e integraciones con apps externas",
				uptime: "99,97%",
			},
			dashboard: { name: "Panel y aplicación web", description: "Interfaz de agentes y administración", uptime: "100,00%" },
			analytics: { name: "Analítica e informes", description: "Paneles en tiempo real y exportaciones", uptime: "99,99%" },
			mobile: { name: "Pulse Mobile", description: "Apps nativas de orquestación para iOS y Android", uptime: "99,96%" },
			api: { name: "API", description: "APIs públicas REST y de webhooks", uptime: "100,00%" },
			notifications: { name: "Notificaciones", description: "Alertas por correo, Teams y push", uptime: "99,95%" },
		},
	},

	uptime: {
		sectionLabel: "02 — HISTORIAL_DISPONIBILIDAD",
		overall: "99,97%",
		caption: "90 DÍAS · CADA BARRA = UN DÍA · PASA EL CURSOR PARA VER EL DETALLE",
		dayTooltip: "Día {day}: {state}",
		rangeStart: "−90 D",
		rangeEnd: "HOY",
		legendOperational: "OPERATIVO",
		legendDegraded: "DEGRADADO",
		legendOutage: "CAÍDA",
	},

	incidents: {
		sectionLabel: "03 — REGISTRO_INCIDENCIAS",
		sectionRight: "ÚLTIMOS 90 DÍAS",
		severities: { critical: "crítica", major: "grave", minor: "menor" },
		states: { resolved: "resuelta", monitoring: "en seguimiento", investigating: "en investigación" },
		items: {
			"inc-024": {
				title: "Latencia elevada en las respuestas de IA",
				date: "19 FEB 2025",
				updates: [
					{
						time: "14:32 UTC",
						message:
							"Resuelto. El análisis de causa raíz identificó un clúster de autoescalado saturado. El tiempo medio de respuesta de Pulse AI vuelve a su valor de referencia (<800 ms).",
					},
					{
						time: "13:58 UTC",
						message:
							"Investigando una latencia p99 elevada en el motor de agentes de IA. La creación y la entrega de tickets no se ven afectadas.",
					},
				],
			},
			"inc-023": {
				title: "Retraso en la entrega de notificaciones",
				date: "7 FEB 2025",
				updates: [
					{ time: "09:14 UTC", message: "Resuelta la limitación de la API de integraciones. Se han entregado todas las notificaciones en cola." },
					{
						time: "08:41 UTC",
						message:
							"La API de integraciones de terceros está aplicando limitaciones. Algunas notificaciones se retrasan hasta 15 minutos. No se ha perdido ningún ticket.",
					},
				],
			},
			"inc-022": {
				title: "Mantenimiento programado — actualización de base de datos",
				date: "25 ENE 2025",
				updates: [
					{ time: "03:00 UTC", message: "Mantenimiento completado. Todos los servicios plenamente operativos." },
					{
						time: "01:00 UTC",
						message: "Comienza la ventana de mantenimiento programado. Modo de solo lectura activo para las exportaciones de analítica.",
					},
				],
			},
		},
		upcoming: {
			title: "Próximo mantenimiento",
			window: "8 MAR 2026 · 01:00–03:00 UTC",
			desc: "Actualización de infraestructura programada. Las exportaciones de analítica estarán en modo de solo lectura. El resto de servicios seguirá plenamente operativo.",
			cta: "Suscribirse",
		},
	},

	finalCta: {
		tag: "04 — SUSCRÍBETE · CORREO / SMS / WEBHOOK",
		headline: { lead: "No te pierdas ninguna", highlight: "incidencia." },
		desc: "Suscríbete a las actualizaciones de estado por correo, SMS o webhook. Recibe el aviso en el momento en que algo cambie.",
		primary: "Suscribirse a las actualizaciones",
		secondary: "Ver documentación del SLA",
	},
};

export default status;
