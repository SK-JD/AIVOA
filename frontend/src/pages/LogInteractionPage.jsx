import InteractionForm from '../components/InteractionForm'
import ChatAssistant from '../components/ChatAssistant'

// The main screen: split view — Interaction form (left), AI Assistant chat (right).
export default function LogInteractionPage() {
  return (
    <div className="page">
      <h1 className="page-title">Log HCP Interaction</h1>
      <div className="split">
        <InteractionForm />
        <ChatAssistant />
      </div>
    </div>
  )
}
