import { POST } from "@/app/api/auth/register/route";
import { authService } from "@/modules/auth/auth.service";

jest.mock("@/modules/auth/auth.service", () => ({
  authService: {
    signUp: jest.fn(),
  },
}));

describe("POST /api/auth/register", () => {
  it("returns auth result on successful registration", async () => {
    const result = { user: { id: "1", email: "test@test.com", name: "Test" } };
    (authService.signUp as jest.Mock).mockResolvedValue(result);

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName: "Test", email: "test@test.com", password: "password" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data).toEqual(result);
    expect(response.status).toBe(200);
  });

  it("returns 400 on failed registration", async () => {
    (authService.signUp as jest.Mock).mockRejectedValue(new Error("Failed"));

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName: "Test", email: "test@test.com", password: "password" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data).toEqual({ error: "Gagal mendaftar" });
    expect(response.status).toBe(400);
  });
});
