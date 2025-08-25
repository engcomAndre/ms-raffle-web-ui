module.exports = {
  // Configuração para NYC (equivalente ao JaCoCo)
  nyc: {
    extends: '@istanbuljs/nyc-config-typescript',
    all: true,
    check-coverage: true,
    reporter: [
      'text',
      'text-summary',
      'html',
      'lcov',
      'json',
      'cobertura'
    ],
    exclude: [
      'coverage/**',
      'packages/*/test/**',
      'test/**',
      'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
      '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
      '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
      '**/__tests__/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.{js,cjs,mjs,ts,tsx,jsx}',
      '**/.{eslint,mocha,babel,nyc}.js',
      '**/{main,index}.{js,cjs,mjs,ts,tsx,jsx}',
      '**/*.d.ts',
      '**/*.config.js',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**'
    ],
    include: [
      'src/**/*.{js,jsx,ts,tsx}'
    ],
    branches: 70,
    lines: 70,
    functions: 70,
    statements: 70
  },
  
  // Configuração para Jest
  jest: {
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.stories.{js,jsx,ts,tsx}',
      '!src/**/__tests__/**',
      '!src/**/*.test.{js,jsx,ts,tsx}',
      '!src/**/*.spec.{js,jsx,ts,tsx}',
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    coverageReporters: [
      'text',
      'text-summary',
      'html',
      'lcov',
      'json',
      'cobertura'
    ],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8'
  },
  
  // Configuração para SonarQube
  sonar: {
    projectKey: 'ms-raffle-web-ui',
    projectName: 'MS Raffle Web UI',
    projectVersion: '1.0.0',
    sources: 'src',
    tests: 'src/__tests__',
    testInclusions: 'src/__tests__/**/*',
    coverageExclusions: 'src/**/*.test.ts,src/**/*.test.tsx,src/**/*.spec.ts,src/**/*.spec.tsx,src/__tests__/**',
    language: 'js,ts',
    typescriptTsconfigPath: 'tsconfig.json',
    exclusions: '**/node_modules/**,**/dist/**,**/build/**,**/.next/**,**/coverage/**,**/*.d.ts'
  }
}
