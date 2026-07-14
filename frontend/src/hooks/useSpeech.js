import { useCallback, useState } from 'react'

// Browser text-to-speech (Web Speech API) for assistant talk-back — zero dependencies.
export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  // Default ON unless the user has explicitly turned it off.
  const [enabled, setEnabled] = useState(() => localStorage.getItem('ttsOn') !== '0')

  const toggle = useCallback(() => {
    setEnabled((e) => {
      const next = !e
      localStorage.setItem('ttsOn', next ? '1' : '0')
      if (!next && supported) window.speechSynthesis.cancel()
      return next
    })
  }, [supported])

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ''))
      utterance.rate = 1.02
      window.speechSynthesis.speak(utterance)
    },
    [supported],
  )

  return { supported, enabled, toggle, speak }
}
