import type { SecurityDict } from "../en/security";

const security: SecurityDict = {
	hero: {
		eyebrow: "DOSIER_SEGURIDAD — SOC 2 / GDPR / HIPAA",
		headline: { lead: "Seguridad para", highlight: "jugarte tu reputación", trail: "" },
		subhead:
			"Hecho para todos, desde profesionales en solitario hasta grandes empresas. Cada capa está diseñada para proteger los datos de tus clientes, con controles que escalan según lo que necesites.",
		ctaPrimary: "Solicitar revisión de seguridad",
		ctaSecondary: "Contactar al equipo de seguridad",
		stats: {
			uptime: "SLA DE DISPONIBILIDAD",
			encryption: { value: "AES-256", label: "CIFRADO EN REPOSO" },
			breaches: "BRECHAS DE DATOS HASTA HOY",
			regions: "REGIONES DE RESIDENCIA DE DATOS",
		},
	},

	compliance: {
		sectionLabel: "CUMPLIMIENTO",
		sectionTitle: "Certificaciones y cumplimiento",
		sectionRight: "AUDITADO DE FORMA INDEPENDIENTE",
		intro:
			"Verificado de forma independiente por auditores externos. Los informes de auditoría completos están disponibles para clientes Enterprise bajo acuerdo de confidencialidad.",
		badges: {
			certified: "CERTIFICADO",
			compliant: "CONFORME",
			inProgress: "EN CURSO",
			baaAvailable: "BAA DISPONIBLE",
			verified: "VERIFICADO",
		},
		items: {
			soc2: {
				body: "AICPA",
				description:
					"Auditado de forma independiente cada año. Cubre seguridad, disponibilidad, integridad del procesamiento, confidencialidad y privacidad.",
			},
			gdpr: {
				body: "Reglamento UE 2016/679",
				description:
					"Cumplimiento total del reglamento europeo de protección de datos. DPA disponible para todos los clientes. Residencia de datos en la UE incluida en Enterprise.",
			},
			ccpa: {
				body: "Ley de Privacidad del Consumidor de California",
				description:
					"Derechos de las personas interesadas totalmente admitidos. Las solicitudes de supresión, exportación y exclusión se atienden en 72 horas.",
			},
			iso27001: {
				body: "En curso — 3.er trimestre de 2025",
				description:
					"Auditoría del sistema de gestión de seguridad de la información en marcha. Certificación prevista para el 3.er trimestre de 2025.",
			},
			hipaa: {
				body: "Sanidad de EE. UU.",
				description:
					"BAA disponible para clientes del sector sanitario. Registro de auditoría, cifrado de datos en reposo y en tránsito, y controles de acceso estrictos.",
			},
			microsoft: {
				body: "Microsoft Partner Network",
				description: "Aplicación verificada en Azure Marketplace. Revisada y aprobada por los equipos de seguridad de Microsoft.",
			},
		},
	},

	infrastructure: {
		sectionLabel: "02 — INFRAESTRUCTURA",
		sectionRight: "DEFENSA EN PROFUNDIDAD",
		headline: { lead: "Cada capa,", highlight: "blindada." },
		subhead: "Construido sobre Azure con defensa en profundidad. Auditado de forma independiente.",
		items: {
			hosting: {
				title: "Alojamiento multirregión",
				desc: "Desplegado en Azure en EE. UU. (Este/Oeste), UE (Europa Occidental) y APAC (Sudeste Asiático). La selección de región de residencia de datos está disponible en el plan Enterprise.",
			},
			encryption: {
				title: "Cifrado en reposo y en tránsito",
				desc: "Todos los datos se cifran en reposo con AES-256 y en tránsito con TLS 1.3. Las claves de cifrado se gestionan en Azure Key Vault con rotación automática.",
			},
			uptime: {
				title: "SLA de disponibilidad del 99,97%",
				desc: "Garantía contractual de disponibilidad respaldada por monitorización en tiempo real. Conmutación automática entre zonas de disponibilidad. La página de estado se actualiza en menos de 5 minutos ante cualquier incidencia.",
			},
			cmek: {
				title: "Claves de cifrado gestionadas por el cliente",
				desc: "Los clientes Enterprise pueden aportar sus propias claves de cifrado mediante BYOK de Azure Key Vault. Con CMEK activado, nunca tenemos acceso a datos de cliente sin cifrar.",
			},
			audit: {
				title: "Registro de auditoría completo",
				desc: "Cada acción (ver un ticket, cambiar un estado, exportar, actualizar la configuración) se registra con fecha y hora, usuario, IP y agente de usuario. Los registros se conservan 7 años por defecto.",
			},
			pentest: {
				title: "Pruebas de penetración",
				desc: "Pruebas de penetración anuales realizadas por una firma de seguridad independiente. Los resultados y los plazos de corrección se comparten con clientes Enterprise que lo soliciten.",
			},
		},
	},

	accessAndData: {
		sectionLabel: "03 — ACCESO Y DATOS",
		sectionRight: "TUS DATOS SON TUYOS",
		accessTitle: "Controles de acceso",
		accessIntro: "Controles granulares para que las personas adecuadas accedan exactamente a lo que necesitan, y a nada más.",
		accessControls: [
			"Control de acceso basado en roles (RBAC) con conjuntos de permisos personalizados",
			"SSO de Microsoft 365 y SAML 2.0 en Professional y Enterprise",
			"Aplicación obligatoria de MFA a nivel de organización",
			"Lista blanca de IP para el acceso de los agentes",
			"Políticas de expiración de sesión y de confianza de dispositivo",
			"Ámbitos de tokens de API con mínimo privilegio",
			"Detección y alerta automáticas de inicios de sesión anómalos",
			"Automatización de la salida: desaprovisionamiento en menos de 60 segundos",
		],
		dataTitle: "Tratamiento de datos",
		dataIntro: "Tus datos son tuyos. Sin matices.",
		dataHandling: {
			residency: {
				title: "Residencia de datos",
				desc: "Los clientes del plan Enterprise pueden elegir su región de residencia de datos: Estados Unidos, Unión Europea o Asia-Pacífico. Los datos nunca cruzan regiones sin consentimiento explícito.",
			},
			retention: {
				title: "Conservación de datos",
				desc: "Configura periodos de conservación personalizados por tipo de ticket. Los flujos de eliminación automática se ejecutan cada noche. Los clientes pueden solicitar la eliminación inmediata mediante la API.",
			},
			portability: {
				title: "Portabilidad de datos",
				desc: "Exporta todo tu archivo de datos en cualquier momento en formato JSON o CSV. Al cancelar la cuenta, la ventana de exportación permanece abierta 90 días.",
			},
			subprocessors: {
				title: "Subencargados",
				desc: "Publicamos y mantenemos actualizada la lista completa de subencargados. Avisamos con 30 días de antelación de cualquier subencargado nuevo. Los clientes Enterprise pueden oponerse.",
			},
		},
	},

	disclosure: {
		sectionLabel: "04 — DIVULGACIÓN",
		sectionRight: "INVESTIGACIÓN DE BUENA FE BIENVENIDA",
		title: "Divulgación responsable",
		intro:
			"Nos tomamos en serio cada informe de seguridad. Si crees que has encontrado una vulnerabilidad en Pulse, contáctanos antes de divulgarla públicamente.",
		steps: [
			"Informa de una vulnerabilidad en security@pulse.cc",
			"Confirmamos la recepción en 24 horas",
			"Evaluamos la gravedad y empezamos a corregir en 72 horas si es crítica",
			"Damos crédito a los investigadores en nuestro Hall of Fame al publicar la corrección",
			"No emprendemos acciones legales contra investigadores de buena fe",
		],
		ctaPrimary: "Informar de una vulnerabilidad",
		ctaSecondary: "Hablar con nuestro equipo de seguridad",
	},

	finalCta: {
		tag: "05 — REVISIÓN · DPA / INFORMES DE AUDITORÍA / NDA",
		headline: { lead: "Revisión de seguridad para tu", highlight: "equipo." },
		desc: "¿Necesitas una revisión de seguridad a medida, un DPA o un informe de auditoría? Nuestro equipo de seguridad está para ayudarte, seas un profesional en solitario o una gran empresa.",
		primary: "Solicitar una revisión",
		secondary: "Ver la página de estado",
	},
};

export default security;
