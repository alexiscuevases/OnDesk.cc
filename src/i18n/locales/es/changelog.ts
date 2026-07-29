import type { ChangelogDict } from "../en/changelog";

const changelog: ChangelogDict = {
	hero: {
		eyebrow: "REGISTRO_VERSIONES — DESPLIEGUE CONTINUO",
		headline: { lead: "Cada versión,", highlight: "a la vista" },
		subhead: "Seguimos la evolución continua de Pulse como la plataforma de soporte autónomo más avanzada del mundo.",
		cta: "Suscribirse a las novedades",
	},

	filters: { all: "Todas", major: "Mayor", minor: "Menor", patch: "Parche" },

	releasesFound: {
		one: "{count} VERSIÓN ENCONTRADA",
		other: "{count} VERSIONES ENCONTRADAS",
	},

	changeTypes: { new: "NUEVO", improvement: "MEJORA", fix: "ARREGLO" },

	releases: {
		"3.5.0": {
			date: "MAR 2025",
			headline: "Pulse Starter, Google Workspace y respuestas predefinidas más inteligentes",
			changes: [
				"Plan Pulse Starter: tarifa plana para profesionales en solitario y equipos pequeños",
				"Integración con Google Workspace: ya se admiten los canales de Gmail y Google Chat",
				"Las respuestas predefinidas ahora admiten personalización asistida por IA antes de enviarse",
				"Integraciones de e-commerce: contexto de pedidos de Stripe y Shopify en la barra lateral del ticket",
				"App móvil: los filtros de la bandeja se conservan entre sesiones",
				"Corregida la búsqueda de respuestas predefinidas, que no devolvía resultados con caracteres acentuados",
			],
		},
		"3.4.0": {
			date: "FEB 2025",
			headline: "La actualización de orquestación de Pulse: más inteligente, más rápida, soberana",
			changes: [
				"Agentes de IA v2: razonamiento multiturno con memoria y conciencia del contexto",
				"Integración con Microsoft Copilot (beta): muestra el contexto del ticket en Copilot Chat",
				"Selector de residencia de datos para las regiones de la UE y APAC",
				"La latencia de primera respuesta de la IA se reduce un 40%",
				"La lista de tickets ya admite asignación y cierre en bloque",
				"Corregido un caso límite en el que el reloj del SLA no se pausaba en estado pendiente-cliente",
			],
		},
		"3.3.2": {
			date: "ENE 2025",
			headline: "Fiabilidad de las notificaciones y pulido del modo oscuro",
			changes: [
				"Resuelta la duplicación de notificaciones de Teams al reasignar un ticket",
				"El enlace de la encuesta CSAT ahora se muestra correctamente en Outlook móvil",
				"Mejorados los ratios de contraste del modo oscuro en todos los paneles",
			],
		},
		"3.3.0": {
			date: "DIC 2024",
			headline: "Portal de autoservicio, Power Automate y Twilio Voice",
			changes: [
				"Portal de autoservicio con soporte para dominio propio",
				"Conector de Power Automate: dispara flujos desde cualquier evento de ticket",
				"De llamada a ticket: transcripción y creación automática con Twilio Voice",
				"El selector de rango de fechas de analítica ya admite rangos personalizados",
				"Las vistas previas de adjuntos de SharePoint se cargan sin volver a autenticarse",
			],
		},
		"3.2.0": {
			date: "NOV 2024",
			headline: "Canal de WhatsApp y enrutamiento por competencias",
			changes: [
				"Bandeja omnicanal: WhatsApp a través de Twilio",
				"Motor de reglas de enrutamiento por competencias",
				"Fusión de tickets: combina envíos duplicados en un solo hilo",
				"Mejoras de rendimiento en la app móvil (iOS y Android)",
				"Corregidos los errores de desfase horario en las alertas de incumplimiento de SLA",
			],
		},
		"3.1.0": {
			date: "OCT 2024",
			headline: "Etiquetado automático con IA y sincronización bidireccional con Jira",
			changes: [
				"Etiquetado automático con IA: los tickets se clasifican en categorías automáticamente",
				"Sincronización bidireccional con Jira: los cambios de estado se reflejan en ambos sistemas",
				"La búsqueda ahora indexa el cuerpo del ticket (texto completo)",
				"Resuelto el recuento incorrecto de tickets en el mapa de calor de carga del equipo",
			],
		},
		"3.0.0": {
			date: "SEP 2024",
			headline: "Pulse v3: la plataforma, reconstruida desde cero",
			changes: [
				"Pulse v3: revisión integral de la arquitectura y nuevo sistema de diseño",
				"Agentes de IA v1: clasificación automática y primera respuesta",
				"Integraciones nativas con Microsoft 365 y Google Workspace",
				"Enterprise: claves de cifrado gestionadas por el cliente (plan Enterprise)",
				"Analítica avanzada con CSAT, NPS y previsión de volumen",
			],
		},
	},

	finalCta: {
		tag: "EOF — PROGRAMA BETA · DEFINE LO QUE VIENE",
		headline: { lead: "¿Quieres acceso", highlight: "anticipado?" },
		desc: "Únete a nuestro programa beta y ayuda a definir la hoja de ruta antes de que las funciones se publiquen. Tus comentarios deciden lo que construimos.",
		primary: "Solicitar acceso beta",
		secondary: "Empieza la prueba gratis",
	},
};

export default changelog;
