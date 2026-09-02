# Credential rotation & history scrub

## Why

Commit `da62ec2` ("add all files") added a `.env` file containing live credentials.
`.gitignore` was updated later, which stops *new* commits from including it but does
**not** remove it from history. On a public repository every one of these values is
readable by anyone who clones the repo:

| Variable | What it exposes |
| --- | --- |
| `MONGO_URI` | Atlas username + password + cluster host — full read/write on the database |
| `UPSTASH_REDIS_URL` | Redis token — full read/write on the cache |
| `JWT_ACCESS_TOKEN` | Lets anyone mint a valid access token for any user id |
| `JWT_REFRESH_TOKEN` | Lets anyone mint a valid refresh token for any user id |

`backend/server.js` also carried a bare password as a trailing comment. That line has
been removed, but it is still in history and is covered by the same scrub below.

## Step 1 — Rotate first (do this before anything else)

Rotating invalidates the leaked values. Do it even if you plan to scrub history,
and do it even if the cluster is currently paused or deleted.

1. **MongoDB Atlas** — Database Access → delete the old database user, create a new
   one with a new password. Rotating the password alone is not enough if the old
   username is still valid elsewhere.
2. **Upstash Redis** — Database → Details → *Reset password* (or delete the database
   and create a new one). Copy the new `rediss://` URL.
3. **JWT secrets** — generate two fresh ones:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
   Run it twice: once for `JWT_ACCESS_TOKEN`, once for `JWT_REFRESH_TOKEN`.
   Changing these logs every existing user out. That is the point.
4. **Cloudinary** and **Stripe** — these were not in the committed `.env`, but if the
   same values were ever pasted anywhere public, roll them too. Stripe keys are rolled
   from Developers → API keys; Cloudinary from Settings → Security → API Keys.
5. Put the new values into Render (Dashboard → your service → Environment) and into
   your local `.env`. Use `.env.example` at the repo root as the checklist — the
   variable names there are the ones the code actually reads.

## Step 2 — Scrub the history

Rotation makes the leaked values useless. Scrubbing removes them from the record.
Do it in that order, never the reverse.

Run `scripts/scrub-git-history.sh`. It uses [`git-filter-repo`], purges `.env` from
every commit on every branch, and leaves you with a rewritten local history.

```bash
./scripts/scrub-git-history.sh
```

The script stops before pushing. Read what it prints, then push:

```bash
git push --force-with-lease --all
git push --force-with-lease --tags
```

### What a force-push to `main` costs you

- Every commit SHA after `da62ec2` changes. Any existing clone, fork, or open PR is
  based on history that no longer exists and has to be re-cloned.
- GitHub keeps unreferenced commits reachable for a while through the API and through
  forks. After pushing, open a support request asking GitHub to garbage-collect the
  old objects, and note that forks are *not* rewritten by your push.
- Because of that last point, treat rotation as the real fix. The scrub is cleanup.

If you would rather not rewrite `main`, the acceptable alternative is: rotate
everything (Step 1), and leave history alone. The leaked values are dead at that point.

[`git-filter-repo`]: https://github.com/newren/git-filter-repo

## Step 3 — Verify

```bash
# Should print nothing.
git log --all --oneline --name-only --diff-filter=A -- '*.env' '.env'

# Should print nothing.
git grep -I -n -e 'mongodb+srv://' -e 'rediss://' $(git rev-list --all) 2>/dev/null
```

Then confirm the app still boots with the new values:

```bash
npm start
curl -s localhost:5000/api/health
```
