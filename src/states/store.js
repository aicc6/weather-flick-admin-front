import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { systemApi } from '../store/api/systemApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [systemApi.reducerPath]: systemApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(systemApi.middleware),
})
