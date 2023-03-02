import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import babelConfig from './babelconfig.js';
import { dirname } from './lib/utils.js';

const isProduction = process.env.NODE_ENV === 'production';
const __dirname = dirname(import.meta.url);

const common = {
  entry: {
    index: path.resolve(__dirname, 'client/main/index.tsx'),
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist/public'),
  },
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
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
          MiniCssExtractPlugin.loader,
          { loader: 'css-modules-typescript-loader' },
          {
            loader: 'css-loader',
            options: { url: false, modules: { auto: true } },
          },
          { loader: 'postcss-loader' },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/index.css' }),
    new webpack.DefinePlugin({ __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })' }),
  ],
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
  stats: { warnings: false, children: false, modules: false },
};

let config;
if (isProduction) {
  config = {
    ...common,
    mode: 'production',
  };
} else {
  common.entry.index = ['blunt-livereload/dist/client', common.entry.index];
  config = {
    ...common,
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
  };
}

export default config;
