import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  clearMocks: true,
};

export default config;