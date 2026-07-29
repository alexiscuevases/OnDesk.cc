import type { CareersDict } from "../en/careers";

const careers: CareersDict = {
	hero: {
		eyebrow: "CONTRATANDO — {count} VACANTES ABIERTAS",
		headline: { lead: "Construye el", highlight: "servicio autónomo" },
		subhead:
			"Somos un equipo remoto de 47 personas repartidas por el mundo, construyendo infraestructura de soporte que funciona igual para fundadores en solitario y para equipos empresariales.",
		facts: { countries: "14 PAÍSES", remote: "100% REMOTO", glassdoor: "4,9 / 5 EN GLASSDOOR" },
		ctaPrimary: "Ver vacantes abiertas",
		ctaSecondary: "Sobre nosotros",
		stats: {
			team: "PERSONAS EN EL EQUIPO",
			countries: "PAÍSES",
			rating: "VALORACIÓN EN GLASSDOOR",
			recommend: "LO RECOMENDARÍAN",
		},
	},

	perks: {
		sectionLabel: "BENEFICIOS",
		sectionTitle: "Por qué trabajar aquí",
		sectionRight: "CULTURA > RETRIBUCIÓN",
		intro: "Competimos por cultura, no solo por retribución. Esto es lo que significa en la práctica.",
		items: {
			remote: {
				title: "100% remoto",
				desc: "Trabaja desde donde piensas mejor. Tenemos compañeros en 14 países.",
			},
			equity: {
				title: "Participación competitiva",
				desc: "Opciones sobre acciones significativas para todo el equipo: creemos en la propiedad compartida desde el primer día.",
			},
			health: {
				title: "Salud y bienestar",
				desc: "200 USD al mes de ayuda para bienestar, más cobertura médica, dental y oftalmológica completa.",
			},
			learning: {
				title: "Presupuesto de formación",
				desc: "2.000 USD al año para congresos, cursos y libros. Sin necesidad de aprobación.",
			},
			pto: {
				title: "Vacaciones generosas",
				desc: "Vacaciones ilimitadas, con un mínimo recomendado de 20 días. Medimos su uso: lo decimos en serio.",
			},
			office: { title: "Ayuda para el espacio de trabajo", desc: "1.500 USD para montar tu espacio como quieras." },
			retreats: {
				title: "Encuentros de equipo",
				desc: "Dos encuentros de toda la empresa al año. Hemos estado en Lisboa, Barcelona y Tokio.",
			},
			growth: {
				title: "Crecimiento acelerado",
				desc: "Triplicamos los ingresos recurrentes en 2024. Verás que tu trabajo cuenta y crecerás con la empresa.",
			},
		},
	},

	reports: {
		sectionLabel: "02 — INFORMES DEL EQUIPO",
		sectionRight: "4,9 / 5 EN GLASSDOOR",
		verifiedEmployee: "EMPLEO VERIFICADO",
		items: {
			engineer: {
				quote:
					"La mejor empresa en la que he trabajado. La dirección escucha de verdad, publicamos rápido y el equipo es de primer nivel.",
				role: "Ingeniería sénior",
			},
			designer: {
				quote: "Trabajo remoto bien hecho. No solo tolerado: es lo normal. Excelente cultura asíncrona.",
				role: "Diseño de producto",
			},
			csm: {
				quote: "Vacaciones ilimitadas que la gente sí usa. Refrescante para una startup.",
				role: "Gestión de Éxito del Cliente",
			},
		},
	},

	roles: {
		sectionLabel: "VACANTES ABIERTAS",
		sectionTitle: "Únete al equipo",
		sectionRight: "{roles} VACANTES / {departments} DEPARTAMENTOS",
		allFilter: "Todos",
		openCount: "{count} ABIERTAS",
		apply: "APLICAR",
		types: { fullTime: "Jornada completa" },
		locations: {
			remoteEuUs: "Remoto (UE / EE. UU.)",
			remote: "Remoto",
			remoteUs: "Remoto (EE. UU.)",
			remoteUsLatam: "Remoto (EE. UU. / LATAM)",
			londonOrRemote: "Londres o remoto",
		},
		departments: {
			engineering: {
				name: "Inteligencia e Infraestructura",
				roles: {
					intelligence: "Ingeniería sénior de inteligencia — Pulse Core",
					frontend: "Ingeniería frontend — Sistemas de diseño",
					infra: "Ingeniería staff — Infraestructura",
					ml: "Ingeniería de ML — Clasificación de tickets",
				},
			},
			product: {
				name: "Producto y Diseño",
				roles: {
					pmCore: "Gestión sénior de producto — Plataforma principal",
					designer: "Diseño de producto — UX empresarial",
					pmSmb: "Gestión de producto — Starter y pymes",
				},
			},
			success: {
				name: "Éxito del Cliente",
				roles: {
					csmEnterprise: "Gestión de Éxito del Cliente — Enterprise (EMEA)",
					onboarding: "Especialista en incorporación técnica",
				},
			},
			sales: {
				name: "Ventas",
				roles: {
					aeMidMarket: "Ejecutivo de cuentas — Mid-Market (EMEA)",
					salesEngineer: "Ingeniería de preventa",
					aeSmb: "Ejecutivo de cuentas — Pymes",
				},
			},
		},
	},

	process: {
		sectionLabel: "04 — PROCESO",
		sectionRight: "SOLICITUD → OFERTA EN ~2 SEMANAS",
		headline: { lead: "Transparente, rápido y", highlight: "respetuoso." },
		subhead: "Cuatro pasos. Sin preguntas trampa. Pruebas de trabajo remuneradas.",
		steps: {
			apply: {
				title: "Solicítalo online",
				desc: "Envía tu candidatura. Revisamos todos los envíos: no descartamos automáticamente por palabras clave.",
			},
			intro: {
				title: "Llamada inicial",
				desc: "30 minutos con alguien del equipo para hablar del puesto y responder tus preguntas.",
			},
			technical: {
				title: "Prueba técnica / de trabajo",
				desc: "Una prueba remunerada para casa o una entrevista en directo, enfocada y relevante para tu puesto. Sin preguntas trampa.",
			},
			final: {
				title: "Entrevistas finales",
				desc: "Conoce a 2-3 personas con las que trabajarías a diario. Decisión en 5 días laborables.",
			},
		},
	},

	finalCta: {
		tag: "EOF — CANDIDATURA ESPONTÁNEA",
		headline: { lead: "¿No ves tu", highlight: "puesto?" },
		desc: "Siempre nos interesa conocer a gente excepcional. Escríbenos y cuéntanos cómo contribuirías.",
		primary: "Enviar candidatura espontánea",
		secondary: "Sobre nosotros",
	},
};

export default careers;
