import { format } from "date-fns";
import { aggregate, getDayData, getMonthDates, priorYearEquivalent } from "@/lib/mockData";
import { fmtMoney, fmtMoney2, fmtPct } from "@/lib/format";
import { KpiCard } from "../KpiCard";
import { CategoryPanel } from "../CategoryPanel";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlyThis({ monthAnchor: anchorProp, future = false }: { monthAnchor?: Date; future?: boolean } = {}) {
  const monthAnchor = anchorProp ?? new Date();
  const dates = getMonthDates(monthAnchor);
  const pyDays = dates.map((d) => getDayData(priorYearEquivalent(d)));
  const pyAgg = aggregate(pyDays);

  const chartData = pyDays.map((d) => ({
    day: d.date.getDate(),
    revenue: d.revenue,
  }));

  return (
    <div className="space-y-6">
      <section className="bg-card border border-border rounded-xl p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">This Month</span>
        <div className="text-lg font-semibold">{format(monthAnchor, "MMMM yyyy")}</div>
      </section>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Last Year's Same Month ({format(pyDays[0].date, "MMM yyyy")})
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
        <h3 className="section-header">Expected Daily Trend · Last Year</h3>
        <div className="reference-surface rounded-xl border p-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--reference-border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--reference-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--reference-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtMoney(v)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--reference-foreground))" strokeWidth={1.75} strokeDasharray="5 5" dot={false} />
              </LineChart>
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
