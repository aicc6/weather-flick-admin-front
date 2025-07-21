import { createContext, useContext, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setUser,
  setLoading,
  setError,
  logout as logoutAction,
  initializeAuth,
} from '@/store/slices/authSlice'
import { useLoginMutation, useGetCurrentUserQuery } from '@/store/api/authApi'
import { STORAGE_KEYS } from '@/constants/storage'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const { user, loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  )

  // RTK Query 훅들
  const [loginMutation] = useLoginMutation()
  const { refetch: getCurrentUser } = useGetCurrentUserQuery(undefined, {
    skip: true,
  })

  // 앱 시작 시 인증 상태 초기화
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  const login = async (email, password) => {
    try {
      dispatch(setLoading(true))
      const response = await loginMutation({ email, password }).unwrap()
      console.log('로그인 응답:', response)

      // API 응답 구조에 맞게 토큰 저장
      const accessToken = response.token?.access_token
      const refreshToken = response.token?.refresh_token

      if (!accessToken) {
        throw new Error('토큰을 받지 못했습니다.')
      }

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      }

      // 로그인 응답에서 바로 관리자 정보 사용
      if (response.admin) {
        dispatch(setUser(response.admin))
      } else {
        // 응답에 관리자 정보가 없으면 별도로 조회
        const { data: userData } = await getCurrentUser()
        dispatch(setUser(userData))
      }

      // 사용자 정보를 localStorage에 저장하는 로직은 authSlice에서 처리하므로 제거

      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      
      // FastAPI validation error 처리 - 사용자 친화적 메시지
      let errorMessage = '로그인에 실패했습니다.'
      
      if (error.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          // 필드별 한국어 메시지 매핑
          const fieldMessages = {
            'username': '이메일을 입력해주세요.',
            'password': '비밀번호를 입력해주세요.',
            'email': '이메일을 입력해주세요.'
          }
          
          // FastAPI validation errors를 사용자 친화적 메시지로 변환
          const messages = error.data.detail.map(err => {
            // loc 배열에서 실제 필드명 추출 (예: ["body", "username"] -> "username")
            const fieldName = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : null
            
            // 필드별 한국어 메시지 또는 기본 메시지 사용
            if (fieldName && fieldMessages[fieldName]) {
              return fieldMessages[fieldName]
            } else if (err.msg) {
              // 기본 영어 메시지를 한국어로 변환
              if (err.msg.includes('Field required')) {
                return '필수 정보를 입력해주세요.'
              } else if (err.msg.includes('Invalid')) {
                return '올바른 형식으로 입력해주세요.'
              }
              return err.msg
            }
            return '유효하지 않은 입력입니다.'
          })
          
          // 중복 메시지 제거 후 조합
          errorMessage = [...new Set(messages)].join(' ')
        } else if (typeof error.data.detail === 'string') {
          errorMessage = error.data.detail
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      dispatch(setError(errorMessage))
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  const logout = () => {
    dispatch(logoutAction())
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
