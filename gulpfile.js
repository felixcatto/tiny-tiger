import { spawn } from 'child_process';
import { deleteAsync } from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import waitOn from 'wait-on';
import babelConfig from './babelconfig.js';

const { series } = gulp;

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
    .pipe(babel(babelConfig.server))
    .pipe(gulp.dest(paths.dest));

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

export const dev = series(clean, transpileServerJs, startServer, watch);

export const build = transpileServerJs;
