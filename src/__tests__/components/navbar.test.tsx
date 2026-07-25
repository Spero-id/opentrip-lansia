import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/navbar";

jest.mock("@/lib/auth-client", () => ({
  useSession: jest.fn(() => ({ data: null, isPending: false })),
  signOut: jest.fn(),
}));

describe("Navbar", () => {
  it("renders navigation links", () => {
    render(<Navbar />);
    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.getByText("Destinasi")).toBeInTheDocument();
  });

  it("shows login/register buttons when not authenticated", () => {
    render(<Navbar />);
    expect(screen.getByText("Masuk")).toBeInTheDocument();
    expect(screen.getByText("Daftar")).toBeInTheDocument();
  });

  it("renders brand logo", () => {
    render(<Navbar />);
    const brandLink = screen.getByRole("link", { name: /open/i });
    expect(brandLink).toBeInTheDocument();
  });
});
