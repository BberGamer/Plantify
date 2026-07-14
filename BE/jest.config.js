// jest.config.js - Cấu hình Jest cho Plantify Backend
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/features/**/*.service.js',
    'src/features/**/*.controller.js',
    'src/utils/**/*.js',
    '!src/**/*.model.js',
    '!src/server.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setup.js'],
  globalTeardown: '<rootDir>/tests/teardown.js',
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
