#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Start the AI-First CRM (backend + frontend) after setup.
# Run:  bash scripts/run.sh    (Ctrl-C stops both)
# ─────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Backend (FastAPI on :8000) ───────────────────────────────
cd "$ROOT/backend"
# shellcheck disable=SC1091
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# ── Frontend (Vite on :5173) ─────────────────────────────────
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ Backend  → http://localhost:8000  (Swagger at /docs)"
echo "✓ Frontend → http://localhost:5173"
echo "  Press Ctrl-C to stop."

# Stop both children on exit.
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' INT TERM EXIT
wait
