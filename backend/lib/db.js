import mongoose from "mongoose";

// The previous version called process.exit(1) on the first failed connection.
// On Render that meant a paused Atlas cluster or one slow DNS lookup killed the
// container, Render restarted it, and it died again — the restart loop.
// Now: retry with backoff, stay up either way, and let /api/health report the truth.

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 2_000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let listenersAttached = false;

const attachListeners = () => {
	if (listenersAttached) return;
	listenersAttached = true;

	mongoose.connection.on("disconnected", () => {
		console.warn("⚠️  MongoDB disconnected — the driver will keep retrying");
	});

	mongoose.connection.on("reconnected", () => {
		console.log("✅ MongoDB reconnected");
	});

	// Without a listener here a connection error after startup is an unhandled
	// 'error' event, which takes the process down.
	mongoose.connection.on("error", (error) => {
		console.error("MongoDB connection error:", error.message);
	});
};

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
	if (!process.env.MONGO_URI) {
		console.error("❌ MONGO_URI is not set — the API will start but every database call will fail.");
		return false;
	}

	attachListeners();

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		try {
			const conn = await mongoose.connect(process.env.MONGO_URI, {
				serverSelectionTimeoutMS: 10_000,
			});
			console.log(`✅ MongoDB connected: ${conn.connection.host}`);
			return true;
		} catch (error) {
			const delay = BASE_DELAY_MS * 2 ** (attempt - 1);

			if (attempt === MAX_ATTEMPTS) {
				console.error(`❌ MongoDB connection failed after ${MAX_ATTEMPTS} attempts: ${error.message}`);
				console.error("   The server stays up so /api/health can report the outage.");
				console.error("   Check that the Atlas cluster is running and that Render's IP is allowed.");
				return false;
			}

			console.warn(
				`MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed (${error.message}) — retrying in ${delay / 1000}s`
			);
			await wait(delay);
		}
	}

	return false;
};
