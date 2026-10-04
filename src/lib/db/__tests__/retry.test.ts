// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  RETRY_DELAYS_MS,
  isReadOnlyCall,
  isTransientError,
} from "@/lib/db/retry";

describe("isReadOnlyCall", () => {
  it("mengenali select sebagai read-only", () => {
    expect(isReadOnlyCall(["select * from trips"])).toBe(true);
    expect(isReadOnlyCall(["  SELECT id FROM trips"])).toBe(true);
    expect(isReadOnlyCall(["\n\tselect 1"])).toBe(true);
  });

  it("menolak perintah tulis", () => {
    expect(isReadOnlyCall(["insert into trips values (1)"])).toBe(false);
    expect(isReadOnlyCall(["update trips set title = 'x'"])).toBe(false);
    expect(isReadOnlyCall(["delete from trips"])).toBe(false);
    expect(isReadOnlyCall(["truncate trips"])).toBe(false);
  });

  it("mengenali batch yang seluruhnya select", () => {
    expect(isReadOnlyCall([["select 1", "select 2"]])).toBe(true);
  });

  it("menolak batch yang memuat satu saja perintah tulis", () => {
    expect(isReadOnlyCall([["select 1", "update trips set title = 'x'"]])).toBe(
      false,
    );
  });

  it("menolak batch kosong", () => {
    expect(isReadOnlyCall([[]])).toBe(false);
  });

  it("menolak argumen yang bukan string atau array", () => {
    expect(isReadOnlyCall([])).toBe(false);
    expect(isReadOnlyCall([{ sql: "select 1" }])).toBe(false);
    expect(isReadOnlyCall([42])).toBe(false);
  });
});

describe("isTransientError", () => {
  it("mengenali error koneksi database", () => {
    expect(isTransientError(new Error("Error connecting to database: x"))).toBe(
      true,
    );
  });

  it("mengenali error server 5xx dan 429", () => {
    expect(
      isTransientError(new Error("Server error (HTTP status 503)")),
    ).toBe(true);
    expect(
      isTransientError(new Error("Server error (HTTP status 429)")),
    ).toBe(true);
  });

  it("mengenali failed query", () => {
    expect(isTransientError(new Error("Failed query: select 1"))).toBe(true);
  });

  it("menolak error lain dan nilai non-Error", () => {
    expect(isTransientError(new Error("permission denied"))).toBe(false);
    expect(isTransientError("Error connecting to database: x")).toBe(true);
    expect(isTransientError(undefined)).toBe(false);
  });
});

describe("RETRY_DELAYS_MS", () => {
  it("ter urinary dan naik", () => {
    expect(RETRY_DELAYS_MS.length).toBeGreaterThan(0);
    for (let i = 1; i < RETRY_DELAYS_MS.length; i++) {
      expect(RETRY_DELAYS_MS[i]).toBeGreaterThan(RETRY_DELAYS_MS[i - 1]);
    }
  });
});