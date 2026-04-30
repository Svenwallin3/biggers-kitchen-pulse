import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
          <Summary label="MKT ST sold" primary={`${totals.aUnits}`} secondary={fmtMoney(totals.aVal)} hint="Retail price" />
          <Summary label="CB Rd. sold" primary={`${totals.bUnits}`} secondary={fmtMoney(totals.bVal)} hint="Retail price" />
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

        {/* Per-item collapsibles */}
        <div className="divide-y divide-border">
          {items.map((it) => {
            const unsold = Math.max(0, it.unitsSent - it.soldA - it.soldB);
            const pct = it.unitsSent ? (unsold / it.unitsSent) * 100 : 0;
            const flag = pct > unsoldThreshold;
            return (
              <ItemRow
                key={it.name}
                item={it}
                unsold={unsold}
                pct={pct}
                flag={flag}
              />
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Sent $</strong> uses the internal kitchen transfer price.{" "}
        <strong>Location MKT ST / CB Rd. $</strong> uses retail price paid by the customer. Cells flagged amber when
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
