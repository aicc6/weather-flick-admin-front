/**
 * API 요청 캐싱 및 최적화 유틸리티
 * - 메모리 캐싱
 * - 요청 중복 방지
 * - 자동 재시도
 * - 백그라운드 새로고침
 */

import { useState, useEffect } from 'react'

class ApiCache {
  constructor(options = {}) {
    this.cache = new Map()
    this.pendingRequests = new Map()
    this.options = {
      maxAge: 5 * 60 * 1000, // 5분
      maxSize: 100, // 최대 캐시 항목 수
      staleWhileRevalidate: true,
      retry: {
        count: 3,
        delay: 1000,
        backoff: 2,
      },
      ...options,
    }
  }

  /**
   * 캐시 키 생성
   */
  generateKey(url, options = {}) {
    const sortedOptions = Object.keys(options)
      .sort()
      .reduce((acc, key) => {
        acc[key] = options[key]
        return acc
      }, {})

    return `${url}::${JSON.stringify(sortedOptions)}`
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  get(key) {
    const cached = this.cache.get(key)

    if (!cached) {
      return null
    }

    const isExpired = Date.now() > cached.expireAt

    if (isExpired && !this.options.staleWhileRevalidate) {
      this.cache.delete(key)
      return null
    }

    return {
      data: cached.data,
      isStale: isExpired,
      cachedAt: cached.cachedAt,
    }
  }

  /**
   * 캐시에 데이터 저장
   */
  set(key, data) {
    // 캐시 크기 제한 확인
    if (this.cache.size >= this.options.maxSize) {
      // 가장 오래된 항목 제거 (LRU)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      cachedAt: Date.now(),
      expireAt: Date.now() + this.options.maxAge,
    })
  }

  /**
   * 캐시 무효화
   */
  invalidate(pattern) {
    if (typeof pattern === 'string') {
      // 정확한 키 매칭
      this.cache.delete(pattern)
    } else if (pattern instanceof RegExp) {
      // 패턴 매칭
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key)
        }
      }
    } else if (typeof pattern === 'function') {
      // 커스텀 필터
      for (const [key, value] of this.cache.entries()) {
        if (pattern(key, value)) {
          this.cache.delete(key)
        }
      }
    }
  }

  /**
   * 전체 캐시 클리어
   */
  clear() {
    this.cache.clear()
  }

  /**
   * 캐시 상태 조회
   */
  getStats() {
    const entries = Array.from(this.cache.entries())
    const now = Date.now()

    return {
      size: this.cache.size,
      entries: entries.map(([key, value]) => ({
        key,
        size: JSON.stringify(value.data).length,
        age: now - value.cachedAt,
        isExpired: now > value.expireAt,
      })),
      totalSize: entries.reduce(
        (sum, [_, value]) => sum + JSON.stringify(value.data).length,
        0,
      ),
    }
  }
}

// 글로벌 캐시 인스턴스
const apiCache = new ApiCache()

/**
 * 캐시된 API 요청 함수
 */
export async function cachedFetch(url, options = {}) {
  const {
    cache = true,
    cacheKey,
    forceRefresh = false,
    ...fetchOptions
  } = options

  // 캐시 사용 안 함
  if (!cache) {
    return fetch(url, fetchOptions).then((res) => res.json())
  }

  const key = cacheKey || apiCache.generateKey(url, fetchOptions)

  // 강제 새로고침이 아니면 캐시 확인
  if (!forceRefresh) {
    const cached = apiCache.get(key)

    if (cached && !cached.isStale) {
      return Promise.resolve(cached.data)
    }

    // Stale-while-revalidate 전략
    if (cached && cached.isStale && apiCache.options.staleWhileRevalidate) {
      // 백그라운드에서 새로고침
      fetchWithRetry(url, fetchOptions)
        .then((data) => apiCache.set(key, data))
        .catch((error) => console.error('Background refresh failed:', error))

      // 기존 데이터 즉시 반환
      return Promise.resolve(cached.data)
    }
  }

  // 중복 요청 방지
  if (apiCache.pendingRequests.has(key)) {
    return apiCache.pendingRequests.get(key)
  }

  // 새 요청 생성
  const request = fetchWithRetry(url, fetchOptions)
    .then((data) => {
      apiCache.set(key, data)
      apiCache.pendingRequests.delete(key)
      return data
    })
    .catch((error) => {
      apiCache.pendingRequests.delete(key)
      throw error
    })

  apiCache.pendingRequests.set(key, request)
  return request
}

/**
 * 재시도 로직이 포함된 fetch
 */
async function fetchWithRetry(url, options = {}) {
  const { retry = apiCache.options.retry } = options
  let lastError

  for (let i = 0; i <= retry.count; i++) {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      lastError = error

      if (i < retry.count) {
        // 지수 백오프로 재시도 지연
        const delay = retry.delay * Math.pow(retry.backoff, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * 캐시 프리페치
 * 미리 데이터를 로드하여 사용자 경험 개선
 */
export function prefetch(urls) {
  const promises = urls.map((url) => {
    if (typeof url === 'string') {
      return cachedFetch(url)
    } else {
      return cachedFetch(url.url, url.options)
    }
  })

  return Promise.allSettled(promises)
}

/**
 * 캐시 무효화 헬퍼 함수들
 */
export function invalidateCache(pattern) {
  apiCache.invalidate(pattern)
}

export function clearCache() {
  apiCache.clear()
}

export function getCacheStats() {
  return apiCache.getStats()
}

/**
 * React Query 스타일의 훅을 위한 유틸리티
 */
export function createCachedApiHook(fetcher, options = {}) {
  return function useCachedApi(key, fetcherOptions = {}) {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      let cancelled = false

      const fetchData = async () => {
        try {
          setLoading(true)
          const result = await cachedFetch(fetcher(key, fetcherOptions), {
            ...options,
            ...fetcherOptions,
          })

          if (!cancelled) {
            setData(result)
            setError(null)
          }
        } catch (err) {
          if (!cancelled) {
            setError(err)
            setData(null)
          }
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      }

      fetchData()

      return () => {
        cancelled = true
      }
    }, [key])

    return { data, error, loading }
  }
}

export default apiCache
