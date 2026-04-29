import { format } from "date-fns";
import {
  aggregate,
  aggregateProduction,
  getDayData,
  getWeekDates,
  getWeekToDateDates,
  priorYearEquivalent,
  todayDate,
} from "@/lib/mockData";
import { ProductionVsRetailPanel } from "../ProductionVsRetailPanel";
import { fmtMoney, fmtMoney2, fmtPct } from "@/lib/format";
import { KpiCard } from "../KpiCard";
import { CategoryPanel } from "../CategoryPanel";
import { WeatherStrip } from "../WeatherStrip";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeeklyLast({ weekAnchor, onDayClick }: { weekAnchor: Date; onDayClick?: (d: Date) => void }) {
  const dates = getWeekDates(weekAnchor);
  const days = dates.map(getDayData);
  const pyDates = dates.map(priorYearEquivalent);
  const pyDays = pyDates.map(getDayData);
  const agg = aggregate(days);
  const pyAgg = aggregate(pyDays);
  const production = aggregateProduction(days);

  // Week-to-date snapshot for the in-progress week (Monday → yesterday)
  const wtdDates = getWeekToDateDates(todayDate());
  const wtdDays = wtdDates.map(getDayData);
  const wtdAgg = aggregate(wtdDays);

  const chartData = days.map((d) => ({
    day: format(d.date, "EEE"),
    date: d.date,
    revenue: d.revenue,
    type: d.dayType,
  }));

  return (
    <div className="space-y-6">
      {wtdDates.length > 0 && (
        <section className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Week to Date</span>
              <div className="text-sm font-medium">
                Mon {format(wtdDates[0], "MMM d")} – {format(wtdDates[wtdDates.length - 1], "EEE MMM d")} ({wtdDates.length} {wtdDates.length === 1 ? "day" : "days"} so far)
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Revenue</div>
                <div className="font-semibold tabular-nums">{fmtMoney(wtdAgg.revenue)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Labor %</div>
                <div className="font-semibold tabular-nums">{fmtPct(wtdAgg.laborPct)}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Last Week (Mon–Sun)</span>
            <div className="text-lg font-semibold">
              {format(dates[0], "MMM d")} – {format(dates[6], "MMM d, yyyy")}
            </div>
          </div>
        </div>
        <WeatherStrip days={days.map((d) => ({ date: d.date, weather: d.weather }))} />
      </section>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total Revenue" value={fmtMoney(agg.revenue)} priorValue={fmtMoney(pyAgg.revenue)} currentRaw={agg.revenue} priorRaw={pyAgg.revenue} />
        <KpiCard label="Labor $" value={fmtMoney(agg.laborCost)} priorValue={fmtMoney(pyAgg.laborCost)} currentRaw={agg.laborCost} priorRaw={pyAgg.laborCost} invertDelta />
        <KpiCard label="Labor %" value={fmtPct(agg.laborPct)} priorValue={fmtPct(pyAgg.laborPct)} currentRaw={agg.laborPct} priorRaw={pyAgg.laborPct} invertDelta />
        <KpiCard label="Avg Ticket" value={fmtMoney2(agg.avgTicket)} priorValue={fmtMoney2(pyAgg.avgTicket)} currentRaw={agg.avgTicket} priorRaw={pyAgg.avgTicket} />
        <KpiCard label="Items / Ticket" value={agg.avgItems.toFixed(2)} priorValue={pyAgg.avgItems.toFixed(2)} currentRaw={agg.avgItems} priorRaw={pyAgg.avgItems} />
      </div>

      <section className="space-y-3">
        <h3 className="section-header">Daily Revenue</h3>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 24, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtMoney(v)}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} onClick={(d: any) => onDayClick?.(d.date)} cursor="pointer" label={{ position: "top", fontSize: 10, fill: "hsl(var(--muted-foreground))", formatter: (v: number) => `$${(v / 1000).toFixed(1)}k` }}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.type === "Service" ? "hsl(var(--service))" : "hsl(var(--production))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-production" /> Production Day</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-service" /> Service Day</span>
            <span className="ml-auto">Tap a bar to see that day's detail</span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="section-header">Category Performance · Weekly</h3>
        <CategoryPanel categories={agg.categories} />
      </section>

      <section className="space-y-3">
        <h3 className="section-header">Same Week Last Year</h3>
        <div className="reference-surface rounded-xl border p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <RefStat label="Total Revenue" value={fmtMoney(pyAgg.revenue)} />
            <RefStat label="Labor %" value={fmtPct(pyAgg.laborPct)} />
            <RefStat label="Top Category" value={pyAgg.categories[0]?.name || "—"} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-reference-foreground/70 mb-2">Weather that week</div>
            <WeatherStrip days={pyDays.map((d) => ({ date: d.date, weather: d.weather }))} reference />
          </div>
        </div>
      </section>
    </div>
  );
}

function RefStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-reference-foreground/70">{label}</div>
      <div className="text-base font-semibold text-reference-foreground tabular-nums">{value}</div>
    </div>
  );
}
