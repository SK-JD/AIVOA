import { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import Icon from './Icon'

// The AI Assistant chat panel (right). Full-height, sticky: only the message list scrolls.
// Sending a message runs the LangGraph agent, which drives the form via tool calls.
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
    <div className="panel chat-panel">
      <div className="assistant-head">
        <span className="avatar"><Icon name="bot" size={20} /></span>
        <div>
          <div className="title">
            AI Assistant
            <span className="status-live">Online</span>
          </div>
          <div className="sub">Log interaction via chat</div>
        </div>
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
          <Icon name="send" size={16} /> Log
        </button>
      </div>
    </div>
  )
}
