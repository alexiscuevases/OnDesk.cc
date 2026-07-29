import type { CustomersDict } from "../en/customers";

// The Torres case study is the one place the source copy states a persona's
// gender ("she'd built", "who she'd replied to"), so Spanish follows it with
// feminine forms. Everywhere else the roles stay common-gender.

const customers: CustomersDict = {
	hero: {
		eyebrow: "EXPEDIENTES — MÁS DE 1.200 EQUIPOS REGISTRADOS",
		headline: { lead: "Equipos reales,", highlight: "resultados reales" },
		subhead: "Resultados documentados de equipos de soporte, agencias y profesionales independientes de todo el mundo.",
		stats: {
			customers: "CLIENTES EN TODO EL MUNDO",
			countries: "PAÍSES ATENDIDOS",
			deflection: "DESVÍO MEDIO DE TICKETS",
			csat: "VALORACIÓN CSAT MEDIA",
		},
	},

	industries: {
		all: "Todos",
		technology: "Tecnología",
		retail: "Retail",
		agency: "Agencia",
		finance: "Finanzas",
		healthcare: "Salud",
		education: "Educación",
	},

	featured: {
		sectionLabel: "01 — CASO DESTACADO",
		caseTag: "CASO_001",
		challengeLabel: "EL RETO",
		solutionLabel: "LA SOLUCIÓN",
		resultsLabel: "RESULTADOS",
		cta: "Consigue resultados así",
		planSuffix: "PLAN",
	},

	index: {
		sectionLabel: "ÍNDICE DE CASOS",
		sectionTitle: "Explora los expedientes",
		sectionRight: "{count} CASOS DOCUMENTADOS",
	},

	cases: {
		fabrikam: {
			tagline: "De 22 agentes a 9, con el mismo volumen de tickets",
			challenge:
				"El equipo de soporte de IT de Fabrikam estaba desbordado por tickets repetitivos de licencias de Microsoft 365 e incorporaciones. Los agentes dedicaban el 60% de su tiempo a incidencias con resoluciones idénticas.",
			solution:
				"Desplegaron agentes de IA de Pulse para resolver automáticamente restablecimientos de contraseña, solicitudes de licencia y listas de incorporación. Integrado directamente con sus canales de Azure AD y Teams.",
			results: [
				{ metric: "59%", label: "Menos personal necesario" },
				{ metric: "4 min", label: "Tiempo medio de resolución" },
				{ metric: "94%", label: "Puntuación CSAT" },
				{ metric: "420 K USD", label: "Ahorro anual en costes" },
			],
			quote:
				"Evaluamos seis herramientas. Pulse fue la única con una orquestación de Microsoft Teams realmente nativa, no un webhook añadido a última hora.",
			role: "Dirección de IT",
		},
		northwind: {
			tagline: "El soporte al cliente escaló 4× sin contratar a nadie",
			challenge:
				"Un pico de temporada duplicó los tickets entrantes. El equipo no tenía forma de prever el volumen ni de enrutar automáticamente por urgencia.",
			solution:
				"Usaron el enrutamiento predictivo de Pulse, las alertas de incumplimiento de SLA y las respuestas autónomas para absorber la carga punta sin contratar agentes de temporada.",
			results: [
				{ metric: "4×", label: "Volumen gestionado, mismo equipo" },
				{ metric: "98%", label: "Cumplimiento del SLA en el pico" },
				{ metric: "2,1 h", label: "Tiempo medio de primera respuesta" },
				{ metric: "89%", label: "Puntuación CSAT en temporada alta" },
			],
			quote:
				"La última campaña de navidad fue la primera en cinco años en la que no tuve que trabajar los fines de semana para mantener los tickets al día.",
			role: "VP de Operaciones",
		},
		brightsupport: {
			tagline: "8 clientes. 1 bandeja. Cero cambios de contexto.",
			challenge:
				"BrightSupport gestionaba el soporte por correo de 8 clientes SaaS con 4 herramientas distintas. Los agentes cambiaban de pestaña sin parar, confundían el tono de cada cliente y no tenían informes entre clientes que demostraran lo que estaban entregando.",
			solution:
				"Consolidaron todos los clientes en Pulse con espacios de trabajo separados, bandejas personalizadas por cliente y una vista de analítica compartida para los informes. Cada agente quedó limitado únicamente a sus clientes asignados.",
			results: [
				{ metric: "8", label: "Clientes en un solo espacio" },
				{ metric: "60%", label: "Menos tiempo cambiando de contexto" },
				{ metric: "100%", label: "Aislamiento de datos por cliente" },
				{ metric: "3×", label: "Informes mensuales más rápidos" },
			],
			quote:
				"Ahora incorporamos clientes nuevos en menos de una hora. El aislamiento entre espacios de trabajo era exactamente lo que necesitábamos para estar tranquilos de que nada se filtra.",
			role: "Responsable de Operaciones",
		},
		torres: {
			tagline: "Consultora en solitario. 3 productos. Cero solicitudes perdidas.",
			challenge:
				"Mia Torres gestionaba sola el soporte de tres productos SaaS que había creado. Las solicitudes llegaban por correo, por un formulario de contacto y por mensajes directos de Twitter. Se le escapaban cosas constantemente y perdía la pista de a quién ya había respondido.",
			solution:
				"Conectó los 3 canales a Pulse Starter en una tarde. Configuró respuestas predefinidas para sus 10 preguntas más frecuentes y una autorrespuesta para noches y fines de semana.",
			results: [
				{ metric: "< 10 min", label: "Tiempo de configuración" },
				{ metric: "3", label: "Productos gestionados en solitario" },
				{ metric: "0", label: "Solicitudes perdidas desde el lanzamiento" },
				{ metric: "2×", label: "Respuesta más rápida" },
			],
			quote:
				"Llevaba el soporte repartido en tres bandejas y dos navegadores. Pulse Starter lo unificó todo en una tarde. Desde entonces no se me ha escapado ni un mensaje.",
			role: "Consultora independiente",
		},
		contoso: {
			tagline: "Soporte de IT conforme a HIPAA y sin fugas de tickets",
			challenge:
				"El IT sanitario exige un tratamiento de datos hermético. Las herramientas heredadas no podían garantizar la residencia de datos conforme a HIPAA ni los registros de auditoría de cada acción sobre un ticket.",
			solution:
				"Desplegaron el plan Enterprise con residencia de datos en la UE, registro de auditoría completo y controles de acceso por roles vinculados a sus grupos de Active Directory.",
			results: [
				{ metric: "100%", label: "Cobertura del registro de auditoría" },
				{ metric: "0", label: "Incumplimientos de residencia en 18 meses" },
				{ metric: "73%", label: "Informes de cumplimiento más rápidos" },
				{ metric: "91%", label: "Satisfacción de los agentes" },
			],
			quote:
				"En el sector sanitario, una brecha de datos es existencial. Pulse nos dio los controles y los registros de auditoría soberanos que las herramientas heredadas nunca pudieron ofrecer.",
			role: "CISO",
		},
		tailwind: {
			tagline: "Redujeron la acumulación de tickets de 3.200 a menos de 50 en 30 días",
			challenge:
				"Una migración a Microsoft 365 generó una acumulación enorme de tickets. La clasificación manual hacía casi imposible priorizar y los tiempos de respuesta se dispararon a más de 5 días.",
			solution:
				"Usaron la clasificación con IA y el enrutamiento por prioridad para vaciar la cola. Las respuestas automáticas resolvieron el 60% de los tickets de la migración sin intervención de ningún agente.",
			results: [
				{ metric: "98%", label: "Reducción de la cola en 30 días" },
				{ metric: "60%", label: "Tickets autorresueltos por IA" },
				{ metric: "6 h", label: "Frente a 5 días de respuesta" },
				{ metric: "210 K USD", label: "Ahorrados en costes de contratistas" },
			],
			quote: "Solo la clasificación con IA pagó 18 meses de nuestra suscripción en un único mes.",
			role: "Dirección de IT",
		},
		adventure: {
			tagline: "Unificaron 14 colas regionales de soporte en una única bandeja inteligente",
			challenge:
				"Catorce oficinas regionales gestionaban sus propias colas de tickets en herramientas distintas. Las escalaciones entre regiones se perdían con frecuencia.",
			solution:
				"Consolidaron todas las colas en Pulse con enrutamiento por región, rutas de escalación automáticas y un panel de inteligencia compartido para los responsables regionales.",
			results: [
				{ metric: "14→1", label: "Colas unificadas en una" },
				{ metric: "0", label: "Fallos de escalación entre regiones en 6 meses" },
				{ metric: "41%", label: "Menos tickets duplicados" },
				{ metric: "96%", label: "CSAT en todas las regiones" },
			],
			quote:
				"Por primera vez, nuestros responsables regionales ven los mismos datos al mismo tiempo. Eso solo ya cambió cómo hacemos las reuniones de los lunes.",
			role: "Dirección Global de Soporte",
		},
		wingtip: {
			tagline: "Los tickets de soporte de IT del alumnado bajaron un 67% en un semestre",
			challenge:
				"El IT de la universidad se saturaba al inicio de cada semestre con consultas idénticas sobre contraseñas y el sistema de matrícula de miles de estudiantes.",
			solution:
				"Crearon una base de conocimiento de autoservicio con respuestas asistidas por IA, resolvieron automáticamente los 10 tipos de consulta más recurrentes e integraron su portal del alumnado mediante la API.",
			results: [
				{ metric: "67%", label: "Menos tickets en el primer semestre" },
				{ metric: "4,8/5", label: "Satisfacción del alumnado" },
				{ metric: "8 min", label: "Tiempo medio de resolución (antes 3 días)" },
				{ metric: "3 agentes", label: "Hacen ahora lo que requería 11" },
			],
			quote:
				"Nuestro equipo de IT por fin tiene tiempo para proyectos estratégicos en vez de restablecer contraseñas 300 veces al día.",
			role: "VP de Tecnologías de la Información",
		},
	},

	finalCta: {
		tag: "03 — TU TURNO · SIN TARJETA DE CRÉDITO",
		headline: { lead: "¿Listo para escribir tu propia", highlight: "historia?" },
		desc: "Únete a más de 1.200 equipos de soporte que ya transformaron su forma de gestionar tickets.",
		primary: "Empieza la prueba gratis",
		secondary: "Habla con ventas",
	},
};

export default customers;
