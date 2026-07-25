/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@neondatabase/serverless$": "<rootDir>/src/__mocks__/neondatabase-serverless.ts",
    "^better-auth$": "<rootDir>/src/__mocks__/better-auth.ts",
    "^better-auth/adapters/drizzle$": "<rootDir>/src/__mocks__/better-auth-drizzle-adapter.ts",
    "^better-auth/next-js$": "<rootDir>/src/__mocks__/better-auth-next-js.ts",
    "^better-auth/react$": "<rootDir>/src/__mocks__/better-auth-react.ts",
    "^next/server$": "<rootDir>/src/__mocks__/next-server.ts",
    "^next/navigation$": "<rootDir>/src/__mocks__/next-navigation.ts",
    "^next/headers$": "<rootDir>/src/__mocks__/next-headers.ts",
    "\\.css$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "identity-obj-proxy",
  },
  setupFiles: [],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  transformIgnorePatterns: [
    "/node_modules/(?!(lucide-react|better-auth)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
