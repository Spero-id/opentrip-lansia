import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAdminCrud } from "@/features/admin/hooks/use-admin-crud";
import { useConfirmDialog } from "@/features/admin/hooks/use-confirm-dialog";

afterEach(() => {
  vi.unstubAllGlobals();
});

interface Row {
  id: string;
  title: string;
}

interface Form {
  title: string;
}

const OPTS = {
  endpoint: "/api/blogs",
  emptyForm: { title: "" } as Form,
  toForm: (row: Row) => ({ title: row.title }),
};

function mockFetch(handler: (url: string, init?: RequestInit) => unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string, init?: RequestInit) => Promise.resolve(handler(url, init))),
  );
}

describe("useConfirmDialog", () => {
  it("opens and closes around target", () => {
    const { result } = renderHook(() => useConfirmDialog<string>());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.openConfirm("abc"));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.target).toBe("abc");
    act(() => result.current.closeConfirm());
    expect(result.current.isOpen).toBe(false);
  });
});

describe("useAdminCrud", () => {
  it("loads rows on mount and handles create flow", async () => {
    mockFetch((url, init) => {
      if (!init?.method || init.method === "GET") return { ok: true, json: () => Promise.resolve([{ id: "1", title: "A" }]) };
      return { ok: true, json: () => Promise.resolve({ id: "2" }) };
    });
    const { result } = renderHook(() => useAdminCrud<Row, Form>(OPTS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toHaveLength(1);

    act(() => result.current.openCreate());
    expect(result.current.modalOpen).toBe(true);
    act(() => result.current.setField("title", "Baru"));
    await act(async () => {
      await result.current.submit({ preventDefault: () => {} } as React.FormEvent);
    });
    expect(result.current.modalOpen).toBe(false);
    expect(result.current.saveError).toBeNull();
  });

  it("surfaces server save error", async () => {
    mockFetch(() => ({
      ok: true,
      json: () => Promise.resolve([]),
    }));
    const { result } = renderHook(() => useAdminCrud<Row, Form>(OPTS));
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: "Judul wajib diisi" }) }),
    );
    act(() => result.current.openCreate());
    await act(async () => {
      await result.current.submit({ preventDefault: () => {} } as React.FormEvent);
    });
    expect(result.current.saveError).toBe("Judul wajib diisi");
    expect(result.current.modalOpen).toBe(true);
  });

  it("deletes and refreshes", async () => {
    let store: Row[] = [{ id: "1", title: "A" }];
    mockFetch((url, init) => {
      if (init?.method === "DELETE") {
        store = [];
        return { ok: true, json: () => Promise.resolve({}) };
      }
      return { ok: true, json: () => Promise.resolve(store) };
    });
    const { result } = renderHook(() => useAdminCrud<Row, Form>(OPTS));
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    act(() => result.current.confirmDelete("1"));
    expect(result.current.deletingId).toBe("1");
    await act(async () => {
      await result.current.executeDelete();
    });
    expect(result.current.rows).toHaveLength(0);
  });
});
