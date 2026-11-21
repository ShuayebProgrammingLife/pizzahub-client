// delivery dates are stored as UTC midnight, so show them in UTC to avoid off-by-one days
export const fmtDeliveryDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const money = (n: number) => `$${n.toFixed(2)}`;