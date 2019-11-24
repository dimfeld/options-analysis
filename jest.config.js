module.exports = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['jest-extended'],
  transform: {
    '\\.[j|t]s$': 'babel-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
