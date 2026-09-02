/**
 * Regression tests for the refresh-token flow.
 *
 * Covers the bug where the token was stored under `refreshToken:<id>` but read
 * back under `refresh_token:<id>`, so every refresh returned 401 and users were
 * silently logged out after the 15-minute access token expired.
 *
 * Runs against a minimal in-process RESP server (tests/helpers/fake-redis.mjs)
 * so the real ioredis client path is exercised without needing a Redis install.
 * No database is required — none of these paths touch Mongo.
 *
 *   npm test
 */

import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { start, upper, seed, has } from "./helpers/fake-redis.mjs";

const PORT = 6401;
await start(PORT);

process.env.UPSTASH_REDIS_URL = `redis://127.0.0.1:${PORT}`;
process.env.JWT_REFRESH_TOKEN = "test-refresh-secret";
process.env.JWT_ACCESS_TOKEN = "test-access-secret";

const redisLib = await import("../backend/lib/redis.js");
const auth = await import("../backend/controllers/auth.controllers.js");

// wait for the client to report ready
for (let i = 0; i < 50 && !redisLib.isRedisAvailable(); i++) await new Promise((r) => setTimeout(r, 100));
assert.ok(redisLib.isRedisAvailable(), "redis client should be ready");
console.log("✓ ioredis connected to the fake server");

// --- wrappers round-trip ---
assert.equal(await redisLib.safeRedisSet("k1", "v1", 60), true);
assert.equal(await redisLib.safeRedisGet("k1"), "v1");
assert.equal(await redisLib.safeRedisDel("k1"), true);
assert.equal(await redisLib.safeRedisGet("k1"), null);
console.log("✓ safeRedisSet/Get/Del round-trip");

// TTL must actually be sent, otherwise the cache never expires
assert.ok(upper().some((c) => c === "SET K1 V1 EX 60"), `SET should carry EX, got: ${upper()}`);
console.log("✓ SET sends an expiry");

const res = () => {
  const r = { statusCode: 200, body: null, cookies: {}, cleared: [] };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.cookie = (n, v) => { r.cookies[n] = v; return r; };
  r.clearCookie = (n) => { r.cleared.push(n); return r; };
  return r;
};

const userId = "65f0000000000000000000aa";
const token = jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN, { expiresIn: "7d" });

// --- the bug: stored under refreshToken:, read back under refresh_token: ---
// Seed the key the WRITER produces, then let the READER look it up.
seed(`refreshToken:${userId}`, token);

const r1 = res();
await auth.refreshToken({ cookies: { refreshToken: token } }, r1);
assert.equal(r1.statusCode, 200, `expected 200, got ${r1.statusCode}: ${JSON.stringify(r1.body)}`);
assert.ok(r1.cookies.accessToken, "a new access token should be set");
console.log("✓ refresh succeeds against the key the writer uses (was 401 before)");

const getCmd = upper().filter((c) => c.startsWith("GET REFRESH"));
assert.ok(getCmd.some((c) => c === `GET REFRESHTOKEN:${userId}`.toUpperCase()), `reader used: ${getCmd}`);
assert.ok(!upper().some((c) => c.includes("REFRESH_TOKEN:")), "no snake_case key should be used");
console.log("✓ reader and writer agree on the key name");

// --- a token that is valid but not in the allow-list must be rejected ---
const strayToken = jwt.sign({ userId: "65f0000000000000000000bb" }, process.env.JWT_REFRESH_TOKEN, { expiresIn: "7d" });
const r2 = res();
await auth.refreshToken({ cookies: { refreshToken: strayToken } }, r2);
assert.equal(r2.statusCode, 401, "a revoked/unknown token must not refresh while Redis is up");
console.log("✓ revocation is enforced when Redis is available");

// --- logout deletes the same key ---
const r3 = res();
await auth.logout({ cookies: { refreshToken: token } }, r3);
assert.equal(r3.statusCode, 200);
assert.ok(!has(`refreshToken:${userId}`), "logout should delete the stored token");
assert.deepEqual(r3.cleared.sort(), ["accessToken", "refreshToken"]);
console.log("✓ logout revokes the same key it was stored under");

// --- garbage token: 401, not 500 ---
const r4 = res();
await auth.refreshToken({ cookies: { refreshToken: "not.a.jwt" } }, r4);
assert.equal(r4.statusCode, 401);
const r5 = res();
await auth.logout({ cookies: { refreshToken: "not.a.jwt" } }, r5);
assert.equal(r5.statusCode, 200, "logout must still clear cookies for a bad token");
console.log("✓ malformed tokens return 401 / still log out");

console.log("\nALL PASS");
process.exit(0);
