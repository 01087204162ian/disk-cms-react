#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/simg/disk-cms-react"
REMOTE="origin"
BRANCH="main"
PORT="3001"

cd "$APP_DIR"

echo "==> Pull latest code ($REMOTE/$BRANCH)"
git fetch "$REMOTE"
git checkout "$BRANCH"
git pull "$REMOTE" "$BRANCH"

echo "==> Install deps"
npm ci || npm install

echo "==> Reload via PM2"
pm2 restart disk-cms-react
pm2 save

echo "==> Health check (wait up to 30s)"
for i in {1..30}; do
  if curl -fsS -I "http://127.0.0.1:${PORT}" >/dev/null 2>&1; then
    echo "OK: http://127.0.0.1:${PORT}"
    exit 0
  fi
  sleep 1
done

echo "Health check FAILED: http://127.0.0.1:${PORT}"
pm2 logs disk-cms-react --lines 60
exit 1
