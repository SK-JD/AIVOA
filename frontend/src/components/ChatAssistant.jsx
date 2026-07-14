import { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useSpeech } from '../hooks/useSpeech'
import Icon from './Icon'

// The AI Assistant chat panel (right). Full-height, sticky: only the message list scrolls.
// Supports voice input (Groq Whisper) and optional spoken talk-back (browser TTS).
export default function ChatAssistant() {
  const { messages, status, send } = useChat()
  const voice = useVoiceInput()
  const speech = useSpeech()
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const spokenRef = useRef(0)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  // Speak new assistant messages when talk-back is enabled.
  useEffect(() => {
    if (!speech.enabled) {
      spokenRef.current = messages.length
      return
    }
    const last = messages[messages.length - 1]
    if (last && last.role === 'assistant' && messages.length > spokenRef.current) {
      speech.speak(last.content)
    }
    spokenRef.current = messages.length
  }, [messages, speech])

  function submit() {
    if (!text.trim()) return
    send(text)
    setText('')
  }

  const busy = status === 'loading' || voice.busy

  return (
    <div className="panel chat-panel">
      <div className="assistant-head">
        <span className="avatar"><Icon name="bot" size={20} /></span>
        <div style={{ flex: 1 }}>
          <div className="title">
            AI Assistant
            <span className="status-live">Online</span>
          </div>
          <div className="sub">Log interaction via chat or voice</div>
        </div>
        {speech.supported && (
          <button
            className={`icon-btn${speech.enabled ? ' on' : ''}`}
            onClick={speech.toggle}
            title={speech.enabled ? 'Voice replies on' : 'Voice replies off'}
          >
            <Icon name={speech.enabled ? 'volume' : 'volume-x'} size={17} />
          </button>
        )}
      </div>

      <div className="chat-msgs">
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.role}`}>
            <span className={`msg-avatar ${m.role}`}>
              <Icon name={m.role === 'user' ? 'user' : 'bot'} size={17} />
            </span>
            <div className={`bubble ${m.role}`}>{m.content}</div>
          </div>
        ))}
        {status === 'loading' && (
          <div className="typing">
            <span className="dots"><span className="d" /><span className="d" /><span className="d" /></span>
            Assistant is thinking
          </div>
        )}
        {voice.busy && (
          <div className="typing"><span className="dots"><span className="d" /><span className="d" /><span className="d" /></span> Transcribing voice note</div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        {voice.supported && (
          <button
            className={`icon-btn mic${voice.recording ? ' recording' : ''}`}
            onClick={voice.toggle}
            disabled={voice.busy}
            title={voice.recording ? 'Stop recording' : 'Record a voice note'}
          >
            <Icon name={voice.recording ? 'stop' : 'mic'} size={17} />
          </button>
        )}
        <input
          type="text"
          placeholder={voice.recording ? 'Listening…' : 'Describe interaction...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          disabled={busy}
        />
        <button className="btn primary" onClick={submit} disabled={busy}>
          <Icon name="send" size={16} /> Log
        </button>
      </div>
    </div>
  )
}
