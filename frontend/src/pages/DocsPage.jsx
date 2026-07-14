// In-app documentation: how the AI-first form works, the 5 tools, and example prompts.
export default function DocsPage() {
  return (
    <div className="page docs">
      <h1 className="page-title">Docs · How it works</h1>
      <p className="page-sub">An AI-first way to log HCP interactions — powered by LangGraph tool-calling.</p>
      <div className="panel card" style={{ maxWidth: 760 }}>
        <div className="panel-header"><span className="dot" /> Guide</div>
        <div className="panel-body">
          <p>
            This is an <strong>AI-first CRM</strong> for logging Healthcare Professional (HCP)
            interactions. You never fill the form manually — describe the interaction to the{' '}
            <strong>AI Assistant</strong> on the right and a <strong>LangGraph</strong> agent
            (running on Groq) populates the form on the left through tool calls.
          </p>

          <h3>Try it</h3>
          <p>
            On the <a href="/">Log Interaction</a> screen, type:
          </p>
          <span className="callout">
            <code>
              I met Dr. Smith today regarding Product X. He responded positively. I shared two
              brochures and requested a follow-up in two weeks.
            </code>
          </span>
          <p>The form fills automatically. Then try corrections like:</p>
          <ul>
            <li><code>Change the sentiment to neutral</code></li>
            <li><code>Add Dr. Sharma to attendees</code></li>
            <li><code>Suggest some follow-up actions</code></li>
            <li><code>Log it</code> — saves the interaction to the database</li>
          </ul>

          <h3>The 5 LangGraph tools</h3>
          <ul>
            <li><strong>log_interaction</strong> — extracts structured fields from free text.</li>
            <li><strong>edit_interaction</strong> — updates a single field on request.</li>
            <li><strong>search_hcp</strong> — resolves the HCP against the CRM directory.</li>
            <li><strong>suggest_followups</strong> — proposes next-step actions.</li>
            <li><strong>save_interaction</strong> — persists the completed form to PostgreSQL.</li>
          </ul>

          <h3>Admin</h3>
          <p>
            The <a href="/admin">Admin</a> panel lets you paste a Groq API key, pick a model, test
            the connection, and save — changes take effect immediately (no restart).
          </p>

          <h3>API reference</h3>
          <p>
            The backend exposes interactive Swagger docs at{' '}
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
              http://localhost:8000/docs
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
