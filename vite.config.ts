import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/odsay': {
          target: 'https://api.odsay.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/odsay/, ''),
          secure: false, // SSL 인증서 에러 무시 (학교 네트워크 필수 설정)
          ws: true,
          
          // 요청을 보낼 때 '나는 로컬호스트다'라고 명찰을 달아주는 설정
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              proxyReq.setHeader('Origin', 'http://localhost:3000');
              proxyReq.setHeader('Referer', 'http://localhost:3000');
            });
            // 에러가 나도 서버가 꺼지지 않게 로그만 찍고 넘어감
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
          },
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});