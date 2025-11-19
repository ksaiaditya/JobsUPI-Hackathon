import { BadgeCheck, GraduationCap, MapPin, PencilLine, Phone } from 'lucide-react'

export default function CandidateCard({ c, onCall, onUpdateStatus }) {
  return (
    <div className="ui-card p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="break-words text-base font-semibold text-slate-900">{c.name}</h4>
          <p className="mt-1 break-words text-sm font-medium text-[var(--accent)]">{c.role}</p>
        </div>
        {c.status && (
          <span className="badge">
            <BadgeCheck size={14} />
            {c.status}
          </span>
        )}
      </div>
      <div className="mb-5 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2 break-words">
          <MapPin size={16} />
          {c.area || c.location || 'Location unavailable'}
        </p>
        <p className="flex items-center gap-2 break-words">
          <GraduationCap size={16} />
          {c.education || 'Education not provided'}
        </p>
      </div>
      <div className="flex gap-3">
        <a
          href={`tel:${c.phone}`}
          onClick={() => onCall?.(c)}
          className="btn-blue w-full"
        >
          <Phone size={18} />
          Call
        </a>
        {onUpdateStatus && (
          <button
            type="button"
            className="btn-ghost w-full"
            onClick={() => onUpdateStatus?.(c)}
          >
            <PencilLine size={18} />
            Update
          </button>
        )}
      </div>
    </div>
  )
}
