import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DefaultLayout } from './components/layouts/default-layout'
import { MainPage } from './components/pages/main'
import { LoginPage } from './components/pages/login'
import { AdminsPage } from './components/pages/admins'
import { WeatherPage } from './components/pages/weather'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
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
            path="/weather"
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <WeatherPage />
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
