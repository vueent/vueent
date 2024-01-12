module.exports = {
  rootDir: '.',
  displayName: '@vueent/mix-models',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          warnOnly: true
        }
      }
    ]
  },
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.tsx?$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/types/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@vueent/(.*)': '<rootDir>/../../packages/$1/src',
    '@tests/(.*)': '<rootDir>/../../packages/$1/tests'
  }
};
