"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

export interface AdminCrudOptions<TRow extends { id: string | number }, TForm> {
  endpoint: string;
  emptyForm: TForm;
  toForm: (row: TRow) => TForm;
  validate?: (form: TForm) => string | null;
  transform?: (form: TForm) => unknown;
}

const ADMIN_SAVE_ERROR_FALLBACK = "Gagal menyimpan data.";

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data?.error || fallback;
  } catch {
    return fallback;
  }
}

export function useAdminCrud<TRow extends { id: string | number }, TForm>(options: AdminCrudOptions<TRow, TForm>) {
  const [rows, setRows] = useState<TRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TRow | null>(null);
  const [form, setForm] = useState<TForm>(options.emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(options.endpoint);
      const data: unknown = await res.json();
      setRows(Array.isArray(data) ? (data as TRow[]) : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [options.endpoint]);

  useEffect(() => {
    async function load() {
      await refresh();
    }
    void load();
  }, [refresh]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(options.emptyForm);
    setSaveError(null);
    setModalOpen(true);
  }, [options.emptyForm]);

  const openEdit = useCallback(
    (row: TRow) => {
      setEditing(row);
      setForm(options.toForm(row));
      setSaveError(null);
      setModalOpen(true);
    },
    [options.toForm],
  );

  const closeModal = useCallback(() => setModalOpen(false), []);

  function setField<K extends keyof TForm>(key: K, value: TForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (options.validate) {
      const validationError = options.validate(form);
      if (validationError) {
        setSaveError(validationError);
        return;
      }
    }
    const body = options.transform ? options.transform(form) : form;
    setSaving(true);
    setSaveError(null);
    try {
      const url = editing ? `${options.endpoint}/${editing.id}` : options.endpoint;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setSaveError(await readErrorMessage(res, ADMIN_SAVE_ERROR_FALLBACK));
        return;
      }
      setModalOpen(false);
      await refresh();
    } catch {
      setSaveError(ADMIN_SAVE_ERROR_FALLBACK);
    } finally {
      setSaving(false);
    }
  }

  const confirmDelete = useCallback((id: string | number) => setDeletingId(id), []);
  const cancelDelete = useCallback(() => setDeletingId(null), []);

  async function executeDelete() {
    if (deletingId === null) return;
    try {
      await fetch(`${options.endpoint}/${deletingId}`, { method: "DELETE" });
    } catch {
    } finally {
      setDeletingId(null);
      await refresh();
    }
  }

  return {
    rows,
    loading,
    refresh,
    modalOpen,
    editing,
    form,
    saving,
    saveError,
    deletingId,
    openCreate,
    openEdit,
    closeModal,
    setField,
    setForm,
    submit,
    confirmDelete,
    cancelDelete,
    executeDelete,
  };
}
