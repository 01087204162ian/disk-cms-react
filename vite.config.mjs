import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { visualizer } from 'rollup-plugin-visualizer'

// ESM에서 __dirname 사용을 위한 polyfill
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ 
      filename: 'dist/stats.html', 
      gzipSize: true, 
      brotliSize: true 
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // React core
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react-core'

          // Router
          if (id.includes('react-router')) return 'router'

          // (있을 때만) 아이콘/유틸/날짜/차트류 분리
          if (id.includes('lucide-react') || id.includes('react-icons')) return 'icons'
          if (id.includes('lodash')) return 'lodash'
          if (id.includes('moment') || id.includes('dayjs') || id.includes('date-fns')) return 'dates'
          if (id.includes('chart') || id.includes('recharts')) return 'charts'
          
          // 큰 라이브러리 분리 (동적 import로 로드됨)
          if (id.includes('exceljs')) return 'exceljs'
          if (id.includes('react-markdown')) return 'markdown'

          // 나머지 vendor
          return 'vendor'
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
