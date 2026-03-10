import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

const isMinified = process.env.BUILD_MODE === 'production';

export default defineConfig({
  plugins: [
    react(),
    !isMinified && dts({
      insertTypesEntry: false,
      outDir: 'dist',
      include: ['src/react-webcam.tsx'],
    }),
  ].filter(Boolean),
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/react-webcam.tsx'),
      name: 'Webcam',
      formats: ['umd'],
      fileName: () => isMinified ? 'react-webcam.min.js' : 'react-webcam.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
        exports: 'default',
      },
    },
    sourcemap: true,
    minify: isMinified ? 'esbuild' : false,
    emptyOutDir: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    clearMocks: true,
    coverage: { provider: 'v8', reportsDirectory: 'coverage' },
    include: ['**/__tests__/**/*.(spec|test).[jt]s?(x)'],
  },
});
