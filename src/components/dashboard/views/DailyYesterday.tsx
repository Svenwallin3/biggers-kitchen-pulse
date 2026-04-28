import { format } from "date-fns";
import { DayData, priorYearEquivalent, getDayData } from "@/lib/mockData";
import { fmtMoney, fmtMoney2, fmtPct } from "@/lib/format";
import { useSettings } from "@/lib/settings";
import { KpiCard } from "../KpiCard";
import { DayBanner } from "../DayBanner";
import { HourlyBarChart } from "../HourlyBarChart";
import { CategoryPanel } from "../CategoryPanel";
import { WeatherInline } from "../Weather";

export function DailyYesterday({ date }: { date: Date }) {
  const data = getDayData(date);
  const py = getDayData(priorYearEquivalent(date));
  const isService = data.dayType === "Service";
  const { laborAlertThreshold } = useSettings();

  return (
    <div className="space-y-6">
      <DayBanner data={data} />

      <div className={`grid gap-3 ${isService ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" : "grid-cols-2 md:grid-cols-3"}`}>
        <KpiCard label="Total Revenue" value={fmtMoney(data.revenue)} priorValue={fmtMoney(py.revenue)} currentRaw={data.revenue} priorRaw={py.revenue} />
        <KpiCard label="Labor $" value={fmtMoney(data.laborCost)} priorValue={fmtMoney(py.laborCost)} currentRaw={data.laborCost} priorRaw={py.laborCost} invertDelta />
        <KpiCard label="Labor %" value={fmtPct(data.laborPct)} priorValue={fmtPct(py.laborPct)} currentRaw={data.laborPct} priorRaw={py.laborPct} invertDelta flag={data.laborPct > laborAlertThreshold} />
        {isService && (
          <>
            <KpiCard label="Avg Ticket" value={fmtMoney2(data.avgTicket)} priorValue={fmtMoney2(py.avgTicket)} currentRaw={data.avgTicket} priorRaw={py.avgTicket} />
            <KpiCard label="Items / Ticket" value={data.avgItems.toFixed(2)} priorValue={py.avgItems.toFixed(2)} currentRaw={data.avgItems} priorRaw={py.avgItems} />
            <KpiCard label="Sales / Hour" value={fmtMoney(data.salesPerHour)} priorValue={fmtMoney(py.salesPerHour)} currentRaw={data.salesPerHour} priorRaw={py.salesPerHour} />
          </>
        )}
      </div>

      {isService ? (
        <section className="space-y-3">
          <h3 className="section-header">Hourly Sales</h3>
          <div className="bg-card border border-border rounded-xl p-4">
            <HourlyBarChart data={data.hourly} />
          </div>
        </section>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="font-semibold mb-1">Production Day</h3>
          <p className="text-sm text-muted-foreground">Kitchen prep & wholesale. No walk-up service.</p>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="section-header">Category Performance</h3>
        <CategoryPanel categories={data.categories} />
      </section>

      <section className="space-y-3">
        <h3 className="section-header">Same Day Last Year</h3>
        <div className="reference-surface rounded-xl border p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <RefStat label="Date" value={format(py.date, "EEE, MMM d")} />
          <RefStat label="Revenue" value={fmtMoney(py.revenue)} />
          <RefStat label="Labor %" value={fmtPct(py.laborPct)} />
          {isService && <RefStat label="Avg Ticket" value={fmtMoney2(py.avgTicket)} />}
          <RefStat label="Top Category" value={py.categories[0].name} />
          <div className="col-span-2 md:col-span-5">
            <span className="text-xs uppercase tracking-wide text-reference-foreground/70">Weather</span>
            <div className="mt-1"><WeatherInline w={py.weather} muted /></div>
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
