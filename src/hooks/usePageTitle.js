import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getCurrentRoute, setPageTitle } from '../routes/utils'

export function usePageTitle(customTitle) {
  const location = useLocation()

  useEffect(() => {
    if (customTitle) {
      setPageTitle(customTitle)
    } else {
      const currentRoute = getCurrentRoute(location.pathname)
      setPageTitle(currentRoute?.title)
    }
  }, [location.pathname, customTitle])
}

// 사용 예시:
// usePageTitle() // 라우트 메타데이터의 제목 사용
// usePageTitle('커스텀 제목') // 커스텀 제목 사용
