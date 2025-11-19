import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BadgeCheck, BellOff, IndianRupee, PencilLine, Slash, StepForward } from 'lucide-react'
import { pushQueue } from '../utils/offlineCache'

const STATUSES = [
  { key: 'not_available', label: 'Not Available', icon: Slash },
  { key: 'salary_mismatch', label: 'Salary Mismatch', icon: IndianRupee },
  { key: 'no_answer', label: 'No Answer', icon: BellOff },
  { key: 'hired', label: 'Hired', icon: BadgeCheck },
  { key: 'next_round', label: 'Next Round', icon: StepForward },
]

export default function StatusModal({ open, onClose, onSubmit, candidate }) {
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')

  // Reset state whenever modal opens or candidate changes
  useEffect(() => {
    if (open) {
      setStatus('')
      setNote('')
    }
  }, [open, candidate?.id, candidate?._id])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fadeIn"
      style={{ zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Update Candidate Status"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-slideUp max-h-[80vh] overflow-y-auto"
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <PencilLine size={18} />
          Update Candidate Status
        </h3>
        {candidate && (
          <p className="mb-4 text-sm text-slate-500">{candidate.name} · {candidate.role}</p>
        )}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              type="button"
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                status === s.key
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm'
                  : 'border-slate-200 hover:border-[var(--accent)]/40 hover:bg-slate-50'
              }`}
            >
              <s.icon size={18} />
              {s.label}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Add Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter additional details or comments..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-brand"
            onClick={() => {
              if (!status) return
              try {
                onSubmit?.({ status, note })
              } catch {
                pushQueue('statusQueue', { id: candidate?.id || candidate?._id, status, note, ts: Date.now() })
              }
            }}
            disabled={!status}
          >
            Save Status
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
