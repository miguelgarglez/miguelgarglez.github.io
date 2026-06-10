#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "==> Checking runtime"
node --version
npm --version

echo "==> Installing root dependencies"
npm ci

echo "==> Installing cv-chat dependencies"
npm ci --prefix cv-chat

echo "==> Building root site"
npm run build

echo "==> Building cv-chat"
npm run build --prefix cv-chat

echo "==> Running deterministic profile-agent tests"
npm run test:profile-agent

echo "==> Codex cloud setup complete"
