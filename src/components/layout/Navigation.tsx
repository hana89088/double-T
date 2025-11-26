import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import { useStore } from '../../stores/appStore'

export default function Navigation() {
  const { user, signOut } = useAuth()
  const { error, successMessage, clearMessages } = useStore()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
    { name: 'Data Input', href: '/data-input', current: location.pathname === '/data-input' },
    { name: 'Analysis', href: '/analysis', current: location.pathname === '/analysis' },
    { name: 'Visualization', href: '/visualization', current: location.pathname === '/visualization' },
    { name: 'Reports', href: '/reports', current: location.pathname === '/reports' },
    { name: 'Settings', href: '/settings', current: location.pathname === '/settings' },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-semibold text-slate-900">
            Marketing Insights
          </Link>
          <div className="hidden items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 sm:inline-flex">
            Clean UI
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  item.current
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
          <span className="font-medium">{user?.name}</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">{user?.plan}</span>
          <button
            onClick={handleSignOut}
            className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span>{error}</span>
            <button onClick={clearMessages} className="rounded-full px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100">
              Close
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={clearMessages}
              className="rounded-full px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
