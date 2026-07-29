import type { ContactDict } from "../en/contact";

const contact: ContactDict = {
	hero: {
		eyebrow: "COMMS — RESPUESTA MEDIA 4 HORAS LABORABLES",
		headline: { lead: "Hablemos", highlight: "ahora" },
		subhead: "Estamos aquí para ayudar. Escribe al equipo adecuado y te responderemos rápido.",
		stats: {
			response: { value: "< 4 h", label: "RESPUESTA DE VENTAS" },
			soc2: { value: "SOC 2", label: "CERTIFICACIÓN TIPO II" },
			customers: "CLIENTES EN TODO EL MUNDO",
			uptime: "SLA DE DISPONIBILIDAD",
		},
	},

	channels: {
		sectionLabel: "01 — CANALES",
		sectionRight: "ELIGE LA FRECUENCIA CORRECTA",
		options: {
			general: {
				title: "General",
				desc: "¿Acabas de llegar a Pulse, no sabes por dónde empezar o tienes una duda rápida? Leemos todos los mensajes.",
				badge: "RESPUESTA < 8 H",
			},
			sales: {
				title: "Ventas",
				desc: "Dudas sobre planes, precios o si Pulse encaja contigo: estaremos encantados de ayudarte.",
				badge: "RESPUESTA < 4 H",
			},
			enterprise: {
				title: "Enterprise",
				desc: "Contratos personalizados, SSO, revisiones de cumplimiento y garantías de SLA para equipos con requisitos avanzados.",
				badge: "EQUIPO DEDICADO",
			},
			press: {
				title: "Prensa",
				desc: "Consultas de medios, solicitudes de logotipo y kit de prensa. Facilitamos entrevistas, citas y datos de la empresa.",
				badge: "RESPUESTA < 24 H",
			},
		},
	},

	form: {
		sectionLabel: "02 — TRANSMITIR",
		sectionRight: "CANAL ABIERTO",
		newMessage: "NUEVO_MENSAJE",
		encrypted: "CIFRADO · TLS 1.3",
		title: "Envíanos un mensaje",
		subtitle: "Leemos cada envío y respondemos en un día laborable.",
		firstName: "Nombre",
		firstNamePlaceholder: "Alex",
		lastName: "Apellidos",
		lastNamePlaceholder: "García",
		email: "Correo de trabajo",
		emailPlaceholder: "alex@empresa.com",
		company: "Empresa",
		companyPlaceholder: "Acme S.L.",
		teamSize: "Tamaño del equipo",
		teamSizePlaceholder: "Selecciona",
		teamSizes: {
			"1-10": "1–10 agentes",
			"11-50": "11–50 agentes",
			"51-200": "51–200 agentes",
			"200+": "Más de 200 agentes",
		},
		reason: "Motivo del contacto",
		reasonPlaceholder: "Selecciona un tema",
		reasons: {
			general: "Consulta general",
			sales: "Consulta de ventas",
			enterprise: "Plan Enterprise",
			technical: "Soporte técnico",
			partnership: "Alianzas",
			other: "Otro",
		},
		reasonHints: {
			general: "Cuéntanos un poco sobre ti y qué quieres conseguir. Te orientaremos en la dirección correcta.",
			sales: "Cuéntanos el tamaño de tu equipo, tu configuración actual y qué esperas resolver.",
			enterprise: "Describe tus requisitos: SSO, cumplimiento, SLA o contratos personalizados.",
			technical: "Comparte los detalles del problema o de la integración con la que necesitas ayuda.",
			partnership: "Cuéntanos sobre tu producto y el tipo de alianza que tienes en mente.",
			other: "Lo que se te ocurra: leemos todos los mensajes.",
		},
		message: "Mensaje",
		messagePlaceholder: "Cuéntanos cómo podemos ayudarte...",
		submit: "Enviar mensaje",
		privacyPrefix: "Al enviar este formulario aceptas nuestra",
		privacyLink: "Política de Privacidad",
		success: {
			tag: "✓ TRANSMISIÓN RECIBIDA",
			title: "Mensaje recibido",
			desc: "Te responderemos en un plazo de 4 horas laborables de lunes a viernes.",
			sendAnother: "Enviar otro",
			helpCenter: "Centro de ayuda",
		},
	},

	sidebar: {
		officesTitle: "OFICINAS",
		offices: {
			london: { city: "Londres", address: "Sede remota — 14 países" },
			seattle: { city: "Seattle", address: "Centro de ingeniería" },
		},
		responseTitle: "TIEMPOS_RESPUESTA",
		responseTimes: {
			sales: { channel: "VENTAS", time: "< 4 HORAS" },
			enterprise: { channel: "ENTERPRISE", time: "CSM DEDICADO" },
			general: { channel: "GENERAL", time: "< 1 DÍA LABORABLE" },
			press: { channel: "PRENSA", time: "< 24 HORAS" },
		},
		promoTitle: "¿Buscas respuestas rápidas?",
		promoDesc: "Consulta más de 200 artículos en nuestro centro de ayuda antes de escribirnos.",
		promoCta: "Centro de ayuda",
	},
};

export default contact;
