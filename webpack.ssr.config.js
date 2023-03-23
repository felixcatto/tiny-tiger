import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import webpack from 'webpack';
import babelConfig from './babelconfig.js';
import { dirname, generateScopedName } from './lib/devUtils.js';

const isProduction = process.env.NODE_ENV === 'production';
const __dirname = dirname(import.meta.url);

const common = {
  entry: { appSSR: path.resolve(__dirname, 'client/main/appSSR.tsx') },
  experiments: { outputModule: true },
  output: {
    library: { type: 'module' },
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist/public'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    extensionAlias: { '.js': ['.ts', '.tsx', '.js'] },
  },
  module: {
    rules: [
      {
        test: /(\.js$|\.ts$|\.tsx)/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelConfig.client,
        },
      },
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader, options: { emit: false } },
          {
            loader: 'css-loader',
            options: {
              url: false,
              modules: {
                auto: true,
                getLocalIdent: ({ resourcePath }, _, localName) =>
                  generateScopedName(localName, resourcePath),
              },
            },
          },
          { loader: 'postcss-loader' },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({ __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })' }),
  ],
  stats: { warnings: false, children: false, modules: false },
};

let config;
if (isProduction) {
  config = {
    ...common,
    mode: 'production',
  };
} else {
  config = {
    ...common,
    mode: 'development',
    devtool: false,
  };
}

export default config;
