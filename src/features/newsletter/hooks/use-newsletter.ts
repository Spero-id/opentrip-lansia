"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { subscribeNewsletter } from "@/features/newsletter/api/client";

export function useNewsletter() {
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showPopup) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPopup(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showPopup]);

  const changeEmail = useCallback((value: string) => {
    setEmail(value);
    setError("");
  }, []);

  const closePopup = useCallback(() => setShowPopup(false), []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const result = await subscribeNewsletter(email);
      if (!result.ok) {
        setError(result.error || "Gagal berlangganan");
        return;
      }
      setShowPopup(true);
      setEmail("");
    } catch {
      setError("Terjadi kesalahan, coba lagi nanti");
    } finally {
      setLoading(false);
    }
  }

  return { email, changeEmail, showPopup, closePopup, loading, error, submit };
}
