module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.cjs$': 'babel-jest'
  },
  testMatch: [
    "**/__tests__/**/*.cjs",
    "**/?(*.)+(spec|test).cjs"
  ],
  moduleFileExtensions: ['js', 'cjs'],
  transformIgnorePatterns: [
    '/node_modules/'
  ]
} 