#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "==> Verifying root site"
npm run build

echo "==> Verifying cv-chat"
npm run build --prefix cv-chat

echo "==> Verifying chat-worker retrieval behavior"
npm run test:profile-agent

echo "==> Verification complete"
