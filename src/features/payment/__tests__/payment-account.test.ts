import { describe, expect, it } from "vitest";
import {
  availableMethods,
  findAccountByMethod,
  isCompleteAccount,
  resolveActiveMethod,
  type PaymentAccountLike,
} from "@/features/payment/payment-account";

const complete: PaymentAccountLike = {
  method: "BCA",
  bankName: "Bank BCA",
  accountNumber: "6802082513",
  accountHolder: "PT. SINERGI INOVASI KARYA",
};

describe("isCompleteAccount", () => {
  it("accepts a fully populated account", () => {
    expect(isCompleteAccount(complete)).toBe(true);
  });

  it("rejects empty or whitespace-only account numbers (reported case)", () => {
    expect(isCompleteAccount({ ...complete, accountNumber: "" })).toBe(false);
    expect(isCompleteAccount({ ...complete, accountNumber: "   " })).toBe(false);
  });

  it("rejects an empty bank name or account holder", () => {
    expect(isCompleteAccount({ ...complete, bankName: "" })).toBe(false);
    expect(isCompleteAccount({ ...complete, accountHolder: " " })).toBe(false);
  });

  it("rejects null, undefined, and row-less objects", () => {
    expect(isCompleteAccount(null)).toBe(false);
    expect(isCompleteAccount(undefined)).toBe(false);
    expect(isCompleteAccount({ method: "BCA" })).toBe(false);
  });
});

describe("findAccountByMethod", () => {
  it("matches case-insensitively and ignores padding", () => {
    const accounts = [{ ...complete, method: "BCA" }];
    expect(findAccountByMethod(accounts, "bca")).not.toBeNull();
    expect(findAccountByMethod(accounts, " BCA ")).not.toBeNull();
    expect(findAccountByMethod(accounts, "BCA")).not.toBeNull();
  });

  it("returns null for missing rows or non-array input", () => {
    expect(findAccountByMethod([], "BCA")).toBeNull();
    expect(findAccountByMethod(null, "BCA")).toBeNull();
    expect(findAccountByMethod(undefined, "BCA")).toBeNull();
  });
});

describe("availableMethods", () => {
  it("stays undecided only while accounts are still loading", () => {
    expect(availableMethods([], "loading")).toBeNull();
  });

  it("fails closed on fetch error: QRIS only, BCA hidden", () => {
    expect(availableMethods([], "error")).toEqual(["QRIS"]);
    expect(
      availableMethods(
        [{ method: "BCA", bankName: "Bank BCA", accountNumber: "123", accountHolder: "A" }],
        "error"
      )
    ).toEqual(["QRIS"]);
  });

  it("hides BCA when the account row is missing", () => {
    expect(availableMethods([], "ready")).toEqual(["QRIS"]);
  });

  it("hides BCA when its account number is blank", () => {
    const accounts = [{ ...complete, accountNumber: "" }];
    expect(availableMethods(accounts, "ready")).toEqual(["QRIS"]);
  });

  it("shows BCA for a complete account and always keeps QRIS", () => {
    expect(availableMethods([complete], "ready")).toEqual(["BCA", "QRIS"]);
  });
});

describe("resolveActiveMethod", () => {
  it("keeps a selection that is still visible", () => {
    expect(resolveActiveMethod("BCA", ["BCA", "QRIS"])).toBe("BCA");
    expect(resolveActiveMethod("QRIS", ["QRIS", "BCA"])).toBe("QRIS");
  });

  it("moves a hidden selection (default BCA) to the first visible method", () => {
    expect(resolveActiveMethod("BCA", ["QRIS"])).toBe("QRIS");
  });

  it("makes no decision while the method list is unknown", () => {
    expect(resolveActiveMethod("BCA", null)).toBe("BCA");
    expect(resolveActiveMethod(null, [])).toBeNull();
  });
});
