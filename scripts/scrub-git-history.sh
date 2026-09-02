#!/usr/bin/env bash
#
# Remove the committed .env (and any stray *.env) from every commit in this
# repository's history.
#
# ROTATE THE CREDENTIALS FIRST. See docs/SECURITY-ROTATION.md.
# Rewriting history does not un-leak anything that has already been cloned.
#
# This script rewrites local history and then STOPS. It never pushes.

set -euo pipefail

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die() { printf '\n\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }

git rev-parse --git-dir >/dev/null 2>&1 || die "not inside a git repository"

if ! git diff --quiet || ! git diff --cached --quiet; then
  die "working tree has uncommitted changes. Commit or stash them first."
fi

if ! command -v git-filter-repo >/dev/null 2>&1; then
  cat <<'MSG'
git-filter-repo is not installed. Install it with one of:

  pipx install git-filter-repo
  pip install --user git-filter-repo
  brew install git-filter-repo

Then re-run this script.
MSG
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

BACKUP="../$(basename "$REPO_ROOT")-backup-$(date +%Y%m%d%H%M%S).bundle"
say "1/4  Backing up current history to $BACKUP"
git bundle create "$BACKUP" --all

say "2/4  Recording the current remote"
ORIGIN_URL="$(git remote get-url origin 2>/dev/null || echo '')"
[ -n "$ORIGIN_URL" ] && echo "     origin = $ORIGIN_URL"

say "3/4  Rewriting history to drop .env from every commit"
# git-filter-repo removes 'origin' by design after a rewrite; we re-add it below.
git filter-repo --force \
  --invert-paths \
  --path .env \
  --path backend/.env \
  --path frontend/.env \
  --path-glob '*.env'

if [ -n "$ORIGIN_URL" ] && ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$ORIGIN_URL"
  echo "     re-added origin"
fi

say "4/4  Verifying"
if git log --all --oneline --name-only --diff-filter=A -- '*.env' '.env' | grep -q .; then
  die ".env is still present in history — do not push, investigate first"
fi
echo "     clean: no .env found in any commit"

cat <<MSG

------------------------------------------------------------------
History rewritten locally. Nothing has been pushed.

Backup bundle: $BACKUP
  (restore with: git clone $BACKUP restored-repo)

Review it, then publish the rewrite:

  git push --force-with-lease --all
  git push --force-with-lease --tags

Read the "What a force-push to main costs you" section of
docs/SECURITY-ROTATION.md before you do.
------------------------------------------------------------------
MSG
