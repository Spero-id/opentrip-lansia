// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { increment, withTransaction } from "@/lib/db/utils";

type Chunk = unknown;

function chunkValues(sql: unknown): Chunk[] {
  const chunks = (sql as { queryChunks: Chunk[] }).queryChunks;
  return chunks.map((c) =>
    c && typeof c === "object" && "value" in c
      ? (c as { value: Chunk }).value
      : c,
  );
}

describe("increment", () => {
  it("menghasilkan sql identifier dan amount", () => {
    const values = chunkValues(increment("quota", 2));
    expect(values).toContain("quota");
    expect(values).toContain(2);
    expect(values.join("")).toContain(" + ");
  });

  it("memakai amount 1 sebagai default", () => {
    expect(chunkValues(increment("quota"))).toContain(1);
  });

  it("menggunakan sql.identifier untuk nama kolom", () => {
    const sql = increment("quota; drop table trips");
    const values = chunkValues(sql);
    expect(values).toContain("quota; drop table trips");
    expect((sql as unknown as { shouldInlineParams: boolean }).shouldInlineParams).toBe(
      false,
    );
  });
});

describe("withTransaction", () => {
  it("mendelegasikan ke db.transaction dan mengembalikan hasilnya", async () => {
    const { db } = await import("@/lib/db");
    const spy = vi
      .spyOn(db, "transaction")
      .mockResolvedValue("ok" as never);

    const fn = vi.fn(async () => "done");

    const result = await withTransaction(fn);

    expect(result).toBe("ok");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe(fn);
  });

  it("meneruskan error dari callback", async () => {
    const { db } = await import("@/lib/db");
    vi.spyOn(db, "transaction").mockRejectedValue(
      new Error("constraint violated"),
    );

    await expect(withTransaction(async () => "never")).rejects.toThrow(
      "constraint violated",
    );
  });
});