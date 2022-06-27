/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import {
  dependencies as externals,
  productName,
} from '../../release/app/package.json';
import { getAppVersion } from '../scripts/version';

export default {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      url: false,
      fs: false,
      path: false,
    },
    alias: {
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        VERSION: JSON.stringify(getAppVersion()),
        PRODUCT_NAME: JSON.stringify(productName),
        WS_URL: JSON.stringify(process.env.WS_URL),
      },
    }),
  ],
};
