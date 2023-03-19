import { generateScopedName, processPostcss } from './lib/devUtils.js';

export default {
  client: {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: { browsers: ['last 2 Chrome versions'] },
        },
      ],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
  },
  server: {
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    plugins: [
      [
        '@dr.pogodin/react-css-modules',
        {
          replaceImport: true,
          generateScopedName,
          transform: processPostcss,
        },
      ],
    ],
  },
};
