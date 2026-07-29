import type { PricingDict } from "../en/pricing";

// Prices remain in USD. Numeric separators follow es-ES/es-419 convention
// (comma for decimals, period for thousands) — the figures themselves are
// formatted by Intl at render time; only static label text is written here.

const pricing: PricingDict = {
	hero: {
		eyebrow: "MATRIZ_DE_PRECIOS — 14 DÍAS DE PRUEBA / SIN TARJETA",
		headline: { lead: "Precios simples", highlight: "y honestos", trail: "" },
		subhead:
			"Tarifa plana para autónomos. Precio flexible por agente para equipos. Todos los planes incluyen 14 días de prueba gratis.",
		monthly: "Mensual",
		annual: "Anual",
		annualDiscount: "−20%",
	},

	agentCounter: {
		title: "N.º_DE_AGENTES",
		scope: "CORE Y ENTERPRISE",
		agents: "agentes",
		fewer: "Menos agentes",
		more: "Más agentes",
	},

	plans: {
		sectionLabel: "01 — PLANES",
		sectionRight: "3 NIVELES / PRORRATEO DIARIO",
		mostSelected: "EL MÁS ELEGIDO",
		perMonth: "/MES",
		flatRate: "TARIFA PLANA · HASTA 2 AGENTES",
		billedAnnually: " · FACTURACIÓN ANUAL",
		perAgentRate: "{rate} × {count} AGENTES",
		savePerYear: "AHORRA {amount} / AÑO",
		cta: "Empieza la prueba gratis",
		starter: {
			tagline: "PARA AUTÓNOMOS Y EQUIPOS PEQUEÑOS",
			description: "Mantén cada solicitud ordenada. Listo en minutos, cancela cuando quieras.",
			features: [
				"Hasta 2 agentes",
				"300 tickets / mes",
				"2 canales (correo + chat)",
				"Bandeja unificada",
				"Respuestas predefinidas",
				"Automatizaciones básicas",
				"App móvil",
				"Soporte de la comunidad",
			],
			missing: [
				"Clasificación y enrutamiento con IA",
				"Autorresolución con IA",
				"Panel de analítica",
				"Residencia de datos",
				"Arquitecto dedicado",
			],
		},
		core: {
			tagline: "PARA EQUIPOS Y AGENCIAS",
			description: "Soporte completo con enrutamiento por IA, bandeja omnicanal y gestión de equipos.",
			features: [
				"Volumen de tickets ilimitado",
				"Todos los canales unificados",
				"Clasificación y enrutamiento con IA",
				"Gestión de carga del equipo",
				"Panel de analítica",
				"Acceso al Marketplace",
				"Respuestas predefinidas y automatización",
				"Soporte prioritario 24/7",
			],
			missing: [
				"Autorresolución con IA",
				"Residencia de datos soberana",
				"Arquitecto de éxito dedicado",
				"Marcos de SLA personalizados",
			],
		},
		enterprise: {
			tagline: "PARA GRANDES ORGANIZACIONES",
			description: "La plataforma completa para operaciones de soporte complejas y de alto volumen.",
			features: [
				"Todo lo de Pulse Core",
				"Motor de autorresolución con IA",
				"Previsión predictiva de volumen",
				"Residencia de datos soberana (EE. UU./UE/APAC)",
				"Gestión de claves empresarial",
				"Arquitecto de éxito dedicado",
				"Marcos de SLA personalizados",
				"Garantía de disponibilidad del 99,99%",
			],
			missing: [],
		},
	},

	enterpriseCallout: {
		title: "¿Necesitas más de 150 agentes o un contrato personalizado?",
		desc: "Descuentos por volumen, SLA a medida, infraestructura dedicada e incorporación asistida.",
		cta: "Habla con ventas",
	},

	trustRow: {
		soc2: "SOC 2 TIPO II",
		uptime: "SLA 99,97% DISPONIBILIDAD",
		customers: "{count}+ CLIENTES",
		rating: "4,9 / 5 VALORACIÓN MEDIA",
	},

	fieldReports: {
		sectionLabel: "02 — INFORMES DE CAMPO",
		sectionRight: "UNO POR PLAN",
		logPrefix: "LOG_0",
		items: {
			torres: {
				quote:
					"Estaba operativa en menos de 10 minutos. Todos los correos de mis clientes en una bandeja, las automatizaciones básicas listas y nada que no necesitara.",
				role: "Consultoría independiente, Torres Digital",
				plan: "STARTER",
			},
			bright: {
				quote:
					"Core le dio a nuestra agencia visibilidad real. Gestionamos 8 clientes y la cola de cada uno sigue separada sin ningún esfuerzo extra.",
				role: "Responsable de Operaciones, BrightSupport Agency",
				plan: "CORE",
			},
			retail: {
				quote:
					"El motor de resolución autónoma pagó la mejora a Enterprise en menos de un trimestre. No es una herramienta de soporte — es una ventaja competitiva.",
				role: "Dirección de Experiencia de Cliente, RetailFlow Group",
				plan: "ENTERPRISE",
			},
		},
	},

	compare: {
		sectionLabel: "MATRIZ",
		sectionTitle: "Compara los planes lado a lado",
		sectionRight: "DESGLOSE COMPLETO DE FUNCIONES",
		columnFeature: "FUNCIÓN",
		columnStarter: "STARTER",
		columnCore: "CORE",
		columnEnterprise: "ENTERPRISE",
		rows: {
			agents: { feature: "Agentes", starter: "Hasta 2", core: "Ilimitados", enterprise: "Ilimitados" },
			volume: { feature: "Volumen de tickets", starter: "300 / mes", core: "Ilimitado", enterprise: "Ilimitado" },
			channels: { feature: "Canales", starter: "2", core: "Ilimitados", enterprise: "Ilimitados" },
			aiRouting: { feature: "Clasificación y enrutamiento con IA" },
			autoResolution: { feature: "Autorresolución con IA" },
			analytics: { feature: "Panel de analítica" },
			residency: { feature: "Residencia de datos soberana" },
			architect: { feature: "Arquitecto dedicado" },
			uptime: { feature: "SLA de disponibilidad", starter: "99,9%", core: "99,97%", enterprise: "99,99%" },
			support: { feature: "Soporte", starter: "Comunidad", core: "Prioritario 24/7", enterprise: "Asistido" },
		},
	},

	faq: {
		sectionLabel: "04 — PREGUNTAS FRECUENTES",
		entries: "{count} ENTRADAS",
		items: {
			howPricing: {
				q: "¿Cómo funcionan los precios?",
				a: "Pulse Starter tiene una tarifa plana de 9 USD/mes para un máximo de 2 agentes — ideal para autónomos y equipos pequeños. Core y Enterprise se cobran por agente activo al mes, al final de cada periodo de facturación. Añade o quita agentes cuando quieras; los cambios se prorratean al día.",
			},
			changePlans: {
				q: "¿Puedo cambiar de plan más adelante?",
				a: "Sí. Las mejoras se aplican de inmediato; las bajadas de plan, en el siguiente ciclo de facturación. No hay penalizaciones por cambiar.",
			},
			whatIsAgent: {
				q: "¿Qué cuenta como agente?",
				a: "Cualquier usuario que pueda ver, responder o gestionar tickets. Los usuarios de solo lectura y los administradores que no atienden tickets son gratuitos.",
			},
			freeTrial: {
				q: "¿Hay prueba gratuita?",
				a: "Todos los planes de pago incluyen 14 días de prueba gratis con acceso completo. No necesitas tarjeta para empezar.",
			},
			nonProfit: {
				q: "¿Ofrecen descuentos para organizaciones sin ánimo de lucro?",
				a: "Sí — escríbenos para conocer nuestros precios para entidades sin ánimo de lucro y educación. Ofrecemos hasta un 40% de descuento a las organizaciones que califiquen.",
			},
			dataStored: {
				q: "¿Dónde se almacenan nuestros datos?",
				a: "Los datos de Starter y Core se almacenan en EE. UU. por defecto. Los clientes de Enterprise eligen su región: EE. UU., UE o APAC.",
			},
		},
	},

	finalCta: {
		tag: "05 — CONTACTO · SIN PRESIONES NI GUIONES DE VENTA",
		headline: { lead: "Habla con nuestro", highlight: "equipo." },
		desc: "Te ayudamos a elegir el plan adecuado según el tamaño de tu equipo y tu volumen de soporte.",
		primary: "Habla con ventas",
		secondary: "Empieza la prueba gratis",
	},
};

export default pricing;
