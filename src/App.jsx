import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DefaultLayout } from './components/layouts/default-layout'
import { MainPage } from './components/pages/main'
import { LoginPage } from './components/pages/login'
import { AdminsPage } from './components/pages/admins'
import { UsersPage } from './components/pages/users'
import { ContentPage } from './components/pages/content'
import { SystemPage } from './components/pages/system'
import { WeatherPage } from './components/pages/weather'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import TouristAttractionAdminPage from './components/pages/admin/TouristAttractionAdminPage'
import '@/App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <MainPage />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admins"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <AdminsPage />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <UsersPage />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/content"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <ContentPage />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <SystemPage />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <WeatherPage />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tourist-attractions"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <TouristAttractionAdminPage />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
