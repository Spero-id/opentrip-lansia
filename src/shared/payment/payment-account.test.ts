import {
  availableMethods,
  findAccountByMethod,
  isCompleteAccount,
  resolveActiveMethod,
  type PaymentAccountLike,
} from "./payment-account";

const complete: PaymentAccountLike = {
  method: "BCA",
  bankName: "Bank BCA",
  accountNumber: "6802082513",
  accountHolder: "PT. SINERGI INOVASI KARYA",
};

describe("isCompleteAccount", () => {
  it("menerima rekening yang lengkap", () => {
    expect(isCompleteAccount(complete)).toBe(true);
  });

  it("menolak nomor rekening kosong / hanya spasi (kasus laporan)", () => {
    expect(isCompleteAccount({ ...complete, accountNumber: "" })).toBe(false);
    expect(isCompleteAccount({ ...complete, accountNumber: "   " })).toBe(false);
  });

  it("menolak bank / pemilik yang kosong", () => {
    expect(isCompleteAccount({ ...complete, bankName: "" })).toBe(false);
    expect(isCompleteAccount({ ...complete, accountHolder: " " })).toBe(false);
  });

  it("menolak null / undefined / baris tidak ada", () => {
    expect(isCompleteAccount(null)).toBe(false);
    expect(isCompleteAccount(undefined)).toBe(false);
    expect(isCompleteAccount({ method: "BCA" })).toBe(false);
  });
});

describe("findAccountByMethod", () => {
  it("cocok tanpa memandang huruf besar-kecil dan spasi", () => {
    const accounts = [{ ...complete, method: "BCA" }];
    expect(findAccountByMethod(accounts, "bca")).not.toBeNull();
    expect(findAccountByMethod(accounts, " BCA ")).not.toBeNull();
    expect(findAccountByMethod(accounts, "BCA")).not.toBeNull();
  });

  it("mengembalikan null saat baris tidak ada atau daftar bukan array", () => {
    expect(findAccountByMethod([], "BCA")).toBeNull();
    expect(findAccountByMethod(null, "BCA")).toBeNull();
    expect(findAccountByMethod(undefined, "BCA")).toBeNull();
  });
});

describe("availableMethods", () => {
  it("menahan keputusan hanya saat masih dimuat", () => {
    expect(availableMethods([], "loading")).toBeNull();
  });

  it("fail-closed saat fetch gagal: hanya QRIS, BCA disembunyikan", () => {
    expect(availableMethods([], "error")).toEqual(["QRIS"]);
    expect(
      availableMethods(
        [{ method: "BCA", bankName: "Bank BCA", accountNumber: "123", accountHolder: "A" }],
        "error"
      )
    ).toEqual(["QRIS"]);
  });

  it("menyembunyikan BCA saat rekeningnya belum ada", () => {
    expect(availableMethods([], "ready")).toEqual(["QRIS"]);
  });

  it("menyembunyikan BCA saat nomornya kosong", () => {
    const accounts = [{ ...complete, accountNumber: "" }];
    expect(availableMethods(accounts, "ready")).toEqual(["QRIS"]);
  });

  it("menampilkan BCA saat rekening lengkap, QRIS selalu ikut", () => {
    expect(availableMethods([complete], "ready")).toEqual(["BCA", "QRIS"]);
  });
});

describe("resolveActiveMethod", () => {
  it("mempertahankan pilihan yang masih tampil", () => {
    expect(resolveActiveMethod("BCA", ["BCA", "QRIS"])).toBe("BCA");
    expect(resolveActiveMethod("QRIS", ["QRIS"])).toBe("QRIS");
  });

  it("mengalihkan pilihan tersembunyi (default BCA) ke metode pertama", () => {
    expect(resolveActiveMethod("BCA", ["QRIS"])).toBe("QRIS");
  });

  it("tidak mengubah apa pun selama keputusan belum diambil", () => {
    expect(resolveActiveMethod("BCA", null)).toBe("BCA");
    expect(resolveActiveMethod(null, [])).toBeNull();
  });
});
