import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// `new Stripe(undefined)` throws at import time. Because this module is imported
// transitively from server.js, a missing or misspelled STRIPE_SECRET_KEY killed
// the process before it ever bound a port — a boot crash that looked identical
// to a database outage in the Render logs.
//
// Instead: start without Stripe and fail loudly at the point of use, so only
// checkout breaks rather than the whole site.
const key = process.env.STRIPE_SECRET_KEY;

const missingKeyError = () => {
	const error = new Error("STRIPE_SECRET_KEY is not set — payment routes are unavailable");
	error.status = 503;
	return error;
};

let client;

if (key) {
	client = new Stripe(key);
} else {
	console.warn("⚠️  STRIPE_SECRET_KEY is not set — payment routes will return 503.");

	client = new Proxy(
		{},
		{
			get() {
				throw missingKeyError();
			},
		}
	);
}

export const isStripeConfigured = () => Boolean(key);

export const stripe = client;
