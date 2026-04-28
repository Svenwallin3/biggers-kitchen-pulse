import { format } from "date-fns";
import { DayData, getDayType } from "@/lib/mockData";
import { WeatherIcon } from "./Weather";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WeatherStrip({
  days,
  reference,
}: {
  days: { date: Date; weather: DayData["weather"] }[];
  reference?: boolean;
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(({ date, weather }) => {
        const dayType = getDayType(date);
        return (
          <div
            key={date.toISOString()}
            className={cn(
              "rounded-lg border p-3 flex flex-col items-center gap-1 text-center",
              reference ? "reference-surface" : "bg-card border-border"
            )}
          >
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {format(date, "EEE")}
            </span>
            <span className="text-sm font-semibold tabular-nums">{format(date, "d")}</span>
            <WeatherIcon condition={weather.condition} className="w-5 h-5 text-muted-foreground my-1" />
            <span className="text-xs tabular-nums">
              {weather.high}°/{weather.low}°
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {weather.precipPct}%
            </span>
            {weather.severe && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning/15 text-warning">
                <AlertTriangle className="w-2.5 h-2.5" />
                {weather.severe}
              </span>
            )}
            <span
              className={cn(
                "text-[9px] uppercase tracking-wide font-medium mt-0.5",
                dayType === "Service" ? "text-service" : "text-production"
              )}
            >
              {dayType[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
