module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.cjs$': ['babel-jest', { configFile: './babel.config.cjs' }]
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