import { useState } from 'react'
import { ClipboardCopy, Loader, Send, Sparkles, FileText } from 'lucide-react'
import { useApi } from '../hooks/useApi'

export default function OfferJD() {
  const { request, loading, error } = useApi()
  const [form, setForm] = useState({ candidateName:'', role:'', salary:'', workHours:'', employerName:'' })
  const [message, setMessage] = useState('')

  async function generate(e) {
    e.preventDefault()
    const data = await request('/offer', { method: 'POST', body: form })
    setMessage(data.message || '')
  }

  async function copy() { if (message) await navigator.clipboard.writeText(message) }

  const waUrl = message ? `https://wa.me/?text=${encodeURIComponent(message)}` : '#'

  return (
    <div className="space-y-12">
      <header className="ui-card space-y-2 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-8">
        <h2 className="flex items-center gap-3 break-words text-3xl font-semibold text-slate-900">
          <FileText size={28} className="shrink-0 text-[var(--accent)]" />
          <span className="break-words">Offer & job description</span>
        </h2>
        <p className="break-words text-sm text-slate-600">Generate professional WhatsApp-ready offer letters instantly.</p>
      </header>

      <div className="max-w-3xl space-y-8">
        <form onSubmit={generate} className="ui-card space-y-6 bg-white p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Sparkles size={18} className="text-[var(--accent)]" />
            Offer details
          </div>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Candidate name *</label>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="e.g., Rajesh Kumar" value={form.candidateName} onChange={e=>setForm(f=>({...f, candidateName:e.target.value}))} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Role *</label>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="e.g., Delivery Executive" value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value}))} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Salary *</label>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="e.g., ₹18,000/month" value={form.salary} onChange={e=>setForm(f=>({...f, salary:e.target.value}))} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Work hours *</label>
                <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="e.g., 10am - 7pm" value={form.workHours} onChange={e=>setForm(f=>({...f, workHours:e.target.value}))} required />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Employer name *</label>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="e.g., ABC Logistics Pvt Ltd" value={form.employerName} onChange={e=>setForm(f=>({...f, employerName:e.target.value}))} required />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-blue" disabled={loading}>
              {loading ? <Loader className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {loading ? 'Generating...' : 'Generate offer letter'}
            </button>
          </div>
        </form>

        {message && (
          <section className="ui-card space-y-4 bg-white p-8">
            <div className="flex items-center justify-between">
              <h3 className="break-words text-lg font-semibold text-slate-900">Preview</h3>
              <span className="badge text-green-700" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#047857' }}>Generated</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{message}</pre>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-ghost flex-1" type="button" onClick={copy}>
                <ClipboardCopy size={18} />
                Copy to clipboard
              </button>
              <a className="btn-brand flex-1" href={waUrl} target="_blank" rel="noreferrer">
                <Send size={18} />
                Open in WhatsApp
              </a>
            </div>
          </section>
        )}

        {error && <div className="ui-card border-red-200 bg-red-50 p-4 text-sm text-red-700">{String(error.message || error)}</div>}
      </div>
    </div>
  )
}
