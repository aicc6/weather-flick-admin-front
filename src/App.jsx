import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DefaultLayout } from './components/layouts/default-layout'
import { MainPage } from './components/pages/main'
import { LoginPage } from './components/pages/login'
import { SignUpPage } from './components/pages/sign-up'
import { UsersPage } from './components/pages/users'
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
          <Route path="/sign-up" element={<SignUpPage />} />
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
