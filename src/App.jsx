import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './routes'
import { Toaster } from 'react-hot-toast'
import '@/App.css'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App
