#!/bin/sh
set -e
if [ ! -d node_modules/.bin ]; then
  echo "Installing dependencies (first run or empty volume)..."
  npm ci
fi
exec "$@"
