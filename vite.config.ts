import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
        manualChunks: {
          // React 관련 라이브러리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 라이브러리
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
          // 폼 및 검증 라이브러리
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // 유틸리티 라이브러리
          'utils-vendor': ['axios', 'date-fns', 'moment', 'moment-timezone'],
          // 문서 관련 라이브러리
          'docs-vendor': ['react-markdown', 'remark-gfm', 'rehype-raw', 'rehype-sanitize'],
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
