// In-app documentation — the full architecture & workflow, rendered as a proper docs page.
const TOC = [
  ['overview', 'Overview'],
  ['architecture', 'Architecture'],
  ['frontend', 'Frontend'],
  ['backend', 'Backend'],
  ['langgraph', 'LangGraph Workflow'],
  ['nodes', 'Graph Nodes'],
  ['tools', 'The 6 Tools'],
  ['ai-workflow', 'AI Workflow'],
  ['voice', 'Voice Processing'],
  ['database', 'Database Schema'],
  ['prompts', 'Prompt Strategy'],
  ['state', 'State Management'],
  ['api', 'API Flow'],
  ['testing', 'Testing'],
  ['try', 'Try It'],
]

function Section({ id, n, title, children }) {
  return (
    <section id={id} className="doc-section">
      <h2 className="mb-3 flex items-center gap-2.5 text-base font-bold tracking-tight">
        <span className="grid h-6 w-6 flex-none place-items-center rounded-[7px] bg-brand-soft text-xs font-bold text-brand-600">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function DocsPage() {
  return (
    <div className="px-4 pb-12 pt-6 sm:px-8">
      <h1 className="text-xl font-bold tracking-tight">Documentation</h1>
      <p className="mb-5 text-[13px] text-slate-400">How the AI-first CRM is built — architecture, LangGraph workflow, tools, voice, and data.</p>

      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="sticky top-[78px] hidden self-start rounded-xl border border-slate-200 bg-white p-3 shadow-card lg:block">
          <div className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">On this page</div>
          {TOC.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded-md px-2 py-1.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-700">{label}</a>
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          <Section id="overview" n="1" title="Overview">
            <p>
              An <strong>AI-first CRM</strong> for logging Healthcare Professional (HCP) interactions.
              The user never fills the form manually — they describe the interaction to the AI
              Assistant (by text or voice) and a <strong>LangGraph tool-calling agent</strong> on Groq
              understands it, extracts structured data, reasons about what's missing, and updates the
              form. The form is a <em>live, structured mirror</em> of the conversation.
            </p>
            <p>
              <strong>Stack:</strong> React + Redux (Vite, Inter font) · FastAPI · LangGraph +
              LangChain + Groq (<code>openai/gpt-oss-120b</code>) · PostgreSQL.
            </p>
            <p>
              <strong>Beyond the form:</strong> saved interactions appear in the <a href="/pipeline">Pipeline</a>
              table, HCPs in the <a href="/directory">HCP Directory</a>, and a small <a href="/analytics">Analytics</a>
              view summarizes them. The assistant can <strong>clear a field or remove a specific tag</strong>
              (e.g. "clear the attendees", "remove Dr. Sharma"), and every field the AI touches briefly highlights.
            </p>
          </Section>

          <Section id="architecture" n="2" title="Architecture">
            <div className="diagram">{`React + Redux (Vite)            FastAPI
┌──────────────────────┐  POST   ┌──────────────────────────────┐
│ Interaction form     │ ──────▶ │ /api/chat  → LangGraph agent  │
│ AI Assistant chat    │ /api/*  │ /api/voice → Groq Whisper     │
│ Admin / Docs         │ ◀────── │ /api/hcps  /api/admin         │
└──────────────────────┘ reply + └───────────────┬──────────────┘
   ▲  applies form_patch  form_patch              ▼
   │  to Redux (live form)          LangGraph ReAct loop: agent ⇄ tools
   └───── form mirrors chat ──────  LangChain → Groq · 6 tools
                                                   ▼
                                    PostgreSQL (hcps, interactions, app_settings)`}</div>
            <p>
              One LLM seam, one graph, a thin stateless API, and a frontend that only renders state
              and applies patches — each layer independently testable and swappable.
            </p>
          </Section>

          <Section id="frontend" n="3" title="Frontend structure">
            <table className="dtable">
              <thead><tr><th>Folder</th><th>Responsibility</th></tr></thead>
              <tbody>
                <tr><td>pages/</td><td>LogInteraction (split view), Admin (Groq settings), Docs</td></tr>
                <tr><td>components/</td><td>InteractionForm, ChatAssistant, field widgets (HCP, Attendees, Materials, Samples), Icon (inline SVG)</td></tr>
                <tr><td>redux/</td><td>formSlice (form + updatedFields highlight), chatSlice, adminSlice, store</td></tr>
                <tr><td>hooks/</td><td>useChat (AI→form path), useVoiceInput (recording), useSpeech (TTS)</td></tr>
                <tr><td>services/</td><td>api.js — fetch wrapper</td></tr>
                <tr><td>utils/</td><td>constants — form defaults, material catalog, required fields</td></tr>
              </tbody>
            </table>
            <p><strong>Why Redux:</strong> the form/chat are shared state and AI updates arrive as partial patches — a reducer (<code>applyPatch</code>) keeps the form a pure function of events.</p>
          </Section>

          <Section id="backend" n="4" title="Backend structure">
            <table className="dtable">
              <thead><tr><th>Folder</th><th>Responsibility</th></tr></thead>
              <tbody>
                <tr><td>api/</td><td>FastAPI routes (chat, voice, hcps, admin)</td></tr>
                <tr><td>graph/</td><td>state.py (AgentState), engine.py (build_graph, should_continue)</td></tr>
                <tr><td>nodes/</td><td>agent_node (LLM decides), tool_node (executes + advances form)</td></tr>
                <tr><td>tools/</td><td>the 6 tools + common.py (normalization)</td></tr>
                <tr><td>services/</td><td>llm (LangChain/Groq seam), voice (Whisper), settings_service, chat_service, form_logic</td></tr>
                <tr><td>prompts/</td><td>*.txt prompts + loader</td></tr>
                <tr><td>models / schemas / database / config</td><td>ORM, Pydantic contracts, session/seed, settings + catalog</td></tr>
              </tbody>
            </table>
          </Section>

          <Section id="langgraph" n="5" title="LangGraph workflow">
            <p>The canonical <strong>ReAct tool-calling loop</strong>: the LLM chooses tools from natural language — no hardcoded field routing.</p>
            <div className="diagram">{`         ┌──────────── should_continue ────────────┐
         │                                          │
  ─▶ agent ──(last AI msg has tool_calls?)── tools ─┘
     ▲                                          │
     └───────── "end" (plain reply) ─▶ END      ▼ loops back`}</div>
            <ul>
              <li><strong>entry:</strong> agent → conditional → <code>tools</code> if the model asked for a tool, else <code>END</code></li>
              <li><code>tools → agent</code> always loops back so the model reacts to tool results</li>
              <li>Compiled once; <strong>one HTTP turn = one <code>graph.invoke</code></strong>; a recursion limit (12) is a safety net</li>
            </ul>
            <p><strong>State</strong> (<code>AgentState</code>): <code>messages</code> (add_messages reducer) + <code>form</code> (live snapshot injected into tools).</p>
          </Section>

          <Section id="nodes" n="6" title="Graph nodes">
            <table className="dtable">
              <thead><tr><th>Node</th><th>Responsibility</th></tr></thead>
              <tbody>
                <tr><td>agent_node</td><td>Binds the 6 tools to the LLM and lets it decide: call a tool or reply. Retries on a transient Groq <code>tool_use_failed</code> with a fallback model. <strong>Reasoning lives here.</strong></td></tr>
                <tr><td>tool_node</td><td>Runs the requested tools, then merges each tool's <code>form_patch</code> into <code>state.form</code> — so a later tool (save) sees fields an earlier tool (log) just filled.</td></tr>
              </tbody>
            </table>
            <p><strong>Why only two nodes:</strong> the ReAct pattern needs exactly these; intelligence is in the agent + tools + prompt, not extra nodes.</p>
          </Section>

          <Section id="tools" n="7" title="The 6 tools">
            <table className="dtable">
              <thead><tr><th>Tool</th><th>Responsibility</th></tr></thead>
              <tbody>
                <tr><td>log_interaction<span className="doc-tag req">mandatory</span></td><td>LLM-extract all structured fields from a free-text description.</td></tr>
                <tr><td>edit_interaction<span className="doc-tag req">mandatory</span></td><td>Change a single field with an action: <code>set</code> / <code>add</code> / <code>remove</code> a specific item / <code>clear</code> the whole field (e.g. "clear the attendees", "remove Dr. Sharma").</td></tr>
                <tr><td>search_hcp<span className="doc-tag">custom</span></td><td>Resolve the HCP against the directory (DB).</td></tr>
                <tr><td>search_materials<span className="doc-tag">custom</span></td><td>Map a mentioned material to the catalog type and add it.</td></tr>
                <tr><td>suggest_followups<span className="doc-tag">custom</span></td><td>LLM-generate next-step follow-up actions.</td></tr>
                <tr><td>save_interaction<span className="doc-tag">custom</span></td><td>Validate required fields (HCP Name + Topics), then persist; else report what's missing.</td></tr>
              </tbody>
            </table>
            <p><strong>Tool-selection:</strong> the LLM picks tools from their docstrings + system-prompt rules. Tools return <code>content_and_artifact</code> — text for the model + a structured artifact (<code>form_patch</code>, <code>suggestions</code>, <code>saved_id</code>) the API harvests. Tools that need live form values read them via <code>InjectedState("form")</code>.</p>
          </Section>

          <Section id="ai-workflow" n="8" title="AI workflow — reasoning, not text-mapping">
            <p>Each turn, <code>chat_service</code> builds a <strong>form-aware system prompt</strong> with the current form snapshot and the missing required/recommended fields. So the agent:</p>
            <ul>
              <li><strong>Extracts</strong> on first description (log_interaction, once).</li>
              <li><strong>Reasons about completeness</strong> — if HCP Name or Topics is missing, it asks one specific clarifying question instead of guessing.</li>
              <li><strong>Distinguishes Outcomes</strong> (what happened) <strong>from Follow-ups</strong> (what's next).</li>
              <li><strong>Edits</strong> single fields on corrections; never re-logs.</li>
              <li><strong>Validates before saving</strong> — blocks on missing required fields and asks for them.</li>
              <li><strong>Replies meaningfully</strong> — confirms captured fields, flags gaps, offers the next step.</li>
            </ul>
          </Section>

          <Section id="voice" n="9" title="Voice processing">
            <div className="diagram">{`Browser MediaRecorder ─▶ POST /api/voice/transcribe (multipart)
   ─▶ Groq Whisper (whisper-large-v3-turbo) ─▶ transcript
   ─▶ transcript ─▶ POST /api/chat (same agent) ─▶ form fills + summary
Talk-back: assistant reply ─▶ browser SpeechSynthesis (TTS toggle)`}</div>
            <ul>
              <li><strong>STT</strong> — <code>services/voice.py</code> calls the Groq SDK audio endpoint directly (audio isn't in the LangChain chat seam). The chat mic and the form's "Summarize from Voice Note" button both record via <code>useVoiceInput</code>.</li>
              <li><strong>TTS</strong> — <code>useSpeech</code> uses the browser's built-in <code>SpeechSynthesis</code> (zero deps); the speaker toggle in the chat header speaks each reply.</li>
            </ul>
            <p><strong>Why route the transcript through the existing agent:</strong> speech is just another way to produce the user's text — voice reuses extraction, clarifying questions, and validation for free.</p>
          </Section>

          <Section id="database" n="10" title="Database schema">
            <table className="dtable">
              <thead><tr><th>Table</th><th>Columns</th></tr></thead>
              <tbody>
                <tr><td>hcps</td><td>id, name, specialty, organization — the HCP directory</td></tr>
                <tr><td>interactions</td><td>hcp_name, interaction_type, date, time, attendees (JSON), topics, materials_shared (JSON <code>{'[{type, name}]'}</code>), samples_distributed (JSON <code>{'[{name, quantity}]'}</code>), sentiment, outcomes, followup_actions, created_at</td></tr>
                <tr><td>app_settings</td><td>key, value — runtime Groq key/model overlay for the Admin panel</td></tr>
              </tbody>
            </table>
            <p><strong>Why JSON columns:</strong> materials/samples/attendees are small structured lists — JSON keeps the schema simple while staying structured. Sync SQLAlchemy keeps tools simple; FastAPI runs the sync endpoint in a threadpool.</p>
          </Section>

          <Section id="prompts" n="11" title="Prompt strategy">
            <table className="dtable">
              <thead><tr><th>Prompt</th><th>Role</th></tr></thead>
              <tbody>
                <tr><td>system.txt</td><td><strong>Dynamic</strong> — rendered per turn with the current form + missing fields; defines tool rules and "reason, don't just map".</td></tr>
                <tr><td>extract.txt</td><td>JSON extraction schema for log_interaction (materials/samples shapes, outcomes≠follow-ups).</td></tr>
                <tr><td>followups.txt</td><td>Follow-up suggestion generation.</td></tr>
                <tr><td>json_system.txt</td><td>Minimal system prompt for internal JSON calls, so the extraction model returns JSON instead of calling a tool.</td></tr>
              </tbody>
            </table>
            <p>Prompts are files, not Python (mustache-lite <code>{'{{var}}'}</code>) — tuned without code changes.</p>
          </Section>

          <Section id="state" n="12" title="State management">
            <ul>
              <li><strong>Backend:</strong> <code>AgentState</code> (messages + form) flows through the graph; the API is otherwise stateless — the frontend sends the current form each turn, and tool_node advances the form within a turn.</li>
              <li><strong>Frontend:</strong> Redux. <code>applyPatch</code> merges the AI's <code>form_patch</code> and records <code>updatedFields</code> (for the brief highlight); chatSlice holds the transcript; adminSlice the settings.</li>
            </ul>
          </Section>

          <Section id="api" n="13" title="API flow (one chat turn)">
            <div className="diagram">{`POST /api/chat { message, messages[], form }
  └─ chat_service.run_chat
       ├─ build form-aware system prompt (current form + missing required)
       ├─ graph.invoke({messages, form})              [LangGraph]
       │    agent → (tool_calls?) → tools → agent → … → final reply
       │      • agent_node: LLM + bind_tools           [LangChain → Groq]
       │      • tool_node : run tools, merge form_patch into state.form
       ├─ harvest ToolMessage artifacts → form_patch, suggestions, saved_id
       └─ return { reply, form_patch, suggestions, saved_id, tools_used }
  Frontend: dispatch(applyPatch(form_patch)) → form updates live`}</div>
            <p>Errors map cleanly: Groq not configured → 503; bad admin token → 401; any turn-level failure → a safe fallback reply (never 500 a turn). Full API reference at the backend Swagger <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">/docs</a>.</p>
          </Section>

          <Section id="testing" n="14" title="Testing">
            <ul>
              <li><strong>Backend (pytest, 33):</strong> field coercion (incl. structured materials/samples), required-field logic, all 6 tools (LLM mocked, sqlite), graph routing + form-merge, chat-service harvesting, settings overlay, Whisper transcription. No Postgres/Groq needed.</li>
              <li><strong>Frontend (Vitest, 5):</strong> formSlice reducers (patch merge, material dedupe, samples, suggestions).</li>
            </ul>
            <p>Run: <code>cd backend &amp;&amp; pytest</code> · <code>cd frontend &amp;&amp; npm test</code></p>
          </Section>

          <Section id="try" n="15" title="Try it">
            <p>On the <a href="/">Log Interaction</a> screen, type or speak:</p>
            <span className="callout">
              <code>I met Dr. Smith today about Product X. He was positive. I shared a brochure and the clinical study, left two Product X samples, and want a follow-up in two weeks.</code>
            </span>
            <p>The form fills automatically. Then try: <code>change the sentiment to neutral</code>,
              <code>add Dr. Sharma to attendees</code>, <code>suggest follow-ups</code>, <code>log it</code>.
              Set your Groq key in the <a href="/admin">Admin</a> panel first.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}
