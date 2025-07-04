import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarCollapsed: false,
  theme: 'system',
  notifications: [],
  loading: {
    global: false,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },

    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },

    setTheme: (state, action) => {
      state.theme = action.payload
    },

    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
        read: false,
      }
      state.notifications.unshift(notification)

      // 최대 50개까지만 보관
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },

    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      )
      if (notification) {
        notification.read = true
      }
    },

    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true
      })
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      )
    },

    clearNotifications: (state) => {
      state.notifications = []
    },

    setLoading: (state, action) => {
      state.loading[action.payload.key] = action.payload.loading
    },

    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  setLoading,
  setGlobalLoading,
} = uiSlice.actions

export default uiSlice.reducer
