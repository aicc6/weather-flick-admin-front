import { STORAGE_KEYS } from '@/constants/storage'

const replaceUrl = (url, pathVariables) => {
  return Object.entries(pathVariables).reduce((val = '', [key, value]) => {
    if (!['string', 'number'].includes(typeof value))
      throw new Error(`Invalid Path Variable Value - ${key}: ${value}`)

    return val.replace(`{${key}}`, value)
  }, url)
}

const generateUrl = (fullUrl, params) => {
  const computedUrl = !params?.path ? fullUrl : replaceUrl(fullUrl, params.path)
  const queryString = new URLSearchParams(params?.query ?? {}).toString()

  return queryString ? `${computedUrl}?${queryString}` : computedUrl
}

const createHttp = ({ baseUrl, headers, fetch = globalThis.fetch }) => {
  const request = async (method = 'get', url, options) => {
    const body = method === 'get' ? undefined : options?.body

    // 동적 헤더 계산 (getter 함수 지원)
    const computedHeaders = {}
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'function') {
          const computedValue = value()
          if (computedValue !== undefined) {
            computedHeaders[key] = computedValue
          }
        } else if (value !== undefined) {
          computedHeaders[key] = value
        }
      }
    }

    const response = await fetch(
      generateUrl(`${baseUrl}/${url.replace(/^\//, '')}`, options?.params),
      {
        method: method.toUpperCase(),
        ...options,
        headers: {
          ...computedHeaders,
          ...(body &&
          !(body instanceof FormData) &&
          !(body instanceof URLSearchParams)
            ? { 'Content-Type': 'application/json' }
            : {}),
          ...options?.headers,
        },
        ...(body && {
          body:
            body instanceof FormData || body instanceof URLSearchParams
              ? body
              : typeof body === 'string'
                ? body
                : JSON.stringify(body),
        }),
      },
    )

    return response
  }

  return {
    request,
    GET: async (url, options) => request('get', url, options),
    POST: async (url, options) => request('post', url, options),
    PUT: async (url, options) => request('put', url, options),
    PATCH: async (url, options) => request('patch', url, options),
    DELETE: async (url, options) => request('delete', url, options),
  }
}

// 기본 설정
const DEFAULT_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000',
}

// 기본 HTTP 클라이언트
export const http = createHttp(DEFAULT_CONFIG)

// 인증 헤더를 추가하는 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 401 오류 처리 함수
const handleUnauthorized = () => {
  // 토큰 제거
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  // 로그인 페이지로 리다이렉트
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// 인증 응답 처리 함수
const handleAuthResponse = async (response) => {
  if (response.status === 401) {
    handleUnauthorized()
    throw new Error('인증이 필요합니다. 다시 로그인해주세요.')
  }
  return response
}

// 인증이 필요한 요청을 위한 헬퍼 함수들
export const authHttp = {
  GET: async (url, options = {}) => {
    const response = await http.GET(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    })
    return handleAuthResponse(response)
  },

  POST: async (url, options = {}) => {
    const response = await http.POST(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    })
    return handleAuthResponse(response)
  },

  PUT: async (url, options = {}) => {
    const response = await http.PUT(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    })
    return handleAuthResponse(response)
  },

  PATCH: async (url, options = {}) => {
    const response = await http.PATCH(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    })
    return handleAuthResponse(response)
  },

  DELETE: async (url, options = {}) => {
    const response = await http.DELETE(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    })
    return handleAuthResponse(response)
  },

  request: async (method, url, options = {}) => {
    const response = await http.request(method, url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    })
    return handleAuthResponse(response)
  },
}

// 응답 처리 헬퍼 함수
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error:', response.status, errorText)
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }
  return response
}

// JSON 응답 처리 헬퍼 함수
export const getJsonResponse = async (response) => {
  const handledResponse = await handleApiResponse(response)
  return handledResponse.json()
}

// 향상된 authHttp - 자동 에러 처리 포함
export const enhancedAuthHttp = {
  GET: async (url, options = {}) => {
    const response = await authHttp.GET(url, options)
    return handleApiResponse(response)
  },

  POST: async (url, options = {}) => {
    const response = await authHttp.POST(url, options)
    return handleApiResponse(response)
  },

  PUT: async (url, options = {}) => {
    const response = await authHttp.PUT(url, options)
    return handleApiResponse(response)
  },

  PATCH: async (url, options = {}) => {
    const response = await authHttp.PATCH(url, options)
    return handleApiResponse(response)
  },

  DELETE: async (url, options = {}) => {
    const response = await authHttp.DELETE(url, options)
    return handleApiResponse(response)
  },
}

// 다른 baseUrl 또는 설정이 필요한 경우를 위한 헬퍼
export const createApiClient = (config = {}) =>
  createHttp({ ...DEFAULT_CONFIG, ...config })
