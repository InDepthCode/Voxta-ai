import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  CalendarIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { useAuth, useUser, SignOutButton } from '@clerk/clerk-react'

interface LayoutProps {
  children: React.ReactNode
  isDevelopment?: boolean
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Email', href: '/email', icon: EnvelopeIcon },
]

export default function Layout({ children, isDevelopment = false }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const location = useLocation()
  
  // Only use Clerk hooks if not in development mode
  const { isSignedIn } = isDevelopment ? { isSignedIn: true } : useAuth()
  const { user } = isDevelopment ? { user: { fullName: 'Development User', imageUrl: '/default-avatar.svg', primaryEmailAddress: { emailAddress: 'dev@example.com' } } } : useUser()

  // In development mode, treat user as signed in
  const isUserSignedIn = isDevelopment || isSignedIn

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white shadow-md">
          <Link to="/" className="flex items-center gap-3">
            <img src="/voxta-logo.svg" alt="Voxta" className="h-9 w-9 transition-transform hover:scale-105" />
            <span className="text-xl font-bold text-gray-900">Voxta</span>
          </Link>
          <div className="flex items-center gap-4">
            {!isUserSignedIn ? (
              <>
                <Link
                  to="/sign-in"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  className="text-sm font-medium text-white bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative"
              >
                <img
                  src={user?.imageUrl || '/default-avatar.svg'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.fullName || 'Development User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.primaryEmailAddress?.emailAddress || 'dev@example.com'}
                      </p>
                    </div>
                    <Link
                      to="/pricing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Upgrade Plan
                    </Link>
                    {!isDevelopment && (
                      <SignOutButton>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Sign out
                        </button>
                      </SignOutButton>
                    )}
                  </div>
                )}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <nav className="bg-white shadow-lg">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Link
              to="/pricing"
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex h-16 flex-shrink-0 items-center gap-3 px-6 border-b">
            <img src="/voxta-logo.svg" alt="Voxta" className="h-9 w-9 transition-transform hover:scale-105" />
            <span className="text-xl font-bold text-gray-900">Voxta</span>
          </div>
          <nav className="flex flex-1 flex-col justify-between">
            <ul role="list" className="flex flex-1 flex-col gap-y-7 px-3 py-6">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-colors ${
                          location.pathname === item.href
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 ${
                          location.pathname === item.href
                            ? 'text-primary-700'
                            : 'text-gray-400 group-hover:text-gray-900'
                        }`} />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/pricing"
                      className="group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
            {isUserSignedIn ? (
              <div className="p-3 border-t">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 relative"
                >
                  <img
                    src={user?.imageUrl || '/default-avatar.svg'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || 'Development User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.primaryEmailAddress?.emailAddress || 'dev@example.com'}
                    </p>
                  </div>
                  {isProfileMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-lg py-1">
                      <Link
                        to="/pricing"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Upgrade Plan
                      </Link>
                      {!isDevelopment && (
                        <SignOutButton>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Sign out
                          </button>
                        </SignOutButton>
                      )}
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-3 border-t space-y-2">
                <Link
                  to="/sign-in"
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
} 