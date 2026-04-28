import { AlertTriangle, Cloud, CloudRain, Sun } from "lucide-react";
import { Weather } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function WeatherIcon({ condition, className }: { condition: string; className?: string }) {
  if (condition.toLowerCase().includes("rain"))
    return <CloudRain className={cn("w-4 h-4", className)} />;
  if (condition.toLowerCase().includes("cloud"))
    return <Cloud className={cn("w-4 h-4", className)} />;
  return <Sun className={cn("w-4 h-4", className)} />;
}

export function WeatherInline({ w, muted }: { w: Weather; muted?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-sm",
        muted ? "text-reference-foreground" : "text-foreground"
      )}
    >
      <WeatherIcon condition={w.condition} />
      <span className="tabular-nums">
        {w.high}° / {w.low}°
      </span>
      <span className="text-muted-foreground">{w.condition}</span>
      <span className="text-muted-foreground tabular-nums">{w.precipPct}% precip</span>
      {w.severe && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning">
          <AlertTriangle className="w-3 h-3" />
          {w.severe}
        </span>
      )}
    </div>
  );
}
