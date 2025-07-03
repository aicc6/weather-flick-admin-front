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
      '/tourist-attractions': 'http://localhost:8000',
      // 필요하다면 다른 API 경로도 추가
      // '/auth': 'http://localhost:8000',
    },
  },
})
