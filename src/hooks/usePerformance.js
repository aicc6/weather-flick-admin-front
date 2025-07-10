/**
 * 성능 최적화 관련 커스텀 훅 모음
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'

/**
 * 디바운스 훅
 * 빠른 연속 호출을 제한하여 성능 향상
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 쓰로틀 훅
 * 일정 시간 간격으로만 함수 실행
 */
export function useThrottle(callback, delay = 300) {
  const lastRun = useRef(Date.now())

  return useCallback(
    (...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    },
    [callback, delay],
  )
}

/**
 * 가상 스크롤 훅
 * 대량의 리스트 렌더링 최적화
 */
export function useVirtualScroll({
  items,
  itemHeight,
  containerHeight,
  buffer = 5,
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer,
    )

    return {
      items: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    }
  }, [items, itemHeight, containerHeight, buffer, scrollTop])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  return {
    visibleItems,
    handleScroll,
  }
}

/**
 * 레이지 로딩 훅
 * 요소가 뷰포트에 들어올 때만 로드
 */
export function useLazyLoad(options = {}) {
  const [isInView, setIsInView] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(element)
        }
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0,
      },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options.rootMargin, options.threshold])

  return { elementRef, isInView }
}

/**
 * 무한 스크롤 훅
 * 페이지네이션 자동 로드
 */
export function useInfiniteScroll({
  callback,
  hasMore,
  loading,
  rootMargin = '100px',
}) {
  const observerRef = useRef(null)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          callback()
        }
      },
      { rootMargin },
    )

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [callback, hasMore, loading, rootMargin])

  return loadMoreRef
}

/**
 * 메모리 누수 방지 훅
 * 컴포넌트 언마운트 시 정리 작업
 */
export function useCleanup(cleanupFn) {
  const cleanupRef = useRef(cleanupFn)

  useEffect(() => {
    cleanupRef.current = cleanupFn
  }, [cleanupFn])

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])
}

/**
 * 이전 값 추적 훅
 * 값의 변경 감지 및 비교
 */
export function usePrevious(value) {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * 윈도우 사이즈 훅 (최적화된)
 * 리사이즈 이벤트 쓰로틀링 적용
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const handleResize = useThrottle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, 150)

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  return windowSize
}

/**
 * 로컬 스토리지 훅 (최적화된)
 * 성능과 타입 안정성 개선
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error saving localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue]
}

/**
 * 애니메이션 프레임 훅
 * 부드러운 애니메이션을 위한 최적화
 */
export function useAnimationFrame(callback) {
  const requestRef = useRef()
  const previousTimeRef = useRef()

  const animate = useCallback(
    (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callback(deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    },
    [callback],
  )

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate])
}

/**
 * 페이지 가시성 훅
 * 탭이 비활성화될 때 리소스 절약
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}
