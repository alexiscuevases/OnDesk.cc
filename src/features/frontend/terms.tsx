import { LegalPage, type LegalSection } from "./legal-page";
import { useI18n, useLocalizedSeo } from "@/i18n";

// Ids and ordering stay in code so `#limitation-of-liability` and friends remain
// stable, linkable anchors across every language.
const SECTION_IDS = [
	"acceptance-of-terms",
	"use-of-the-service",
	"accounts",
	"subscription-and-billing",
	"intellectual-property",
	"confidentiality",
	"service-availability",
	"data-processing",
	"disclaimer-of-warranties",
	"limitation-of-liability",
	"termination",
	"changes-to-terms",
	"governing-law",
	"contact",
] as const;

export default function TermsPage() {
	const { dict, locale } = useI18n();
	useLocalizedSeo({ ...dict.meta.terms, path: "/terms", locale });

	const copy = dict.legal.terms;
	const sections: LegalSection[] = SECTION_IDS.map((id) => ({ id, ...copy.sections[id] }));

	return (
		<LegalPage
			code={copy.code}
			heading={copy.heading}
			headingHighlight={copy.headingHighlight}
			lastUpdated={copy.lastUpdated}
			entity="Pulse Intelligence Ltd."
			description={copy.description}
			secondaryLink={{ href: "/privacy", label: copy.secondaryLinkLabel }}
			aside={{ ...copy.aside, email: "legal@pulse.cc" }}
			sections={sections}
		/>
	);
}
