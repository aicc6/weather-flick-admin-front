import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { usePermission } from '../../hooks/usePermission'
import { PERMISSIONS } from '../../constants/permissions'
import { Button } from '../ui/button'
import {
  LogOut,
  User,
  Users,
  Home,
  Cloud,
  FileText,
  Moon,
  Sun as SunIcon,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useEffect, useState } from 'react'
import { LanguageSwitcher } from '../common/LanguageSwitcher'

export const DefaultLayout = ({ children }) => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { hasPermission } = usePermission()
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark'
    }
    return false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  const handleLogout = () => {
    logout()
  }

  const navigation = [
    {
      name: t('navigation.dashboard'),
      href: '/',
      icon: Home,
      permission: PERMISSIONS.DASHBOARD_READ,
    },
    {
      name: t('navigation.users'),
      href: '/users',
      icon: Users,
      permission: PERMISSIONS.USER_READ,
    },
    {
      name: t('navigation.admins'),
      href: '/admins',
      icon: User,
      permission: PERMISSIONS.ADMIN_READ,
    },
    {
      name: t('navigation.content'),
      href: '/content',
      icon: FileText,
      permission: PERMISSIONS.CONTENT_READ,
    },
    {
      name: t('navigation.weather'),
      href: '/weather',
      icon: Cloud,
      permission: PERMISSIONS.SYSTEM_READ,
    },
    {
      name: t('navigation.tourist_attractions'),
      href: '/tourist-attractions',
      icon: FileText,
      permission: PERMISSIONS.CONTENT_READ,
    },
  ].filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <img
                src="/logo.jpg"
                alt="Weather Flick Logo"
                className="mr-2 h-8 w-8 rounded"
                loading="lazy"
              />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Weather Flick Admin
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                onClick={toggleDarkMode}
                aria-label={t('settings.theme')}
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {user?.username}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="h-screen w-64 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      isActive
                        ? 'border-r-2 border-blue-700 bg-blue-100 text-blue-700 dark:bg-gray-900 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-200'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
