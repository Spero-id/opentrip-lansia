import { POST } from "@/app/api/auth/login/route";
import { authService } from "@/modules/auth/auth.service";

jest.mock("@/modules/auth/auth.service", () => ({
  authService: {
    signIn: jest.fn(),
  },
}));

describe("POST /api/auth/login", () => {
  it("returns auth result on successful login", async () => {
    const result = { user: { id: "1", email: "test@test.com" } };
    (authService.signIn as jest.Mock).mockResolvedValue(result);

    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", password: "password" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data).toEqual(result);
    expect(response.status).toBe(200);
  });

  it("returns 401 on failed login", async () => {
    (authService.signIn as jest.Mock).mockRejectedValue(new Error("Invalid"));

    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", password: "wrong" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data).toEqual({ error: "Email atau password salah" });
    expect(response.status).toBe(401);
  });
});
