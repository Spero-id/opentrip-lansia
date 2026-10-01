
export type AccountsStatus = "loading" | "ready" | "error";

export interface PaymentAccountLike {
  method?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  isActive?: boolean | null;
}

function hasText(value: unknown): boolean {
  return String(value ?? "").trim().length > 0;
}

export function isCompleteAccount(
  account: PaymentAccountLike | null | undefined
): boolean {
  if (!account) return false;
  return (
    hasText(account.bankName) &&
    hasText(account.accountNumber) &&
    hasText(account.accountHolder)
  );
}

export function findAccountByMethod(
  accounts: PaymentAccountLike[] | null | undefined,
  method: string
): PaymentAccountLike | null {
  const target = String(method ?? "").trim().toLowerCase();
  if (!target || !Array.isArray(accounts)) return null;
  return (
    accounts.find(
      (a) => String(a?.method ?? "").trim().toLowerCase() === target
    ) ?? null
  );
}

export function availableMethods(
  accounts: PaymentAccountLike[] | null | undefined,
  status: AccountsStatus,
  bankMethods: string[] = ["BCA"]
): string[] | null {
  if (status === "loading") return null;
  const source = status === "ready" && Array.isArray(accounts) ? accounts : [];
  const visible = bankMethods.filter((m) =>
    isCompleteAccount(findAccountByMethod(source, m))
  );
  if (!visible.includes("QRIS")) visible.push("QRIS");
  return visible;
}

export function resolveActiveMethod(
  current: string | null | undefined,
  visible: string[] | null | undefined
): string | null {
  if (!visible || visible.length === 0) return current ?? null;
  if (current && visible.includes(current)) return current;
  return visible[0];
}
