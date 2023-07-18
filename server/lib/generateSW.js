import { generateSW } from 'workbox-build';

const mode = process.env.NODE_ENV || 'development';

generateSW({
  mode,
  globDirectory: 'dist/public',
  globPatterns: ['**/*.{png,js,css,svg,ico,woff2,ttf,webp,json}'],
  globIgnores: [
    'server/**/*',
    'img/project-structure.svg',
    'assets/projectStructure*',
    'assets/InfoCircle*',
  ],
  swDest: 'dist/public/sw.js',
  skipWaiting: true,
  // runtimeCaching: [
  //   {
  //     urlPattern: () => true,
  //     handler: 'NetworkFirst',
  //     options: { cacheName: 'runtime' },
  //   },
  // ],
  // additionalManifestEntries: ['/index.html'],
  // should be placed to /html/index.html, because now it becomes cached and served as part of static assets
  // navigateFallback: '/index.html',
});
