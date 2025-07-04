import { createContext, useContext, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  setUser, 
  setLoading, 
  setError, 
  logout as logoutAction, 
  initializeAuth 
} from '../store/slices/authSlice'
import { apiService } from '../services/api'
import { STORAGE_KEYS } from '../constants/storage'

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
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth)

  // 초기화 시 Redux store 초기화
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  const login = async (email, password) => {
    try {
      dispatch(setLoading(true))
      const response = await apiService.login(email, password)
      console.log('로그인 응답:', response)

      // API 응답 구조에 맞게 토큰 저장
      const token = response.token?.access_token
      if (!token) {
        throw new Error('토큰을 받지 못했습니다.')
      }

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)

      // 로그인 응답에서 바로 관리자 정보 사용
      if (response.admin) {
        dispatch(setUser(response.admin))
      } else {
        // 응답에 관리자 정보가 없으면 별도로 조회
        const userData = await apiService.getCurrentUser()
        dispatch(setUser(userData))
      }

      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      dispatch(setError(error.message || '로그인에 실패했습니다.'))
      return {
        success: false,
        error: error.message || '로그인에 실패했습니다.',
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
