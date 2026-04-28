import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { deltaPct } from "@/lib/format";

interface KpiCardProps {
  label: string;
  value: string;
  priorValue?: string;
  priorRaw?: number;
  currentRaw?: number;
  reference?: boolean;
  invertDelta?: boolean; // for labor% — lower is better
  flag?: boolean;
  hint?: string;
}

export function KpiCard({
  label,
  value,
  priorValue,
  priorRaw,
  currentRaw,
  reference,
  invertDelta,
  flag,
  hint,
}: KpiCardProps) {
  const delta =
    currentRaw !== undefined && priorRaw !== undefined ? deltaPct(currentRaw, priorRaw) : null;
  const positive = delta === null ? null : invertDelta ? delta < 0 : delta > 0;
  const neutral = delta === 0;

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 flex flex-col gap-1",
        reference ? "reference-surface" : "bg-card border-border",
        flag && "border-destructive/60 bg-destructive/5"
      )}
    >
      {reference && (
        <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide font-medium text-reference-foreground/70 bg-background/60 px-1.5 py-0.5 rounded">
          Last Year
        </span>
      )}
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          "text-3xl font-semibold tabular-nums",
          reference ? "text-reference-foreground" : "text-foreground",
          flag && "text-destructive"
        )}
      >
        {value}
      </span>
      {priorValue !== undefined && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="tabular-nums">{priorValue}</span>
          {delta !== null && !neutral && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                positive ? "text-success" : "text-destructive"
              )}
            >
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          <span className="text-muted-foreground/70">vs LY</span>
        </div>
      )}
      {hint && <span className="text-[11px] text-muted-foreground/80 mt-1">{hint}</span>}
    </div>
  );
}
