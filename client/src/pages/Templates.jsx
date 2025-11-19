import { useEffect, useMemo, useState } from 'react'
import { Clock3, Eye, FilePlus, IndianRupee, Layers3, ListChecks, PencilLine, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'

export default function Templates() {
  const { request, loading, error } = useApi()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', salaryMin: '', salaryMax: '', workHours: '', defaultRequirements: '' })
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const data = await request('/roles/templates')
    const templates = data.templates || []
    setItems(templates)
    setSelected((prev) => {
      if (!templates.length) return null
      if (prev) {
        const match = templates.find((t) => t.id === prev.id)
        if (match) return match
      }
      return templates[0]
    })
  }

  function toReqs(s) {
    return String(s || '').split(',').map(x => x.trim()).filter(Boolean)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const body = {
      name: form.name,
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      workHours: form.workHours,
      defaultRequirements: toReqs(form.defaultRequirements),
    }
    if (editing) {
      await request(`/roles/templates/${editing}`, { method: 'PUT', body })
    } else {
      await request('/roles/templates', { method: 'POST', body })
    }
    setForm({ name: '', salaryMin: '', salaryMax: '', workHours: '', defaultRequirements: '' })
    setEditing(null)
    load()
  }

  function startEdit(t) {
    setEditing(t.id)
    setSelected(t)
    setForm({
      name: t.name,
      salaryMin: t.salaryRange?.[0] ?? '',
      salaryMax: t.salaryRange?.[1] ?? '',
      workHours: t.workHours || '',
      defaultRequirements: (t.defaultRequirements || []).join(', '),
    })
  }

  async function del(id) {
    await request(`/roles/templates/${id}`, { method: 'DELETE' })
    setSelected((prev) => (prev && prev.id === id ? null : prev))
    load()
  }

  const stats = useMemo(() => {
    if (!items.length) {
      return { total: 0, avgSalaryMin: 0, avgSalaryMax: 0, avgRequirements: 0, uniqueShifts: 0 }
    }
    let minSum = 0
    let maxSum = 0
    let reqCount = 0
    const shifts = new Set()
    items.forEach((t) => {
      const [min, max] = t.salaryRange || []
      if (typeof min === 'number' && !Number.isNaN(min)) minSum += min
      if (typeof max === 'number' && !Number.isNaN(max)) maxSum += max
      reqCount += (t.defaultRequirements || []).length
      if (t.workHours) shifts.add(t.workHours)
    })
    const divisor = items.length || 1
    return {
      total: items.length,
      avgSalaryMin: Math.round(minSum / divisor) || 0,
      avgSalaryMax: Math.round(maxSum / divisor) || 0,
      avgRequirements: Number((reqCount / divisor).toFixed(1)) || 0,
      uniqueShifts: shifts.size,
    }
  }, [items])

  const selectedRequirements = selected?.defaultRequirements || []
  const salaryRange = selected?.salaryRange || []

  return (
    <div className="space-y-12">
      <section className="ui-card space-y-8 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
              <Sparkles size={16} />
              Template gallery
            </span>
            <h2 className="break-words text-3xl font-bold text-slate-900 md:text-4xl">Craft, launch, and scale your hiring playbooks</h2>
            <p className="max-w-3xl text-sm text-slate-600">
              Design templated roles with salary bands, shift windows, and ready-to-use requirements. Every section is card-based, responsive, and built for high-velocity hiring teams.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setForm({ name: '', salaryMin: '', salaryMax: '', workHours: '', defaultRequirements: '' })
            }}
            className="btn-blue"
          >
            <FilePlus size={18} />
            New blank template
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="ui-card space-y-1 border-blue-100 bg-white/90 p-5 shadow-none">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total templates</p>
            <div className="flex items-center gap-2">
              <Layers3 size={18} className="text-[var(--accent)]" />
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
          <div className="ui-card space-y-1 border-blue-100 bg-white/90 p-5 shadow-none">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average salary band</p>
            <div className="flex items-center gap-2">
              <IndianRupee size={18} className="text-[var(--brand)]" />
              <p className="text-lg font-semibold text-slate-900">₹{stats.avgSalaryMin.toLocaleString()} – ₹{stats.avgSalaryMax.toLocaleString()}</p>
            </div>
          </div>
          <div className="ui-card space-y-1 border-blue-100 bg-white/90 p-5 shadow-none">
            <p className="text-xs uppercase tracking-wide text-slate-500">Avg. requirements</p>
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-[var(--accent)]" />
              <p className="text-3xl font-bold text-[var(--brand)]">{stats.avgRequirements}</p>
            </div>
          </div>
          <div className="ui-card space-y-1 border-blue-100 bg-white/90 p-5 shadow-none">
            <p className="text-xs uppercase tracking-wide text-slate-500">Unique shift patterns</p>
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-[var(--accent)]" />
              <p className="text-3xl font-bold text-[var(--accent)]">{stats.uniqueShifts}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[2fr_1fr]">
        <form onSubmit={handleSubmit} className="ui-card space-y-6 bg-white p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <PencilLine size={20} />
              {editing ? 'Edit template' : 'Create new template'}
            </h3>
            {editing && (
              <span className="badge">Editing existing template</span>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Role name *</label>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25" placeholder="e.g., Delivery Associate" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Work hours</label>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25" placeholder="e.g., 10am - 7pm" value={form.workHours} onChange={e=>setForm(f=>({...f,workHours:e.target.value}))} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Min salary (₹) *</label>
              <input type="number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25" placeholder="15000" value={form.salaryMin} onChange={e=>setForm(f=>({...f,salaryMin:e.target.value}))} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">Max salary (₹) *</label>
              <input type="number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25" placeholder="25000" value={form.salaryMax} onChange={e=>setForm(f=>({...f,salaryMax:e.target.value}))} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Requirements</label>
            <textarea className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25" rows={4} placeholder="Comma separated, e.g., 10th pass, Valid DL, Own vehicle" value={form.defaultRequirements} onChange={e=>setForm(f=>({...f,defaultRequirements:e.target.value}))} />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            {editing && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setEditing(null)
                  setForm({ name: '', salaryMin: '', salaryMax: '', workHours: '', defaultRequirements: '' })
                }}
              >
                Cancel edit
              </button>
            )}
            <button className="btn-blue" type="submit">
              {editing ? 'Update template' : 'Add template'}
            </button>
          </div>
        </form>

        <aside className="ui-card flex flex-col gap-6 bg-white p-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Eye size={18} />
              Template preview
            </h3>
            {selected && (
              <span className="badge">ID: {selected.id.slice(-6)}</span>
            )}
          </div>
          {selected ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
                <p className="break-words text-2xl font-semibold text-slate-900">{selected.name}</p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--accent)]">Salary band</p>
                  <p className="text-lg font-semibold text-slate-900">₹{(salaryRange[0] || 0).toLocaleString()} – ₹{(salaryRange[1] || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--brand)]">Shift</p>
                  <p className="text-base font-semibold text-slate-800">{selected.workHours || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">Requirements</p>
                {selectedRequirements.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedRequirements.map((req, idx) => (
                      <span key={`${selected.id}-preview-req-${idx}`} className="break-words inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]"></span>
                        {req}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No requirements listed yet.</p>
                )}
              </div>
              <div className="flex gap-3">
                <button className="btn-blue w-full" type="button" onClick={() => startEdit(selected)}>
                  <PencilLine size={18} />
                  Edit template
                </button>
                <button className="btn-ghost w-full" type="button" onClick={() => del(selected.id)}>
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
              <Eye size={32} className="text-[var(--accent)]" />
              Select a template card to preview full details here.
            </div>
          )}
        </aside>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-slate-900">Template library</h3>
          <button className="btn-ghost" type="button" onClick={load}>
            <RefreshCw size={16} />
            Refresh list
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((t) => {
            const isSelected = selected?.id === t.id
            return (
              <article
                key={t.id}
                onClick={() => setSelected(t)}
                className={`ui-card cursor-pointer p-6 transition-all ${
                  isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--accent)]">Role template</p>
                    <h4 className="mt-1 break-words text-lg font-semibold text-slate-900">{t.name}</h4>
                  </div>
                  <span className="badge">{(t.defaultRequirements || []).length} reqs</span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-semibold text-slate-800">
                    Salary: <span className="text-[var(--accent)]">₹{t.salaryRange?.[0]?.toLocaleString()} – ₹{t.salaryRange?.[1]?.toLocaleString()}</span>
                  </p>
                  <p className="text-slate-500">Shift: {t.workHours || 'Not specified'}</p>
                </div>
                {(t.defaultRequirements || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(t.defaultRequirements || []).slice(0, 4).map((req, i) => (
                      <span key={`${t.id}-lib-req-${i}`} className="break-words rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {req}
                      </span>
                    ))}
                    {(t.defaultRequirements || []).length > 4 && (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                        +{(t.defaultRequirements || []).length - 4} more
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-6 flex gap-3">
                  <button
                    className="btn-blue w-full"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEdit(t)
                    }}
                  >
                    <PencilLine size={16} />
                    Edit
                  </button>
                  <button
                    className="btn-ghost w-full"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      del(t.id)
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </article>
            )
          })}
          {!items.length && (
            <div className="col-span-full flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 py-16 text-sm text-slate-500">
              No templates created yet. Use the form above to add your first playbook.
            </div>
          )}
        </div>
      </section>

      {loading && (
        <div className="py-6 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--accent)] border-r-transparent"></div>
        </div>
      )}
      {error && (
        <div className="ui-card border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {String(error.message || error)}
        </div>
      )}
    </div>
  )
}
