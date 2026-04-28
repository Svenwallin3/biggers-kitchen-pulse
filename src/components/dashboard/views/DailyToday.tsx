import { format } from "date-fns";
import { getDayData, priorYearEquivalent } from "@/lib/mockData";
import { fmtMoney, fmtMoney2, fmtPct } from "@/lib/format";
import { KpiCard } from "../KpiCard";
import { DayBanner } from "../DayBanner";
import { HourlyBarChart } from "../HourlyBarChart";
import { CategoryPanel } from "../CategoryPanel";
import { WeatherInline } from "../Weather";

export function DailyToday({ date }: { date: Date }) {
  const today = getDayData(date);
  const py = getDayData(priorYearEquivalent(date));
  const isService = py.dayType === "Service";

  return (
    <div className="space-y-6">
      <DayBanner data={today} label="Today" />

      <section className="reference-surface rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Weather Comparison</h3>
          <span className="text-[10px] uppercase tracking-wide font-medium text-reference-foreground/70 bg-background/60 px-1.5 py-0.5 rounded">
            Side by side
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs uppercase text-muted-foreground mb-1">Today's Forecast</div>
            <WeatherInline w={today.weather} />
          </div>
          <div className="bg-background/60 border border-reference-border rounded-lg p-3">
            <div className="text-xs uppercase text-reference-foreground/70 mb-1">
              Last Year — {format(py.date, "EEE, MMM d")}
            </div>
            <WeatherInline w={py.weather} muted />
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Outlook · Based on last year's equivalent day ({format(py.date, "EEE, MMM d, yyyy")})
        </p>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <KpiCard label="Expected Revenue" value={fmtMoney(py.revenue)} reference />
          <KpiCard label="Expected Labor %" value={fmtPct(py.laborPct)} reference />
          {isService && <KpiCard label="Expected Avg Ticket" value={fmtMoney2(py.avgTicket)} reference />}
          <KpiCard label="Expected Top Category" value={py.categories[0].name} reference />
        </div>
      </div>

      {isService && (
        <section className="space-y-3">
          <h3 className="section-header">Last Year — Hourly Trend</h3>
          <div className="reference-surface rounded-xl border p-4">
            <HourlyBarChart data={py.hourly} reference />
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="section-header">Category Outlook · Based on last year</h3>
        <CategoryPanel categories={py.categories} reference title="Expected Category Performance" />
      </section>
    </div>
  );
}
