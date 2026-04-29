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
import { HourBar } from "@/lib/mockData";
import { fmtMoney } from "@/lib/format";

export function HourlySimpleChart({
  data,
  reference,
}: {
  data: HourBar[];
  reference?: boolean;
}) {
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
                const { x, y, payload } = props;
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
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as HourBar;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-sm">
                    <div className="font-semibold mb-1">
                      {d.hour}:00 — {fmtMoney(d.revenue)}
                    </div>
                    <div className="text-muted-foreground">
                      Top category: <span className="text-foreground font-medium">{d.topCategory}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="revenue"
              radius={[4, 4, 0, 0]}
              fillOpacity={reference ? 0.7 : 1}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i % 2 === 0
                      ? "hsl(var(--muted-foreground) / 0.85)"
                      : "hsl(var(--muted-foreground) / 0.45)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
