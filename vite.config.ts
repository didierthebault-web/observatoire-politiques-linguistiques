import { defineConfig } from 'vite';
export default defineConfig({base:'/observatoire-politiques-linguistiques/',build:{outDir:'dist',rollupOptions:{output:{manualChunks:{spreadsheet:['xlsx']}}}}});
