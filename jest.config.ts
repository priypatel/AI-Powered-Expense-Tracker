import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "unit",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["<rootDir>/src/__tests__/unit/**/*.test.ts"],
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: { strict: true } }] },
    },
    {
      displayName: "integration",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["<rootDir>/src/__tests__/integration/**/*.test.ts"],
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: { strict: true } }] },
    },
    {
      displayName: "components",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/src/__tests__/components/**/*.test.tsx"],
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: { strict: true, jsx: "react-jsx" } }] },
      setupFilesAfterEnv: ["@testing-library/jest-dom"],
    },
  ],
};

export default config;
