import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Check, Loader, QrCode, User } from 'lucide-react'
import { useApi } from '../hooks/useApi'

export default function QRRegister() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const code = sp.get('code') || ''
  const { request, loading, error } = useApi()

  const [form, setForm] = useState({ name: '', phone: '', role: '', area: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  useEffect(() => {
    if (!code) {
      // If no code, redirect to QR homepage
      const t = setTimeout(() => navigate('/qr'), 1500)
      return () => clearTimeout(t)
    }
  }, [code, navigate])

  async function submit(e) {
    e.preventDefault()
    const payload = { code, ...form }

    // Try backend first
    let ok = false
    try {
      await request('/qr/register', { method: 'POST', body: payload })
      ok = true
    } catch (_) {
      // Fallback: store locally and notify via storage event so QRSpot can pick it up
      const key = 'qr_registrations'
      const list = JSON.parse(localStorage.getItem(key) || '[]')
      list.push({ ...payload, ts: Date.now() })
      localStorage.setItem(key, JSON.stringify(list))
      ok = true
    }

    if (ok) {
      setSubmitted(true)
      setSubmittedData(payload)
      // Also mark a scan event (if not already) so live view shows it
      try {
        const sKey = 'qr_scans'
        const scans = JSON.parse(localStorage.getItem(sKey) || '[]')
        scans.push({ code, ts: Date.now() })
        localStorage.setItem(sKey, JSON.stringify(scans))
      } catch {}
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-10">
      <header className="ui-card space-y-2 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-6">
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
          <QrCode size={22} className="text-[var(--accent)]" />
          QR Registration
        </h1>
        <p className="text-sm text-slate-600">Code: <span className="font-mono text-slate-900">{code || 'N/A'}</span></p>
      </header>

      {!code && (
        <div className="ui-card p-6 text-sm text-slate-600">
          Missing QR code. Redirecting to QR page...
        </div>
      )}

      {code && !submitted && (
        <form onSubmit={submit} className="ui-card space-y-4 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Ramesh Kumar"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit mobile"
                pattern="^[0-9]{10}$"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g., Delivery Boy"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Area</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                placeholder="e.g., JP Nagar"
              />
            </div>
          </div>
          <button type="submit" className="btn-brand" disabled={loading}>
            {loading ? <Loader className="animate-spin" size={18} /> : <User size={18} />}
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{String(error.message || error)}</div>
          )}
        </form>
      )}

      {code && submitted && (
        <div className="ui-card space-y-5 bg-white p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Registration received</h2>
              <p className="text-sm text-slate-600">Your details have been recorded successfully.</p>
            </div>
          </div>
          {submittedData && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
                  <p className="text-sm font-medium text-slate-900 break-words">{submittedData.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900"><a className="text-[var(--brand)] hover:text-[var(--brand-dark)]" href={`tel:${submittedData.phone}`}>{submittedData.phone}</a></p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
                  <p className="text-sm text-slate-900 break-words">{submittedData.role || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Area</p>
                  <p className="text-sm text-slate-900 break-words">{submittedData.area || '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Code</p>
                  <p className="font-mono text-sm text-slate-900 break-all">{submittedData.code}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <a href="/qr" className="btn-ghost">Back to QR Spot</a>
            {submittedData?.phone && <a className="btn-blue" href={`tel:${submittedData.phone}`}>Call candidate</a>}
          </div>
        </div>
      )}
    </div>
  )
}
