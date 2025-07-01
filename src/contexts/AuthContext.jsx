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

  // 초기화 시 로컬스토리지에서 사용자 정보도 복원
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        
        if (token && savedUser) {
          // 저장된 사용자 정보 먼저 복원 (빠른 UI 업데이트)
          const userData = JSON.parse(savedUser)
          setUser(userData)
          
          // 백그라운드에서 토큰 유효성 검증
          try {
            const currentUserData = await apiService.getCurrentUser()
            setUser(currentUserData)
            localStorage.setItem('user', JSON.stringify(currentUserData))
          } catch (error) {
            console.error('Token validation failed:', error)
            // 토큰이 유효하지 않으면 모든 저장된 데이터 제거
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          }
        } else if (token) {
          // 토큰만 있고 사용자 정보가 없는 경우
          try {
            const userData = await apiService.getCurrentUser()
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } catch (error) {
            console.error('Failed to get current user:', error)
            localStorage.removeItem('token')
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password)
      
      // API 응답 구조에 맞게 토큰 저장
      const token = response.token?.access_token
      if (!token) {
        throw new Error('토큰을 받지 못했습니다.')
      }
      
      localStorage.setItem('token', token)
      
      // 로그인 응답에서 바로 관리자 정보 사용
      if (response.admin) {
        setUser(response.admin)
        localStorage.setItem('user', JSON.stringify(response.admin))
      } else {
        // 응답에 관리자 정보가 없으면 별도로 조회
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }

      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return {
        success: false,
        error: error.message || '로그인에 실패했습니다.',
      }
    }
  }


  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
