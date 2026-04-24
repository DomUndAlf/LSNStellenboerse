import type { Config } from "jest";

const CONFIG: Config = {
  verbose: true,
  preset: "ts-jest",
  rootDir: "../",
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coverageDirectory: "<rootDir>/Tests/coverage",
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{ts,tsx}"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  coveragePathIgnorePatterns: ["./Config/*", "./validationServer"],
};

export default CONFIG;
