import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM에서 __dirname 사용을 위한 polyfill
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 청크 크기 경고 임계값 조정 (선택사항)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // 수동 청크 분할 설정
        manualChunks: (id) => {
          // node_modules 의존성 분리
          if (id.includes('node_modules')) {
            // React 관련 라이브러리
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // 문서 관련 라이브러리 (PharmacyDocumentation에서만 사용, 동적 import로 자동 분리됨)
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) {
              return 'docs-vendor';
            }
            // UI 라이브러리
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-vendor';
            }
            // 폼 및 검증 라이브러리
            if (id.includes('react-hook-form') || id.includes('hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            // 유틸리티 라이브러리
            if (id.includes('axios') || id.includes('date-fns') || id.includes('moment')) {
              return 'utils-vendor';
            }
            // 기타 vendor 라이브러리
            return 'vendor';
          }
          
          // 페이지별 청크 분리 (동적 import된 페이지들)
          if (id.includes('/pages/pharmacy/Documentation')) {
            return 'page-docs';
          }
          if (id.includes('/pages/pharmacy/Applications')) {
            return 'page-pharmacy';
          }
          if (id.includes('/pages/staff/')) {
            return 'page-staff';
          }
          if (id.includes('/pages/')) {
            return 'page-common';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    // 개발 환경에서 로컬 서버로 프록시 (로컬 서버가 3000 포트에서 실행 중일 때)
    // 실서버를 사용하려면 아래 주석을 해제하고 target을 변경하세요
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // 쿠키 전달을 위해 필요
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 쿠키가 있으면 전달
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        },
      },
    },
    // 실서버 사용 시 주석 해제:
    // proxy: {
    //   '/api': {
    //     target: 'https://disk-cms.simg.kr',
    //     changeOrigin: true,
    //     secure: true,
    //   },
    // },
  },
})
