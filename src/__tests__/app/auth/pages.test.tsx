import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/auth/login/page";
import RegisterPage from "@/app/auth/register/page";

// Mock useRouter
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => "/auth/login",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Login Page", () => {
  it("renders login form", async () => {
    render(await LoginPage());
    expect(screen.getByText("Selamat Datang Kembali!")).toBeInTheDocument();
  });

  it("renders email input", async () => {
    render(await LoginPage());
    expect(screen.getByPlaceholderText("Masukkan email kamu")).toBeInTheDocument();
  });

  it("renders password input", async () => {
    render(await LoginPage());
    expect(screen.getByPlaceholderText("Masukkan password kamu")).toBeInTheDocument();
  });

  it("renders login button", async () => {
    render(await LoginPage());
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders register link", async () => {
    render(await LoginPage());
    expect(screen.getByText("Daftar di sini")).toBeInTheDocument();
  });

  it("renders forgot password link", async () => {
    render(await LoginPage());
    expect(screen.getByText("Lupa Password?")).toBeInTheDocument();
  });
});

describe("Register Page", () => {
  it("renders register form", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Buat Akun Baru")).toBeInTheDocument();
  });

  it("renders all input fields", () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText("Masukkan nama lengkap kamu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Masukkan email kamu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buat password aman")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Daftar Sekarang")).toBeInTheDocument();
  });

  it("renders login link", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Masuk di sini")).toBeInTheDocument();
  });

  it("submits form and redirects", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const { signUp } = require("@/lib/auth-client");
    signUp.email.mockResolvedValue({ data: { user: { id: "1" } }, error: null });

    await user.type(screen.getByPlaceholderText("Masukkan nama lengkap kamu"), "Test User");
    await user.type(screen.getByPlaceholderText("Masukkan email kamu"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Buat password aman"), "password123");
    await user.click(screen.getByText("Daftar Sekarang"));

    expect(signUp.email).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123",
      name: "Test User",
    });
    expect(mockPush).toHaveBeenCalledWith("/trips");
  });
});
