import type { LegalDict } from "../en/legal";

// Courtesy translation of binding documents: `prevailingNotice` states that the
// English version governs, which is the standard safeguard when legal terms are
// published in more than one language. Have counsel review before publishing.

const legal: LegalDict = {
	chrome: {
		eyebrow: "LEGAL",
		lastUpdated: "ÚLTIMA ACTUALIZACIÓN:",
		clauses: "{count} CLÁUSULAS",
		index: "ÍNDICE",
		contactCta: "¿Dudas? Contáctanos",
		endOfDocument: "FIN DEL DOCUMENTO",
		signalEnd: "SIG.END",
		prevailingNotice:
			"Esta es una traducción de cortesía. En caso de discrepancia, la versión en inglés de este documento es la que prevalece.",
	},

	privacy: {
		code: "POLITICA_PRIVACIDAD / REV 2025.03.01",
		heading: "Política de",
		headingHighlight: "Privacidad",
		lastUpdated: "1 de marzo de 2025",
		description:
			"Esta Política de Privacidad describe cómo Pulse Intelligence Ltd. recopila, usa y comparte información sobre ti cuando utilizas nuestros servicios.",
		secondaryLinkLabel: "Resumen de seguridad",
		aside: { title: "¿DUDAS DE PRIVACIDAD?", desc: "Contacta a nuestro Delegado de Protección de Datos." },
		sections: {
			"information-we-collect": {
				title: "Información que recopilamos",
				body: [
					"Recopilamos la información que nos facilitas directamente, por ejemplo al crear una cuenta, enviar un ticket de soporte o contactarnos. Esto incluye:",
					[
						"Datos de la cuenta: nombre, dirección de correo electrónico, nombre de la empresa y contraseña.",
						"Contenido de los tickets: mensajes, archivos adjuntos y metadatos enviados a través de Pulse.",
						"Datos de uso: registros, direcciones IP, tipo de navegador, páginas visitadas y acciones realizadas en la plataforma.",
						"Datos de pago: procesados de forma segura por Stripe; no almacenamos números de tarjeta en bruto.",
					],
					"También recopilamos información de forma automática mediante cookies y tecnologías similares cuando usas nuestros servicios.",
				],
			},
			"how-we-use-your-information": {
				title: "Cómo usamos tu información",
				body: [
					"Usamos la información que recopilamos para:",
					[
						"Prestar, mantener y mejorar Pulse.",
						"Procesar transacciones y enviar información relacionada, incluidas confirmaciones y facturas.",
						"Enviar avisos técnicos, actualizaciones, alertas de seguridad y mensajes de soporte.",
						"Responder a tus comentarios y preguntas.",
						"Supervisar y analizar tendencias, uso y actividad en relación con nuestros servicios.",
						"Detectar, investigar y prevenir transacciones fraudulentas y otras actividades ilícitas.",
						"Cumplir con nuestras obligaciones legales.",
					],
				],
			},
			"data-sharing": {
				title: "Compartición de datos",
				body: [
					"No vendemos tus datos personales. Podemos compartir tu información con:",
					[
						"Proveedores de servicios: terceros que prestan servicios por cuenta nuestra (por ejemplo, alojamiento en la nube, procesamiento de pagos, envío de correo). Estas partes están sujetas a obligaciones de confidencialidad.",
						"Microsoft: si decides conectar tu tenant de Microsoft 365, los datos circulan por la infraestructura de Microsoft y quedan sujetos a sus condiciones de privacidad.",
						"Requerimientos legales: cuando lo exija la ley, una orden judicial o una autoridad pública.",
						"Operaciones societarias: en el contexto de una fusión, adquisición o venta total o parcial de nuestros activos.",
					],
				],
			},
			"data-retention": {
				title: "Conservación de datos",
				body: [
					"Conservamos tus datos personales mientras tu cuenta esté activa o durante el tiempo necesario para prestar los servicios. Tras la eliminación de la cuenta, borramos o anonimizamos tus datos en un plazo de 90 días, salvo cuando debamos conservarlos por motivos legales o de cumplimiento normativo.",
					"Los datos de tickets y el historial de conversaciones pueden conservarse hasta 7 años cuando existan requisitos de registro de auditoría. La conservación ampliada está disponible en todos los planes; los planes Enterprise incluyen además exportaciones de registros de auditoría con nivel de cumplimiento normativo.",
				],
			},
			security: {
				title: "Seguridad",
				body: [
					"Aplicamos medidas de seguridad conformes al estándar del sector, entre ellas:",
					[
						"Cifrado TLS 1.3 para todos los datos en tránsito.",
						"Cifrado AES-256 para los datos en reposo.",
						"Infraestructura certificada SOC 2 Tipo II alojada en Microsoft Azure.",
						"Controles de acceso basados en roles y registro de auditoría.",
						"Pruebas de penetración periódicas realizadas por terceros.",
					],
					"Ningún método de transmisión por Internet es 100% seguro. Nos esforzamos por proteger tu información, pero no podemos garantizar una seguridad absoluta.",
				],
			},
			"your-rights": {
				title: "Tus derechos",
				body: [
					"Según tu ubicación, puedes tener derecho a:",
					[
						"Acceder a los datos personales que tenemos sobre ti.",
						"Rectificar datos inexactos o incompletos.",
						"Solicitar la supresión de tus datos personales.",
						"Oponerte al tratamiento de tus datos o solicitar su limitación.",
						"Portabilidad de los datos: recibir una copia de tus datos en un formato estructurado y legible por máquina.",
						"Retirar tu consentimiento en cualquier momento cuando el tratamiento se base en él.",
					],
					"Para ejercer estos derechos, escríbenos a privacy@pulse.cc. Responderemos en un plazo de 30 días.",
				],
			},
			cookies: {
				title: "Cookies",
				body: [
					"Usamos cookies y tecnologías de seguimiento similares para operar y mejorar nuestros servicios. Puedes controlar las cookies desde la configuración de tu navegador. Desactivarlas puede limitar algunas funciones de Pulse.",
					"Utilizamos:",
					[
						"Cookies estrictamente necesarias: imprescindibles para el funcionamiento básico de la plataforma.",
						"Cookies analíticas: para entender cómo interactúan los usuarios con nuestro servicio (por ejemplo, Plausible Analytics, que cumple el RGPD y por defecto no usa cookies).",
						"Cookies de preferencias: para recordar tus ajustes y preferencias.",
					],
				],
			},
			"international-transfers": {
				title: "Transferencias internacionales",
				body: [
					"Tu información puede transferirse y tratarse en países distintos al tuyo. Nos aseguramos de aplicar las garantías adecuadas, incluidas las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.",
					"La selección de región de residencia de los datos (EE. UU., UE o APAC) está disponible para clientes del plan Enterprise desde los ajustes de la plataforma.",
				],
			},
			contact: {
				title: "Contacto",
				body: [
					"Si tienes alguna pregunta sobre esta Política de Privacidad, contáctanos:",
					[
						"Correo: privacy@pulse.cc",
						"Dirección postal: Pulse Intelligence Ltd., Data Protection Office, 123 Innovation Way, Londres, EC2A 4NE, Reino Unido",
					],
					"Los residentes en la UE pueden contactar a nuestro Delegado de Protección de Datos en dpo@pulse.cc.",
				],
			},
		},
	},

	terms: {
		code: "TERMINOS_SERVICIO / REV 2025.03.01",
		heading: "Términos del",
		headingHighlight: "Servicio",
		lastUpdated: "1 de marzo de 2025",
		description:
			"Lee atentamente estos Términos del Servicio antes de usar Pulse. Estos Términos constituyen un acuerdo legalmente vinculante entre tú y Pulse Intelligence Ltd.",
		secondaryLinkLabel: "Política de Privacidad",
		aside: { title: "¿DUDAS LEGALES?", desc: "Contacta directamente a nuestro equipo legal." },
		sections: {
			"acceptance-of-terms": {
				title: "Aceptación de los términos",
				body: [
					'Al acceder o utilizar Pulse (el "Servicio"), aceptas quedar vinculado por estos Términos del Servicio (los "Términos"). Si no estás de acuerdo con ellos, no utilices el Servicio.',
					"Estos Términos se aplican a todos los visitantes, usuarios y demás personas que accedan o utilicen el Servicio. Si utilizas el Servicio en nombre de una empresa u otra entidad jurídica, declaras que tienes facultades para vincular a dicha entidad a estos Términos.",
				],
			},
			"use-of-the-service": {
				title: "Uso del servicio",
				body: [
					"Solo puedes usar el Servicio con fines lícitos y conforme a estos Términos. Te comprometes a no:",
					[
						"Usar el Servicio de cualquier forma que infrinja leyes o normativas aplicables.",
						"Transmitir material abusivo, acosador, ilícito, difamatorio, vulgar o que vulnere la privacidad de terceros.",
						"Intentar obtener acceso no autorizado a cualquier parte del Servicio o a los sistemas conectados a él.",
						"Usar el Servicio para enviar comunicaciones no solicitadas (spam).",
						"Aplicar ingeniería inversa, desensamblar o descompilar cualquier parte del Servicio.",
						"Revender, sublicenciar o transferir de otro modo tu acceso al Servicio a terceros sin nuestro consentimiento previo por escrito.",
					],
				],
			},
			accounts: {
				title: "Cuentas",
				body: [
					"Eres responsable de proteger la contraseña con la que accedes al Servicio y de toda actividad realizada en tu cuenta. Te recomendamos usar una contraseña robusta y activar la autenticación multifactor.",
					"Debes notificarnos de inmediato en cuanto tengas conocimiento de cualquier brecha de seguridad o uso no autorizado de tu cuenta. No seremos responsables de las pérdidas o daños derivados del incumplimiento de esta obligación.",
				],
			},
			"subscription-and-billing": {
				title: "Suscripción y facturación",
				body: [
					"Determinadas funciones del Servicio están disponibles mediante suscripción de pago. Al suscribirte, nos autorizas a cargar tu método de pago de forma recurrente.",
					"Las cuotas no son reembolsables, salvo cuando lo exija la ley o se indique expresamente en estos Términos. Podemos modificar las cuotas de suscripción en cualquier momento, pero avisaremos con al menos 30 días de antelación antes de que cualquier incremento surta efecto.",
					"Tu suscripción puede facturarse por agente o con tarifa plana, según el plan elegido. Consulta la página de precios o tu confirmación de pedido para conocer el modelo de facturación aplicable a tu cuenta.",
					"Si tu pago falla, podemos suspender el acceso al Servicio hasta recibirlo. Transcurridos 14 días de impago, nos reservamos el derecho de cancelar tu cuenta.",
				],
			},
			"intellectual-property": {
				title: "Propiedad intelectual",
				body: [
					"El Servicio y su contenido, funciones y funcionalidades originales son y seguirán siendo propiedad exclusiva de Pulse Intelligence Ltd. y de sus licenciantes. El Servicio está protegido por las leyes de derechos de autor, marcas y otras normas de propiedad intelectual.",
					'Conservas la titularidad de todo el contenido que envíes, publiques o muestres a través del Servicio (el "Contenido del Cliente"). Al enviar Contenido del Cliente, nos concedes una licencia mundial, no exclusiva y libre de regalías para usar, tratar y mostrar dicho contenido con el único fin de prestar el Servicio.',
				],
			},
			confidentiality: {
				title: "Confidencialidad",
				body: [
					"Cada parte se compromete a mantener la confidencialidad de toda información no pública de la otra parte que esté designada como confidencial o que, por su naturaleza, deba entenderse razonablemente como tal.",
					"Esta obligación no se aplica a la información que: (a) sea o pase a ser pública sin culpa de la parte receptora; (b) fuera conocida por la parte receptora antes de su divulgación; (c) haya sido desarrollada de forma independiente por la parte receptora sin usar la información confidencial.",
				],
			},
			"service-availability": {
				title: "Disponibilidad del servicio",
				body: [
					"Nuestro objetivo es ofrecer una disponibilidad mensual del 99,9% del Servicio, según lo descrito en nuestro Acuerdo de Nivel de Servicio. Las ventanas de mantenimiento programado quedan excluidas del cálculo de disponibilidad y se comunicarán con al menos 48 horas de antelación.",
					"En caso de interrupción del servicio, nuestra página de estado (pulse.cc/status) se actualizará en tiempo real. Los créditos por indisponibilidad por debajo del umbral del SLA están disponibles, previa solicitud, para clientes de los planes Starter, Professional y Enterprise.",
				],
			},
			"data-processing": {
				title: "Tratamiento de datos",
				body: [
					'Al usar el Servicio, nos autorizas a tratar el Contenido del Cliente conforme a nuestra Política de Privacidad y, cuando corresponda, al Acuerdo de Tratamiento de Datos ("DPA") disponible para todos los clientes. Los clientes Enterprise pueden solicitar un DPA ampliado con cláusulas adicionales de residencia de datos y auditoría.',
					"Para los clientes sujetos al RGPD, actuamos como Encargado del Tratamiento respecto de los datos personales contenidos en el Contenido del Cliente. Nuestra Política de Privacidad describe cómo tratamos dichos datos.",
				],
			},
			"disclaimer-of-warranties": {
				title: "Exclusión de garantías",
				body: [
					'EL SERVICIO SE PRESTA "TAL CUAL" Y "SEGÚN DISPONIBILIDAD", SIN GARANTÍAS DE NINGÚN TIPO, NI EXPRESAS NI IMPLÍCITAS, INCLUIDAS, ENTRE OTRAS, LAS GARANTÍAS IMPLÍCITAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN CONCRETO Y NO INFRACCIÓN.',
					"No garantizamos que el Servicio sea ininterrumpido, libre de errores o libre de virus u otros componentes dañinos.",
				],
			},
			"limitation-of-liability": {
				title: "Limitación de responsabilidad",
				body: [
					"EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE, PULSE INTELLIGENCE LTD. NO SERÁ EN NINGÚN CASO RESPONSABLE DE DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS, NI DE DAÑOS POR LUCRO CESANTE, PÉRDIDA DE INGRESOS, DATOS, FONDO DE COMERCIO U OTRAS PÉRDIDAS INTANGIBLES.",
					"NUESTRA RESPONSABILIDAD TOTAL FRENTE A TI POR CUALQUIER RECLAMACIÓN DERIVADA DE ESTOS TÉRMINOS O DEL SERVICIO, O RELACIONADA CON ELLOS, NO EXCEDERÁ LA MAYOR DE LAS SIGUIENTES CANTIDADES: (A) EL IMPORTE ABONADO POR TI EN LOS 12 MESES ANTERIORES A LA RECLAMACIÓN O (B) CIEN DÓLARES ESTADOUNIDENSES (100 USD).",
				],
			},
			termination: {
				title: "Terminación",
				body: [
					"Podemos cancelar o suspender tu cuenta y tu acceso al Servicio de forma inmediata, sin aviso previo ni responsabilidad, si incumples estos Términos.",
					"Tras la terminación, tu derecho a usar el Servicio cesará de inmediato. Seguirán vigentes todas las disposiciones de estos Términos que por su naturaleza deban subsistir, incluidas las relativas a propiedad intelectual, exclusión de garantías y limitación de responsabilidad.",
					"Puedes cancelar tu cuenta en cualquier momento contactándonos. Tras la terminación, dispondrás de una ventana de 30 días para exportar tus datos antes de su eliminación.",
				],
			},
			"changes-to-terms": {
				title: "Modificaciones de los términos",
				body: [
					"Nos reservamos el derecho de modificar estos Términos en cualquier momento. Si realizamos cambios sustanciales, te avisaremos por correo electrónico o mediante un aviso destacado en el Servicio con al menos 30 días de antelación a su entrada en vigor.",
					"El uso continuado del Servicio después de la fecha de entrada en vigor de los Términos revisados constituye tu aceptación de los cambios.",
				],
			},
			"governing-law": {
				title: "Legislación aplicable",
				body: [
					"Estos Términos se regirán e interpretarán conforme a las leyes de Inglaterra y Gales, sin atender a sus normas sobre conflicto de leyes.",
					"Cualquier controversia derivada de estos Términos o relacionada con ellos quedará sometida a la jurisdicción exclusiva de los tribunales de Inglaterra y Gales.",
				],
			},
			contact: {
				title: "Contacto",
				body: [
					"Si tienes alguna pregunta sobre estos Términos, escríbenos a legal@pulse.cc o a:",
					["Pulse Intelligence Ltd.", "123 Innovation Way", "Londres, EC2A 4NE", "Reino Unido"],
				],
			},
		},
	},
};

export default legal;
