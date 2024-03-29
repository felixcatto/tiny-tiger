import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { generateScopedName, loadEnv } from './scripts/devUtils.js';

// import { sentryVitePlugin } from '@sentry/vite-plugin';

loadEnv();

// const isProd = process.env.NODE_ENV === 'production';

let config = defineConfig({
  publicDir: 'server/public',
  optimizeDeps: { exclude: ['@felixcatto/ui'] },
  build: { sourcemap: true, outDir: 'dist/public' },
  plugins: [
    react(),
    // isProd &&
    //   sentryVitePlugin({
    //     include: './dist/public',
    //     org: process.env.SENTRY_ORG,
    //     project: process.env.SENTRY_PROJECT,
    //     authToken: process.env.SENTRY_AUTH_TOKEN,
    //   }),
  ],
  css: { modules: { generateScopedName } },
  define: { __SENTRY_DEBUG__: false },
});

if (process.env.ANALYZE) {
  const newPlugins = (config as any).plugins.concat({
    ...visualizer({ emitFile: true, open: true }),
    enforce: 'post',
    apply: 'build',
  });

  config = { ...config, plugins: newPlugins };
}

export default config;
