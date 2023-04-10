/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testPathIgnorePatterns: ['fixtures'],
  setupFiles: ['./__tests__/fixtures/envSetup'],

  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^.+\\.module\\.css$': 'identity-obj-proxy',
  },
  transform: { '^.+\\.tsx?$': '@swc/jest' },
};
