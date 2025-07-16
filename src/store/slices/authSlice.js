import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/constants/storage'
import { authApi } from '@/store/api/authApi'

// 비동기 Thunk 생성
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      try {
        // 토큰이 있으면 서버에 사용자 정보 요청
        const userResponse = await dispatch(
          authApi.endpoints.getCurrentUser.initiate(),
        )
        if (userResponse.data) {
          return userResponse.data
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (error) {
        // 토큰이 유효하지 않은 경우 로그아웃 처리
        dispatch(logout())
        return null
      }
    }
    return null
  },
)

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.loading = false
      state.error = null
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload))
    },

    setLoading: (state, action) => {
      state.loading = action.payload
    },

    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },

    clearError: (state) => {
      state.error = null
    },

    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(action.payload),
          )
        } else {
          state.user = null
          state.isAuthenticated = false
        }
        state.loading = false
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
      })
  },
})

export const { setUser, setLoading, setError, clearError, logout } =
  authSlice.actions

export default authSlice.reducer
