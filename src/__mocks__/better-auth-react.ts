export function createAuthClient(config: Record<string, unknown>) {
  return {
    signIn: { email: jest.fn() },
    signUp: { email: jest.fn() },
    signOut: jest.fn(),
    useSession: jest.fn(() => ({ data: null, isPending: false })),
    getSession: jest.fn(),
  };
}
