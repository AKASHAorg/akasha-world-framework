module.exports = {
  externals: [
    {
      '@akashaproject/design-system': '@akashaproject/design-system',
    },
    function ({ context, request }, callback) {
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

      if (/^react-dom$/.test(request)) {
        return callback(null, 'ReactDOM', 'root');
      }

      if (/^react$/.test(request)) {
        return callback(null, 'React', 'root');
      }
      callback();
    },
  ],
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'named',
    splitChunks: {
      chunks: 'all',
      minSize: 69000,
      minChunks: 2,
    },
  },
};
