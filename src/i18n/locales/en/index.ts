import common from "./common";
import meta from "./meta";
import landing from "./landing";
import pricing from "./pricing";
import features from "./features";
import legal from "./legal";
import solutions from "./solutions";
import about from "./about";
import contact from "./contact";
import customers from "./customers";
import integrations from "./integrations";
import help from "./help";
import status from "./status";
import blog from "./blog";
import changelog from "./changelog";
import careers from "./careers";
import security from "./security";

// English is the source of truth: `Dictionary` is derived from this object, so
// every other locale is checked against it at compile time. A missing or
// misspelled key in a translation is a type error, not a runtime surprise.

const en = {
	common,
	meta,
	landing,
	pricing,
	features,
	legal,
	solutions,
	about,
	contact,
	customers,
	integrations,
	help,
	status,
	blog,
	changelog,
	careers,
	security,
};

export default en;
