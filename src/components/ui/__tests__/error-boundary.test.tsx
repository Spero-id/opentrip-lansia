import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function Exploding(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("renders children when healthy", () => {
    render(
      <ErrorBoundary>
        <p>sehat</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("sehat")).toBeDefined();
  });

  it("renders fallback when child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Exploding />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Bagian ini gagal dimuat.")).toBeDefined();
    vi.restoreAllMocks();
  });

  it("renders custom fallback", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>kustom</p>}>
        <Exploding />
      </ErrorBoundary>,
    );
    expect(screen.getByText("kustom")).toBeDefined();
    vi.restoreAllMocks();
  });
});
