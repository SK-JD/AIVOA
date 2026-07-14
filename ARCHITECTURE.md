# Architecture — AI-First CRM (Log HCP Interaction)

This document explains how the system is built and **why** each decision was made, so a reviewer
can understand it quickly.

---

## 1. Overall architecture

```
┌──────────────────────────┐        HTTP/JSON        ┌───────────────────────────────┐
│  React + Redux (Vite)    │  ───────────────────▶   │  FastAPI                      │
│  • Interaction form      │   POST /api/chat        │  • /api/chat  → LangGraph     │
│  • AI Assistant chat     │   GET  /api/hcps        │  • /api/hcps  → directory     │
│  • Admin / Docs          │   /api/admin/*          │  • /api/admin → settings      │
└──────────────────────────┘  ◀───────────────────   └───────────────┬───────────────┘
        ▲   applies form_patch      reply + form_patch                │
        │   to Redux (live form)                                      ▼
        │                                        ┌────────────────────────────────────┐
        └──────────── the form is a live ────────│  LangGraph agent (ReAct loop)      │
                      mirror of the chat          │  agent ⇄ tools → 6 tools           │
                                                  │  LangChain → Groq (gpt-oss-120b)   │
                                                  └───────────────┬────────────────────┘
                                                                  ▼
                                                     PostgreSQL (hcps, interactions,
                                                                 app_settings)
```

**Core idea:** the user never fills the form manually. They talk to the AI Assistant; a **LangGraph
tool-calling agent** understands the message, extracts structured data, reasons about what's
missing, and returns a **`form_patch`** that Redux merges into the form. The form is a *live,
structured mirror* of the conversation.

**Why this shape:** one LLM seam, one graph, a thin stateless API, and a frontend that only renders
state + applies patches. Each layer is independently testable and swappable.

---

## 2. Frontend structure (`frontend/src/`)

| Folder | Responsibility |
|---|---|
| `pages/` | `LogInteractionPage` (split view), `AdminPage` (Groq settings), `DocsPage` (in-app guide) |
| `components/` | `InteractionForm`, `ChatAssistant`, field widgets (`HCPNameField`, `MaterialsField`, `SamplesField`, `ChipList`), `Icon` (inline SVG set) |
| `redux/` | `formSlice` (form + `updatedFields` highlight), `chatSlice` (transcript/status), `adminSlice` (settings/token), `store` |
| `hooks/` | `useChat` — the single AI→form update path |
| `services/` | `api.js` — fetch wrapper |
| `utils/` | `constants.js` — form defaults, material catalog, required fields (mirrors backend) |

**Why Redux:** the form and chat are cross-component shared state, and AI updates arrive as partial
patches — a reducer (`applyPatch`) is the natural fit and keeps the form a pure function of events.

## 3. Backend structure (`backend/app/`)

| Folder | Responsibility |
|---|---|
| `api/` | FastAPI routes (chat, hcps, admin) |
| `graph/` | `state.py` (AgentState), `engine.py` (`build_graph`, `should_continue`) |
| `nodes/` | `agent_node` (LLM decides), `tool_node` (executes + advances form) |
| `tools/` | the 6 tools + `common.py` (normalization) |
| `services/` | `llm.py` (the only LangChain/Groq seam), `settings_service.py`, `chat_service.py`, `form_logic.py` |
| `prompts/` | `*.txt` prompts + `loader.py` |
| `models/` `schemas/` `database/` `config/` | ORM, Pydantic contracts, session/seed, settings + catalog |

**Why this layout:** it matches the assignment's requested structure and isolates every concern —
the LLM lives behind one module, prompts are files not code, business rules are one module.

---

## 4. LangGraph workflow

The graph is the canonical **ReAct tool-calling loop**:

```
        ┌───────────────── should_continue ─────────────────┐
        │                                                    │
   ─▶ agent ──(last AI msg has tool_calls?)── "tools" ─▶ tools ─┐
        ▲                                                    │   │
        └────────────────────── loop ────────────────────────┘   │
        │                                                        │
        └──── "end" (plain reply) ────▶ END                      │
```

- **entry:** `agent`
- **`agent` → conditional (`should_continue`)** → `tools` if the model asked for a tool, else `END`
- **`tools` → `agent`** (always loops back so the model can react to tool results)
- Compiled **once** at startup; **one HTTP turn = one `graph.invoke`**.

**Why real LangGraph (not a hand-rolled engine):** the assignment mandates LangGraph; the ReAct
loop is its canonical pattern and lets the **LLM choose tools from natural language** — no hardcoded
"if message contains X set field Y" logic. A `recursion_limit` (12) is a safety net; a
`GraphRecursionError` recovers whatever tools already produced instead of failing the turn.

### Graph state (`graph/state.py`)
```python
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]  # conversation (system+user+AI+tool)
    form: dict                               # live form snapshot, injected into tools
```
`add_messages` appends tool results correctly. `form` is what makes tools *stateful within a turn*.

### Nodes (`nodes/`)
| Node | Responsibility |
|---|---|
| `agent_node` | Bind the 6 tools to the LLM and let it decide: call a tool or reply. Retries on a transient Groq `tool_use_failed` with a fallback model. **This is where reasoning lives.** |
| `tool_node` | Wrap LangGraph's `ToolNode` to run the requested tools, then **merge each tool's `form_patch` into `state.form`** so a later tool (e.g. `save`) sees fields an earlier tool (e.g. `log`) just filled. |

**Why only two nodes:** the ReAct pattern needs exactly these two; adding more would be
over-engineering. The *intelligence* is in the agent + tools + prompt, not in extra nodes.

---

## 5. Tool responsibilities (`tools/`)

| Tool | Type | Responsibility |
|---|---|---|
| `log_interaction` | mandatory | LLM-extract **all** structured fields from a free-text description (name, type, date, attendees, topics, materials, samples, sentiment, outcomes, follow-ups). |
| `edit_interaction` | mandatory | Update a **single** field on a correction; appends to list fields. |
| `search_hcp` | custom | Resolve the HCP against the `hcps` directory (DB). |
| `search_materials` | custom | Map a mentioned material to the **catalog type** and add it. |
| `suggest_followups` | custom | LLM-generate next-step follow-up actions. |
| `save_interaction` | custom | **Validate required fields** (HCP Name + Topics) then persist to Postgres; refuses + reports what's missing otherwise. |

**Tool-selection logic:** the LLM picks tools from their **docstrings + the system prompt rules**
(e.g. "call `log_interaction` once", "only `save` when the user asks"). Tools return
`content_and_artifact` — human text for the model, a structured `artifact` (`form_patch`,
`suggestions`, `saved_id`) that the API harvests. Tools that need live form values read them via
`InjectedState("form")`.

---

## 6. AI workflow — how it reasons like a CRM assistant

Each turn, `chat_service` builds a **form-aware system prompt** containing the current form snapshot
and the list of **missing required / recommended** fields. So the agent:

1. **Extracts** on first description (`log_interaction`, once).
2. **Reasons about completeness** — if HCP Name or Topics is still missing, it asks **one specific
   clarifying question** instead of guessing.
3. **Distinguishes Outcomes (what happened) from Follow-ups (what's next)** — enforced in the prompt.
4. **Edits** single fields on corrections (`edit_interaction`), never re-logging.
5. **Validates before saving** — `save_interaction` blocks on missing required fields and the agent
   asks for them.
6. **Replies meaningfully** — confirms captured fields, flags gaps, offers the next step.

**Why prompt-driven, not code-driven:** completeness/clarification is reasoning, not string
matching. Putting the form state + missing fields into the prompt lets the LLM decide — which is the
whole point of an *AI-first* CRM.

---

## 7. Voice processing (planned — phase 2)

```
Browser MediaRecorder ─▶ POST /api/voice/transcribe
   ─▶ Groq Whisper (whisper-large-v3-turbo) ─▶ transcript
   ─▶ transcript flows through the SAME agent (log_interaction)
   ─▶ fields populate + AI summary/clarify in chat
Talk-back: assistant reply ─▶ browser SpeechSynthesis (TTS)
```
**Why route the transcript through the existing agent:** speech is just another way to produce the
user's text — reusing the graph means the voice path gets extraction, clarifying questions, and
validation for free (no separate pipeline). STT uses the Groq SDK directly (audio isn't in the
LangChain chat seam). TTS uses the browser's built-in `SpeechSynthesis` — zero dependencies.

---

## 8. Database schema (`models/models.py`)

| Table | Columns |
|---|---|
| `hcps` | id, name, specialty, organization — the HCP directory (`search_hcp`) |
| `interactions` | id, hcp_name, interaction_type, date, time, attendees (JSON), topics, materials_shared (JSON `[{type,name}]`), samples_distributed (JSON `[{name,quantity}]`), sentiment, outcomes, followup_actions, created_at |
| `app_settings` | key, value — runtime Groq key/model overlay for the Admin panel |

**Why JSON columns for lists:** materials/samples/attendees are small structured lists; JSON keeps
the schema simple (assessment-appropriate) while staying structured. **Why sync SQLAlchemy:** tools
run inside the graph and touch the DB; sync sessions keep tools simple and FastAPI runs the sync
endpoint in a threadpool.

---

## 9. Prompt strategy (`prompts/*.txt`)

| Prompt | Role |
|---|---|
| `system.txt` | **Dynamic** — rendered per turn with the current form + missing fields; defines tool rules and the "reason, don't just map" behavior. |
| `extract.txt` | JSON extraction schema for `log_interaction` (materials/samples object shapes, outcomes≠follow-ups). |
| `followups.txt` | Follow-up suggestion generation. |
| `json_system.txt` | Minimal system prompt for **internal** JSON calls, so the extraction model returns JSON instead of trying to call a tool. |

Prompts are **files, not Python** (mustache-lite `{{var}}`), so behavior is tuned without code
changes and JSON braces don't clash with `str.format`.

---

## 10. State management

- **Backend:** `AgentState` (messages + form) flows through the graph; the API is otherwise
  stateless — the frontend sends the current form snapshot each turn, so `edit`/`save` see live
  values across turns, and `tool_node` advances the form *within* a turn.
- **Frontend:** Redux. `formSlice.applyPatch` merges the AI's `form_patch` and records
  `updatedFields` (for the brief highlight); `chatSlice` holds the transcript; `adminSlice` the
  settings.

---

## 11. API flow (one chat turn)

```
POST /api/chat { message, messages[], form }
  └─ chat_service.run_chat
       ├─ build form-aware system prompt (current form + missing required)
       ├─ graph.invoke({messages, form})           [LangGraph]
       │    agent → (tool_calls?) → tools → agent → … → final reply
       │      • agent_node: LLM + bind_tools        [LangChain → Groq]
       │      • tool_node : run tools, merge form_patch into state.form
       ├─ harvest ToolMessage artifacts → form_patch, suggestions, saved_id
       └─ return { reply, form_patch, suggestions, saved_id, tools_used }
  Frontend: dispatch(applyPatch(form_patch)) → form updates live
```

Errors map cleanly: Groq not configured → **503**; bad admin token → **401**; any turn-level
failure → a safe fallback reply (**never 500 a turn**), logged server-side.

---

## 12. Testing

- **Backend (pytest, 31 tests):** field normalization/coercion (incl. structured materials/samples),
  required-field logic, all 6 tools (LLM mocked, sqlite DB), graph routing + form-merge, chat-service
  harvesting, settings overlay. Runs against a throwaway SQLite DB — no Postgres/Groq needed.
- **Frontend (Vitest, 5 tests):** `formSlice` reducers (patch merge, material dedupe, samples,
  suggestions).

Run: `cd backend && pytest`  and  `cd frontend && npm test`.
