import { ProductionItem } from "@/lib/mockData";
import { fmtMoney, fmtMoney2 } from "@/lib/format";

interface Props {
  items: ProductionItem[];
  label?: string;
}

export function ProductionLogPanel({ items, label = "Today" }: Props) {
  const totalUnits = items.reduce((s, i) => s + i.unitsSent, 0);
  const totalValue = items.reduce((s, i) => s + i.unitsSent * i.transferPrice, 0);

  return (
    <section className="space-y-3">
      <h3 className="section-header">Production Output — Today</h3>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/40 border-b border-border">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Units Sent to Markets</div>
            <div className="text-xl font-semibold tabular-nums">{totalUnits.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Transfer Value</div>
            <div className="text-xl font-semibold tabular-nums">{fmtMoney(totalValue)}</div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="py-2 px-4 font-medium">Item</th>
                <th className="py-2 px-4 font-medium text-right">Units Sent</th>
                <th className="py-2 px-4 font-medium text-right">Transfer $ Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.name} className="border-b border-border/60 last:border-0">
                  <td className="py-2 px-4">{it.name}</td>
                  <td className="py-2 px-4 text-right tabular-nums">{it.unitsSent}</td>
                  <td className="py-2 px-4 text-right tabular-nums">
                    {fmtMoney2(it.unitsSent * it.transferPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked */}
        <div className="md:hidden divide-y divide-border">
          {items.map((it) => (
            <div key={it.name} className="p-3 flex items-center justify-between gap-3">
              <div className="font-medium text-sm">{it.name}</div>
              <div className="text-right">
                <div className="text-sm tabular-nums">{it.unitsSent} units</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {fmtMoney2(it.unitsSent * it.transferPrice)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Daily transfers from kitchen to market locations. Retail sell-through is shown weekly only —
        kitchen items take multiple days to sell.
      </p>
    </section>
  );
}
