import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// GitHub Pages(プロジェクトページ)で配信するため、ビルド時のみ base をリポジトリ名にする。
// 開発サーバー(command === 'serve')ではルート '/' のまま。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/anatomy-3d-viewer/' : '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // 最大の依存である Three.js(three / three-stdlib)を専用チャンクに分離し、
        // 初期ロードのキャッシュ効率を上げる。他は既定のチャンクに任せる(循環回避)。
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          return undefined;
        },
      },
    },
  },
}));
