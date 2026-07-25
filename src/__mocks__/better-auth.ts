export function betterAuth(config: Record<string, unknown>) {
  return {
    api: {
      getSession: jest.fn(),
      signInEmail: jest.fn(),
      signUpEmail: jest.fn(),
      signOut: jest.fn(),
    },
    handler: jest.fn(),
  };
}
