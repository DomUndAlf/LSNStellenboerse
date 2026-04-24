import type { Config } from "jest";
import { TextEncoder, TextDecoder } from "text-encoding";

declare global {
  interface IGlobal {
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
  }
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const CONFIG: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: "../",
  setupFiles: ["<rootDir>/Config/jest.setup.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/Tests/.*|(\\.|/)(test|spec|unit))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coverageDirectory: "<rootDir>/Tests/coverage",
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.{ts,tsx}"],
  coverageReporters: ["json", "lcov", "text", "clover"],
  setupFilesAfterEnv: ["<rootDir>/Config/setupTests.ts"],
  coveragePathIgnorePatterns: ["./Config/*", "App.tsx", "index.tsx", "reportWebVitals.ts", "i18n"],
};

export default CONFIG;
