import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { generateScopedName } from './lib/devUtils.js';

let config = defineConfig({
  plugins: [react()],
  css: { modules: { generateScopedName } },
});

if (process.env.ANALYZE) {
  config = defineConfig({
    plugins: [{ ...visualizer({ emitFile: true, open: true }), enforce: 'post', apply: 'build' }],
  });
}

export default config;
