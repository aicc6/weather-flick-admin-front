/**
 * 사용자 언어 설정 관리 훅
 * 로컬 스토리지와 사용자 프로필에 언어 설정 저장/로드
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authHttp } from '../lib/http'
import {
  getCurrentLanguage,
  changeLanguage,
  isLanguageSupported,
} from '../i18n/config'

export const useLanguagePreference = () => {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 서버에서 사용자 언어 설정 로드
   */
  const loadUserLanguagePreference = useCallback(async () => {
    if (!user?.user_id) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await authHttp.GET(
        `/api/users/${user.user_id}/preferences`,
      )
      const data = await response.json()

      if (data.success && data.data.language) {
        const userLanguage = data.data.language

        // 지원하는 언어인지 확인
        if (isLanguageSupported(userLanguage)) {
          // 현재 언어와 다르면 변경
          if (getCurrentLanguage() !== userLanguage) {
            await changeLanguage(userLanguage)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user language preference:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [user?.user_id])

  /**
   * 서버에 사용자 언어 설정 저장
   */
  const saveUserLanguagePreference = useCallback(
    async (language) => {
      if (!user?.user_id) {
        // 로그인하지 않은 경우 로컬 스토리지에만 저장
        await changeLanguage(language)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 서버에 언어 설정 저장
        const response = await authHttp.PUT(
          `/api/users/${user.user_id}/preferences`,
          {
            language: language,
          },
        )

        const data = await response.json()

        if (data.success) {
          // 언어 변경 적용
          await changeLanguage(language)

          // 사용자 정보 업데이트 (필요시)
          if (updateUser) {
            updateUser({
              ...user,
              preferences: {
                ...user.preferences,
                language: language,
              },
            })
          }
        } else {
          throw new Error(data.message || 'Failed to save language preference')
        }
      } catch (err) {
        console.error('Failed to save user language preference:', err)
        setError(err.message)

        // 서버 저장 실패해도 클라이언트 언어는 변경
        await changeLanguage(language)
      } finally {
        setIsLoading(false)
      }
    },
    [user, updateUser],
  )

  /**
   * 언어 변경 (로컬 + 서버 저장)
   */
  const setLanguage = useCallback(
    async (language) => {
      if (!isLanguageSupported(language)) {
        setError(`Unsupported language: ${language}`)
        return false
      }

      try {
        await saveUserLanguagePreference(language)
        return true
      } catch (err) {
        setError(err.message)
        return false
      }
    },
    [saveUserLanguagePreference],
  )

  /**
   * 언어 설정 초기화 (기본 언어로 복원)
   */
  const resetLanguagePreference = useCallback(async () => {
    return await setLanguage('ko') // 기본 언어로 설정
  }, [setLanguage])

  /**
   * 브라우저 언어를 기반으로 언어 설정
   */
  const setLanguageFromBrowser = useCallback(async () => {
    const browserLang = navigator.language.split('-')[0] // 'ko-KR' -> 'ko'

    if (isLanguageSupported(browserLang)) {
      return await setLanguage(browserLang)
    } else {
      // 지원하지 않는 언어면 기본 언어 사용
      return await resetLanguagePreference()
    }
  }, [setLanguage, resetLanguagePreference])

  // 컴포넌트 마운트 시 사용자 언어 설정 로드
  useEffect(() => {
    if (user?.user_id) {
      loadUserLanguagePreference()
    }
  }, [user?.user_id, loadUserLanguagePreference])

  return {
    // 상태
    currentLanguage: getCurrentLanguage(),
    isLoading,
    error,

    // 메서드
    setLanguage,
    resetLanguagePreference,
    setLanguageFromBrowser,
    loadUserLanguagePreference,

    // 유틸리티
    isLanguageSupported,
    clearError: () => setError(null),
  }
}

export default useLanguagePreference
