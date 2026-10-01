"use client";

import { useMemo, useState } from "react";
import { ADMIN_ALL_STATUS, ADMIN_DEFAULT_PAGE_SIZE } from "@/features/admin/types";
import type { AdminTableOptions } from "@/features/admin/types";

export function filterAdminRows<T>(
  rows: T[],
  query: string,
  status: string,
  options: Pick<AdminTableOptions<T>, "searchKeys" | "statusKey" | "allStatusValue">,
): T[] {
  const allValue = options.allStatusValue ?? ADMIN_ALL_STATUS;
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (options.statusKey && status !== allValue) {
      if (String(row[options.statusKey] ?? "") !== status) return false;
    }
    if (!q) return true;
    return options.searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q));
  });
}

export function paginateAdminRows<T>(rows: T[], page: number, pageSize: number): { paged: T[]; totalPages: number; safePage: number } {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  return { paged: rows.slice(safePage * pageSize, (safePage + 1) * pageSize), totalPages, safePage };
}

export function useAdminTable<T>(rows: T[], options: AdminTableOptions<T>) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(options.allStatusValue ?? ADMIN_ALL_STATUS);
  const [page, setPage] = useState(0);
  const pageSize = options.pageSize ?? ADMIN_DEFAULT_PAGE_SIZE;

  const filtered = useMemo(
    () => filterAdminRows(rows, query, status, options),
    [rows, query, status, options],
  );
  const { paged, totalPages, safePage } = useMemo(
    () => paginateAdminRows(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  function resetFilters() {
    setQuery("");
    setStatus(options.allStatusValue ?? ADMIN_ALL_STATUS);
    setPage(0);
  }

  return { query, setQuery, status, setStatus, page, setPage: setPage, filtered, paged, totalPages, safePage, resetFilters };
}
