// delivery dates are stored as UTC midnight, so show them in UTC to avoid off-by-one days
export const fmtDeliveryDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const money = (n: number) => `$${n.toFixed(2)}`;


export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function fmtMoney(amount: number, currency = "usd") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}