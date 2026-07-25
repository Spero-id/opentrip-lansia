import { authService } from "@/modules/auth/auth.service";
import { authRepository } from "@/modules/auth/auth.repository";

jest.mock("@/modules/auth/auth.repository", () => ({
  authRepository: {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
  },
}));

const mockAuth = jest.mocked(authService.config);

describe("authService", () => {
  const headers = new Headers();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSession", () => {
    it("returns session from auth api", async () => {
      (mockAuth.api.getSession as jest.Mock).mockResolvedValue({ user: { id: "1" } });
      const result = await authService.getSession(headers);
      expect(result).toEqual({ user: { id: "1" } });
    });
  });

  describe("signIn", () => {
    it("calls signInEmail with credentials", async () => {
      (mockAuth.api.signInEmail as jest.Mock).mockResolvedValue({ user: { id: "1" } });
      const result = await authService.signIn("test@test.com", "password", headers);
      expect(mockAuth.api.signInEmail).toHaveBeenCalledWith({
        body: { email: "test@test.com", password: "password" },
        headers,
      });
      expect(result).toEqual({ user: { id: "1" } });
    });
  });

  describe("signUp", () => {
    it("calls signUpEmail with user data", async () => {
      (mockAuth.api.signUpEmail as jest.Mock).mockResolvedValue({ user: { id: "1" } });
      const result = await authService.signUp("test@test.com", "password", "Test", headers);
      expect(mockAuth.api.signUpEmail).toHaveBeenCalledWith({
        body: { email: "test@test.com", password: "password", name: "Test" },
        headers,
      });
      expect(result).toEqual({ user: { id: "1" } });
    });
  });

  describe("signOut", () => {
    it("calls signOut", async () => {
      (mockAuth.api.signOut as jest.Mock).mockResolvedValue({ success: true });
      const result = await authService.signOut(headers);
      expect(result).toEqual({ success: true });
    });
  });

  describe("getUser", () => {
    it("returns user by id from repository", async () => {
      const user = { id: "1", email: "test@test.com", name: "Test" };
      (authRepository.findById as jest.Mock).mockResolvedValue(user);
      const result = await authService.getUser("1");
      expect(result).toEqual(user);
    });
  });
});
