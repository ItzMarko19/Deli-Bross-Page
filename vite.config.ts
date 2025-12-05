
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // IMPORTANT: './' ensures assets load correctly on GitHub Pages (e.g. /repo-name/assets/script.js)
    base: './', 
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      // Ensure we don't minify too aggressively if debugging is needed, but default is usually fine.
      // Explicitly setting target ensures compatibility.
      target: 'es2020'
    }
  };
});