import { useDispatch, useSelector } from 'react-redux'
import { api } from '../services/api'
import { addMessage, setStatus, setError } from '../redux/chatSlice'
import { applyPatch, clearUpdated, setSuggestions, setSavedId } from '../redux/formSlice'

// Sends a user message to the LangGraph agent, then applies the returned form patch,
// suggestions, and reply to the store. This is the single AI → form update path.
export function useChat() {
  const dispatch = useDispatch()
  const messages = useSelector((s) => s.chat.messages)
  const status = useSelector((s) => s.chat.status)
  const form = useSelector((s) => s.form)

  async function send(text) {
    const content = text.trim()
    if (!content || status === 'loading') return

    dispatch(addMessage({ role: 'user', content }))
    dispatch(setStatus('loading'))

    // Send the running history + current form snapshot so edit/save see live values.
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    const { hcp_name, interaction_type, date, time, duration, attendees, topics, materials_shared,
      samples_distributed, sentiment, outcomes, followup_actions } = form
    const formSnapshot = { hcp_name, interaction_type, date, time, duration, attendees, topics,
      materials_shared, samples_distributed, sentiment, outcomes, followup_actions }

    try {
      const res = await api.sendChat({
        message: content,
        messages: history,
        form: formSnapshot,
      })
      if (res.form_patch && Object.keys(res.form_patch).length) {
        dispatch(applyPatch(res.form_patch))
        setTimeout(() => dispatch(clearUpdated()), 1800)
      }
      if (res.suggestions && res.suggestions.length) {
        dispatch(setSuggestions(res.suggestions))
      }
      if (res.saved_id != null) {
        dispatch(setSavedId(res.saved_id))
      }
      dispatch(addMessage({ role: 'assistant', content: res.reply }))
      dispatch(setStatus('idle'))
    } catch (err) {
      dispatch(setError(err.message))
      dispatch(
        addMessage({ role: 'assistant', content: `⚠️ ${err.message}` }),
      )
    }
  }

  return { messages, status, send }
}
