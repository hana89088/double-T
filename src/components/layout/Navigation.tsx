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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                Marketing Insights
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                    ${item.current
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.name} ({user?.plan})
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearMessages}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              onClick={clearMessages}
              className="text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}