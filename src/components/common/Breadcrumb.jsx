import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTE_META } from '@/routes/types'

export function Breadcrumb({ className = '' }) {
  const location = useLocation()

  // 현재 경로에 해당하는 메타데이터 찾기
  const currentRoute = Object.values(ROUTE_META).find(
    (route) => route.path === location.pathname,
  )

  if (!currentRoute || !currentRoute.breadcrumb) {
    return null
  }

  return (
    <nav
      className={`text-muted-foreground flex items-center space-x-2 text-sm ${className}`}
    >
      <Link
        to="/"
        className="hover:text-foreground flex items-center transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {currentRoute.breadcrumb.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          <span
            className={
              index === currentRoute.breadcrumb.length - 1
                ? 'text-foreground font-medium'
                : 'hover:text-foreground transition-colors'
            }
          >
            {crumb}
          </span>
        </div>
      ))}
    </nav>
  )
}
