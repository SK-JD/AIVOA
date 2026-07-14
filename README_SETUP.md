# README — Setup (from scratch)

This prepares the entire project on a fresh machine. For day-to-day running after setup, see
[README_RUN.md](README_RUN.md).

## 1. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Python | 3.10+ | `python3 --version` |
| Node.js + npm | 18+ | `node --version` |
| PostgreSQL | 13+, running | `pg_isready` |
| Groq API key | — | create at <https://console.groq.com> |

## 2. One-command setup (recommended)

```bash
bash scripts/setup.sh
```

This will:
1. Create the backend virtualenv (`backend/.venv`) and install Python dependencies.
2. Create `backend/.env` from the template (if missing).
3. Create the PostgreSQL database (if missing), create tables, and seed sample HCPs.
4. Install frontend npm dependencies.

> If PostgreSQL uses credentials other than the defaults, edit **`backend/.env`** →
> `DATABASE_URL` **before** running the script (or re-run it after editing). The database user
> in that URL must already exist; the script creates the *database*, not the *role*.

## 3. Environment configuration

A single env file lives at **`backend/.env`** (copied from `backend/.env.example`):

```dotenv
DATABASE_URL=postgresql+psycopg2://crm_user:crm_pass@localhost:5432/aivao_crm
GROQ_API_KEY=gsk_your_key_here          # or leave blank and set it in the Admin panel
GROQ_MODEL=openai/gpt-oss-120b          # reliable tool-calling on Groq (gemma2-9b-it is deprecated)
ADMIN_TOKEN=change-me-admin-token       # required by the Admin panel
FRONTEND_ORIGIN=http://localhost:5173
```

- **No secrets are hardcoded** — everything comes from this file.
- The Groq key/model can also be set at runtime via the **Admin panel** (`/admin`), which persists
  them to the database and applies them without a restart.

## 4. Manual setup (if you prefer not to use the script)

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # then edit DATABASE_URL / GROQ_API_KEY / ADMIN_TOKEN
python -m app.database.create_db   # create the database if it doesn't exist
python -m app.database.seed        # create tables + seed sample HCPs
deactivate

# Frontend
cd ../frontend
npm install
```

## 5. Verify

```bash
# Backend import + graph compile
cd backend && source .venv/bin/activate
python -c "from app.graph.engine import build_graph; build_graph(); print('graph ok')"

# Once running (see README_RUN.md):
curl http://localhost:8000/api/health      # -> {"status":"ok"}
```

You're ready — start the app with `bash scripts/run.sh`.
