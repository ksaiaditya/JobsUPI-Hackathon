import { useEffect, useMemo, useState } from 'react'
import { Activity, Clock, Link2, Play, RefreshCw, Smartphone, Square, User, QrCode } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { API_BASE_URL } from '../api'
import QRCode from 'react-qr-code'

export default function QRSpot() {
  const { request } = useApi()
  const [sessions, setSessions] = useState([])
  const [current, setCurrent] = useState(null)
  const [events, setEvents] = useState([])

  const serverOrigin = useMemo(() => {
    try {
      const u = new URL(API_BASE_URL)
      return `${u.protocol}//${u.host}`
    } catch {
      return 'http://localhost:5000'
    }
  }, [])
  const clientOrigin = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    let socket
    async function connect() {
      try {
        const { io } = await import('socket.io-client')
        socket = io(serverOrigin, { transports: ['websocket'] })
        socket.on('qr:session:created', (p) => pushEvt('session created', p))
        socket.on('qr:session:stopped', (p) => pushEvt('session stopped', p))
        socket.on('qr:scan', (p) => pushEvt('scan', p))
        socket.on('qr:registration', (p) => pushEvt('registration', p))
      } catch {}
    }
    connect()

    // Local fallback: listen for storage events from QRRegister page
    function onStorage(e) {
      try {
        if (e.key === 'qr_scans' && e.newValue) {
          const arr = JSON.parse(e.newValue || '[]')
          const last = arr[arr.length - 1]
          if (last) pushEvt('scan', last)
        }
        if (e.key === 'qr_registrations' && e.newValue) {
          const arr = JSON.parse(e.newValue || '[]')
          const last = arr[arr.length - 1]
          if (last) pushEvt('registration', last)
        }
      } catch {}
    }
    window.addEventListener('storage', onStorage)

    return () => {
      if (socket) socket.close()
      window.removeEventListener('storage', onStorage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverOrigin])

  function pushEvt(type, payload) {
    setEvents((prev) => [{ time: new Date().toLocaleTimeString(), type, payload }, ...prev].slice(0, 50))
  }

  async function load() {
    try {
      const d = await request('/qr/sessions?active=true')
      setSessions(d.sessions || [])
      setCurrent((d.sessions || [])[0] || null)
    } catch (_) {
      // Fallback: read from localStorage
      const hist = JSON.parse(localStorage.getItem('qr_sessions_history') || '[]')
      setSessions(hist)
      const cur = hist.find((s) => s.active) || null
      setCurrent(cur)
    }
  }

  function genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let s = ''
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
    return s
  }

  async function start() {
    const employerId = prompt('Employer ID (for demo, any string is ok)')
    if (!employerId) return
    try {
      const d = await request('/qr/sessions', { method: 'POST', body: { employerId } })
      setCurrent(d.session)
      load()
    } catch (_) {
      const session = { id: 'local-' + Date.now(), code: genCode(), active: true, createdAt: new Date().toISOString(), employerId }
      // Update history
      const hist = JSON.parse(localStorage.getItem('qr_sessions_history') || '[]')
      const newHist = [{ ...session }, ...hist]
      localStorage.setItem('qr_sessions_history', JSON.stringify(newHist))
      setCurrent(session)
      setSessions(newHist)
      pushEvt('session created', session)
    }
  }

  async function stop() {
    if (!current) return
    try {
      await request(`/qr/sessions/${current.id}/stop`, { method: 'PATCH' })
      setCurrent(null)
      load()
    } catch (_) {
      const hist = JSON.parse(localStorage.getItem('qr_sessions_history') || '[]')
      const updated = hist.map((s) => (s.id === current.id ? { ...s, active: false } : s))
      localStorage.setItem('qr_sessions_history', JSON.stringify(updated))
      pushEvt('session stopped', { id: current.id, code: current.code })
      setCurrent(null)
      setSessions(updated)
    }
  }

  function qrLink() {
    if (!current) return '#'
    // Use client origin by default so it works without server
    return `${clientOrigin}/qr/register?code=${encodeURIComponent(current.code)}`
  }

  return (
    <div className="space-y-12">
      <header className="ui-card space-y-2 bg-gradient-to-r from-blue-50 via-white to-orange-50 p-8">
        <h2 className="flex items-center gap-3 break-words text-3xl font-semibold text-slate-900">
          <Smartphone size={28} className="shrink-0 text-[var(--accent)]" />
          <span className="break-words">QR spot hiring</span>
        </h2>
        <p className="break-words text-sm text-slate-600">Enable walk-in registrations with QR codes and monitor real-time activity.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        {!current && (
          <button className="btn-blue" onClick={start} type="button">
            <Play size={18} />
            Start new session
          </button>
        )}
        {current && (
          <button
            className="btn-ghost border border-red-500 text-red-600"
            style={{ backgroundColor: 'rgba(248, 113, 113, 0.08)' }}
            onClick={stop}
            type="button"
          >
            <Square size={18} />
            Stop session
          </button>
        )}
        <button className="btn-ghost" onClick={load} type="button">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {current && (
        <section className="ui-card space-y-6 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <Activity size={18} />
            Active session
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="break-words text-xs uppercase tracking-wide text-slate-500">Session code</p>
            <p className="break-all mt-2 font-mono text-2xl font-semibold text-[var(--brand)]">{current.code}</p>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <QRCode value={qrLink()} size={200} bgColor="#ffffff" fgColor="#0f172a" level="H" />
            </div>
            <div className="flex-1 space-y-3">
              <h4 className="flex items-center gap-2 break-words text-base font-semibold text-slate-900">
                <Smartphone size={18} className="shrink-0" />
                <span className="break-words">How to use</span>
              </h4>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
                <li>Print or display the QR code at your hiring location.</li>
                <li>Candidates scan using their phone camera.</li>
                <li>They complete a quick registration form.</li>
                <li>Watch submissions stream in live below.</li>
              </ol>
              <a className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-dark)]" href={qrLink()} target="_blank" rel="noreferrer">
                <Link2 size={16} />
                Open registration link
              </a>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ui-card space-y-4 bg-white p-6">
          <h3 className="flex items-center gap-2 break-words text-lg font-semibold text-slate-900">
            <Activity size={18} className="shrink-0" />
            <span className="break-words">Live events</span>
          </h3>
          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
            {events.map((e, i) => {
              const p = e.payload || {}
              const key = `${e.time}-${e.type}-${i}`
              if (e.type === 'registration') {
                return (
                  <div key={key} className="border-b border-slate-100 p-4 last:border-b-0">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-500">{e.time}</span>
                      <span className="badge text-emerald-700" style={{backgroundColor:'rgba(16,185,129,0.14)'}}>registration</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><User size={16} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 break-words">{p.name || 'New candidate'}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                          {p.phone && (
                            <a className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200" href={`tel:${p.phone}`}>{p.phone}</a>
                          )}
                          {p.role && <span className="rounded-full bg-slate-100 px-2 py-1">{p.role}</span>}
                          {p.area && <span className="rounded-full bg-slate-100 px-2 py-1">{p.area}</span>}
                          {p.code && <span className="rounded-full bg-slate-100 px-2 py-1 font-mono">{p.code}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              if (e.type === 'scan') {
                return (
                  <div key={key} className="border-b border-slate-100 p-4 last:border-b-0">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-500">{e.time}</span>
                      <span className="badge text-blue-700" style={{backgroundColor:'rgba(59,130,246,0.14)'}}>scan</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><QrCode size={16} /></span>
                      <span>QR scanned</span>
                      {p.code && <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs">{p.code}</span>}
                    </div>
                  </div>
                )
              }
              if (e.type === 'session created') {
                return (
                  <div key={key} className="border-b border-slate-100 p-4 last:border-b-0">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-500">{e.time}</span>
                      <span className="badge text-violet-700" style={{backgroundColor:'rgba(139,92,246,0.14)'}}>session created</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Play size={16} /></span>
                      <span>Session started</span>
                      {p.code && <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs">{p.code}</span>}
                      {p.employerId && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{p.employerId}</span>}
                    </div>
                  </div>
                )
              }
              if (e.type === 'session stopped') {
                return (
                  <div key={key} className="border-b border-slate-100 p-4 last:border-b-0">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-500">{e.time}</span>
                      <span className="badge text-red-700" style={{backgroundColor:'rgba(248,113,113,0.14)'}}>session stopped</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700"><Square size={16} /></span>
                      <span>Session stopped</span>
                      {p.code && <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs">{p.code}</span>}
                    </div>
                  </div>
                )
              }
              // default fallback
              return (
                <div key={key} className="border-b border-slate-100 p-4 last:border-b-0">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500">{e.time}</span>
                    <span className="badge uppercase">{e.type}</span>
                  </div>
                  <pre className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700">{JSON.stringify(p, null, 2)}</pre>
                </div>
              )
            })}
            {events.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No events yet. Start a session to see live updates.</div>}
          </div>
        </section>

        <section className="ui-card space-y-4 bg-white p-6">
          <h3 className="flex items-center gap-2 break-words text-lg font-semibold text-slate-900">
            <Clock size={18} className="shrink-0" />
            <span className="break-words">Session history</span>
          </h3>
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-mono text-sm font-semibold text-slate-900">{s.code}</p>
                    <p className="break-words text-xs text-slate-500">{new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`badge shrink-0 ${s.active ? 'text-emerald-600' : 'text-slate-500'}`} style={{ backgroundColor: s.active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.16)' }}>
                    {s.active ? 'Active' : 'Stopped'}
                  </span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
                No sessions created yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
