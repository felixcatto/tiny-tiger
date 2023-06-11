import spawnAsync from 'await-spawn';
import { spawn } from 'child_process';
import { deleteAsync } from 'del';
import fs from 'fs';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import swc from 'gulp-swc';
import madge from 'madge';
import waitOn from 'wait-on';

const { series, parallel } = gulp;
const spawnNpxAsync = async args => spawnAsync('npx', args, { stdio: 'inherit' });

const paths = {
  dest: 'dist',
  serverJs: {
    src: [
      '*/**/*.{js,ts,tsx}',
      'knexfile.js',
      '!node_modules/**',
      '!dist/**',
      '!public/**',
      '!client/**',
      '!__tests__/**',
      '!seeds/**',
      '!migrations/**',
      '!services/**',
    ],
  },
  misc: '.env*',
};

let server;
let isWaitonListening = false;
const startServer = async () => {
  server = spawn('node', ['dist/bin/server.js'], { stdio: 'inherit' });

  if (!isWaitonListening) {
    isWaitonListening = true;
    await waitOn({
      resources: [`http-get://localhost:3000`],
      delay: 500,
      interval: 1000,
      validateStatus: status => status !== 503,
    });
    isWaitonListening = false;
  }
};

const restartServer = async () => {
  server.kill();
  await startServer();
};
process.on('exit', () => server && server.kill());

const clean = async () => deleteAsync(['dist']);

const transpileServerJs = () =>
  gulp
    .src(paths.serverJs.src, { base: '.', since: gulp.lastRun(transpileServerJs) })
    .pipe(swc({ jsc: { target: 'es2022' } }))
    .pipe(gulp.dest(paths.dest));

const transpileServerJsWithSourcemaps = () =>
  gulp
    .src(paths.serverJs.src, { base: '.', since: gulp.lastRun(transpileServerJs) })
    .pipe(sourcemaps.init())
    .pipe(swc({ sourceMaps: true, inlineSourcesContent: true, jsc: { target: 'es2022' } }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dest));

// const uploadServerSourcemaps = async () => {
//   await spawnNpxAsync(['sentry-cli', 'sourcemaps', 'inject', 'dist']);
//   await spawnNpxAsync(['sentry-cli', 'sourcemaps', 'upload', '--use-artifact-bundle', 'dist']);
// };

const copyMisc = () => gulp.src(paths.misc).pipe(gulp.dest(paths.dest));

const viteBuildClient = async () => spawnNpxAsync(['vite', 'build', '--outDir', 'dist/public']);

const viteBuildSSR = async () =>
  spawnNpxAsync([
    'vite',
    'build',
    '--outDir',
    'dist/server',
    '--ssr',
    'client/main/entry-server.tsx',
  ]);

// const makeGqlTypes = async () => spawnNpxAsync(['graphql-codegen']);

const makeProjectStructure = async () => {
  const result = await madge(['client/main/entry-client.tsx', 'main/index.ts'], {
    dependencyFilter: importedDependency => {
      const isTypeImport = importedDependency.match(/types\.ts$/);
      return !isTypeImport;
    },
  });
  const svg = await result.svg();
  fs.writeFileSync('public/img/project-structure.svg', svg);
};

const trackChangesInDist = () => {
  const watcher = gulp.watch('dist/**/*');
  watcher
    .on('add', pathname => console.log(`File ${pathname} was added`))
    .on('change', pathname => console.log(`File ${pathname} was changed`))
    .on('unlink', pathname => console.log(`File ${pathname} was removed`));
};

const watch = async () => {
  gulp.watch('index.html', series(restartServer));
  gulp.watch(paths.serverJs.src, series(transpileServerJs, restartServer));
  trackChangesInDist();
};

export const dev = series(
  clean,
  parallel(transpileServerJs, copyMisc),
  startServer,
  // makeGqlTypes,
  watch
);

export const build = series(
  clean,
  parallel(copyMisc, transpileServerJsWithSourcemaps),
  // uploadServerSourcemaps,
  viteBuildClient,
  viteBuildSSR
);

export { makeProjectStructure };
