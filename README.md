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
| AI | **LangGraph** (tool-calling agent) + **LangChain** + **Groq** (`openai/gpt-oss-120b`, switchable in the Admin panel) |
| Database | **PostgreSQL** via SQLAlchemy |

It's **AI-first**: the assistant doesn't just map text into fields — it **reasons about
completeness, asks clarifying questions when required info is missing, distinguishes Outcomes (what
happened) from Follow-ups (what's next), and validates before saving**. The form is a live,
structured mirror of the conversation. See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the full design.

## The LangGraph agent & its 6 tools

The graph is the canonical tool-calling loop: **`agent` ⇄ `tools`** with a `should_continue`
conditional edge — the LLM decides which tool to call; there is no hardcoded field routing.

| Tool | Role |
|---|---|
| `log_interaction` *(mandatory)* | Extract structured fields from a free-text description. |
| `edit_interaction` *(mandatory)* | Update a single field from a conversational correction. |
| `search_hcp` | Resolve the HCP against the CRM directory. |
| `search_materials` | Map a mentioned material to the CRM catalog (typed preview cards). |
| `suggest_followups` | Generate AI-suggested follow-up actions. |
| `save_interaction` | Validate required fields, then persist the interaction to PostgreSQL. |

The agent is form-aware each turn (current form + missing required fields are injected into the
system prompt), so it clarifies instead of guessing.

**Voice:** record a note (🎙 in the chat or "Summarize from Voice Note" on the form) → **Groq
Whisper** transcribes it → the transcript runs through the same agent to fill the form. Optional
spoken replies use the browser's built-in text-to-speech (toggle in the chat header).

## Project structure

```
AIVAO/
├── backend/app/
│   ├── api/          # FastAPI routes (chat, hcps, admin)
│   ├── graph/        # LangGraph: state + engine (build_graph)
│   ├── nodes/        # agent_node, tool_node
│   ├── tools/        # the 6 tools + shared helpers
│   ├── services/     # llm (LangChain seam), settings_service, chat_service, form_logic
│   ├── prompts/      # *.txt prompts + loader
│   ├── models/       # SQLAlchemy models (hcps, interactions, app_settings)
│   ├── schemas/      # Pydantic contracts
│   ├── database/     # session, init_db, create_db, seed
│   ├── config/       # env-backed settings + material catalog
│   └── tests/        # pytest suite (31 tests)
├── frontend/src/     # components/ pages/ redux/ services/ hooks/ utils/  (+ Vitest)
├── scripts/          # setup.sh, run.sh
├── ARCHITECTURE.md   # full design + rationale
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

## Tests

```bash
cd backend && source .venv/bin/activate && pytest    # 31 backend tests (sqlite, LLM mocked)
cd frontend && npm test                              # 5 Redux tests (Vitest)
```
