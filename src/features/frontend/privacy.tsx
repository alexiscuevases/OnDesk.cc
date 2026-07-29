import { LegalPage, type LegalSection } from "./legal-page";
import { useI18n, useLocalizedSeo } from "@/i18n";

// Section ids and their order live here, not in the dictionary: `#data-retention`
// and friends are linkable anchors that must survive translation.
const SECTION_IDS = [
	"information-we-collect",
	"how-we-use-your-information",
	"data-sharing",
	"data-retention",
	"security",
	"your-rights",
	"cookies",
	"international-transfers",
	"contact",
] as const;

export default function PrivacyPage() {
	const { dict, locale } = useI18n();
	useLocalizedSeo({ ...dict.meta.privacy, path: "/privacy", locale });

	const copy = dict.legal.privacy;
	const sections: LegalSection[] = SECTION_IDS.map((id) => ({ id, ...copy.sections[id] }));

	return (
		<LegalPage
			code={copy.code}
			heading={copy.heading}
			headingHighlight={copy.headingHighlight}
			lastUpdated={copy.lastUpdated}
			entity="OnDesk.cc Ltd."
			description={copy.description}
			secondaryLink={{ href: "/security", label: copy.secondaryLinkLabel }}
			aside={{ ...copy.aside, email: "dpo@pulse.cc" }}
			sections={sections}
		/>
	);
}
