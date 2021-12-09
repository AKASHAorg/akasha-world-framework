// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const name = require('./package.json').name;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Dotenv = require('dotenv-webpack');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { InjectManifest } = require('workbox-webpack-plugin');

const config = {
  entry: './src/index.ts',
  context: path.resolve(__dirname),
  module: {
    rules: [
      { test: /\.ts(x)?$/, loader: 'ts-loader' },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '*.mjs'],
    alias: {
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
    },
    fallback: {
      os: false,
      crypto: false,
      http: false,
      https: false,
      dns: false,
      fs: false,
      assert: require.resolve('assert/'),
      path: require.resolve('path-browserify/'),
      stream: require.resolve('stream-browserify/'),
      util: require.resolve('util/'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'akasha.sdk.js',
    library: 'awfSDK',
    libraryTarget: 'umd',
    publicPath: '/',
  },
  target: ['web', 'es2020'],
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'named',
    splitChunks: {
      chunks: 'all',
      minSize: 69000,
      minChunks: 2,
    },
  },
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '../.env'),
      safe:
        process.env.NODE_ENV === 'production' ? path.resolve(__dirname, '../.env.example') : false,
      systemvars: true,
    }),
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production',
    }),
    new webpack.ProgressPlugin({
      entries: true,
      modules: true,
      modulesCount: 100,
      profile: true,
    }),
    new webpack.AutomaticPrefetchPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: ['process'],
    }),
    new InjectManifest({
      swSrc: './src/sw.js',
      swDest: 'sw.js',
      exclude: [/.*?/],
    }),
  ],
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
  mode: process.env.NODE_ENV || 'development',
  externals: [
    function ({ request }, callback) {
      if (/^rxjs\/operators$/.test(request)) {
        return callback(null, ['rxjs', 'operators'], 'root');
      }
      if (/^rxjs$/.test(request)) {
        return callback(null, 'rxjs', 'root');
      }
      if (/^single-spa-react$/.test(request)) {
        return callback(null, 'singleSpaReact', 'root');
      }
      if (/^single-spa$/.test(request)) {
        return callback(null, 'singleSpa', 'root');
      }
      callback();
    },
  ],
};

module.exports = config;
