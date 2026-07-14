import { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'

// The AI Assistant chat panel (right). Sending a message runs the LangGraph agent, which
// drives the form via tool calls. The "Log" button sends the current text just like Enter.
export default function ChatAssistant() {
  const { messages, status, send } = useChat()
  const [text, setText] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  function submit() {
    if (!text.trim()) return
    send(text)
    setText('')
  }

  return (
    <div className="panel">
      <div className="panel-header chat-head">
        <span>🔵 AI Assistant</span>
        <span className="sub">Log interaction via chat</span>
      </div>
      <div className="chat">
        <div className="chat-msgs">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>{m.content}</div>
          ))}
          {status === 'loading' && <div className="typing">Assistant is thinking…</div>}
          <div ref={endRef} />
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Describe interaction..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            disabled={status === 'loading'}
          />
          <button className="btn primary" onClick={submit} disabled={status === 'loading'}>
            ⚑ Log
          </button>
        </div>
      </div>
    </div>
  )
}
