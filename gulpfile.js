import { listen, backClient, makeLrServer } from 'blunt-livereload';
import { spawn } from 'child_process';
import { deleteAsync } from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import waitOn from 'wait-on';
import webpack from 'webpack';
import babelConfig from './babelconfig.js';
import { makeCompileActor, makeWrapSeries, events } from './lib/devUtils.js';
import webpackConfig from './webpack.config.js';

const { series, parallel } = gulp;

const paths = {
  dest: 'dist',
  public: { src: 'public/**/*', dest: 'dist/public' },
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
  cssModules: { src: 'client/**/*.module.css' },
};

const startLrServer = async () => {
  backClient.start();
  const lrServer = makeLrServer();
  return listen(lrServer);
};
const reloadBrowser = async () => backClient.notifyWindowReload();

const compileActor = makeCompileActor(reloadBrowser);
const wrapSeries = makeWrapSeries(series, compileActor);

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

const copyPublic = () => gulp.src(paths.public.src).pipe(gulp.dest(paths.public.dest));
const copyPublicDev = () =>
  gulp
    .src(paths.public.src, { since: gulp.lastRun(copyPublicDev) })
    .pipe(gulp.symlink(paths.public.dest, { overwrite: false }));

const copyCssModules = () =>
  gulp
    .src(paths.cssModules.src, { base: '.', since: gulp.lastRun(copyCssModules) })
    .pipe(gulp.dest(paths.dest));

const transpileServerJs = () =>
  gulp
    .src(paths.serverJs.src, { base: '.', since: gulp.lastRun(transpileServerJs) })
    .pipe(babel(babelConfig.server))
    .pipe(gulp.dest(paths.dest));

const transpileClientJs = () =>
  gulp
    .src(paths.client.src, { base: '.', since: gulp.lastRun(transpileClientJs) })
    .pipe(babel(babelConfig.server))
    .pipe(gulp.dest(paths.dest));

const compiler = webpack(webpackConfig);
const startWebpack = done => {
  compiler.hooks.compile.tap('?', async () => compileActor.send(events.WEBPACK_START));
  compiler.hooks.done.tap('?', async () => compileActor.send(events.WEBPACK_FINISH));
  compiler.watch({}, () => done());
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
  gulp.watch(paths.public.src, wrapSeries(copyPublicDev, restartServer));
  gulp.watch(paths.serverJs.src, wrapSeries(transpileServerJs, restartServer));
  gulp.watch(paths.client.src, wrapSeries(transpileClientJs, restartServer));
  gulp.watch(paths.cssModules.src, wrapSeries(copyCssModules, restartServer));

  trackChangesInDist();
};

export const dev = wrapSeries(
  parallel(clean, startLrServer),
  parallel(copyPublicDev, copyCssModules, transpileServerJs, transpileClientJs),
  parallel(startWebpack, startServer),
  watch
);

export const build = series(
  clean,
  parallel(copyPublic, copyCssModules, transpileServerJs, transpileClientJs, bundleClient)
);
