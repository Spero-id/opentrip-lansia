import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/footer";

describe("Footer", () => {
  it("renders footer with copyright", () => {
    render(<Footer />);
    expect(screen.getByText(/Seluruh hak cipta/i)).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Footer />);
    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.getByText("Destinasi")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders contact information", () => {
    render(<Footer />);
    expect(screen.getByText(/halo@opentrip.co.id/)).toBeInTheDocument();
    expect(screen.getByText(/\+62 812 3456 7890/)).toBeInTheDocument();
  });
});
