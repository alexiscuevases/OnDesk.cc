import type { SolutionsDict } from "../en/solutions";

const solutions: SolutionsDict = {
	chrome: {
		ctaPrimary: "Empieza la prueba gratis",
		ctaSecondary: "Ver precios",
		capabilitiesLabel: "CAPACIDADES",
		capabilitiesRight: "INCLUIDO / SIN EXTRAS",
		processLabel: "02 — PROCESO",
		processRight: "SOLICITUD → RESUELTO",
		transmissionLabel: "03 — TRANSMISIÓN",
		verifiedCustomer: "CLIENTE VERIFICADO",
		deployLabel: "04 — DESPLIEGA",
	},

	supportTeams: {
		badge: "Para equipos de soporte",
		code: "SEG_01 / SUPPORT_TEAMS",
		headline: { lead: "Atiende más tickets", highlight: "sin ampliar", trail: "tu equipo" },
		description:
			"Pulse reúne cada canal, agente y flujo de trabajo en un único centro de mando. Deja de saltar entre pestañas. Empieza a resolver.",
		stats: {
			resolution: { value: "80%", label: "Más rápido al resolver" },
			volume: { value: "50K+", label: "Tickets/mes gestionados" },
			satisfaction: { value: "95%", label: "Satisfacción del cliente" },
		},
		featuresHeadline: "Todo lo que tu equipo de soporte necesita",
		features: {
			triage: {
				title: "Clasificación con IA",
				desc: "Clasifica, prioriza y enruta cada ticket en el momento en que llega. Sin ordenar a mano, sin solicitudes perdidas.",
			},
			team: {
				title: "Gestión de equipo y carga",
				desc: "Ve la cola de todo tu equipo de un vistazo. Reparte la carga automáticamente y evita el desgaste de los agentes.",
			},
			sla: {
				title: "Seguimiento de SLA",
				desc: "Define SLA por canal o prioridad. Recibe alertas antes de que se venza el plazo: no vuelvas a incumplir un compromiso.",
			},
			analytics: {
				title: "Analítica de rendimiento",
				desc: "Mide tiempos de resolución, puntuaciones CSAT y productividad de los agentes desde un único panel.",
			},
		},
		stepsHeadline: "Del caos a resuelto, en minutos",
		steps: {
			connect: {
				title: "Conecta tus canales",
				desc: "Reúne correo, chat y redes en una sola bandeja. Minutos, no días.",
			},
			rules: {
				title: "Define tus reglas",
				desc: "Configura SLA, lógica de enrutamiento y flujos automáticos una vez. Pulse se encarga del resto.",
			},
			ai: {
				title: "Deja que la IA absorba el volumen",
				desc: "Pulse clasifica y enruta cada ticket mientras tu equipo se centra en lo que de verdad necesita a una persona.",
			},
		},
		testimonial: {
			quote:
				"Unificar nuestros canales con Pulse redujo el tiempo de resolución un 70%. La clasificación por IA actúa con precisión quirúrgica: por fin el equipo puede respirar.",
			role: "Dirección de Éxito del Cliente",
		},
		ctaBadge: "Equipos de soporte",
		ctaHeadline: "¿Listo para poner tu cola en modo automático?",
		ctaDesc: "14 días de prueba gratis. Sin tarjeta. Soporte unificado y automatización desde el primer día.",
	},

	agencies: {
		badge: "Para agencias",
		code: "SEG_02 / AGENCIES",
		headline: { lead: "Gestiona el soporte de cada cliente", highlight: "desde un solo lugar", trail: "" },
		description:
			"Una plataforma. Varios clientes. Visibilidad total. Deja de hacer malabares con pestañas y herramientas: Pulse le da a tu agencia una operación de soporte profesional y escalable.",
		stats: {
			resolution: { value: "8+", label: "Clientes por espacio de trabajo" },
			volume: { value: "60%", label: "Menos carga operativa" },
			satisfaction: { value: "100%", label: "Aislamiento de datos por cliente" },
		},
		featuresHeadline: "Hecho para agencias que dan soporte por cuenta de otros",
		features: {
			triage: {
				title: "Espacios multicliente",
				desc: "Cada cliente tiene un entorno totalmente aislado con sus propios canales, agentes y datos. Sin contaminación cruzada.",
			},
			team: {
				title: "Bandejas con la marca del cliente",
				desc: "Configura bandejas personalizadas con la marca de cada cliente. Tu agencia entrega una experiencia cuidada y profesional.",
			},
			sla: {
				title: "Informes entre clientes",
				desc: "Informes agregados o por cliente en un clic. Muéstrales exactamente lo que está entregando tu equipo.",
			},
			analytics: {
				title: "Acceso por roles",
				desc: "Controla con precisión quién ve qué. Asigna agentes solo a clientes concretos: sin exposición accidental de datos.",
			},
		},
		stepsHeadline: "Incorpora un cliente nuevo en menos de una hora",
		steps: {
			connect: {
				title: "Crea el espacio del cliente",
				desc: "Cada cliente tiene su propio espacio aislado en minutos. Sin configuración técnica.",
			},
			rules: {
				title: "Conecta sus canales",
				desc: "Enchufa su correo, su widget de chat y sus redes sociales. Pulse los unifica al instante.",
			},
			ai: {
				title: "Informa y retén",
				desc: "Genera informes de rendimiento por cliente que demuestran el valor de tu agencia y te ayudan a ganar renovaciones.",
			},
		},
		testimonial: {
			quote:
				"Gestionar 8 clientes significaba 8 herramientas distintas. Pulse lo unificó en una sola. Nuestro equipo es más rápido, nuestros clientes están más contentos y ganamos negocio nuevo por cómo se lo reportamos.",
			role: "Responsable de Operaciones",
		},
		ctaBadge: "Agencias",
		ctaHeadline: "Tus clientes merecen mejor soporte. Empieza a dárselo.",
		ctaDesc: "14 días de prueba gratis. Monta el espacio de tu primer cliente en menos de una hora.",
	},

	solo: {
		badge: "Para autónomos y equipos pequeños",
		code: "SEG_03 / SOLO_SMALL_TEAMS",
		headline: { lead: "Controla cada solicitud", highlight: "sin complicaciones", trail: "" },
		description:
			"Pensado para una persona o un equipo reducido. Pulse mantiene tus solicitudes ordenadas, tus respuestas rápidas y a tus clientes contentos, sin la carga de una herramienta empresarial.",
		stats: {
			resolution: { value: "< 5 min", label: "Hasta tu primer ticket" },
			volume: { value: "Todos", label: "Los canales en un solo lugar" },
			satisfaction: { value: "1 → 50", label: "Escala con tu equipo" },
		},
		featuresHeadline: "Simple por diseño. Potente cuando lo necesitas.",
		features: {
			triage: {
				title: "Bandeja unificada",
				desc: "Cada correo, chat y envío de formulario en un solo lugar. Deja de cambiar de pestaña para encontrar lo que hay que responder.",
			},
			team: {
				title: "Automatizaciones sin código",
				desc: "Configura autorrespuestas, enrutamiento y etiquetas en minutos. Sin programadores. Sin complejidad. Solo resultados.",
			},
			sla: {
				title: "Respuestas predefinidas",
				desc: "Guarda tus mejores respuestas y reutilízalas con un clic. Resuelve las preguntas habituales en segundos.",
			},
			analytics: {
				title: "Crece contigo",
				desc: "Empieza en solitario. Suma a alguien cuando estés listo. Precios que tienen sentido en cada etapa, sin saltos bruscos.",
			},
		},
		stepsHeadline: "Operativo en una tarde",
		steps: {
			connect: {
				title: "Conecta en 5 minutos",
				desc: "Enchufa tu correo o tu widget de chat. Sin departamento de IT: solo unos clics.",
			},
			rules: {
				title: "Organiza una vez",
				desc: "Configura etiquetas, prioridades y enrutamiento sencillos. Una tarde de ajustes, meses de beneficio.",
			},
			ai: {
				title: "Responde más rápido",
				desc: "Las sugerencias de IA y las respuestas predefinidas te ayudan a cerrar tickets antes de que se enfríe el café.",
			},
		},
		testimonial: {
			quote:
				"Llevo el soporte de tres productos SaaS en solitario. Pulse es la primera herramienta que no parecía hecha para un equipo de 50 personas. La configuré en 10 minutos. Ahora hasta disfruto respondiendo tickets.",
			role: "Consultoría independiente",
		},
		ctaBadge: "Autónomos y equipos pequeños",
		ctaHeadline: "Sencillo, rápido y con todos tus clientes contentos.",
		ctaDesc: "Gratis durante 14 días. Sin tarjeta. Sin contrato empresarial. Solo buen soporte.",
	},
};

export default solutions;
