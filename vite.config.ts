
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // IMPORTANT: Changed to relative path so it works on any GitHub Pages repo
    base: './',
    define: {
      // This injects the process.env.API_KEY into the client-side code during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
