import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { STORAGE_KEYS } from '../../constants/storage'

export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('content-type', 'application/json')
    return headers
  },
})

export const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // 토큰 만료 시 로그아웃 처리
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    window.location.href = '/login'
  }

  // v3 API 표준 응답 구조 처리
  if (result.data && typeof result.data === 'object') {
    // v3 표준 응답 구조: {success, data, error, pagination}
    if (result.data.success !== undefined) {
      if (result.data.success) {
        result.data = result.data.data || result.data
      } else {
        // 에러 응답 처리
        result.error = {
          status: 'PARSING_ERROR',
          data: result.data.error || 'Unknown error',
        }
        result.data = null
      }
    }
    // 기존 호환성 유지 (data 필드 직접 추출)
    else if (result.data.data !== undefined) {
      result.data = result.data.data
    }
  }

  return result
}
