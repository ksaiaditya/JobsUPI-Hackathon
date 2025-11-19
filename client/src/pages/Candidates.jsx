import { useEffect, useState } from 'react'
import { Filter, Loader, Search, Users } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { getCache, setCache } from '../utils/offlineCache'
import CandidateCard from '../components/CandidateCard'
import StatusModal from '../components/StatusModal'

export default function Candidates() {
  const { request, loading, error } = useApi()
  const [filters, setFilters] = useState({ role: '', area: '', education: '' })
  const [results, setResults] = useState([])
  const [modal, setModal] = useState({ open: false, cand: null })

  useEffect(() => { search() }, [])

  async function search() {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k,v]) => v && params.append(k, v))
    const key = `candidates:${params.toString() || 'all'}`
    try {
      const data = await request(`/candidates/search?${params.toString()}`)
      const list = data.results || []
      setResults(list)
      setCache(key, list)
    } catch {
      setResults(getCache(key, []))
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
    search()
  }

  return (
    <div className="space-y-12">
      <header className="ui-card space-y-2 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-8">
        <h2 className="flex items-center gap-3 break-words text-3xl font-semibold text-slate-900">
          <Users size={28} className="shrink-0 text-[var(--accent)]" />
          <span className="break-words">Candidate search</span>
        </h2>
        <p className="break-words text-sm text-slate-600">Find and manage candidates with structured filters and instant actions.</p>
      </header>

      <section className="ui-card space-y-6 bg-white p-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={18} className="text-[var(--accent)]" />
          Search filters
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Role</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              placeholder="e.g., Delivery Boy"
              value={filters.role}
              onChange={e=>setFilters(f=>({...f, role:e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Area</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              placeholder="e.g., JP Nagar"
              value={filters.area}
              onChange={e=>setFilters(f=>({...f, area:e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Education</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              placeholder="e.g., 10th pass"
              value={filters.education}
              onChange={e=>setFilters(f=>({...f, education:e.target.value}))}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-blue" onClick={search} type="button" disabled={loading}>
            {loading ? <Loader className="animate-spin" size={16} /> : <Search size={16} />}
            {loading ? 'Searching...' : 'Search candidates'}
          </button>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              setFilters({ role: '', area: '', education: '' })
              setResults([])
            }}
          >
            Clear filters
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="break-words text-xl font-semibold text-slate-900">{results.length > 0 ? `${results.length} candidates found` : 'Search results'}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map(c => (
            <CandidateCard key={c.id || c._id} c={c} onCall={()=>setModal({open:true,cand:c})} onUpdateStatus={()=>setModal({open:true,cand:c})} />
          ))}
          {!results.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
              No candidates found. Try adjusting your filters.
            </div>
          )}
        </div>
      </section>

      <StatusModal open={modal.open} candidate={modal.cand} onClose={()=>setModal({open:false,cand:null})} onSubmit={handleStatusSave} />

      {loading && <div className="mt-6 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[var(--accent)] border-r-transparent"></div></div>}
      {error && <div className="ui-card bg-red-50 p-4 text-sm text-red-700 border-red-200">{String(error.message || error)}</div>}
    </div>
  )
}
