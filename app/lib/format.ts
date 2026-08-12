export function formatPrice(amount: string | number | null, unit?: string | null) {
  if (!amount) return null;
  const num = Number(amount);
  return `Rp${num.toLocaleString("id-ID")}${unit ?? ""}`;
}

export function buildWaLink(number?: string | null, message?: string) {
  if (!number) return "#";
  const cleanNumber = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}