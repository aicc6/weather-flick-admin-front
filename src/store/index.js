import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './api/authApi'
import { usersApi } from './api/usersApi'
import { adminsApi } from './api/adminsApi'
import { contentApi } from './api/contentApi'
import { travelCoursesApi } from './api/contentApi'
import { festivalsEventsApi } from './api/contentApi'
import { systemApi } from './api/systemApi'
import { weatherApi } from './api/weatherApi'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [adminsApi.reducerPath]: adminsApi.reducer,
    [contentApi.reducerPath]: contentApi.reducer,
    [systemApi.reducerPath]: systemApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
    [travelCoursesApi.reducerPath]: travelCoursesApi.reducer,
    [festivalsEventsApi.reducerPath]: festivalsEventsApi.reducer,
    // Regular slices
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    })
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(adminsApi.middleware)
      .concat(contentApi.middleware)
      .concat(systemApi.middleware)
      .concat(weatherApi.middleware)
      .concat(travelCoursesApi.middleware)
      .concat(festivalsEventsApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
})
