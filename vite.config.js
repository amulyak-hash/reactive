import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: mode === 'library'
    ? {
        emptyOutDir: false,
        lib: {
          entry: 'src/index.ts',
          name: 'ReactiveInterface',
          fileName: (format) => format === 'es' ? 'reactive-interface.js' : 'reactive-interface.umd.cjs',
          formats: ['es', 'umd']
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime'
            }
          }
        }
      }
    : undefined
}));
