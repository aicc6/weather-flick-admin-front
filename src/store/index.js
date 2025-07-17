import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './api/authApi'
import { usersApi } from './api/usersApi'
import { adminsApi } from './api/adminsApi'
import { contentApi } from './api/contentApi'
import { travelCoursesApi } from './api/contentApi'
import { festivalsEventsApi } from './api/contentApi'
import { leisureSportsApi } from './api/contentApi'
import { accommodationsApi } from './api/contentApi'
import { restaurantsApi } from './api/contentApi'
import { systemApi } from './api/systemApi'
import { weatherApi } from './api/weatherApi'
import { travelPlansApi } from './api/travelPlansApi'
import { batchApi } from './api/batchApi'
import { touristAttractionsApi } from './api/touristAttractionsApi'
import { dashboardApi } from './api/dashboardApi'
import { regionsApi } from './api/regionsApi'
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
    [leisureSportsApi.reducerPath]: leisureSportsApi.reducer,
    [accommodationsApi.reducerPath]: accommodationsApi.reducer,
    [restaurantsApi.reducerPath]: restaurantsApi.reducer,
    [travelPlansApi.reducerPath]: travelPlansApi.reducer,
    [batchApi.reducerPath]: batchApi.reducer,
    [touristAttractionsApi.reducerPath]: touristAttractionsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [regionsApi.reducerPath]: regionsApi.reducer,
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
      .concat(festivalsEventsApi.middleware)
      .concat(leisureSportsApi.middleware)
      .concat(accommodationsApi.middleware)
      .concat(restaurantsApi.middleware)
      .concat(travelPlansApi.middleware)
      .concat(batchApi.middleware)
      .concat(touristAttractionsApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(regionsApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
})
