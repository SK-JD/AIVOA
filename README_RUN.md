# README — Run

Commands to start the app **after** setup is complete (see [README_SETUP.md](README_SETUP.md) for
first-time setup).

## Start everything (recommended)

```bash
bash scripts/run.sh
```

Starts both servers and stops them together on `Ctrl-C`:

- **Backend** → <http://localhost:8000>  (Swagger API docs at `/docs`)
- **Frontend** → <http://localhost:5173>

## Start manually (two terminals)

```bash
# Terminal 1 — backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev
```

## Using the app

1. Open <http://localhost:5173>.
2. In the **AI Assistant** (right), describe an interaction, e.g.
   *"I met Dr. Smith today regarding Product X. He responded positively. I shared two brochures and
   requested a follow-up in two weeks."*
3. The **form** (left) fills automatically. Then try: `change the sentiment to neutral`,
   `suggest follow-ups`, `log it`.
4. If you haven't set `GROQ_API_KEY` in `.env`, open **`/admin`**, enter the `ADMIN_TOKEN`, paste
   your Groq key, **Test Connection**, then **Save**.
