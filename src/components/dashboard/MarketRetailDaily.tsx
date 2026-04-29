import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ProductionItem } from "@/lib/mockData";
import { fmtMoney2 } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  items: ProductionItem[];
  title?: string;
}

export function MarketRetailDaily({ items, title = "Market Retail Sales · Yesterday" }: Props) {
  const [open, setOpen] = useState(false);

  const totals = items.reduce(
    (acc, it) => {
      const aVal = it.soldA * it.retailPrice;
      const bVal = it.soldB * it.retailPrice;
      acc.aUnits += it.soldA;
      acc.aVal += aVal;
      acc.bUnits += it.soldB;
      acc.bVal += bVal;
      acc.totalVal += aVal + bVal;
      acc.totalUnits += it.soldA + it.soldB;
      return acc;
    },
    { aUnits: 0, aVal: 0, bUnits: 0, bVal: 0, totalVal: 0, totalUnits: 0 }
  );

  return (
    <section className="space-y-3">
      <h3 className="section-header">{title}</h3>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/40 border-b border-border">
          <Summary label="Location MKT ST" units={totals.aUnits} dollars={fmtMoney2(totals.aVal)} />
          <Summary label="Location CB Rd." units={totals.bUnits} dollars={fmtMoney2(totals.bVal)} />
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
            Retail Products Sold
          </div>
          <div className="text-sm font-semibold tabular-nums">{fmtMoney2(totals.totalVal)}</div>
        </button>

        {open && (
          <div className="border-t border-border">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                    <th className="py-2 px-3 font-medium">Item</th>
                    <th className="py-2 px-3 font-medium text-right">MKT ST qty</th>
                    <th className="py-2 px-3 font-medium text-right">MKT ST $</th>
                    <th className="py-2 px-3 font-medium text-right">CB Rd. qty</th>
                    <th className="py-2 px-3 font-medium text-right">CB Rd. $</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.name} className="border-b border-border/60 last:border-0">
                      <td className="py-2 px-3 font-medium">{it.name}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{it.soldA}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{fmtMoney2(it.soldA * it.retailPrice)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{it.soldB}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{fmtMoney2(it.soldB * it.retailPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked */}
            <div className="md:hidden divide-y divide-border">
              {items.map((it) => (
                <div key={it.name} className="p-3">
                  <div className="font-medium text-sm mb-2">{it.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted/40 rounded-md p-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">MKT ST</div>
                      <div className="text-sm font-semibold tabular-nums">{it.soldA}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">{fmtMoney2(it.soldA * it.retailPrice)}</div>
                    </div>
                    <div className="bg-muted/40 rounded-md p-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">CB Rd.</div>
                      <div className="text-sm font-semibold tabular-nums">{it.soldB}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">{fmtMoney2(it.soldB * it.retailPrice)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Summary({ label, units, dollars }: { label: string; units: number; dollars: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-lg font-semibold tabular-nums">{units}</div>
        <div className="text-xs text-muted-foreground">units</div>
      </div>
      <div className="text-sm font-semibold tabular-nums text-foreground/80">{dollars}</div>
    </div>
  );
}
