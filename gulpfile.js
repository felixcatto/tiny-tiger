import { listen, makeServer } from 'blunt-livereload';
import { spawn } from 'child_process';
import { deleteAsync } from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import waitOn from 'wait-on';
import webpack from 'webpack';
import babelConfig from './babelconfig.js';
import { dirname } from './lib/devUtils.js';
import webpackConfig from './webpack.config.js';

const __dirname = dirname(import.meta.url);
const { series, parallel } = gulp;

const paths = {
  dest: 'dist',
  public: { src: ['public/**/*', '!public/cssSource/**'], dest: 'dist/public' },
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
  client: { src: ['client/**/*.{js,ts,tsx}', '!client/**/*.d.ts'] },
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

const devServer = makeServer();
const startDevServer = async () => listen(devServer);
const reloadBrowser = async () => devServer.reloadBrowser();

const copyPublic = () => gulp.src(paths.public.src).pipe(gulp.dest(paths.public.dest));
const copyPublicDev = () =>
  gulp
    .src(paths.public.src, { since: gulp.lastRun(copyPublicDev) })
    .pipe(gulp.symlink(paths.public.dest, { overwrite: false }));

const transpileServerJs = () =>
  gulp
    .src(paths.serverJs.src, { base: '.', since: gulp.lastRun(transpileServerJs) })
    .pipe(babel(babelConfig.server))
    .pipe(gulp.dest(paths.dest));

const compiler = webpack(webpackConfig);
const startWebpack = done => {
  compiler.hooks.done.tap('done', async () => reloadBrowser());
  compiler.watch({}, done);
};
const bundleClient = done => compiler.run(done);

const trackChangesInDist = () => {
  const watcher = gulp.watch('dist/**/*');
  watcher
    .on('add', pathname => console.log(`File ${pathname} was added`))
    .on('change', pathname => console.log(`File ${pathname} was changed`))
    .on('unlink', pathname => console.log(`File ${pathname} was removed`));
};

const watch = async () => {
  gulp.watch(paths.public.src, series(copyPublicDev, restartServer, reloadBrowser));
  gulp.watch(paths.serverJs.src, series(transpileServerJs, restartServer, reloadBrowser));
  trackChangesInDist();
};

export const dev = series(
  clean,
  parallel(copyPublicDev, transpileServerJs, startDevServer),
  startWebpack,
  startServer,
  watch
);

export const build = series(clean, copyPublicDev, transpileServerJs, bundleClient);
