import { useEffect, useMemo, useRef, useState } from 'react'
import { Filter, Loader, Mic, Search } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getCache, setCache } from '../utils/offlineCache'
import CandidateCard from '../components/CandidateCard'
import StatusModal from '../components/StatusModal'

function parseVoiceToFilters(text) {
  const raw = String(text || '')
  const t = raw.toLowerCase()

  // Map common utterances to canonical role labels
  let role
  if (/(delivery\s*(boy|exec|executive|partner)?|zomato|swiggy)/i.test(raw)) role = 'Delivery Boy'
  else if (/(retail|store|sales)/i.test(raw)) role = 'Retail Staff'
  else if (/(helper|warehouse|packing)/i.test(raw)) role = 'Helper'

  // Extract area by common prepositions
  // e.g. "in jp nagar", "near hsr layout", "around koramangala"
  const areaMatch = /\b(?:in|at|near|around)\s+([a-z0-9 .,-]+)/i.exec(raw)
  let area = areaMatch ? areaMatch[1].trim() : undefined
  if (area) area = area.replace(/["'.,]+$/g, '')

  // Education level
  const edu = /(10th|12th|8th)/i.exec(raw)?.[1]

  return { role, area, education: edu }
}

export default function VoiceHire() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [modal, setModal] = useState({ open: false, cand: null })
  const { request, loading } = useApi()

  const rec = useRef(null)
  const canVoice = useMemo(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window, [])

  useEffect(() => {
    if (!canVoice) return
    const R = window.SpeechRecognition || window.webkitSpeechRecognition
    rec.current = new R()
    rec.current.lang = 'en-IN'
    rec.current.continuous = false
    rec.current.interimResults = false
    rec.current.onresult = (e) => {
      const text = e.results[0][0].transcript
      setQuery(text)
      handleSearch(text)
    }
  }, [canVoice])

  async function handleSearch(text) {
    const filters = parseVoiceToFilters(text || query)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => v && params.append(k, v))
    const cacheKey = `voicehire:${params.toString() || 'empty'}`
    try {
      const data = await request(`/candidates/search?${params.toString()}`)
      const list = data.results || []
      setResults(list)
      setCache(cacheKey, list)
    } catch {
      setResults(getCache(cacheKey, []))
    }
  }

  async function handleStatusSave({ status, note }) {
    if (!modal.cand) return
    const candId = modal.cand.id || modal.cand._id
    try {
      await request(`/candidates/${candId}/status`, { method: 'PATCH', body: { status, note } })
    } catch (e) {
      try {
        await request(`/candidates/${candId}/status`, { method: 'PUT', body: { status, note } })
      } catch (e2) {
        await request(`/candidates/status`, { method: 'PATCH', body: { id: candId, status, note } })
      }
    }
    setModal({ open: false, cand: null })
    handleSearch()
  }

  return (
    <div className="space-y-12">
      <section className="ui-card space-y-6 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-8">
        <div className="space-y-2">
          <h2 className="break-words text-3xl font-semibold text-slate-900">Voice-based hiring</h2>
          <p className="break-words text-sm text-slate-600">Speak naturally or type to discover matched candidates instantly.</p>
        </div>
        <div className="ui-card grid gap-4 border-slate-200 bg-white/90 p-6 shadow-none md:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={18} className="text-[var(--accent)]" />
            <input
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
              placeholder='Try: "Show delivery boys in JP Nagar, 10th pass"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            className="btn-blue"
            onClick={() => handleSearch()}
            disabled={loading}
            type="button"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Search'}
          </button>
          {canVoice && (
            <button
              className="btn-brand"
              type="button"
              onClick={() => rec.current && rec.current.start()}
            >
              <Mic size={18} />
              Start voice
            </button>
          )}
        </div>
        <p className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
          <Filter size={14} className="text-[var(--accent)]" />
          Tip: Use natural language like "delivery boys in Koramangala with 10th pass".
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="break-words text-xl font-semibold text-slate-900">
            {results.length > 0 ? `Found ${results.length} candidates` : 'Search results'}
          </h3>
          {query && (
            <span className="badge">Query active</span>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <CandidateCard
              key={c.id || c._id}
              c={c}
              onCall={() => setModal({ open: true, cand: c })}
              onUpdateStatus={() => setModal({ open: true, cand: c })}
            />
          ))}
          {results.length === 0 && query && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
              No candidates match your search. Try different keywords.
            </div>
          )}
          {results.length === 0 && !query && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
              Start by typing or using voice search above.
            </div>
          )}
        </div>
      </section>

      <StatusModal
        open={modal.open}
        candidate={modal.cand}
        onClose={() => setModal({ open: false, cand: null })}
        onSubmit={handleStatusSave}
      />
    </div>
  )
}
