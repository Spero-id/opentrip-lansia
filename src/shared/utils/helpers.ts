export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function generateCode(prefix: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${code}`;
}

export function formatCurrency(amount: string): string {
  const num = parseInt(amount);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
}

export function parseAmount(amount: string): number {
  return parseInt(amount) || 0;
}
