module.exports = {
  
  preset: "ts-jest",

  testEnvironment: "node",
  
  maxWorkers: 1, // Run tests serially, not in parallel
  //maxWorkers: '50%',
  
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json"  // <- point to your test tsconfig
    }
  },
  
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  testMatch: ["**/tests/**/*.test.ts"], // optional, matches your test files
  
  roots: ["<rootDir>/src"],

  collectCoverage: true,
  coverageProvider: "v8",

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/index.ts",
    "!src/**/types.ts"
  ],

  coverageDirectory: "coverage",

  coverageReporters: ["text", "html", "lcov"],

  runInBand: true   // ⬅ REQUIRED to avoid segfaults
};
