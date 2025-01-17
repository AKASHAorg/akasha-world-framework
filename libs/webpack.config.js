/* eslint-disable */
const webpack = require('webpack');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const commons = require('./app.pack.conf');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const CopyPlugin = require('copy-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';

const outputMainFile = 'index.js';
const exp = {
  entry: './src/index',
  mode: process.env.NODE_ENV || 'development',
  target: ['web', 'es2017'],
  module: {
    rules: [
      { test: /\.ts(x)?$/, use: 'ts-loader' },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  },
  output: {
    libraryTarget: 'system',
    publicPath: 'auto',
    filename: outputMainFile,
    crossOriginLoading: 'anonymous',
    clean: true,
  },
  plugins: [
    // new CleanWebpackPlugin({
    //   verbose: true,
    //   dry: false,
    //   dangerouslyAllowCleanPatternsOutsideProject: process.env.NODE_ENV !== 'production',
    // }),
    new WebpackManifestPlugin({
      generate: (seed, files, entries) => {
        const packageJson = require(path.join(process.cwd(), './package.json'));
        let displayName;
        if (packageJson.hasOwnProperty('akasha') && packageJson.akasha.displayName) {
          displayName = packageJson.akasha.displayName;
        }
        return {
          displayName,
          name: packageJson.name,
          mainFile: outputMainFile,
          license: packageJson.license,
          description: packageJson.description,
          keywords: packageJson.keywords || [],
        };
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '*.md',
          context: process.cwd(),
        },
      ],
    }),
    new Dotenv({
      path: path.resolve(__dirname, '../.env'),
      safe:
        process.env.NODE_ENV === 'production' ? path.resolve(__dirname, '../.env.example') : false,
      systemvars: true,
    }),
    new webpack.DefinePlugin({
      __DEV__: !isProduction,
      'globalThis.__DEV__': !isProduction,
    }),
    new webpack.AutomaticPrefetchPlugin(),
    new SubresourceIntegrityPlugin({
      enabled: false,
    }),
    new WebpackAssetsManifest({
      integrity: true,
    }),
    // new webpack.ProgressPlugin({
    //   entries: false,
    //   modules: true,
    //   modulesCount: 10,
    //   profile: true,
    // }),
  ],
  devtool: isProduction ? undefined : 'eval-source-map',
  externals: commons.externals,
  optimization: commons.optimization,
};

module.exports = exp;
