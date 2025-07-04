import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    allowedHosts: true,
    proxy: {
      // FastAPI 서버 주소에 맞게 수정 (아래는 기본 예시)
      '/tourist-attractions': 'http://localhost:9000',
      '/api': 'http://localhost:9000',
      // 필요하다면 다른 API 경로도 추가
      // '/auth': 'http://localhost:9000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 벤더 라이브러리들을 별도 청크로 분리
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor'
            }
            if (id.includes('@radix-ui')) {
              return 'ui'
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux'
            }
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            return 'vendor'
          }

          // 페이지별 청크 분리
          if (id.includes('/pages/main')) {
            return 'main-page'
          }
          if (id.includes('/pages/users')) {
            return 'users-page'
          }
          if (id.includes('/pages/admins')) {
            return 'admins-page'
          }
          if (id.includes('/pages/weather')) {
            return 'weather-page'
          }
          if (id.includes('/pages/system')) {
            return 'system-page'
          }
          if (id.includes('/pages/content')) {
            return 'content-page'
          }

          // 인증 관련
          if (id.includes('/contexts/AuthContext') || id.includes('/auth/')) {
            return 'auth'
          }

          // API 관련
          if (id.includes('/store/api/')) {
            return 'api'
          }
        },
      },
    },
  },
})
