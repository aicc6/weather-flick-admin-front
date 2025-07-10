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
  MapPin,
  Package,
  Shield,
  Settings,
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
import { Avatar, AvatarFallback } from '../ui/avatar'

export const DefaultLayout = ({ children }) => {
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
      name: '대시보드',
      href: '/',
      icon: Home,
      permission: PERMISSIONS.DASHBOARD_READ,
      color: 'text-primary-blue',
    },
    {
      name: '사용자 관리',
      href: '/users',
      icon: Users,
      permission: PERMISSIONS.USER_READ,
      color: 'text-accent-cyan',
    },
    {
      name: '관리자 관리',
      href: '/admins',
      icon: Shield,
      permission: PERMISSIONS.ADMIN_READ,
      color: 'text-primary-blue-dark',
    },
    {
      name: '콘텐츠 관리',
      href: '/content',
      icon: FileText,
      permission: PERMISSIONS.CONTENT_READ,
      color: 'text-soft-mint',
    },
    {
      name: '날씨 관리',
      href: '/weather',
      icon: Cloud,
      permission: PERMISSIONS.SYSTEM_READ,
      color: 'text-accent-cyan-bright',
    },
    {
      name: '관광지 관리',
      href: '/tourist-attractions',
      icon: MapPin,
      permission: PERMISSIONS.CONTENT_READ,
      color: 'text-accent-yellow',
    },
    {
      name: '배치 관리',
      href: '/batch',
      icon: Package,
      permission: PERMISSIONS.SYSTEM_READ,
      color: 'text-primary-blue',
    },
  ].filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <div className="admin-dashboard min-h-screen">
      {/* Header */}
      <header className="admin-header sticky top-0 z-50">
        <div className="border-border border-b">
          <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img
                    src="/newicon.jpg"
                    alt="Weather Flick Logo"
                    className="h-8 w-8 rounded-lg object-cover shadow-sm"
                    loading="lazy"
                  />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-white drop-shadow-sm">
                      Weather Flick
                    </span>
                    <span className="text-sm font-medium text-white/80">
                      관리자 대시보드
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  aria-label="테마 변경"
                  className="hover:bg-accent/10"
                >
                  {darkMode ? (
                    <SunIcon className="text-accent-yellow h-5 w-5" />
                  ) : (
                    <Moon className="text-primary-blue h-5 w-5" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="from-primary-blue to-accent-cyan bg-gradient-to-br text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
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
                        {user?.role === 'super_admin' && (
                          <span className="status-primary mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>설정</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>로그아웃</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="admin-sidebar sticky top-16 h-[calc(100vh-4rem)] w-64">
          <nav className="p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'from-primary-blue-light/20 to-accent-cyan-light/20 text-primary-blue-dark bg-gradient-to-r shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                  >
                    <div
                      className={`mr-3 rounded-md p-1.5 ${
                        isActive
                          ? 'bg-white shadow-sm dark:bg-gray-900'
                          : 'bg-gray-100 group-hover:bg-white dark:bg-gray-700 dark:group-hover:bg-gray-900'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isActive
                            ? item.color
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div className="from-primary-blue to-accent-cyan h-5 w-1.5 rounded-full bg-gradient-to-b" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* 사이드바 하단 정보 */}
            <div className="mt-8 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="space-y-3 px-3">
                <div className="flex items-center space-x-3">
                  <div className="from-accent-cyan-light to-soft-mint flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br">
                    <Cloud className="text-primary-blue-dark h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      날씨 API 상태
                    </p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      정상 운영중
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <main className="p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
