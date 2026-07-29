import type { AboutDict } from "../en/about";

// Founder titles render as "CEO · Equipo fundador" rather than "cofundador/a":
// the source copy never states these people's gender, and Spanish would force a
// choice. "Equipo fundador" carries the same meaning with no gendered noun.

const about: AboutDict = {
	hero: {
		eyebrow: "REGISTRO_EMPRESA — DESDE 2022",
		headline: { lead: "Existimos para", highlight: "arreglar el soporte al cliente" },
		subhead:
			"Pulse es un equipo de 47 personas en 14 países construyendo la infraestructura de soporte autónomo que los equipos de cualquier tamaño realmente merecen.",
		ctaPrimary: "Únete al equipo",
		ctaSecondary: "Hablemos",
		stats: {
			founded: "FUNDACIÓN",
			team: "PERSONAS EN EL EQUIPO",
			customers: "CLIENTES",
			countries: "PAÍSES",
		},
	},

	mission: {
		sectionLabel: "01 — MISIÓN",
		sectionRight: "HACER EXTRAORDINARIOS A LOS EQUIPOS DE SOPORTE",
		title: "Hacer extraordinarios a los equipos de soporte",
		body1:
			"El soporte al cliente es una de las funciones más importantes de cualquier empresa y una de las peor atendidas por el software. Creemos que quienes hacen ese trabajo merecen mejores herramientas que una bandeja compartida y una hoja de cálculo.",
		body2:
			"Pulse está hecho para dar a los equipos de soporte de cualquier tamaño la velocidad y la estructura que necesitan para resolver problemas de verdad mediante orquestación autónoma, sin la complejidad de las plataformas heredadas.",
		commitmentsTitle: "COMPROMISOS",
		commitments: [
			"Certificación SOC 2 Tipo II",
			"Cumplimiento del RGPD y la CCPA",
			"Planes desde 9 USD de tarifa plana — escalables hasta empresa",
			"SLA de disponibilidad del 99,97%",
		],
	},

	timeline: {
		sectionLabel: "CRONOLOGÍA",
		sectionTitle: "De cero a global en tres años",
		sectionRight: "2022 → HOY",
		entries: {
			founded: {
				title: "Fundación",
				desc: "Tres ingenieros dejan Microsoft frustrados por el estado de las herramientas de soporte empresarial. Pulse (lanzado como OnDesk) publica su primera beta para 12 equipos.",
			},
			integrations: {
				title: "Llegan las integraciones nativas",
				desc: "Se activan las integraciones profundas con Microsoft 365 y Google Workspace. Los primeros 100 clientes de pago en 90 días.",
			},
			aiAgents: {
				title: "Agentes de IA en disponibilidad general",
				desc: "Disponibilidad general del enrutamiento asistido por IA, el resumen de tickets y las respuestas sugeridas. Los ingresos recurrentes se triplican.",
			},
			global: {
				title: "Escala global",
				desc: "Más de 1.200 clientes en 40 países. Se abren las regiones de residencia de datos en la UE y APAC. Se anuncia la Serie B.",
			},
		},
	},

	values: {
		sectionLabel: "03 — VALORES",
		sectionRight: "LO QUE DEFENDEMOS",
		items: {
			customer: {
				title: "Obsesión por el cliente",
				desc: "Cada función nace de un problema real de un equipo de soporte. Hacemos más de 20 entrevistas con clientes al mes y publicamos lo que aprendemos.",
			},
			transparent: {
				title: "Transparencia por defecto",
				desc: "Compartimos nuestra hoja de ruta públicamente, publicamos el estado del servicio en tiempo real y avisamos a los clientes cuando lanzamos algo que les afecta.",
			},
			lasting: {
				title: "Hecho para durar",
				desc: "Somos rentables y crecemos. Aquí no hay crecimiento a cualquier precio: construimos relaciones e infraestructura pensadas para seguir funcionando en 20 años.",
			},
		},
	},

	team: {
		sectionLabel: "EQUIPO",
		sectionTitle: "Conoce a la dirección",
		sectionRight: "{count} PERSONAS AL MANDO",
		intro: "Un equipo pequeño con amplia experiencia en compañías como Microsoft, Stripe, Zendesk y ServiceNow.",
		onLinkedin: "{name} en LinkedIn",
		onTwitter: "{name} en Twitter",
		members: {
			elena: {
				role: "CEO · Equipo fundador",
				bio: "Antes PM en Microsoft. Llevó los canales de Teams a 280 millones de usuarios. Obsesión por las operaciones de soporte.",
				location: "Londres",
			},
			daniel: {
				role: "CTO · Equipo fundador",
				bio: "Ex-Azure. Fanático de los sistemas distribuidos. Tiene opiniones firmes sobre colas.",
				location: "Seattle",
			},
			aisha: {
				role: "VP de Producto",
				bio: "Construyó herramientas de soporte en Zendesk durante 6 años. Cree que el producto es un deporte de equipo.",
				location: "Lagos",
			},
			ravi: {
				role: "VP de Ingeniería",
				bio: "Escaló la infraestructura de Stripe. Le encanta la tecnología aburrida que sí funciona.",
				location: "Singapur",
			},
			sophie: {
				role: "VP de Éxito del Cliente",
				bio: "10 años en éxito del cliente en SaaS empresarial. Tiene el récord del QBR más largo con un cliente.",
				location: "París",
			},
			marcus: {
				role: "VP de Ventas",
				bio: "Vendió software empresarial en ServiceNow y Atlassian. Sabe cuándo callarse y escuchar.",
				location: "Ámsterdam",
			},
		},
	},

	press: {
		sectionLabel: "05 — PRENSA E INVERSORES",
		sectionRight: "PARA QUE CONSTE",
		backedBy: "RESPALDADOS POR",
		quotes: {
			techcrunch:
				"Pulse es esa rara herramienta de soporte que funciona igual de bien para una consultoría de una persona que para una empresa de 500.",
			verge:
				"Tanto si gestionas una bandeja como cincuenta, Pulse mantiene todo ordenado sin hacerte sentir que necesitas un departamento de IT.",
			forbes: "Un ejemplo poco común de empresa SaaS que hace exactamente lo que promete.",
		},
	},

	finalCta: {
		tag: "06 — ÚNETE · REMOTO PRIMERO / 14 PAÍSES",
		headline: { lead: "Ven a construir el futuro del", highlight: "soporte." },
		desc: "Siempre buscamos personas extraordinarias a las que les importe de verdad el trabajo. Mira nuestras vacantes o simplemente saluda.",
		primary: "Ver vacantes",
		secondary: "Hablemos",
	},
};

export default about;
