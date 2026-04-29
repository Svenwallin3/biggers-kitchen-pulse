import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORY_PALETTE, HourBar } from "@/lib/mockData";
import { fmtMoney } from "@/lib/format";

export function HourlyBarChart({
  data,
  reference,
}: {
  data: HourBar[];
  reference?: boolean;
}) {
  const cats = Array.from(new Set(data.map((d) => d.topCategory)));
  return (
    <div className="space-y-3">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
            barCategoryGap={0}
            barGap={0}
          >
            <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="hour"
              interval={0}
              tick={(props: any) => {
                const { x, y, payload, index } = props;
                // Shift tick label to the LEFT edge of its bar
                const bandWidth =
                  data.length > 1
                    ? (props.visibleTicksCount
                        ? 0
                        : 0)
                    : 0;
                // Compute half-band offset using the axis scale if available
                const scale = props.scale;
                let offset = 0;
                if (scale && scale.bandwidth) {
                  offset = -scale.bandwidth() / 2;
                }
                return (
                  <text
                    x={x + offset}
                    y={y + 12}
                    textAnchor="start"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={11}
                  >
                    {payload.value}:00
                  </text>
                );
              }}
              stroke="hsl(var(--muted-foreground))"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as HourBar;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-sm">
                    <div className="font-semibold mb-1">
                      {d.hour}:00 — {fmtMoney(d.revenue)}
                    </div>
                    <div className="text-muted-foreground mb-2">{d.ticketCount} tickets</div>
                    <div className="space-y-0.5">
                      {d.topThree.map((t) => (
                        <div key={t.name} className="flex justify-between gap-4">
                          <span>{t.name}</span>
                          <span className="tabular-nums">{fmtMoney(t.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="revenue"
              radius={[4, 4, 0, 0]}
              fillOpacity={reference ? 0.5 : 1}
            >
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={CATEGORY_PALETTE[d.topCategory] || "hsl(var(--primary))"}
                  stroke={reference ? CATEGORY_PALETTE[d.topCategory] : undefined}
                  strokeDasharray={reference ? "3 3" : undefined}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {cats.map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: CATEGORY_PALETTE[c] }}
            />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
