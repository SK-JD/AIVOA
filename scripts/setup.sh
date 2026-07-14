#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# One-command fresh setup for the AI-First CRM.
# Prepares backend (venv + deps + DB + seed) and frontend (npm deps).
# Run from anywhere:  bash scripts/setup.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "▶ AI-First CRM setup"
echo "  Root: $ROOT"

# ── Prerequisite checks ──────────────────────────────────────
command -v python3 >/dev/null || { echo "✗ python3 not found"; exit 1; }
command -v node >/dev/null    || { echo "✗ node not found"; exit 1; }
command -v npm >/dev/null      || { echo "✗ npm not found"; exit 1; }
echo "✓ python3 $(python3 --version 2>&1 | awk '{print $2}'), node $(node --version)"

# ── Backend ──────────────────────────────────────────────────
echo "▶ Backend: virtualenv + dependencies"
cd "$ROOT/backend"
python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip -q
pip install -q -r requirements.txt

if [ ! -f .env ]; then
  cp .env.example .env
  echo "  • Created backend/.env from template — edit it to set GROQ_API_KEY & DATABASE_URL."
fi

echo "▶ Database: create (if needed), migrate, and seed"
python -m app.database.create_db
python -m app.database.seed   # runs init_db() then seeds sample HCPs
deactivate

# ── Frontend ─────────────────────────────────────────────────
echo "▶ Frontend: npm install"
cd "$ROOT/frontend"
npm install --no-fund --no-audit

echo ""
echo "✓ Setup complete."
echo "  1. Set GROQ_API_KEY in backend/.env (or add it later via the Admin panel)."
echo "  2. Start everything with:  bash scripts/run.sh"
