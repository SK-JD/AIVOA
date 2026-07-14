import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { api } from '../services/api'
import { addMessage } from '../redux/chatSlice'
import { useChat } from './useChat'

// Records a voice note (MediaRecorder), transcribes it via Groq Whisper, and feeds the
// transcript through the normal chat agent — so voice reuses the full extraction workflow.
export function useVoiceInput() {
  const dispatch = useDispatch()
  const { send } = useChat()
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  const supported =
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof window !== 'undefined' &&
    'MediaRecorder' in window

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBusy(true)
        try {
          const { transcript } = await api.transcribe(blob)
          if (transcript && transcript.trim()) {
            await send(transcript.trim())
          } else {
            dispatch(addMessage({ role: 'assistant', content: "I didn't catch that — could you try again?" }))
          }
        } catch (err) {
          dispatch(addMessage({ role: 'assistant', content: `⚠️ Voice transcription failed: ${err.message}` }))
        } finally {
          setBusy(false)
        }
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      dispatch(addMessage({ role: 'assistant', content: '⚠️ Microphone access was denied.' }))
    }
  }

  function stop() {
    recorderRef.current?.state === 'recording' && recorderRef.current.stop()
    setRecording(false)
  }

  function toggle() {
    if (busy) return
    recording ? stop() : start()
  }

  return { recording, busy, toggle, supported }
}
