export function formatNumber(value: number | string): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatRupiah(value: number): string {
  return "Rp " + Math.floor(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
