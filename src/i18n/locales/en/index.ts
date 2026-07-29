import common from "./common";
import meta from "./meta";
import landing from "./landing";
import pricing from "./pricing";
import features from "./features";

// English is the source of truth: `Dictionary` is derived from this object, so
// every other locale is checked against it at compile time. A missing or
// misspelled key in a translation is a type error, not a runtime surprise.

const en = {
	common,
	meta,
	landing,
	pricing,
	features,
};

export default en;
