import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    // 번들 분석 플러그인 (빌드 시에만)
    visualizer({
      template: 'treemap',
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/bundle-analysis.html',
    }),
    // Gzip 압축
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli 압축
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // 빌드 최적화 옵션
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 청크 크기 경고 임계값
    chunkSizeWarningLimit: 1000,
    // CSS 코드 분할
    cssCodeSplit: true,
    // 소스맵 생성 (프로덕션에서는 false로 설정)
    sourcemap: false,
    rollupOptions: {
      output: {
        // 에셋 파일명 패턴
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        // 청크 파일명 패턴
        chunkFileNames: 'js/[name]-[hash].js',
        // 엔트리 파일명 패턴
        entryFileNames: 'js/[name]-[hash].js',
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
          // i18n 관련
          if (id.includes('i18n')) {
            return 'i18n'
          }
        },
      },
    },
    // 리포트 압축
    reportCompressedSize: false,
  },
  // 최적화 옵션
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  // 환경 변수 접두사
  envPrefix: 'VITE_',
})
