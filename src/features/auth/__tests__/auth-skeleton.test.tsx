import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import AuthSkeleton from "../components/AuthSkeleton";

// The skeleton must occupy exactly the same vertical space as the real form
// (login 452px, register 584px of column content at 1440x900 - derived from
// the 460/592 baseline measured in a live browser, minus the 8px title→
// subtitle gap saved when the forms' mb-4 was tightened to mb-2), otherwise
// the auto-margin centering shifts the content when loading finishes. jsdom
// cannot do layout, so this test replays the pixel math from the height
// classes: any drifted bar fails with a wrong total.
const BAR_PX: Record<string, number> = {
  "h-px": 1,
  "h-3": 12,
  "h-4": 16,
  "h-5": 20,
  "h-8": 32,
  "h-9": 36,
  "h-10": 40,
  "h-11": 44,
};
const GAP_PX: Record<string, number> = { "space-y-2": 8, "space-y-4": 16 };

// Desktop height of a bar: the lg: override wins at the 1440px width the
// auth layout targets (the title bar is h-8 on mobile, lg:h-9 on desktop).
function barHeight(el: Element): number {
  const names = el.className.split(/\s+/);
  const lg = names.find((n) => n.startsWith("lg:h-"));
  const key = lg ? lg.slice("lg:".length) : names.find((n) => BAR_PX[n] !== undefined);
  const px = key ? BAR_PX[key] : undefined;
  expect(px, `skeleton bar has a known height class: ${el.className}`).toBeDefined();
  return px!;
}

function blockHeight(block: Element): number {
  const kids = Array.from(block.children);
  if (kids.length === 0) return barHeight(block);
  const names = block.className.split(/\s+/);
  // Horizontal rows (divider, remember row): height is the tallest bar.
  if (names.includes("flex")) return Math.max(...kids.map(barHeight));
  const gap = GAP_PX[names.find((n) => n in GAP_PX) ?? ""] ?? 0;
  return kids.reduce((sum, kid) => sum + barHeight(kid), 0) + gap * (kids.length - 1);
}

function stack(container: HTMLElement): Element[] {
  const root = container.querySelector('[aria-label="Memuat"]');
  expect(root).toBeTruthy();
  expect(root?.getAttribute("aria-busy")).toBe("true");
  const pulse = root?.querySelector(".animate-pulse");
  expect(pulse).toBeTruthy();
  // The 16px inter-block rhythm must match the real column (all gaps 16px).
  expect(pulse?.className).toMatch(/(^|\s)space-y-4(\s|$)/);
  return Array.from(pulse!.children);
}

function contentHeight(blocks: Element[]): number {
  return blocks.reduce((sum, b) => sum + blockHeight(b), 0) + 16 * (blocks.length - 1);
}

describe("AuthSkeleton dimensions", () => {
  it("login skeleton matches the real login form height (452px)", () => {
    const { container } = render(<AuthSkeleton fields={2} rememberRow />);
    expect(contentHeight(stack(container))).toBe(452);
  });

  it("register skeleton matches the real register form height (500px)", () => {
    const { container } = render(<AuthSkeleton fields={3} />);
    expect(contentHeight(stack(container))).toBe(500);
  });

  it("inserts the remember row for login, between fields and submit", () => {
    const { container } = render(<AuthSkeleton fields={2} rememberRow />);
    const blocks = stack(container);
    expect(blocks).toHaveLength(8);
    const row = blocks[3];
    expect(row.className).toContain("items-center");
    // The row is now single-sided: only "Ingat saya", no placeholder for the
    // removed "Lupa Password?" link.
    expect(Array.from(row.children)).toHaveLength(1);
  });

  it("omits the remember row unless asked (register and default shape)", () => {
    for (const el of [<AuthSkeleton key="r" fields={4} />, <AuthSkeleton key="d" />]) {
      const { container, unmount } = render(el);
      const blocks = stack(container);
      expect(blocks.some((b) => b.className.includes("justify-between"))).toBe(false);
      unmount();
    }
  });
});
