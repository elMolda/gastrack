#!/bin/sh
set -e

# Named volume can retain stale deps after package.json changes (e.g. adapter swap).
LOCK_HASH_FILE=node_modules/.gastrack-package-lock.sha256
CURRENT_LOCK_HASH="$(sha256sum package-lock.json | awk '{print $1}')"
NEED_INSTALL=0

if [ ! -d node_modules/.bin ]; then
  NEED_INSTALL=1
elif [ ! -f "$LOCK_HASH_FILE" ]; then
  NEED_INSTALL=1
elif [ "$(cat "$LOCK_HASH_FILE")" != "$CURRENT_LOCK_HASH" ]; then
  NEED_INSTALL=1
fi

if [ "$NEED_INSTALL" -eq 1 ]; then
  echo "Installing dependencies (npm ci)..."
  npm ci
  echo "$CURRENT_LOCK_HASH" > "$LOCK_HASH_FILE"
fi

if [ -n "$DATABASE_URL" ]; then
  echo "Applying Drizzle migrations..."
  npm run db:migrate
fi

exec "$@"
