"use client";

import { useCallback, useState } from "react";

export function useConfirmDialog<T = string>() {
  const [target, setTarget] = useState<T | null>(null);

  const openConfirm = useCallback((value: T) => setTarget(value), []);
  const closeConfirm = useCallback(() => setTarget(null), []);

  return { target, isOpen: target !== null, openConfirm, closeConfirm };
}
