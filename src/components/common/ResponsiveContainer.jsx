/**
 * 반응형 컨테이너 컴포넌트
 * 다양한 화면 크기에 최적화된 레이아웃 제공
 */

import { useState, useEffect } from 'react'

/**
 * 화면 크기별 브레이크포인트
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * 현재 화면 크기 감지 훅
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('lg')
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    function updateBreakpoint() {
      const width = window.innerWidth

      if (width < BREAKPOINTS.sm) {
        setBreakpoint('xs')
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (width < BREAKPOINTS.md) {
        setBreakpoint('sm')
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (width < BREAKPOINTS.lg) {
        setBreakpoint('md')
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
      } else if (width < BREAKPOINTS.xl) {
        setBreakpoint('lg')
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      } else if (width < BREAKPOINTS['2xl']) {
        setBreakpoint('xl')
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      } else {
        setBreakpoint('2xl')
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    width: window.innerWidth,
  }
}

/**
 * 반응형 컨테이너 컴포넌트
 */
export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'default',
  padding = 'default',
}) {
  const { isMobile, isTablet } = useBreakpoint()

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
    default: 'max-w-7xl',
  }

  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2 sm:px-4 sm:py-4',
    default: 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8',
    lg: 'px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12',
  }

  return (
    <div
      className={`mx-auto w-full ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * 반응형 그리드 컴포넌트
 */
export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'default',
  className = '',
}) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    default: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const columnClasses = {
    xs: columns.xs ? `grid-cols-${columns.xs}` : '',
    sm: columns.sm ? `sm:grid-cols-${columns.sm}` : '',
    md: columns.md ? `md:grid-cols-${columns.md}` : '',
    lg: columns.lg ? `lg:grid-cols-${columns.lg}` : '',
    xl: columns.xl ? `xl:grid-cols-${columns.xl}` : '',
  }

  const gridClasses = Object.values(columnClasses).filter(Boolean).join(' ')

  return (
    <div className={`grid ${gridClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

/**
 * 반응형 플렉스 컴포넌트
 */
export function ResponsiveFlex({
  children,
  direction = { xs: 'col', md: 'row' },
  gap = 'default',
  align = 'stretch',
  justify = 'start',
  className = '',
}) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    default: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const directionClasses = {
    xs: direction.xs ? `flex-${direction.xs}` : '',
    sm: direction.sm ? `sm:flex-${direction.sm}` : '',
    md: direction.md ? `md:flex-${direction.md}` : '',
    lg: direction.lg ? `lg:flex-${direction.lg}` : '',
    xl: direction.xl ? `xl:flex-${direction.xl}` : '',
  }

  const flexClasses = Object.values(directionClasses).filter(Boolean).join(' ')

  return (
    <div
      className={`flex ${flexClasses} ${gapClasses[gap]} items-${align} justify-${justify} ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * 모바일 친화적인 테이블 래퍼
 */
export function ResponsiveTable({ children, className = '' }) {
  const { isMobile } = useBreakpoint()

  if (isMobile) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <div className="min-w-full">{children}</div>
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

/**
 * 조건부 렌더링 컴포넌트
 */
export function ShowOn({ breakpoint, children }) {
  const currentBreakpoint = useBreakpoint()

  const shouldShow = {
    mobile: currentBreakpoint.isMobile,
    tablet: currentBreakpoint.isTablet,
    desktop: currentBreakpoint.isDesktop,
    xs: currentBreakpoint.breakpoint === 'xs',
    sm: currentBreakpoint.breakpoint === 'sm',
    md: currentBreakpoint.breakpoint === 'md',
    lg: currentBreakpoint.breakpoint === 'lg',
    xl: currentBreakpoint.breakpoint === 'xl',
    '2xl': currentBreakpoint.breakpoint === '2xl',
  }

  return shouldShow[breakpoint] ? children : null
}

/**
 * 숨김 처리 컴포넌트
 */
export function HideOn({ breakpoint, children }) {
  const currentBreakpoint = useBreakpoint()

  const shouldHide = {
    mobile: currentBreakpoint.isMobile,
    tablet: currentBreakpoint.isTablet,
    desktop: currentBreakpoint.isDesktop,
    xs: currentBreakpoint.breakpoint === 'xs',
    sm: currentBreakpoint.breakpoint === 'sm',
    md: currentBreakpoint.breakpoint === 'md',
    lg: currentBreakpoint.breakpoint === 'lg',
    xl: currentBreakpoint.breakpoint === 'xl',
    '2xl': currentBreakpoint.breakpoint === '2xl',
  }

  return shouldHide[breakpoint] ? null : children
}

export default ResponsiveContainer
