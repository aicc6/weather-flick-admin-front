import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { STORAGE_KEYS } from '@/constants/storage'

// 환경에 따른 base URL 설정
const getBaseUrl = () => {
  // 개발 환경에서는 vite proxy를 사용하므로 빈 문자열
  // 프로덕션에서는 환경변수나 설정에서 가져옴
  return import.meta.env.VITE_API_BASE_URL || ''
}

// 기본 baseQuery 설정
export const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    // Content-Type은 RTK Query가 자동으로 설정하도록 함
    return headers
  },
})

// 401 에러 처리 함수
const handle401Error = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  // React Router를 사용한 리다이렉트를 권장하지만,
  // 간단한 구현을 위해 window.location 사용
  window.location.href = '/login'
}

// 인증 및 응답 변환을 포함한 baseQuery
export const baseQueryWithAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  // 401 에러 처리
  if (result.error && result.error.status === 401) {
    handle401Error()
  }

  // 백엔드 응답 형식이 { success: true, data: {...} } 인 경우
  // data만 추출하여 반환 (weather-flick-front 패턴 참고)
  if (
    result.data &&
    typeof result.data === 'object' &&
    'success' in result.data
  ) {
    if (result.data.success && result.data.data !== undefined) {
      result.data = result.data.data
    } else if (!result.data.success && result.data.error) {
      // 에러 응답 처리
      result.error = {
        status: result.error?.status || 'CUSTOM_ERROR',
        data: result.data.error,
      }
      result.data = undefined
    }
  }

  return result
}

// 재인증을 시도하는 baseQuery
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // 리프레시 토큰 가져오기
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    
    if (!refreshToken) {
      handle401Error()
      return result
    }

    // 리프레시 토큰으로 재인증 시도
    const refreshResult = await baseQuery(
      {
        url: '/api/auth/refresh',
        method: 'POST',
        body: { refresh_token: refreshToken },
      },
      api,
      extraOptions,
    )

    if (refreshResult.data) {
      // 새 토큰 저장
      const newAccessToken =
        refreshResult.data.access_token ||
        refreshResult.data.token?.access_token
      const newRefreshToken =
        refreshResult.data.refresh_token ||
        refreshResult.data.token?.refresh_token
        
      if (newAccessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
        if (newRefreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
        }
        // 원래 요청 재시도
        result = await baseQuery(args, api, extraOptions)
      } else {
        handle401Error()
      }
    } else {
      handle401Error()
    }
  }

  // 응답 데이터 변환
  if (
    result.data &&
    typeof result.data === 'object' &&
    'success' in result.data
  ) {
    if (result.data.success && result.data.data !== undefined) {
      result.data = result.data.data
    } else if (!result.data.success && result.data.error) {
      // 에러 응답 처리
      result.error = {
        status: result.error?.status || 'CUSTOM_ERROR',
        data: result.data.error,
      }
      result.data = undefined
    }
  }

  return result
}
