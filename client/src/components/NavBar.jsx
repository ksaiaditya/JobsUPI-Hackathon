import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Mic,
  Newspaper,
  ClipboardList,
  Users,
  FileText,
  UserCheck,
  QrCode,
  Sparkles,
} from 'lucide-react'

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/voice', label: 'Voice Hire', icon: Mic },
  { to: '/feed', label: 'Daily Feed', icon: Newspaper },
  { to: '/templates', label: 'Templates', icon: ClipboardList },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/offer', label: 'Offer & JD', icon: FileText },
  { to: '/mass', label: 'Mass Hiring', icon: UserCheck },
  { to: '/qr', label: 'QR Spot', icon: QrCode },
]

function NavItem({ to, label, icon: Icon, isActive }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-3 transition-all duration-200"
    >
      <Icon 
        size={22} 
        strokeWidth={2.2}
        className={`transition-all duration-200 ${
          isActive ? 'scale-110 text-[var(--accent)]' : 'text-slate-500'
        }`}
      />
      <span className={`break-words text-center text-xs font-medium transition-colors duration-200 ${
        isActive ? 'text-[var(--accent)]' : 'text-slate-600'
      }`}>
        {label}
      </span>
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"></span>
      )}
    </NavLink>
  )
}

export default function NavBar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex shrink-0 items-center gap-2.5 py-4 text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-[var(--accent)]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] text-white shadow-sm">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <span>Jobs UPI</span>
        </Link>

        {/* Navigation */}
        <nav className="no-scrollbar flex flex-1 items-center overflow-x-auto">
          <div className="flex w-full items-center justify-around">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to || 
                             (link.to !== '/' && location.pathname.startsWith(link.to))
              return (
                <div key={link.to} className="relative">
                  <NavItem {...link} isActive={isActive} />
                </div>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}
