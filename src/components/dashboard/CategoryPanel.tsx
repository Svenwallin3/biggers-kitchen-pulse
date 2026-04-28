import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CategoryRow } from "@/lib/mockData";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CategoryPanel({
  categories,
  reference,
  title = "Category Performance",
}: {
  categories: (CategoryRow & { pct?: number })[];
  reference?: boolean;
  title?: string;
}) {
  const total = categories.reduce((s, c) => s + c.revenue, 0) || 1;
  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        reference ? "reference-surface" : "bg-card border-border"
      )}
    >
      <div className="px-4 py-3 border-b border-inherit flex items-center justify-between">
        <h3 className="section-header">{title}</h3>
        {reference && (
          <span className="text-[10px] uppercase tracking-wide font-medium text-reference-foreground/70 bg-background/60 px-1.5 py-0.5 rounded">
            Last Year
          </span>
        )}
      </div>
      <ul>
        {categories.map((c, i) => (
          <CategoryRowItem key={c.name} row={c} rank={i + 1} totalPct={(c.revenue / total) * 100} />
        ))}
      </ul>
    </div>
  );
}

function CategoryRowItem({
  row,
  rank,
  totalPct,
}: {
  row: CategoryRow & { pct?: number };
  rank: number;
  totalPct: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className={cn("border-b last:border-b-0 border-inherit", rank % 2 === 0 && "bg-muted/40")}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/60 transition-colors"
      >
        <span className="text-xs font-medium text-muted-foreground tabular-nums w-6">#{rank}</span>
        <span className="flex-1 font-medium text-sm">{row.name}</span>
        <span className="hidden sm:inline text-sm tabular-nums text-muted-foreground w-24 text-right">
          {row.items} items
        </span>
        <span className="text-sm tabular-nums w-16 text-right text-muted-foreground">
          {totalPct.toFixed(1)}%
        </span>
        <span className="text-sm font-semibold tabular-nums w-24 text-right">
          {fmtMoney(row.revenue)}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase font-medium text-muted-foreground mb-2">Top 5 items</div>
            <ul className="space-y-1">
              {row.topItems.map((it) => (
                <li key={it.name} className="flex justify-between">
                  <span>{it.name}</span>
                  <span className="tabular-nums text-muted-foreground">{fmtMoney(it.revenue)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase font-medium text-muted-foreground mb-2">
              Bottom 5 items
            </div>
            <ul className="space-y-1">
              {row.bottomItems.map((it) => (
                <li key={it.name} className="flex justify-between">
                  <span>{it.name}</span>
                  <span className="tabular-nums text-muted-foreground">{fmtMoney(it.revenue)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
