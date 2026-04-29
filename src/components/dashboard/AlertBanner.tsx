import { useMemo, useState } from "react";
import { subWeeks } from "date-fns";
import { AlertTriangle, CloudRain, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings";
import { DayData, aggregateProduction, getDayData, getWeekDates, todayDate } from "@/lib/mockData";

interface AlertBannerProps {
  yesterday: DayData;
  yesterdayPriorYear: DayData;
  todayWeather: { severe?: string | null };
  tomorrowWeather: { severe?: string | null };
}

export function AlertBanner({
  yesterday,
  yesterdayPriorYear,
  todayWeather,
  tomorrowWeather,
}: AlertBannerProps) {
  const { laborAlertThreshold, revenueVarianceThreshold, unsoldThreshold } = useSettings();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    const out: { id: string; type: "danger" | "warning" | "info"; message: string }[] = [];

    // Last week's production unsold rate
    const lastWeekDates = getWeekDates(subWeeks(todayDate(), 1));
    const lastWeekProd = aggregateProduction(lastWeekDates.map(getDayData));
    const sentTotal = lastWeekProd.reduce((s, p) => s + p.unitsSent, 0);
    const unsoldTotal = lastWeekProd.reduce(
      (s, p) => s + Math.max(0, p.unitsSent - p.soldA - p.soldB),
      0
    );
    const unsoldPct = sentTotal ? (unsoldTotal / sentTotal) * 100 : 0;
    if (unsoldPct > unsoldThreshold) {
      out.push({
        id: "unsold",
        type: "warning",
        message: `Last week's unsold production at ${unsoldPct.toFixed(1)}% of units sent — above ${unsoldThreshold}% threshold.`,
      });
    }

    if (yesterday.laborPct > laborAlertThreshold) {
      out.push({
        id: "labor",
        type: "danger",
        message: `Labor at ${yesterday.laborPct}% — above ${laborAlertThreshold}% threshold.`,
      });
    }
    const variance = ((yesterday.revenue - yesterdayPriorYear.revenue) / yesterdayPriorYear.revenue) * 100;
    if (variance < -revenueVarianceThreshold) {
      out.push({
        id: "rev",
        type: "warning",
        message: `Yesterday's revenue ${Math.abs(variance).toFixed(1)}% below same day last year.`,
      });
    }
    if (todayWeather.severe || tomorrowWeather.severe) {
      const days = [todayWeather.severe && "today", tomorrowWeather.severe && "tomorrow"]
        .filter(Boolean)
        .join(" & ");
      out.push({
        id: "weather",
        type: "info",
        message: `Severe weather event ${days}: ${todayWeather.severe || tomorrowWeather.severe}.`,
      });
    }
    return out.filter((a) => !dismissed.has(a.id));
  }, [yesterday, yesterdayPriorYear, todayWeather, tomorrowWeather, laborAlertThreshold, revenueVarianceThreshold, dismissed]);

  if (alerts.length === 0) return null;
  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-lg border text-sm",
            a.type === "danger" && "bg-destructive/10 border-destructive/30 text-destructive",
            a.type === "warning" && "bg-warning/10 border-warning/30 text-warning",
            a.type === "info" && "bg-info/10 border-info/30 text-info"
          )}
        >
          {a.type === "danger" && <AlertTriangle className="w-4 h-4 shrink-0" />}
          {a.type === "warning" && <AlertTriangle className="w-4 h-4 shrink-0" />}
          {a.type === "info" && <CloudRain className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{a.message}</span>
          <button
            onClick={() => setDismissed(new Set([...dismissed, a.id]))}
            className="opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
