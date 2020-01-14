const ns = 'ui-widget-topbar';

module.exports = {
  useKeysAsDefaultValue: true,
  defaultNamespace: ns,
  output: '../../../locales/$LOCALE/$NAMESPACE.json',
  input: './src/components/**/*.{ts,tsx}',
  locales: ['en'],
  verbose: true,
};
