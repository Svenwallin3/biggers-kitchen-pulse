import { format } from "date-fns";
import { DayData, DayType } from "@/lib/mockData";
import { WeatherInline } from "./Weather";
import { cn } from "@/lib/utils";

export function DayBanner({
  data,
  label,
  reference,
}: {
  data: DayData;
  label?: string;
  reference?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between",
        reference ? "reference-surface" : "bg-card border-border"
      )}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {label || format(data.date, "EEEE")}
          </span>
          <span className="text-lg font-semibold">{format(data.date, "MMMM d, yyyy")}</span>
        </div>
        <DayTypeBadge type={data.dayType} />
      </div>
      <WeatherInline w={data.weather} muted={reference} />
    </div>
  );
}

export function DayTypeBadge({ type }: { type: DayType }) {
  const isService = type === "Service";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
        isService
          ? "bg-service/10 text-service border border-service/20"
          : "bg-production/10 text-production border border-production/20"
      )}
    >
      {isService ? "Service Day" : "Production Day"}
    </span>
  );
}
