import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Redis is a cache and a refresh-token allow-list, not a hard dependency.
// If it is unreachable the app must keep serving requests, so every failure
// mode below degrades instead of throwing.

let redis = null;
let ready = false;
let loggedError = false;

const url = process.env.UPSTASH_REDIS_URL;

if (!url) {
	console.warn("⚠️  UPSTASH_REDIS_URL is not set — running without cache.");
} else {
	redis = new Redis(url, {
		lazyConnect: true, // don't connect at import time, so a bad URL can't break startup
		enableOfflineQueue: false, // fail fast while disconnected instead of buffering forever
		maxRetriesPerRequest: 2,
		connectTimeout: 10_000,
		retryStrategy: (attempt) => Math.min(attempt * 500, 5_000),
	});

	// ioredis reports connection failures through the 'error' event. Without a
	// listener Node treats it as an unhandled 'error' and kills the process —
	// that is what turned a Redis blip into a restart loop on Render.
	redis.on("error", (error) => {
		ready = false;
		if (!loggedError) {
			console.warn("⚠️  Redis unavailable, running without cache:", error.message);
			loggedError = true; // reconnect attempts fire this constantly; log once per outage
		}
	});

	redis.on("ready", () => {
		ready = true;
		loggedError = false;
		console.log("✅ Redis connected");
	});

	redis.on("end", () => {
		ready = false;
	});

	redis.connect().catch((error) => {
		console.warn("⚠️  Initial Redis connection failed:", error.message);
	});
}

export const isRedisAvailable = () => Boolean(redis) && ready;

export const safeRedisGet = async (key) => {
	if (!isRedisAvailable()) return null;
	try {
		return await redis.get(key);
	} catch (error) {
		console.warn("Redis GET failed:", error.message);
		return null;
	}
};

export const safeRedisSet = async (key, value, expirationSeconds = 3600) => {
	if (!isRedisAvailable()) return false;
	try {
		if (expirationSeconds) {
			await redis.set(key, value, "EX", expirationSeconds);
		} else {
			await redis.set(key, value);
		}
		return true;
	} catch (error) {
		console.warn("Redis SET failed:", error.message);
		return false;
	}
};

export const safeRedisDel = async (key) => {
	if (!isRedisAvailable()) return false;
	try {
		await redis.del(key);
		return true;
	} catch (error) {
		console.warn("Redis DEL failed:", error.message);
		return false;
	}
};

export { redis };
