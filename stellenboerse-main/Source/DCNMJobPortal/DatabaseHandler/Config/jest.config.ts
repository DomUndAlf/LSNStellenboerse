import type { Config } from "jest";

const CONFIG: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  rootDir: "../",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coverageDirectory: "<rootDir>/Tests/coverage",
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{ts,tsx}"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  coveragePathIgnorePatterns: ["./Config/*", "./Models", "./databaseServer.ts"],
};

export default CONFIG;
