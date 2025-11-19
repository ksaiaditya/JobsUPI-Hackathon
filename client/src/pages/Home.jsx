import { useEffect, useState } from 'react'
import { CalendarClock, Clock, Navigation, Phone, Search, Sparkles, Zap } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getCache, setCache } from '../utils/offlineCache'
import VoiceSearchBar from '../components/VoiceSearchBar'

export default function Home() {
  const { request, loading, error } = useApi()
  const [templates, setTemplates] = useState([])
  const [feed, setFeed] = useState({ nearby: [], activeToday: [], recentApplicants: [] })
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [location, setLocation] = useState('')

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const d = await request('/roles/templates')
        if (!cancelled) {
          const list = d.templates || []
          setTemplates(list)
          setCache('templates', list)
        }
      } catch {
        if (!cancelled) setTemplates(getCache('templates', []))
      }
      try {
        const f = await request('/feed')
        if (!cancelled) {
          setFeed(f)
          setCache('feed', f)
        }
      } catch {
        if (!cancelled) setFeed(getCache('feed', { nearby: [], activeToday: [], recentApplicants: [] }))
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const searchByLocation = async (loc) => {
    if (!loc) return
    const params = new URLSearchParams()
    params.set('area', loc)
    const data = await request(`/candidates/search?${params.toString()}`)
    setFeed((prev) => ({ ...prev, nearby: data.results || [] }))
  }

  const onVoiceQuery = async (text) => {
    setQuery(text)
    const isDelivery = /delivery/i.test(text)
    const areaMatch = text.match(/in ([A-Za-z ]+)/i)
    const params = new URLSearchParams()
    if (isDelivery) params.set('role', 'Delivery Boy')
    if (areaMatch) params.set('area', areaMatch[1].trim())
    try {
      const data = await request(`/candidates/search?${params.toString()}`)
      const list = data.results || []
      setResults(list)
      setCache(`voice:${params.toString()}`, list)
    } catch {
      setResults(getCache(`voice:${params.toString()}`, []))
    }
  }

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-orange-50 px-6 py-16 shadow-sm">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            <Sparkles size={16} />
            Smart hiring engine
          </span>
          <h1 className="break-words text-4xl font-bold text-slate-900 md:text-5xl">
            Hire faster with voice, recommendations, and real-time candidate feeds
          </h1>
          <p className="break-words text-lg text-slate-600">
            Launch voice-powered searches, auto-match templates, and activate always-on sourcing from a single mission control panel.
          </p>
          <VoiceSearchBar onQuery={onVoiceQuery} />
        </div>
      </section>

      {query && (
        <section className="ui-card border-[var(--accent)]/25 bg-white/90 p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Search size={20} />
              </span>
              <div className="min-w-0">
                <h3 className="break-words text-xl font-semibold text-slate-900">Voice search results</h3>
                <p className="break-words text-sm text-slate-500">"{query}"</p>
              </div>
            </div>
            {results.length > 0 && (
              <span className="badge">{results.length} matches</span>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((c) => (
              <div key={c.id} className="ui-card p-5 shadow-none hover:shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-slate-900">{c.name}</p>
                    <p className="break-words text-sm text-slate-600">{c.role}</p>
                    <p className="break-words mt-1 text-xs text-slate-500">{c.area} · {c.education}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="btn-blue w-auto">
                    <Phone size={18} />
                    Call
                  </a>
                </div>
              </div>
            ))}
            {!results.length && (
              <div className="col-span-full flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-sm text-slate-500">
                No matches found. Try refining your query.
              </div>
            )}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="break-words text-2xl font-semibold text-slate-900">Role templates</h2>
          <span className="break-words text-sm text-slate-500">Instant bands, shifts, and requirements ready for deployment</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <article key={t.id} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className="space-y-3">
                <div className="min-w-0">
                  <h3 className="break-words text-base font-bold text-slate-900">{t.name}</h3>
                  <p className="break-words mt-1 text-sm text-slate-600">
                    ₹{t.salaryRange?.[0]?.toLocaleString()} – ₹{t.salaryRange?.[1]?.toLocaleString()} • {t.workHours || 'Flexible'}
                  </p>
                </div>
                {(t.defaultRequirements || []).length > 0 && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</p>
                    <p className="break-words mt-1 text-sm text-slate-600">
                      {(t.defaultRequirements || []).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}
          {templates.length === 0 && (
            <div className="col-span-full flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 py-16 text-sm text-slate-500">
              No templates available yet.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
              <Sparkles size={18} />
            </span>
            <h2 className="break-words text-2xl font-semibold text-slate-900">Daily hiring feed</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="ui-card p-6">
            <header className="mb-5 flex items-center justify-between gap-3 text-slate-700">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/12 text-[var(--accent)]">
                  <Navigation size={18} />
                </span>
                <h3 className="break-words text-lg font-semibold text-slate-900">Nearby candidates</h3>
              </div>
            </header>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Enter your location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchByLocation(location)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
              <button
                onClick={() => searchByLocation(location)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-dark)]"
              >
                <Search size={16} />
                Search
              </button>
            </div>
            <ul className="space-y-4 text-sm">
              {feed.nearby.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-none last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-slate-900">{c.name}</p>
                    <p className="break-words text-xs text-slate-500">{c.role}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-[var(--brand)] hover:text-[var(--brand-dark)]">
                    <Phone size={16} />
                    Call
                  </a>
                </li>
              ))}
              {!feed.nearby.length && <li className="text-sm text-slate-500">No candidates nearby</li>}
            </ul>
          </article>
          <article className="ui-card p-6">
            <header className="mb-5 flex items-center gap-3 text-slate-700">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand)]/12 text-[var(--brand)]">
                <Zap size={18} />
              </span>
              <h3 className="break-words text-lg font-semibold text-slate-900">Active today</h3>
            </header>
            <ul className="space-y-4 text-sm">
              {feed.activeToday.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-none last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-slate-900">{c.name}</p>
                    <p className="break-words text-xs text-slate-500">{c.role}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[var(--brand)] hover:text-[var(--brand-dark)]">
                    <Phone size={16} />
                    <span>Call</span>
                  </a>
                </li>
              ))}
              {!feed.activeToday.length && <li className="text-sm text-slate-500">No active candidates</li>}
            </ul>
          </article>
          <article className="ui-card p-6">
            <header className="mb-5 flex items-center gap-3 text-slate-700">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/12 text-[var(--accent)]">
                <CalendarClock size={18} />
              </span>
              <h3 className="break-words text-lg font-semibold text-slate-900">Recently applied</h3>
            </header>
            <ul className="space-y-4 text-sm">
              {feed.recentApplicants.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-none last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-slate-900">{c.name}</p>
                    <p className="break-words text-xs text-slate-500">{c.role}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-[var(--brand)] hover:text-[var(--brand-dark)]">
                    <Phone size={16} />
                    Call
                  </a>
                </li>
              ))}
              {!feed.recentApplicants.length && <li className="text-sm text-slate-500">No recent applicants</li>}
            </ul>
          </article>
        </div>
      </section>

      {loading && (
        <div className="flex justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[var(--accent)] border-r-transparent"></div>
        </div>
      )}
      {error && (
        <div className="ui-card border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {String(error.message || error)}
        </div>
      )}
    </div>
  )
}
