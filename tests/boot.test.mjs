/**
 * Boot-resilience test.
 *
 * The server used to exit(1) when MongoDB was unreachable, and ioredis had no
 * 'error' listener so a Redis blip raised an unhandled error event. Either one
 * killed the process, Render restarted it, and it died again — the restart loop.
 *
 * This starts the real server with every external dependency pointed at a dead
 * port and asserts it stays up and reports the outage instead of crashing.
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 5097;

const server = spawn(process.execPath, [path.join(root, "backend", "server.js")], {
	env: {
		...process.env,
		PORT: String(PORT),
		NODE_ENV: "test",
		MONGO_URI: "mongodb://127.0.0.1:59999/nope?directConnection=true",
		UPSTASH_REDIS_URL: "redis://127.0.0.1:59998",
		JWT_ACCESS_TOKEN: "test-access",
		JWT_REFRESH_TOKEN: "test-refresh",
		STRIPE_SECRET_KEY: "", // also asserts the Stripe client no longer throws at import
	},
	stdio: ["ignore", "pipe", "pipe"],
});

let exited = false;
server.on("exit", () => { exited = true; });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const get = async (route) => {
	for (let i = 0; i < 30; i++) {
		try {
			return await fetch(`http://127.0.0.1:${PORT}${route}`);
		} catch {
			await wait(500);
		}
	}
	throw new Error(`server never responded on ${route}`);
};

try {
	const health = await get("/api/health");
	assert.equal(health.status, 503, "health should report 503 while the database is down");

	const body = await health.json();
	assert.equal(body.status, "degraded");
	assert.equal(body.database, "disconnected");
	assert.equal(body.cache, "unavailable");
	console.log("✓ /api/health reports the outage instead of the process dying");

	const missing = await get("/api/does-not-exist");
	assert.equal(missing.status, 404);
	assert.match(missing.headers.get("content-type") || "", /json/);
	console.log("✓ unknown /api routes return JSON 404");

	// Long enough to cover the connection retries and several ioredis reconnects,
	// which is exactly when the old build fell over.
	await wait(15_000);
	assert.equal(exited, false, "server exited while its dependencies were down");

	const still = await get("/api/health");
	assert.equal(still.status, 503);
	console.log("✓ still serving after 15s of failing dependencies");

	console.log("\nALL PASS");
} finally {
	server.kill();
}
