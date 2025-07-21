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
          [
            '@babel/plugin-transform-runtime',
            {
              regenerator: true,
            },
          ],
        ],
      },
    }),
    tailwindcss(),
    tsconfigPaths(),
    // 관리자 프론트엔드 보안 헤더 플러그인
    {
      name: 'admin-security-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // 관리자용 강화된 보안 헤더
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'no-referrer'); // 관리자용 더 엄격한 정책
          res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
          res.setHeader(
            'Content-Security-Policy',
            [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 관리자용 제한적 스크립트
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' http://localhost:9000 ws://localhost:9090", // 관리자 백엔드 및 배치 WebSocket 허용
              "frame-src 'none'", // 관리자에서는 프레임 완전 차단
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          );
          next();
        });
      },
    },
  ],
  esbuild: {
    target: 'es2015',
    keepNames: false, // __name 함수 충돌 방지
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
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true, // debugger 제거
      },
      mangle: {
        keep_classnames: true, // 클래스명 유지 (Redux 호환성)
        keep_fnames: false, // 함수명 유지 비활성화 (__name 충돌 방지)
        reserved: ['useSyncExternalStoreWithSelector', 'useSyncExternalStore'], // Redux 핵심 함수명 보호
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 300, // 관리자용이므로 더 엄격한 제한
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // UI 라이브러리들만 분리
            if (id.includes('@radix-ui')) {
              return 'ui-lib';
            }
            
            // 차트 라이브러리들만 분리
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            
            // React와 Redux 관련 모든 라이브러리를 vendor에 통합
            // 분리하지 않고 모두 함께 번들링하여 Children 오류 방지
            return 'vendor';
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
      keepNames: false, // __name 함수 충돌 방지
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
