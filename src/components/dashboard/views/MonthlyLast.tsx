import { format, subMonths } from "date-fns";
import { aggregate, aggregateProduction, getDayData, getMonthDates, priorYearEquivalent } from "@/lib/mockData";
import { fmtMoney, fmtMoney2, fmtPct } from "@/lib/format";
import { KpiCard } from "../KpiCard";
import { CategoryPanel } from "../CategoryPanel";
import { ProductionVsRetailPanel } from "../ProductionVsRetailPanel";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlyLast({ monthAnchor: anchorProp }: { monthAnchor?: Date } = {}) {
  const monthAnchor = anchorProp ?? subMonths(new Date(), 1);
  const dates = getMonthDates(monthAnchor);
  const days = dates.map(getDayData);
  const pyDays = dates.map((d) => getDayData(priorYearEquivalent(d)));
  const agg = aggregate(days);
  const pyAgg = aggregate(pyDays);
  const production = aggregateProduction(days);

  const chartData = days.map((d, i) => ({
    day: d.date.getDate(),
    type: d.dayType,
    current: d.revenue,
    prior: pyDays[i].revenue,
    gap: d.revenue - pyDays[i].revenue,
  }));

  return (
    <div className="space-y-6">
      <section className="bg-card border border-border rounded-xl p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Last Month</span>
        <div className="text-lg font-semibold">{format(monthAnchor, "MMMM yyyy")}</div>
      </section>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <KpiCard label="Total Revenue" value={fmtMoney(agg.revenue)} priorValue={fmtMoney(pyAgg.revenue)} currentRaw={agg.revenue} priorRaw={pyAgg.revenue} />
        <KpiCard label="Labor $" value={fmtMoney(agg.laborCost)} priorValue={fmtMoney(pyAgg.laborCost)} currentRaw={agg.laborCost} priorRaw={pyAgg.laborCost} invertDelta />
        <KpiCard label="Labor %" value={fmtPct(agg.laborPct)} priorValue={fmtPct(pyAgg.laborPct)} currentRaw={agg.laborPct} priorRaw={pyAgg.laborPct} invertDelta />
        <KpiCard label="Avg Ticket" value={fmtMoney2(agg.avgTicket)} priorValue={fmtMoney2(pyAgg.avgTicket)} currentRaw={agg.avgTicket} priorRaw={pyAgg.avgTicket} />
      </div>

      <section className="space-y-3">
        <h3 className="section-header">Day-by-Day Revenue Trend</h3>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 20 }}>
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtMoney(v)} />
                <defs>
                  <linearGradient id="gapPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="current" stroke="none" fill="url(#gapPos)" />
                <Line type="monotone" dataKey="current" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="This year" />
                <Line type="monotone" dataKey="prior" stroke="hsl(var(--reference-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Last year" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary" /> Current year</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-reference-foreground" /> Prior year</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-production" /> Production days</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-service" /> Service days</span>
          </div>
          <div className="grid mt-1" style={{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }}>
            {chartData.map((d, i) => (
              <div key={i} className={`h-1 ${d.type === "Service" ? "bg-service/40" : "bg-production/40"}`} />
            ))}
          </div>
        </div>
      </section>

      <ProductionVsRetailPanel
        items={production}
        title="Production Output vs Retail Sell-Through · Monthly"
        periodLabel="last month"
      />

      <section className="space-y-3">
        <h3 className="section-header">Category Performance · Monthly</h3>
        <CategoryPanel categories={agg.categories} />
      </section>

      <section className="space-y-3">
        <h3 className="section-header">Same Month Last Year</h3>
        <div className="reference-surface rounded-xl border p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <RefStat label="Total Revenue" value={fmtMoney(pyAgg.revenue)} />
          <RefStat label="Labor %" value={fmtPct(pyAgg.laborPct)} />
          <RefStat label="Top Category" value={pyAgg.categories[0]?.name || "—"} />
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
