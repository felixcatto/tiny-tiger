/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testPathIgnorePatterns: ['fixtures'],
  setupFiles: ['./__tests__/fixtures/envSetup'],
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};
