import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Settings,
  Cloud,
  MapPin,
  Map,
} from 'lucide-react'
import { NAVIGATION_ITEMS } from '../../routes/types'
import { usePermissions } from '../auth/RoleBasedRoute'

// 아이콘 매핑
const ICON_MAP = {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Settings,
  Cloud,
  MapPin,
  Map,
}

export function Navigation({ className = '' }) {
  const { canAccess } = usePermissions()

  return (
    <nav className={`space-y-2 ${className}`}>
      {NAVIGATION_ITEMS.map((item) => {
        // 권한 확인
        if (!canAccess(item)) {
          return null
        }

        const Icon = ICON_MAP[item.icon] || LayoutDashboard

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{item.title}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
