import { ProductionItem } from "@/lib/mockData";
import { useSettings } from "@/lib/settings";
import { fmtMoney, fmtMoney2 } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  items: ProductionItem[];
  title?: string;
  periodLabel?: string;
}

export function ProductionVsRetailPanel({
  items,
  title = "Production Output vs Retail Sell-Through",
  periodLabel = "this week",
}: Props) {
  const { unsoldThreshold } = useSettings();

  const totals = items.reduce(
    (acc, it) => {
      const sentVal = it.unitsSent * it.transferPrice;
      const aVal = it.soldA * it.retailPrice;
      const bVal = it.soldB * it.retailPrice;
      const unsold = Math.max(0, it.unitsSent - it.soldA - it.soldB);
      acc.units += it.unitsSent;
      acc.sentVal += sentVal;
      acc.aUnits += it.soldA;
      acc.aVal += aVal;
      acc.bUnits += it.soldB;
      acc.bVal += bVal;
      acc.unsold += unsold;
      return acc;
    },
    { units: 0, sentVal: 0, aUnits: 0, aVal: 0, bUnits: 0, bVal: 0, unsold: 0 }
  );

  const overallUnsoldPct = totals.units ? (totals.unsold / totals.units) * 100 : 0;
  const overallFlag = overallUnsoldPct > unsoldThreshold;

  return (
    <section className="space-y-3">
      <h3 className="section-header">{title}</h3>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Summary totals */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/40 border-b border-border">
          <Summary label="Sent (units / $)" primary={`${totals.units}`} secondary={fmtMoney(totals.sentVal)} hint="Transfer price" />
          <Summary label="Location A sold" primary={`${totals.aUnits}`} secondary={fmtMoney(totals.aVal)} hint="Retail price" />
          <Summary label="Location B sold" primary={`${totals.bUnits}`} secondary={fmtMoney(totals.bVal)} hint="Retail price" />
          <Summary
            label="Total unsold"
            primary={`${totals.unsold}`}
            secondary={`${overallUnsoldPct.toFixed(1)}% of sent`}
            flag={overallFlag}
          />
          <Summary
            label="Sell-through"
            primary={`${(100 - overallUnsoldPct).toFixed(1)}%`}
            secondary={`across both markets ${periodLabel}`}
          />
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                <th className="py-2 px-3 font-medium">Item</th>
                <th className="py-2 px-3 font-medium text-right">Sent qty</th>
                <th className="py-2 px-3 font-medium text-right">Sent $ <span className="normal-case text-[10px] text-muted-foreground/80">(transfer)</span></th>
                <th className="py-2 px-3 font-medium text-right">Loc A qty</th>
                <th className="py-2 px-3 font-medium text-right">Loc A $ <span className="normal-case text-[10px] text-muted-foreground/80">(retail)</span></th>
                <th className="py-2 px-3 font-medium text-right">Loc B qty</th>
                <th className="py-2 px-3 font-medium text-right">Loc B $ <span className="normal-case text-[10px] text-muted-foreground/80">(retail)</span></th>
                <th className="py-2 px-3 font-medium text-right">Unsold qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const unsold = Math.max(0, it.unitsSent - it.soldA - it.soldB);
                const pct = it.unitsSent ? (unsold / it.unitsSent) * 100 : 0;
                const flag = pct > unsoldThreshold;
                return (
                  <tr key={it.name} className="border-b border-border/60 last:border-0">
                    <td className="py-2 px-3 font-medium">{it.name}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{it.unitsSent}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{fmtMoney2(it.unitsSent * it.transferPrice)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{it.soldA}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{fmtMoney2(it.soldA * it.retailPrice)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{it.soldB}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{fmtMoney2(it.soldB * it.retailPrice)}</td>
                    <td
                      className={cn(
                        "py-2 px-3 text-right tabular-nums font-semibold",
                        flag && "bg-warning/15 text-warning"
                      )}
                    >
                      {unsold} {flag && <span className="text-[10px] font-normal">({pct.toFixed(0)}%)</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile / tablet stacked cards */}
        <div className="lg:hidden divide-y divide-border">
          {items.map((it) => {
            const unsold = Math.max(0, it.unitsSent - it.soldA - it.soldB);
            const pct = it.unitsSent ? (unsold / it.unitsSent) * 100 : 0;
            const flag = pct > unsoldThreshold;
            return (
              <div key={it.name} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-sm">{it.name}</div>
                  <div
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-md tabular-nums",
                      flag ? "bg-warning/15 text-warning font-semibold" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {unsold} unsold ({pct.toFixed(0)}%)
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Cell label="Sent" qty={it.unitsSent} dollars={fmtMoney2(it.unitsSent * it.transferPrice)} dollarHint="transfer" />
                  <Cell label="Loc A" qty={it.soldA} dollars={fmtMoney2(it.soldA * it.retailPrice)} dollarHint="retail" />
                  <Cell label="Loc B" qty={it.soldB} dollars={fmtMoney2(it.soldB * it.retailPrice)} dollarHint="retail" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Sent $</strong> uses the internal kitchen transfer price.{" "}
        <strong>Location A/B $</strong> uses retail price paid by the customer. Cells flagged amber when
        unsold &gt; {unsoldThreshold}% of units sent.
      </p>
    </section>
  );
}

function Summary({
  label,
  primary,
  secondary,
  hint,
  flag,
}: {
  label: string;
  primary: string;
  secondary?: string;
  hint?: string;
  flag?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("text-lg font-semibold tabular-nums", flag && "text-warning")}>{primary}</div>
      {secondary && (
        <div className="text-xs text-muted-foreground tabular-nums">
          {secondary}
          {hint && <span className="ml-1 text-muted-foreground/70">· {hint}</span>}
        </div>
      )}
    </div>
  );
}

function Cell({ label, qty, dollars, dollarHint }: { label: string; qty: number; dollars: string; dollarHint: string }) {
  return (
    <div className="bg-muted/40 rounded-md p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{qty}</div>
      <div className="text-[10px] text-muted-foreground tabular-nums">
        {dollars} <span className="opacity-70">{dollarHint}</span>
      </div>
    </div>
  );
}
