import dotenv from "dotenv";
import type { Config } from "jest";

dotenv.config({ path: "../.env" });

const CONFIG: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: "../",
  coverageDirectory: "<rootDir>/Tests/coverage",
  collectCoverage: process.env.INCLUDE_INTEGRATION_TESTS === "true" ? false : true,
  collectCoverageFrom: ["**/*.{ts,tsx}"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    ...(process.env.INCLUDE_INTEGRATION_TESTS === "true"
      ? []
      : ["<rootDir>/Tests/Integration/aiService.integration.test.ts"]),
  ],
  coveragePathIgnorePatterns: ["./Config", "./aiServer", "./Util", "./Tests"],
};

export default CONFIG;
