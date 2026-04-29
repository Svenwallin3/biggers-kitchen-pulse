import { format } from "date-fns";
import { aggregate, getDayData, getWeekDates, priorYearEquivalent } from "@/lib/mockData";
import { fmtMoney, fmtMoney2, fmtPct } from "@/lib/format";
import { KpiCard } from "../KpiCard";
import { CategoryPanel } from "../CategoryPanel";
import { WeatherStrip } from "../WeatherStrip";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeeklyThis({ weekAnchor }: { weekAnchor: Date }) {
  const dates = getWeekDates(weekAnchor);
  const todayDays = dates.map(getDayData);
  const pyDates = dates.map(priorYearEquivalent);
  const pyDays = pyDates.map(getDayData);
  const pyAgg = aggregate(pyDays);

  const chartData = pyDays.map((d) => ({
    day: format(d.date, "EEE"),
    revenue: d.revenue,
    type: d.dayType,
  }));

  return (
    <div className="space-y-6">
      <section className="bg-card border border-border rounded-xl p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">This Week</span>
        <div className="text-lg font-semibold">
          {format(dates[0], "MMM d")} – {format(dates[6], "MMM d, yyyy")}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="section-header">7-Day Weather Forecast</h3>
        <WeatherStrip days={todayDays.map((d) => ({ date: d.date, weather: d.weather }))} />
      </section>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Last Year's Same Week ({format(pyDates[0], "MMM d")} – {format(pyDates[6], "MMM d, yyyy")})
        </p>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard label="Last Year Revenue" value={fmtMoney(pyAgg.revenue)} reference />
          <KpiCard label="Last Year Labor $" value={fmtMoney(pyAgg.laborCost)} reference />
          <KpiCard label="Last Year Labor %" value={fmtPct(pyAgg.laborPct)} reference />
          <KpiCard label="Last Year Avg Ticket" value={fmtMoney2(pyAgg.avgTicket)} reference />
          <KpiCard label="Last Year Top Category" value={pyAgg.categories[0]?.name || "—"} reference />
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="section-header">Last Year — Daily Trend</h3>
        <div className="reference-surface rounded-xl border p-4">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 24, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--reference-border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--reference-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--reference-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtMoney(v)} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fillOpacity={0.6}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.type === "Service" ? "hsl(var(--service))" : "hsl(var(--production))"} strokeDasharray="3 3" stroke={d.type === "Service" ? "hsl(var(--service))" : "hsl(var(--production))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="section-header">Category Outlook · Based on last year</h3>
        <CategoryPanel categories={pyAgg.categories} reference title="Expected Category Performance" />
      </section>
    </div>
  );
}
