import type { BlogDict } from "../en/blog";

const blog: BlogDict = {
	hero: {
		eyebrow: "DESPACHOS — NOTAS DE CAMPO Y GUÍAS",
		headline: { lead: "Ideas para", highlight: "cualquier equipo de soporte" },
		subhead: "Guías, novedades de producto e historias de equipos, agencias y profesionales que construyen mejor soporte.",
		allTag: "Todos",
	},

	tags: {
		ai: "IA",
		product: "Producto",
		guide: "Guía",
		agency: "Agencias",
		solo: "Autónomos y equipos pequeños",
	},

	featured: {
		sectionLabel: "01 — DESPACHO DESTACADO",
		sectionRight: "ÚLTIMA TRANSMISIÓN",
		readSuffix: "DE LECTURA",
		readArticle: "Leer el artículo",
	},

	archive: {
		sectionLabel: "ARCHIVO",
		sectionTitle: "Todos los despachos",
		sectionRight: "{count} ENTRADAS EN EL ARCHIVO",
	},

	roles: {
		cto: "CTO",
		cs: "Dirección de Éxito del Cliente",
		product: "Dirección de Producto",
	},

	posts: {
		aiAgents: {
			title: "Cómo los agentes de IA resuelven el 80% de los tickets sin intervención humana",
			excerpt:
				"Un análisis a fondo del pipeline de clasificación, recuperación de contexto y generación de respuestas que impulsa los agentes de IA de Pulse, y los casos límite que tuvimos que resolver.",
			date: "18 FEB 2025",
			readTime: "8 MIN",
		},
		sla: {
			title: "Guía de supervivencia del SLA para equipos de soporte en crecimiento",
			excerpt:
				"Incumplir el SLA daña el CSAT, las renovaciones y la moral del equipo. Este es el marco que recomendamos a equipos que pasan de 5 a 50 agentes.",
			date: "11 FEB 2025",
			readTime: "6 MIN",
		},
		agency: {
			title: "Cómo las agencias gestionan el soporte de más de 8 clientes sin perder la cabeza",
			excerpt:
				"Las herramientas, los flujos y las rutinas que usan las agencias de soporte de alto rendimiento para mantener limpia la cola de cada cliente, sin cambiar de contexto todo el día.",
			date: "4 FEB 2025",
			readTime: "7 MIN",
		},
		csat: {
			title: "Cómo Fabrikam subió su CSAT del 60% al 90% en 90 días",
			excerpt:
				"Un caso práctico sobre cómo combinar autorrespuestas con IA, enrutamiento por competencias y una planificación de turnos estructurada para lograr un giro radical en la satisfacción.",
			date: "28 ENE 2025",
			readTime: "5 MIN",
		},
		portal: {
			title: "Cómo crear un portal de autoservicio que tus clientes usen de verdad",
			excerpt:
				"La mayoría de los portales de autoservicio fracasan porque son difíciles de encontrar y aún más de buscar. Esto es lo que aprendimos construyendo el portal de Pulse.",
			date: "21 ENE 2025",
			readTime: "7 MIN",
		},
		tagging: {
			title: "Por qué tu taxonomía de etiquetas de tickets probablemente está mal",
			excerpt:
				"Las etiquetas manuales se desvían. Las automáticas con IA no, si las siembras bien. Una guía práctica para construir una taxonomía de etiquetas que escale.",
			date: "14 ENE 2025",
			readTime: "6 MIN",
		},
		solo: {
			title: "Soporte en solitario: cómo atender más de 200 solicitudes semanales sin quemarte",
			excerpt:
				"Las respuestas predefinidas, las bandejas inteligentes y unas pocas reglas de IA pueden hacer el trabajo de una segunda contratación. Una guía práctica para autónomos que gestionan el soporte de sus clientes.",
			date: "7 ENE 2025",
			readTime: "6 MIN",
		},
	},

	newsletter: {
		tag: "03 — SUSCRÍBETE · UN CORREO / SEMANA · SIN SPAM",
		headline: { lead: "No te pierdas ningún", highlight: "despacho." },
		desc: "Nuestros mejores artículos sobre soporte con IA, operaciones y novedades de producto, directos a tu bandeja.",
		emailPlaceholder: "TU@EMPRESA.COM",
		submit: "Suscribirme",
		unsubscribe: "PUEDES DARTE DE BAJA EN CUALQUIER MOMENTO",
	},
};

export default blog;
