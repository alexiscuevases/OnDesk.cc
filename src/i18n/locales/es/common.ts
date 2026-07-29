import type { CommonDict } from "../en/common";

// Spanish: neutral register for both Spain and Latin America. Machine-style
// tags that read as system identifiers (PULSE://INDEX, SIG.END, SUPPORT_OS)
// are part of the visual language and stay untranslated.

const common: CommonDict = {
	nav: {
		solutions: "Soluciones",
		features: "Funciones",
		pricing: "Precios",
		integrations: "Integraciones",
		login: "Iniciar sesión",
		freeTrial: "Prueba gratis",
		solutionsIndex: "ÍNDICE_SOLUCIONES",
		entries: "{count} ENTRADAS",
		toggleMenu: "Abrir menú",
		telemetry: "SUPPORT_OS",
	},

	solutions: {
		supportTeams: {
			label: "Equipos de soporte",
			description: "Gestiona un alto volumen de soporte con automatización y flujos de trabajo",
		},
		agencies: {
			label: "Agencias",
			description: "Lleva el soporte de varios clientes desde un solo lugar",
		},
		solo: {
			label: "Autónomos y equipos pequeños",
			description: "Mantén cada solicitud ordenada, sin complicaciones",
		},
	},

	footer: {
		index: "PULSE://INDEX",
		operational: "TODOS LOS SISTEMAS OPERATIVOS",
		tagline: "Automatiza el soporte, resuelve más rápido y escala sin esfuerzo.",
		rights: "© {year} PULSE — TODOS LOS DERECHOS RESERVADOS",
		signalEnd: "SIG.END",
		headings: {
			solutions: "Soluciones",
			platform: "Plataforma",
			resources: "Recursos",
			company: "Empresa",
			legal: "Legal",
		},
		links: {
			supportTeams: "Equipos de soporte",
			agencies: "Agencias",
			solo: "Autónomos y equipos pequeños",
			features: "Funciones",
			integrations: "Integraciones",
			changelog: "Novedades",
			blog: "Blog",
			help: "Centro de ayuda",
			customers: "Casos de éxito",
			status: "Estado del servicio",
			about: "Nosotros",
			security: "Seguridad",
			careers: "Empleo",
			contact: "Contacto",
			privacy: "Privacidad",
			terms: "Términos",
		},
	},

	language: {
		label: "Idioma",
		mono: "IDIOMA",
		select: "Seleccionar idioma",
	},

	localeHint: {
		message: "Esta página está disponible en {language}.",
		action: "Cambiar",
		dismiss: "Descartar",
	},
};

export default common;
