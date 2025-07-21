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
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true, // debugger 제거
      },
      mangle: {
        keep_classnames: false, // 클래스명 압축
        keep_fnames: false, // 함수명 압축
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 300, // 관리자용이므로 더 엄격한 제한
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Node modules 세분화
          if (id.includes('node_modules')) {
            // React 코어
            if (id.includes('react') && !id.includes('react-router') && !id.includes('react-redux')) {
              return 'react-core';
            }
            
            // React 라우터
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // Redux 생태계
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || 
                id.includes('redux') || id.includes('immer') || id.includes('reselect')) {
              return 'redux-vendor';
            }
            
            // UI 컴포넌트
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            // 아이콘
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // 차트 라이브러리 (세분화)
            if (id.includes('recharts')) {
              return 'recharts-vendor';
            }
            
            if (id.includes('d3')) {
              return 'd3-vendor';
            }
            
            // 폼 관련
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms';
            }
            
            // 유틸리티
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'utils';
            }
            
            // 기타 vendor
            return 'vendor';
          }

          // 페이지별 청크 분리 (더 세분화)
          if (id.includes('src/pages/')) {
            if (id.includes('main')) return 'main-page';
            if (id.includes('users')) return 'users-page';
            if (id.includes('admins')) return 'admins-page';
            if (id.includes('weather')) return 'weather-page';
            if (id.includes('system')) return 'system-page';
            if (id.includes('content')) return 'content-page';
            if (id.includes('batch')) return 'batch-page';
            return 'pages';
          }

          // 컴포넌트별 분리
          if (id.includes('src/components/')) {
            if (id.includes('ui/')) return 'ui-components';
            if (id.includes('layout/')) return 'layout-components';
            if (id.includes('charts/') || id.includes('dashboard/')) return 'chart-components';
            return 'components';
          }

          // 인증 관련
          if (id.includes('contexts/AuthContext') || id.includes('auth/')) {
            return 'auth';
          }

          // Store/API 관련
          if (id.includes('store/') || id.includes('api/')) {
            return 'store-api';
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
