/**
 * Jest configuration for ChatModal Testing Suite
 * 
 * This runs comprehensive tests including:
 * - Dialogue mode functionality (prevents avatar echoing)
 * - Component structure and configuration
 * - SSR compatibility checks
 */

module.exports = {
  // Set root directory to project root (one level up from tests/)
  rootDir: '../',
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files (relative to project root)
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  
  // Run ChatModal-related tests
  testMatch: [
    '<rootDir>/tests/**/ChatModal*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/?(*.)ChatModal*.test.{js,jsx,ts,tsx}'
  ],
  
  // Transform files including ES modules
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ]
    }],
  },
  
  // Transform ES modules in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|remark-|unified|bail|is-plain-obj|trough|vfile|unist-|mdast-|micromark|decode-named-character-reference|character-entities|property-information|hast-|space-separated-tokens|comma-separated-tokens|pretty-bytes|web-namespaces|zwitch|html-void-elements|devlop|ccount|escape-string-regexp|longest-streak|markdown-table)/)'
  ],
  
  // Module name mapping for Next.js
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Coverage for critical files
  collectCoverageFrom: [
    'src/components/ChatModal.tsx',
    'src/services/apiService.ts',
    '!src/**/*.d.ts',
  ],
  
  // Coverage thresholds - ensure dialogue mode setup is covered
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/components/ChatModal.tsx': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Verbose output for debugging
  verbose: true,
  
  // Test timeout for async operations
  testTimeout: 10000,
}; 