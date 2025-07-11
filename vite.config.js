import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-runtime', {
            regenerator: true
          }]
        ]
      }
    }),
    tailwindcss(),
    tsconfigPaths()
  ],
  esbuild: {
    target: 'es2015',
    keepNames: true,
  },
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
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      keep_classnames: true,
      keep_fnames: true,
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 벤더 라이브러리들을 별도 청크로 분리
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('@reduxjs/toolkit') ||
              id.includes('react-redux') ||
              id.includes('redux') ||
              id.includes('immer') ||
              id.includes('reselect')
            ) {
              return 'vendor'
            }
            if (id.includes('@radix-ui')) {
              return 'ui'
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
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'immer',
      'redux',
      'reselect',
      'redux-thunk',
    ],
    esbuildOptions: {
      target: 'es2015',
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
