import crypto from 'crypto';
import path from 'path';
import postcss from 'postcss';
import nested from 'postcss-nested';
import { fileURLToPath } from 'url';
import { createMachine, interpret } from 'xstate';

export const dirname = url => fileURLToPath(path.dirname(url));

export const generateScopedName = (localName, resourcePath) => {
  const getHash = value => crypto.createHash('sha256').update(value).digest('hex');
  const hash = getHash(`${resourcePath}${localName}`).slice(0, 4);
  return `${localName}--${hash}`;
};

export const processPostcss = (cssSource, cssSourceFilePath) => {
  if (!cssSourceFilePath.endsWith('.module.css')) return '';
  return postcss([nested]).process(cssSource, { from: cssSourceFilePath });
};

export const makeEnum = (...args) => args.reduce((acc, key) => ({ ...acc, [key]: key }), {});

export const makeWrapSeries =
  (series, actor) =>
  (...args) =>
    series(
      async () => actor.send(events.GULP_START),
      ...args,
      async () => actor.send(events.GULP_FINISH)
    );

const plStates = makeEnum('gulp', 'webpack');
const states = makeEnum('done', 'compiling');
export const events = makeEnum('GULP_START', 'GULP_FINISH', 'WEBPACK_START', 'WEBPACK_FINISH');

const compileMachine = createMachine({
  type: 'parallel',
  predictableActionArguments: true,
  states: {
    [plStates.gulp]: {
      initial: states.done,
      states: {
        [states.done]: {
          on: { [events.GULP_START]: states.compiling },
        },
        [states.compiling]: {
          on: {
            [events.GULP_FINISH]: [
              {
                target: states.done,
                cond: 'isWebpackDone',
                actions: 'reloadBrowser',
              },
              states.done,
            ],
          },
        },
      },
    },
    [plStates.webpack]: {
      initial: states.done,
      states: {
        [states.done]: {
          on: { [events.WEBPACK_START]: states.compiling },
        },
        [states.compiling]: {
          on: {
            [events.WEBPACK_FINISH]: [
              {
                target: states.done,
                cond: 'isGulpDone',
                actions: 'reloadBrowser',
              },
              states.done,
            ],
          },
        },
      },
    },
  },
});

export const makeCompileActor = reloadBrowser => {
  const options = {
    actions: { reloadBrowser },
    guards: {
      isGulpDone: (_, __, meta) => meta.state.matches(`${plStates.gulp}.${states.done}`),
      isWebpackDone: (_, __, meta) => meta.state.matches(`${plStates.webpack}.${states.done}`),
    },
  };

  return interpret(compileMachine.withConfig(options)).start();
};
