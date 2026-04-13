import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // 从环境变量读取端口，如果不存在则使用默认端口
  // 端口将由启动脚本动态分配
  const port = parseInt(env.VITE_PORT) || 2567;

  return {
    base: './',
    build: {
      outDir: '../../frontend/public/generateimage',
      emptyOutDir: true,
    },
    server: {
      port: port,
      host: '0.0.0.0',
      strictPort: false, // 如果端口被占用，自动尝试下一个端口
      proxy: {
        '/api/nano-banana': {
          target: env.VITE_NANO_BANANA_BASE_URL || 'https://ai.t8star.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/nano-banana/, '/v1/draw/nano-banana'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // 添加 API Key 到请求头（从环境变量读取）
              const apiKey = env.VITE_NANO_BANANA_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                console.log('[代理] 添加 API Key:', apiKey);
              } else {
                console.error('[代理] 警告: VITE_NANO_BANANA_API_KEY 未设置');
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('[代理] 响应状态:', proxyRes.statusCode, proxyRes.statusMessage);
            });
            proxy.on('error', (err, req, res) => {
              console.error('[代理] 错误:', err);
            });
          }
        }
      }
    },
    plugins: [react(),tailwindcss(),],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NANO_BANANA_API_KEY': JSON.stringify(env.NANO_BANANA_API_KEY),
      'process.env.NANO_BANANA_BASE_URL': JSON.stringify(env.NANO_BANANA_BASE_URL || 'https://ai.t8star.cn')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
