import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import webpack from 'webpack';
import babelConfig from './babelconfig.js';
import { dirname, generateScopedName } from './lib/devUtils.js';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';

const isProduction = process.env.NODE_ENV === 'production';
const __dirname = dirname(import.meta.url);

const common = {
  entry: {
    index: path.resolve(__dirname, 'client/main/index.tsx'),
  },
  output: {
    filename: isProduction ? 'js/[name].[contenthash:6].js' : 'js/[name].js',
    path: path.resolve(__dirname, 'dist/public'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.ts', '.tsx', '.js'],
    },
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
          MiniCssExtractPlugin.loader,
          { loader: 'css-modules-typescript-loader' },
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
    new MiniCssExtractPlugin({
      filename: isProduction ? 'css/index.[contenthash:6].css' : 'css/index.css',
    }),
    new webpack.DefinePlugin({ __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })' }),
  ],
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/](react|react-dom|lodash.*|formik|@redux.*|axios)[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  stats: { warnings: false, children: false, modules: false },
};

let config;
if (process.env.ANALYZE) {
  const plugins = [new BundleAnalyzerPlugin()].concat(common.plugins);
  config = {
    ...common,
    mode: 'production',
    plugins,
  };
} else if (isProduction) {
  const plugins = [new WebpackManifestPlugin({ publicPath: '/' })].concat(common.plugins);
  config = {
    ...common,
    mode: 'production',
    plugins,
  };
} else {
  common.entry.index = ['blunt-livereload/dist/frontClient', common.entry.index];
  config = {
    ...common,
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
  };
}

export default config;
