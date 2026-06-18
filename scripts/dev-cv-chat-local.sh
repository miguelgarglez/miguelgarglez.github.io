#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKER_DIR="$ROOT_DIR/chat-worker"
CV_CHAT_DIR="$ROOT_DIR/cv-chat"

WORKER_PORT="${WORKER_PORT:-8787}"
CV_CHAT_PORT="${CV_CHAT_PORT:-4321}"
WORKER_HEALTH_URL="http://127.0.0.1:${WORKER_PORT}/healthz"
CV_CHAT_URL="http://localhost:${CV_CHAT_PORT}/cv-chat/"

WORKER_PID=""
CV_CHAT_PID=""

log() {
  echo "==> $*"
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

cleanup() {
  trap - EXIT INT TERM
  echo ""
  log "Shutting down local dev stack..."

  if [[ -n "$CV_CHAT_PID" ]] && kill -0 "$CV_CHAT_PID" 2>/dev/null; then
    kill "$CV_CHAT_PID" 2>/dev/null || true
  fi

  if [[ -n "$WORKER_PID" ]] && kill -0 "$WORKER_PID" 2>/dev/null; then
    kill "$WORKER_PID" 2>/dev/null || true
  fi

  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

load_dotenv_file() {
  local file="$1"

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" || "$line" == \#* ]] && continue

    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local value="${BASH_REMATCH[2]}"
      value="${value%\"}"
      value="${value#\"}"
      value="${value%\'}"
      value="${value#\'}"
      export "$key=$value"
    fi
  done < "$file"
}

load_worker_env() {
  if [[ -f "$WORKER_DIR/.dev.vars" ]]; then
    log "Loading worker secrets from chat-worker/.dev.vars"
    load_dotenv_file "$WORKER_DIR/.dev.vars"
    return
  fi

  if [[ -f "$WORKER_DIR/.env" ]]; then
    log "Loading worker secrets from chat-worker/.env"
    load_dotenv_file "$WORKER_DIR/.env"
    return
  fi

  fail "Missing chat-worker/.dev.vars or chat-worker/.env. Copy chat-worker/.dev.vars.example and set LLM_API_KEY."
}

ensure_cv_chat_env() {
  if [[ -f "$CV_CHAT_DIR/.env" ]]; then
    return
  fi

  if [[ -f "$CV_CHAT_DIR/.env.example" ]]; then
    cp "$CV_CHAT_DIR/.env.example" "$CV_CHAT_DIR/.env"
    log "Created cv-chat/.env from .env.example"
    return
  fi

  fail "Missing cv-chat/.env. Copy cv-chat/.env.example first."
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts="${3:-45}"

  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if curl -sf "$url" >/dev/null 2>&1; then
      log "$label is ready"
      return 0
    fi
    sleep 1
  done

  fail "$label did not become ready at $url"
}

start_worker() {
  log "Starting Cloudflare worker on port ${WORKER_PORT}"
  (
    cd "$WORKER_DIR"
    npx wrangler dev --port "$WORKER_PORT"
  ) &
  WORKER_PID=$!
}

start_cv_chat() {
  log "Starting cv-chat on port ${CV_CHAT_PORT}"
  (
    cd "$CV_CHAT_DIR"
    npm run dev -- --port "$CV_CHAT_PORT"
  ) &
  CV_CHAT_PID=$!
}

log "Checking runtime"
require_command node
require_command npm
require_command curl
node --version
npm --version

if [[ ! -d "$CV_CHAT_DIR/node_modules" ]]; then
  log "Installing cv-chat dependencies"
  npm ci --prefix "$CV_CHAT_DIR"
fi

ensure_cv_chat_env
load_worker_env

if [[ "${DEV:-}" != "true" ]]; then
  log "Setting DEV=true for localhost CORS in the worker"
  export DEV=true
fi

if [[ -z "${LLM_API_KEY:-}" ]]; then
  fail "LLM_API_KEY is not set in chat-worker/.dev.vars or chat-worker/.env"
fi

start_worker
wait_for_url "$WORKER_HEALTH_URL" "Cloudflare worker"

start_cv_chat
wait_for_url "$CV_CHAT_URL" "cv-chat"

echo ""
log "Local stack running"
echo "  CV:     $CV_CHAT_URL"
echo "  Worker: http://127.0.0.1:${WORKER_PORT}/chat"
echo "  Health: $WORKER_HEALTH_URL"
echo ""
echo "Press Ctrl+C to stop both processes."

while kill -0 "$WORKER_PID" 2>/dev/null || kill -0 "$CV_CHAT_PID" 2>/dev/null; do
  sleep 1
done
