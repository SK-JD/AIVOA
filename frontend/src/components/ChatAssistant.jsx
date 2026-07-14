import { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useSpeech } from '../hooks/useSpeech'
import Icon from './Icon'
import MessageContent from './MessageContent'

// Module-level so it survives remounts (navigating away and back) — each assistant
// message is spoken at most once, and the initial backlog is never re-spoken.
let ttsSpokenUpTo = null

function Dots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-blink" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </span>
  )
}

// The AI Assistant chat panel (right, docked). Auto-growing textarea, voice (Whisper), TTS.
export default function ChatAssistant() {
  const { messages, status, send } = useChat()
  const voice = useVoiceInput()
  const speech = useSpeech()
  const [text, setText] = useState('')
  const msgsRef = useRef(null)
  const taRef = useRef(null)

  useEffect(() => {
    const el = msgsRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, status, voice.busy])

  useEffect(() => {
    if (ttsSpokenUpTo === null) { ttsSpokenUpTo = messages.length; return }
    if (!speech.enabled) { ttsSpokenUpTo = messages.length; return }
    const last = messages[messages.length - 1]
    if (last && last.role === 'assistant' && messages.length > ttsSpokenUpTo) speech.speak(last.content)
    ttsSpokenUpTo = messages.length
  }, [messages, speech.enabled, speech])

  function autosize() {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }

  function submit() {
    if (!text.trim()) return
    send(text)
    setText('')
    requestAnimationFrame(() => { if (taRef.current) taRef.current.style.height = 'auto' })
  }

  const busy = status === 'loading' || voice.busy

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex flex-none items-center gap-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-[18px] py-3.5">
        <span className="grid h-[38px] w-[38px] place-items-center rounded-[11px] bg-gradient-to-br from-brand to-violet-400 text-white shadow-sm">
          <Icon name="bot" size={20} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-[15px] font-semibold">
            AI Assistant
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 before:h-[7px] before:w-[7px] before:rounded-full before:bg-emerald-500 before:content-['']">Online</span>
          </div>
          <div className="mt-px text-xs text-slate-400">Log interaction via chat or voice</div>
        </div>
        {speech.supported && (
          <button className={`icon-btn h-[34px] w-[34px] ${speech.enabled ? 'on' : ''}`} onClick={speech.toggle}
            title={speech.enabled ? 'Voice replies on' : 'Voice replies off'}>
            <Icon name={speech.enabled ? 'volume' : 'volume-x'} size={17} />
          </button>
        )}
      </div>

      {/* messages */}
      <div ref={msgsRef} className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto bg-slate-50 px-[18px] py-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex max-w-[88%] gap-2.5 ${m.role === 'user' ? 'flex-row-reverse self-end' : 'self-start'}`}>
            {m.role === 'assistant' && (
              <span className="mt-0.5 grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] border border-violet-100 bg-brand-soft text-brand-600">
                <Icon name="bot" size={16} />
              </span>
            )}
            <div className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
              m.role === 'user'
                ? 'whitespace-pre-wrap rounded-tr-sm bg-gradient-to-b from-violet-600 to-brand text-white'
                : 'rounded-tl-sm border border-slate-200 bg-white text-slate-600'
            }`}>
              {m.role === 'assistant' ? <MessageContent text={m.content} /> : m.content}
            </div>
          </div>
        ))}
        {status === 'loading' && <div className="flex items-center gap-2 px-10 text-[12.5px] text-slate-400"><Dots /> Assistant is thinking</div>}
        {voice.busy && <div className="flex items-center gap-2 px-10 text-[12.5px] text-slate-400"><Dots /> Transcribing voice note</div>}
      </div>

      {/* input */}
      <div className="flex-none border-t border-slate-200 bg-white px-3.5 pb-3.5 pt-3">
        <div className="flex items-end gap-1.5 rounded-2xl border border-slate-300 bg-white py-1.5 pl-2 pr-1.5 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
          <button className="icon-btn flat h-[34px] w-[34px]" title="Attach (coming soon)" disabled><Icon name="paperclip" size={17} /></button>
          <textarea
            ref={taRef}
            rows={1}
            className="max-h-[140px] min-h-0 flex-1 resize-none border-none bg-transparent px-1 py-1.5 text-[13.5px] leading-snug outline-none focus:ring-0"
            placeholder={voice.recording ? 'Listening…' : 'Message the assistant...'}
            value={text}
            onChange={(e) => { setText(e.target.value); autosize() }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            disabled={busy}
          />
          {voice.supported && (
            <button className={`icon-btn flat h-[34px] w-[34px] ${voice.recording ? 'animate-pulse-rec border-red-200 bg-red-50 text-red-500' : ''}`}
              onClick={voice.toggle} disabled={voice.busy} title={voice.recording ? 'Stop recording' : 'Record a voice note'}>
              <Icon name={voice.recording ? 'stop' : 'mic'} size={17} />
            </button>
          )}
          <button className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] bg-gradient-to-b from-violet-500 to-brand text-white shadow-sm hover:brightness-105 disabled:opacity-50"
            onClick={submit} disabled={busy} title="Send"><Icon name="send" size={16} /></button>
        </div>
        <div className="mt-2 text-center text-[11px] text-slate-400">AI can make mistakes. Verify HCP details before saving.</div>
      </div>
    </div>
  )
}
