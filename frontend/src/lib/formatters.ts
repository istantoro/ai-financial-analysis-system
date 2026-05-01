export function formatRupiah(value: number | string): string {
  const num = Number(value) || 0;
  if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(2)} T`;
  if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(2)} M`;
  if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(2)} Jt`;
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export function formatPersen(value: number | string): string {
  const num = Number(value) || 0;
  return `${num.toFixed(1)}%`;
}
