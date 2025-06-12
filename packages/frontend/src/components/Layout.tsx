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
import DarkModeToggle from './DarkModeToggle'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Email', href: '/email', icon: EnvelopeIcon },
]

// Get the base URL from Vite config
const baseUrl = import.meta.env.BASE_URL

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-800 shadow-md">
          <Link to="/" className="flex items-center gap-3">
            <img src={baseUrl + 'voxta-logo.svg'} alt="Voxta" className="h-9 w-9 transition-transform hover:scale-105" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Voxta</span>
          </Link>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
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
          <nav className="bg-white dark:bg-dark-800 shadow-lg">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Link
              to="/pricing"
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700">
          <div className="flex h-16 flex-shrink-0 items-center gap-3 px-6 border-b dark:border-dark-700">
            <img src={baseUrl + 'voxta-logo.svg'} alt="Voxta" className="h-9 w-9 transition-transform hover:scale-105" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Voxta</span>
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
                            ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-100'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 ${
                          location.pathname === item.href
                            ? 'text-primary-700 dark:text-primary-100'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`} />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/pricing"
                      className="group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
            <div className="p-3 border-t dark:border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-primary-700 dark:text-primary-100" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Guest User
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      guest@example.com
                    </p>
                  </div>
                </div>
                <DarkModeToggle />
              </div>
            </div>
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