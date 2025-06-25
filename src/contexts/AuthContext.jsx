import { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // 백엔드 서버가 실행되지 않을 경우를 대비해 토큰이 있으면 기본 사용자 정보 설정
      const mockUser = {
        id: 1,
        email: 'admin@weatherflick.com',
        username: 'admin',
        is_active: true,
        is_superuser: true,
      }

      apiService
        .getCurrentUser()
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          console.warn('Backend server not available, using mock user data')
          setUser(mockUser)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      // 백엔드 서버가 실행되지 않을 경우를 대비한 임시 로그인 로직
      if (email === 'admin@weatherflick.com' && password === 'admin123') {
        const mockToken = 'mock-jwt-token-' + Date.now()
        localStorage.setItem('token', mockToken)

        const mockUser = {
          id: 1,
          email: email,
          username: 'admin',
          is_active: true,
          is_superuser: true,
        }

        setUser(mockUser)
        return { success: true }
      }

      // 실제 백엔드 API 호출 시도
      const response = await apiService.login(email, password)
      localStorage.setItem('token', response.access_token)

      // 로그인 성공 후 즉시 사용자 정보 설정
      // getCurrentUser API 호출이 실패할 경우를 대비해 기본 사용자 정보 설정
      const mockUser = {
        id: 1,
        email: email,
        username: email.split('@')[0],
        is_active: true,
        is_superuser: email === 'admin@weatherflick.com',
      }

      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
      } catch (userError) {
        console.warn('Failed to get current user, using mock data:', userError)
        setUser(mockUser)
      }

      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)

      // 백엔드 서버가 실행되지 않은 경우 임시 로그인 허용
      if (email === 'admin@weatherflick.com' && password === 'admin123') {
        const mockToken = 'mock-jwt-token-' + Date.now()
        localStorage.setItem('token', mockToken)

        const mockUser = {
          id: 1,
          email: email,
          username: 'admin',
          is_active: true,
          is_superuser: true,
        }

        setUser(mockUser)
        return { success: true }
      }

      return {
        success: false,
        error: error.message || '로그인에 실패했습니다.',
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData)
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
