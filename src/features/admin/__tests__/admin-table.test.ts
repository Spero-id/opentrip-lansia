import { describe, expect, it } from "vitest";
import { filterAdminRows, paginateAdminRows } from "@/features/admin/hooks/use-admin-table";

interface Sample {
  id: string;
  title: string;
  status: string;
}

const ROWS: Sample[] = [
  { id: "1", title: "Bromo Open Trip", status: "published" },
  { id: "2", title: "Pantai Kuta", status: "draft" },
  { id: "3", title: "Bromo Private", status: "published" },
];

const OPTS = { searchKeys: ["title"] as Array<keyof Sample>, statusKey: "status" as keyof Sample };

describe("filterAdminRows", () => {
  it("returns all rows without query and all status", () => {
    expect(filterAdminRows(ROWS, "", "all", OPTS)).toHaveLength(3);
  });

  it("searches case-insensitively across keys", () => {
    expect(filterAdminRows(ROWS, "bromo", "all", OPTS).map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("filters by status", () => {
    expect(filterAdminRows(ROWS, "", "draft", OPTS).map((r) => r.id)).toEqual(["2"]);
  });

  it("combines search and status", () => {
    expect(filterAdminRows(ROWS, "bromo", "published", OPTS).map((r) => r.id)).toEqual(["1", "3"]);
    expect(filterAdminRows(ROWS, "kuta", "published", OPTS)).toHaveLength(0);
  });
});

describe("paginateAdminRows", () => {
  it("slices page correctly", () => {
    const { paged, totalPages } = paginateAdminRows(ROWS, 0, 2);
    expect(paged).toHaveLength(2);
    expect(totalPages).toBe(2);
  });

  it("clamps out-of-range page", () => {
    const { paged, safePage } = paginateAdminRows(ROWS, 9, 2);
    expect(safePage).toBe(1);
    expect(paged).toHaveLength(1);
  });
});
