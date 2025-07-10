/**
 * 모바일 네비게이션 컴포넌트
 * 햄버거 메뉴와 드로어 형태의 모바일 친화적인 네비게이션
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Home,
  Users,
  UserCheck,
  FileText,
  Monitor,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Button } from '../ui/button'
import { useBreakpoint } from './ResponsiveContainer'

/**
 * 모바일 네비게이션 메뉴
 */
export function MobileNavigation() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { isMobile } = useBreakpoint()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // 데스크톱에서는 렌더링하지 않음
  if (!isMobile) return null

  const navigationItems = [
    {
      name: t('navigation.dashboard'),
      href: '/dashboard',
      icon: Home,
    },
    {
      name: t('navigation.users'),
      href: '/users',
      icon: Users,
    },
    {
      name: t('navigation.admins'),
      href: '/admins',
      icon: UserCheck,
    },
    {
      name: t('navigation.content'),
      href: '/content',
      icon: FileText,
    },
    {
      name: t('navigation.system'),
      href: '/system',
      icon: Monitor,
    },
  ]

  const isCurrentPath = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    )
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 bg-white shadow-md lg:hidden"
        aria-label={t('navigation.open_menu')}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* 백드롭 */}
      {isOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 드로어 메뉴 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Weather Flick
                </h2>
                <p className="text-sm text-gray-500">
                  {t('navigation.admin_panel')}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label={t('navigation.close_menu')}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* 사용자 정보 */}
          {user && (
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                  <span className="text-sm font-medium text-gray-700">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.username || user.email}
                  </p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* 네비게이션 메뉴 */}
          <nav className="flex-1 space-y-1 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const current = isCurrentPath(item.href)

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      current
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* 하단 액션 */}
          <div className="space-y-3 border-t border-gray-200 p-4">
            {/* 언어 전환 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t('settings.language')}
              </span>
              <LanguageSwitcher
                variant="compact"
                showFlag={true}
                showText={false}
              />
            </div>

            {/* 설정 */}
            <Link
              to="/settings"
              onClick={handleLinkClick}
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              {t('navigation.settings')}
            </Link>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500" />
              {t('navigation.logout')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * 모바일 상단 바 (페이지 제목과 액션 버튼)
 */
export function MobileTopBar({ title, actions = [] }) {
  const { isMobile } = useBreakpoint()

  if (!isMobile) return null

  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 햄버거 메뉴가 있는 공간 확보 */}
          <div className="w-10" />
          <h1 className="truncate text-lg font-semibold text-gray-900">
            {title}
          </h1>
        </div>
        {actions.length > 0 && (
          <div className="flex items-center space-x-2">
            {actions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 모바일 하단 탭 네비게이션
 */
export function MobileBottomTabs({ tabs = [] }) {
  const { isMobile } = useBreakpoint()
  const location = useLocation()

  if (!isMobile || tabs.length === 0) return null

  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white lg:hidden">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.href

          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex flex-1 flex-col items-center justify-center px-1 py-2 text-xs transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon
                className={`mb-1 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
              />
              <span className="truncate">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MobileNavigation
