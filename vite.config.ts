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
