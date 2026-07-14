# AI-First CRM — Log HCP Interaction

An **AI-first CRM module** for logging interactions with Healthcare Professionals (HCPs).
The screen is a split view: an **Interaction Details form** on the left and an **AI Assistant
chat** on the right. You don't fill the form manually — you *describe* the interaction in natural
language and a **LangGraph agent** (driven by a Groq LLM) populates and edits the form through
**tool calls**.

> Example: *"I met Dr. Smith today regarding Product X. He responded positively. I shared two
> brochures and requested a follow-up in two weeks."* → the form fills itself.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Redux Toolkit + React Router (Google **Inter** font), Vite |
| Backend | Python + **FastAPI** (sync, threadpool) |
| AI | **LangGraph** (tool-calling agent) + **LangChain** + **Groq** (`gemma2-9b-it`) |
| Database | **PostgreSQL** via SQLAlchemy |

## The LangGraph agent & its 5 tools

The graph is the canonical tool-calling loop: **`agent` ⇄ `tools`** with a `should_continue`
conditional edge — the LLM decides which tool to call; there is no hardcoded field routing.

| Tool | Role |
|---|---|
| `log_interaction` *(mandatory)* | Extract structured fields from a free-text description. |
| `edit_interaction` *(mandatory)* | Update a single field from a conversational correction. |
| `search_hcp` | Resolve the HCP against the CRM directory. |
| `suggest_followups` | Generate AI-suggested follow-up actions. |
| `save_interaction` | Persist the completed interaction to PostgreSQL. |

## Project structure

```
AIVAO/
├── backend/app/
│   ├── api/          # FastAPI routes (chat, hcps, admin)
│   ├── graph/        # LangGraph: state + engine (build_graph)
│   ├── nodes/        # agent_node, tool_node
│   ├── tools/        # the 5 tools + shared helpers
│   ├── services/     # llm (LangChain seam), settings_service, chat_service
│   ├── prompts/      # *.txt prompts + loader
│   ├── models/       # SQLAlchemy models (hcps, interactions, app_settings)
│   ├── schemas/      # Pydantic contracts
│   ├── database/     # session, init_db, create_db, seed
│   └── config/       # env-backed settings
├── frontend/src/
│   ├── components/ pages/ redux/ services/ hooks/ utils/
├── scripts/          # setup.sh, run.sh
├── README_SETUP.md   # first-time setup (from scratch)
└── README_RUN.md     # run commands only
```

## Quick start

```bash
bash scripts/setup.sh   # one-time: venv, deps, DB, seed
# set GROQ_API_KEY in backend/.env  (or add it later in the Admin panel)
bash scripts/run.sh     # start backend + frontend
```

Then open **http://localhost:5173**. See [README_SETUP.md](README_SETUP.md) and
[README_RUN.md](README_RUN.md) for details.

- **Admin panel** (`/admin`) — paste/rotate the Groq key, pick a model, test the connection, save
  (takes effect without a restart).
- **Docs** (`/docs`) in-app, plus backend Swagger at **http://localhost:8000/docs**.
