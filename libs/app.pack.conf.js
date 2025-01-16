module.exports = {
  externals: [
    {
      '@akashaorg/core-sdk': '@akashaorg/core-sdk',
    },
    {
      '@akashaorg/ui-core-hooks': '@akashaorg/ui-core-hooks',
    },
    {
      'single-spa': 'single-spa',
    },
    {
      'single-spa-react': 'single-spa-react',
    },
    function ({ request }, callback) {
      if (/^rxjs\/operators$/.test(request)) {
        return callback(null, ['rxjs', 'operators'], 'root');
      }
      if (/^rxjs$/.test(request)) {
        return callback(null, 'rxjs', 'root');
      }
      if (/^react-dom$/.test(request)) {
        return callback(null, 'ReactDOM', 'root');
      }

      if (/^react$/.test(request)) {
        return callback(null, 'React', 'root');
      }

      if (/^@tanstack\/react-query$/.test(request)) {
        return callback(null, 'ReactQuery', 'root');
      }
      if (/^@twind\/core$/.test(request)) {
        return callback(null, 'twind', 'root');
      }
      if (/^systemjs$/.test(request)) {
        return callback(null, 'System', 'root');
      }

      callback();
    },
  ],
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'named',
    splitChunks: {
      chunks: 'async',
      minSize: 69000,
      minChunks: 2,
    },
  },
};
