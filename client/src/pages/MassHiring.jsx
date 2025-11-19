import { useState } from 'react'
import { Loader, Target, Users } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import CandidateCard from '../components/CandidateCard'

export default function MassHiring() {
  const { request, loading, error } = useApi()
  const [role, setRole] = useState('Helper')
  const [count, setCount] = useState(3)
  const [result, setResult] = useState(null)

  async function run(e) {
    e.preventDefault()
    const data = await request('/hire/mass', { method: 'POST', body: { role, count } })
    setResult(data)
  }

  return (
    <div className="space-y-12">
      <header className="ui-card space-y-2 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-8">
        <h2 className="flex items-center gap-3 break-words text-3xl font-semibold text-slate-900">
          <Users size={28} className="shrink-0 text-[var(--accent)]" />
          <span className="break-words">Mass hiring</span>
        </h2>
        <p className="break-words text-sm text-slate-600">Get multiple qualified candidates for a role in seconds.</p>
      </header>

      <div className="max-w-2xl">
        <form onSubmit={run} className="ui-card space-y-6 bg-white p-8">
          <div className="text-sm font-semibold text-slate-700">
            Bulk request
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Role</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                value={role}
                onChange={e=>setRole(e.target.value)}
                placeholder="e.g., Helper"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Number of candidates</label>
              <input
                type="number"
                min={1}
                max={50}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                value={count}
                onChange={e=>setCount(Number(e.target.value)||1)}
                placeholder="e.g., 5"
              />
            </div>
          </div>
          <button className="btn-blue w-full" disabled={loading}>
            {loading ? <Loader className="animate-spin" size={18} /> : <Target size={18} />}
            {loading ? 'Fetching...' : 'Get candidates'}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-6">
          {result.template && (
            <div className="ui-card space-y-2 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-6">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Target size={18} className="text-[var(--brand)]" />
                Matched template
              </h4>
              <p className="break-words text-base font-semibold text-slate-900">{result.template.name}</p>
              <p className="break-words text-sm font-semibold text-[var(--brand)]">₹{result.template.salaryRange?.[0]?.toLocaleString()} – ₹{result.template.salaryRange?.[1]?.toLocaleString()}</p>
              <p className="break-words text-sm text-slate-500">Shift: {result.template.workHours || 'Not specified'}</p>
            </div>
          )}
          <div>
            <h3 className="break-words text-xl font-semibold text-slate-900">Suggested candidates ({(result.suggested || []).length})</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(result.suggested || []).map(c => (
              <CandidateCard key={c.id || c._id} c={c} />
            ))}
            {(!result.suggested || result.suggested.length===0) && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
                No suggestions found for this role.
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div className="ui-card border-red-200 bg-red-50 p-4 text-sm text-red-700">{String(error.message || error)}</div>}
    </div>
  )
}
