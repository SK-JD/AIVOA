import { useVoiceInput } from '../hooks/useVoiceInput'
import Icon from './Icon'

// The form's "Summarize from Voice Note" action: record → Groq Whisper → agent fills the form.
export default function VoiceNoteButton() {
  const { recording, busy, toggle, supported } = useVoiceInput()

  if (!supported) {
    return (
      <button className="btn ghost sm voice-btn" disabled title="Voice recording not supported in this browser">
        <Icon name="mic" size={15} /> Summarize from Voice Note (Requires Consent)
      </button>
    )
  }

  const label = busy
    ? 'Transcribing…'
    : recording
      ? 'Stop & Summarize'
      : 'Summarize from Voice Note (Requires Consent)'

  return (
    <button
      className={`btn ghost sm voice-btn${recording ? ' recording' : ''}`}
      onClick={toggle}
      disabled={busy}
    >
      <Icon name={recording ? 'stop' : 'mic'} size={15} /> {label}
    </button>
  )
}
