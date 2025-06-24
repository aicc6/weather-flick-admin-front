import { createContext, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from '../states/slices/authSlice'

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
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth,
  )

  const login = async (email, password) => {
    try {
      dispatch(loginStart())

      // 실제 API 호출 대신 임시 로직 (나중에 실제 API로 교체)
      if (email === 'admin@weatherflick.com' && password === 'admin123') {
        const mockUser = {
          id: 1,
          email: 'admin@weatherflick.com',
          name: '관리자',
          role: 'admin',
        }
        const mockToken = 'mock-jwt-token-' + Date.now()

        dispatch(loginSuccess({ user: mockUser, token: mockToken }))
        navigate('/')
        return { success: true }
      } else {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch (error) {
      dispatch(loginFailure(error.message))
      return { success: false, error: error.message }
    }
  }

  const logoutUser = () => {
    dispatch(logout())
    navigate('/login')
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
