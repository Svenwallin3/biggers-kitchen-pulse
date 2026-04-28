export const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const fmtMoney2 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export function deltaPct(current: number, prior: number): number {
  if (!prior) return 0;
  return +(((current - prior) / prior) * 100).toFixed(1);
}
