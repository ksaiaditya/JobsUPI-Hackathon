import { useEffect, useState } from 'react'
import { CalendarClock, Flame, Navigation, Zap, Search } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getCache, setCache } from '../utils/offlineCache'
import CandidateCard from '../components/CandidateCard'
import StatusModal from '../components/StatusModal'

export default function Feed() {
  const [feed, setFeed] = useState({ nearby: [], activeToday: [], recentApplicants: [] })
  const [location, setLocation] = useState('JP Nagar')
  const [modal, setModal] = useState({ open: false, cand: null })
  const { request } = useApi()

  // Load once on mount; searches are triggered via button/Enter
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    let data
    // Attempt to fetch feed (with area/location params if provided)
    try {
      const qs = new URLSearchParams()
      if (location) {
        qs.set('area', location)
        qs.set('location', location)
      }
      const url = `/feed${qs.toString() ? `?${qs.toString()}` : ''}`
      data = await request(url)
    } catch (e) {
      // Fallback to POST for backends that expect body
      try {
        data = await request('/feed', { method: 'POST', body: { area: location || undefined, location: location || undefined } })
      } catch (_) {
        data = { nearby: [], activeToday: [], recentApplicants: [] }
      }
    }

    // Ensure object shape
    data = data || { nearby: [], activeToday: [], recentApplicants: [] }

    // If a location is provided, directly query nearby candidates as a reliable source
    if (location) {
      try {
        const nearby = await request(`/candidates/search?area=${encodeURIComponent(location)}`)
        data.nearby = nearby.results || []
      } catch (_) {
        // keep existing nearby if this fails
      }
    }

    setFeed(data)
    setCache(`feed:${location || 'default'}`, data)
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
    load()
  }

  function Section({ icon: Icon, title, items }) {
    return (
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Icon size={18} />
          </span>
          <span className="break-words">{title}</span>
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CandidateCard key={c.id || c._id} c={c} onCall={() => setModal({ open: true, cand: c })} onUpdateStatus={() => setModal({ open: true, cand: c })} />
          ))}
          {items.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
              No candidates in this category yet.
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-12">
      <header className="ui-card flex flex-col gap-6 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <h2 className="flex items-center gap-3 break-words text-2xl font-semibold text-slate-900 md:text-3xl">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/15 text-[var(--brand)]">
              <Flame size={24} />
            </span>
            <span className="break-words">Daily hiring feed</span>
          </h2>
          <p className="break-words text-sm text-slate-600">
            Track nearby talent, real-time availability, and recent applicants across the city.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <label className="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Location</label>
          <input
            className="w-44 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="e.g., HSR Layout"
          />
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-dark)]"
          >
            <Search size={14} />
            Search
          </button>
          {location && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Using: {location}
            </span>
          )}
        </div>
      </header>

      <Section icon={Navigation} title="Nearby candidates" items={feed.nearby} />
      <Section icon={Zap} title="Actively looking today" items={feed.activeToday} />
      <Section icon={CalendarClock} title="Recently active" items={feed.recentApplicants} />

      <StatusModal open={modal.open} candidate={modal.cand} onClose={() => setModal({ open: false, cand: null })} onSubmit={handleStatusSave} />
    </div>
  )
}
