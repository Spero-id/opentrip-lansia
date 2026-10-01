import { useEffect, useState } from "react";
import { fetchPaymentAccounts } from "@/features/checkout";
import type { AccountsStatus, PaymentAccountLike } from "@/features/payment/payment-account";

export function usePaymentAccounts() {
  const [accounts, setAccounts] = useState<PaymentAccountLike[]>([]);
  const [status, setStatus] = useState<AccountsStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    fetchPaymentAccounts()
      .then((data) => {
        if (!cancelled) {
          setAccounts(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { accounts, status };
}
