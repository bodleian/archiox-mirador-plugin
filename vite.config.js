import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    plugins: [react(), svgr()],
    root: isBuild ? '.' : './dev',
    esbuild: {
      loader: 'jsx',
      include: /.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    build: undefined,
    base: './',
    test: {
      root: './',
      environment: 'jsdom',
      globals: true,
      css: false,
      coverage: {
        reporters: ['html'],
        include: ['src/**/**/*.js'],
      },
    },
  };
});
