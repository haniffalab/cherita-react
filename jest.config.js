module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest', // Transpile JS/JSX with Babel
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js', // Mock static assets
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(polyclip-ts|@uidotdev/usehooks)/)', // Transform ESM dependencies
  ],
  // Coverage options
  collectCoverage: true, // Enable coverage collection
  coverageDirectory: 'coverage', // Directory for storing coverage reports
  coverageReporters: ['lcov', 'text'], // Generate lcov and text coverage reports
  collectCoverageFrom: [
    'src/**/*.{js,jsx}', // Specify files for coverage collection
    '!src/**/*.test.{js,jsx}', // Exclude test files
  ],
};
