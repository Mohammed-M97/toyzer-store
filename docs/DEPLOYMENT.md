# Deployment & recovery

## Environment variables

`.env.example` at the repo root is the authoritative list — the names there are the
ones the code actually reads. Set every one of them in Render under
**Dashboard → your service → Environment**.

`CLIENT_URL` matters more than it looks: Stripe uses it to build the success and
cancel redirect URLs, and the server uses it as the CORS allow-list. In production
it must be `https://toyzer-store.onrender.com` (no trailing slash).

## Recreating the MongoDB Atlas cluster

A free M0 cluster is paused automatically after 60 days without a connection, and a
long-paused cluster can eventually be removed. If the old one is gone, the data is
not recoverable — recreate and reseed:

1. Atlas → **Create** → M0 (free). Pick the region closest to your Render region.
2. **Database Access** → Add New Database User. Use a generated password, give it
   *Read and write to any database*. Do not reuse the leaked credentials.
3. **Network Access** → Add IP Address → `0.0.0.0/0`.
   Render's free tier has no static outbound IP, so an allow-list of specific
   addresses will not work. The database user's password is what protects the
   cluster here, which is why it has to be a strong generated one.
4. **Connect** → *Drivers* → copy the `mongodb+srv://` string. Add the database
   name before the `?`, e.g. `...mongodb.net/toyzer?retryWrites=true&w=majority`.
   Without it, Mongoose writes to the `test` database.
5. Put it in `MONGO_URI` locally and in Render.

Then seed:

```bash
npm run seed              # admin + starter catalogue, skips what already exists
npm run seed -- --fresh   # wipe products first, then reseed
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before the first seed, otherwise the
admin account is skipped and you will not be able to reach the dashboard.

## Keeping the Render service up

The free instance spins down after ~15 minutes without traffic; the next request then
waits roughly 50 seconds for a cold start. That is the behaviour, not a bug — but it
looks identical to an outage, which is part of why this felt like it kept "dropping".

1. **Health check path** — Render → Settings → Health Check Path → `/api/health`.
   It returns `200` when Mongo is connected and `503` when it is not, so a failed
   deploy is now visible instead of silent.
2. **Keep it warm** — point an uptime pinger (UptimeRobot, cron-job.org, BetterStack)
   at `https://toyzer-store.onrender.com/api/health` every 10 minutes. This keeps the
   instance from idling out. It does not stop the monthly free-tier restarts.
3. **Node version** — `engines.node` is pinned to `>=20` in `package.json`. Set
   `NODE_VERSION=20` in Render's environment too, so builds do not drift.

## Degraded modes

The server no longer exits when a dependency is unreachable. It stays up and reports
what is wrong:

```bash
curl -s https://toyzer-store.onrender.com/api/health
```

```json
{ "status": "ok", "database": "connected", "cache": "connected", "uptime": 412 }
```

| Dependency | What happens when it is down |
| --- | --- |
| MongoDB | `connectDB` retries 5 times with exponential backoff, then leaves the driver to keep reconnecting. `/api/health` returns `503` with `"database": "disconnected"`. The process does **not** exit. |
| Redis | Every cache call goes through `safeRedisGet` / `safeRedisSet` / `safeRedisDel`, which return `null`/`false` instead of throwing. Featured products fall back to a direct Mongo query. |

**One tradeoff to be aware of:** refresh tokens are normally checked against an
allow-list in Redis, which is what makes logout able to revoke a session. When Redis
is unavailable there is no list to check, so `POST /api/auth/refresh-token` falls back
to trusting the token's signature alone and logs a warning. Sessions survive a Redis
outage, but a logout issued during one will not be enforced until Redis returns. If
you would rather fail closed, change the `isRedisAvailable()` branch in
`backend/controllers/auth.controllers.js` to return `401`.

## Why the old setup restarted in a loop

`connectDB()` ran inside the `app.listen` callback and called `process.exit(1)` on the
first failed connection. A paused Atlas cluster, a slow DNS lookup, or a Redis blip
(the `ioredis` client had no `error` listener, so a connection error was an unhandled
`error` event) each killed the process. Render restarted it, the same thing happened,
and the service flapped. All three of those paths now log and continue.
