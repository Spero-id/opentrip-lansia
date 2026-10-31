import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { pushMock, refreshMock, signInEmailMock, signInSocialMock, signUpEmailMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    refreshMock: vi.fn(),
    signInEmailMock: vi.fn(),
    signInSocialMock: vi.fn(),
    signUpEmailMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/auth/client", () => ({
  signIn: { email: signInEmailMock, social: signInSocialMock },
  signUp: { email: signUpEmailMock },
}));

import LoginForm from "@/app/(auth)/login/login-form";
import RegisterForm from "@/app/(auth)/register/register-form";

function setUrl(path: string) {
  window.history.pushState({}, "", path);
}

async function clickSubmit(
  user: ReturnType<typeof userEvent.setup>,
  name: "Masuk" | "Daftar"
) {
  await user.click(screen.getByRole("button", { name }));
}

beforeEach(() => {
  vi.clearAllMocks();
  setUrl("/login");
});

afterEach(() => {
  setUrl("/");
});

describe("LoginForm validasi", () => {
  it("menampilkan pesan error per-field saat submit kosong", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await clickSubmit(user, "Masuk");

    expect(await screen.findByText("Email wajib diisi")).toBeTruthy();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeTruthy();
    expect(signInEmailMock).not.toHaveBeenCalled();
  });

  it("menolak format email tidak valid tanpa memanggil signIn", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "budi-at-example");
    await clickSubmit(user, "Masuk");

    expect(await screen.findByText("Email tidak valid")).toBeTruthy();
    expect(signInEmailMock).not.toHaveBeenCalled();
  });

  it("memanggil signIn.email dan redirect setelah login valid", async () => {
    signInEmailMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Masuk");

    await waitFor(() => {
      expect(signInEmailMock).toHaveBeenCalledWith({
        email: "budi@example.com",
        password: "rahasia123",
        rememberMe: true,
      });
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("mengirim rememberMe=false setelah checkbox Ingat saya di-centang ulang", async () => {
    signInEmailMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("checkbox", { name: "Ingat saya" }));

    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Masuk");

    await waitFor(() => {
      expect(signInEmailMock).toHaveBeenCalledWith({
        email: "budi@example.com",
        password: "rahasia123",
        rememberMe: false,
      });
    });
  });

  it("menampilkan pesan server saat login gagal", async () => {
    signInEmailMock.mockResolvedValue({
      error: { message: "Email atau password salah" },
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "salah");
    await clickSubmit(user, "Masuk");

    expect(
      await screen.findByText("Email atau password salah")
    ).toBeTruthy();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("link daftar polos saat tidak ada query redirect", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("link", { name: "Daftar di sini" }).getAttribute("href")
    ).toBe("/register");
  });

  it("meneruskan redirect ?redirect=/trips ke link daftar dan hasil login", async () => {
    signInEmailMock.mockResolvedValue({ error: null });
    setUrl("/login?redirect=%2Ftrips");
    const user = userEvent.setup();
    render(<LoginForm />);

    const daftarLink = screen.getByRole("link", { name: "Daftar di sini" });
    expect(daftarLink.getAttribute("href")).toBe("/register?redirect=%2Ftrips");

    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Masuk");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/trips");
    });
  });

  it("mengarahkan redirect tidak aman (//evil.com) ke beranda", async () => {
    signInEmailMock.mockResolvedValue({ error: null });
    setUrl("/login?redirect=%2F%2Fevil.com");
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(
      screen.getByRole("link", { name: "Daftar di sini" }).getAttribute("href")
    ).toBe("/register");

    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Masuk");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("mengarahkan redirect backslash (/%5Cevil.com) ke beranda", async () => {
    signInEmailMock.mockResolvedValue({ error: null });
    setUrl("/login?redirect=%2F%5Cevil.com");
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(
      screen.getByRole("link", { name: "Daftar di sini" }).getAttribute("href")
    ).toBe("/register");

    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Masuk");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("memanggil signIn.social saat klik Masuk dengan Google", async () => {
    signInSocialMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Masuk dengan Google" }));

    expect(signInSocialMock).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/",
    });
  });
});

describe("RegisterForm validasi", () => {
  beforeEach(() => {
    setUrl("/register");
  });

  it("menampilkan pesan error per-field saat submit kosong", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await clickSubmit(user, "Daftar");

    expect(await screen.findByText("Nama lengkap wajib diisi")).toBeTruthy();
    expect(screen.getByText("Email wajib diisi")).toBeTruthy();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeTruthy();
    expect(signUpEmailMock).not.toHaveBeenCalled();
  });

  it("tidak menampilkan error saat mengetik sebelum submit", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Email"), "bukan-email");
    await user.type(screen.getByLabelText("Kata Sandi"), "pendek");

    expect(screen.queryByText("Email tidak valid")).toBeNull();
    expect(screen.queryByText("Kata sandi minimal 8 karakter")).toBeNull();
    expect(signUpEmailMock).not.toHaveBeenCalled();
  });

  it("menghilangkan error satu field saat diketik setelah submit gagal", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await clickSubmit(user, "Daftar");
    expect(await screen.findByText("Email wajib diisi")).toBeTruthy();

    await user.type(screen.getByLabelText("Email"), "x");

    expect(screen.queryByText("Email wajib diisi")).toBeNull();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeTruthy();
  });

  it("menolak password kurang dari 8 karakter", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Nama Lengkap"), "Budi Santoso");
    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "pendek");
    await clickSubmit(user, "Daftar");

    expect(
      await screen.findByText("Kata sandi minimal 8 karakter")
    ).toBeTruthy();
    expect(signUpEmailMock).not.toHaveBeenCalled();
  });

  it("memanggil signUp.email dengan data form dan redirect setelah valid", async () => {
    signUpEmailMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Nama Lengkap"), "Budi Santoso");
    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Daftar");

    await waitFor(() => {
      expect(signUpEmailMock).toHaveBeenCalledWith({
        name: "Budi Santoso",
        email: "budi@example.com",
        password: "rahasia123",
      });
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("menampilkan pesan server saat registrasi gagal", async () => {
    signUpEmailMock.mockResolvedValue({
      error: { message: "Email sudah terdaftar" },
    });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Nama Lengkap"), "Budi Santoso");
    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Daftar");

    expect(await screen.findByText("Email sudah terdaftar")).toBeTruthy();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("menolak redirect /admin dari query string", async () => {
    signUpEmailMock.mockResolvedValue({ error: null });
    setUrl("/register?redirect=%2Fadmin");
    const user = userEvent.setup();
    render(<RegisterForm />);

    expect(
      screen.getByRole("link", { name: "Masuk di sini" }).getAttribute("href")
    ).toBe("/login");

    await user.type(screen.getByLabelText("Nama Lengkap"), "Budi Santoso");
    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Daftar");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("meneruskan redirect ke link masuk dan hasil registrasi", async () => {
    signUpEmailMock.mockResolvedValue({ error: null });
    setUrl("/register?redirect=%2Ftrips");
    const user = userEvent.setup();
    render(<RegisterForm />);

    expect(
      screen.getByRole("link", { name: "Masuk di sini" }).getAttribute("href")
    ).toBe("/login?redirect=%2Ftrips");

    await user.type(screen.getByLabelText("Nama Lengkap"), "Budi Santoso");
    await user.type(screen.getByLabelText("Email"), "budi@example.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "rahasia123");
    await clickSubmit(user, "Daftar");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/trips");
    });
  });

  it("link masuk polos saat tidak ada query redirect", () => {
    render(<RegisterForm />);

    expect(
      screen.getByRole("link", { name: "Masuk di sini" }).getAttribute("href")
    ).toBe("/login");
  });

  it("memanggil signIn.social saat klik Daftar dengan Google", async () => {
    signInSocialMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Daftar dengan Google" }));

    expect(signInSocialMock).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/",
    });
  });
});

