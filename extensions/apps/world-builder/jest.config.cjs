const baseConfig = require('../../../jest.config.base');

module.exports = Object.assign(baseConfig, {
  automock: false,
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?|ts?)$',
  testEnvironment: 'jsdom',
});
