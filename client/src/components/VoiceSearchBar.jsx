import { useEffect, useRef, useState } from 'react'
import { Lightbulb, Mic } from 'lucide-react'

export default function VoiceSearchBar({ onQuery }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      onQuery?.(text)
      setListening(false)
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
  }, [onQuery])

  const start = () => {
    if (!recRef.current) return
    try {
      setListening(true)
      recRef.current.start()
    } catch {}
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={start}
        className="btn-brand"
        style={
          listening
            ? {
                backgroundColor: '#dc2626',
                boxShadow: '0 18px 42px -18px rgba(220,38,38,0.6)',
              }
            : undefined
        }
      >
        <Mic size={18} />
        {listening ? 'Listening...' : 'Voice Search'}
      </button>
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
        <Lightbulb size={16} className="text-[var(--accent)]" />
        <span className="font-medium text-slate-900">Try:</span>
        "Show delivery boys in JP Nagar"
      </div>
    </div>
  )
}
