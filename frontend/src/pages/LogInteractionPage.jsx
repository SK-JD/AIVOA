import InteractionForm from '../components/InteractionForm'
import ChatAssistant from '../components/ChatAssistant'

// The main screen: split view — Interaction form (left), AI Assistant chat (right).
export default function LogInteractionPage() {
  return (
    <div className="page">
      <h1 className="page-title">Log HCP Interaction</h1>
      <p className="page-sub">Describe the interaction to the AI assistant — it fills the form for you.</p>
      <div className="split">
        <InteractionForm />
        <div className="chat-col">
          <ChatAssistant />
        </div>
      </div>
    </div>
  )
}
