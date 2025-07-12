import { createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEYS } from '@/constants/storage'

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
      localStorage.removeItem(STORAGE_KEYS.USER)
    },

    initializeAuth: (state) => {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

      if (savedUser && token) {
        try {
          state.user = JSON.parse(savedUser)
          state.isAuthenticated = true
        } catch (error) {
          console.error('Failed to parse saved user data:', error)
          localStorage.removeItem(STORAGE_KEYS.USER)
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        }
      }
      state.loading = false
    },
  },
})

export const {
  setUser,
  setLoading,
  setError,
  clearError,
  logout,
  initializeAuth,
} = authSlice.actions

export default authSlice.reducer
