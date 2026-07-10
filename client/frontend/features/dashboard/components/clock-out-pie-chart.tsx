"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { components } from "@/lib/api/generated/schema";

type ClockOutStats = components["schemas"]["ClockOutStats"];

interface ClockOutPieChartProps {
  stats?: ClockOutStats;
}

const chartConfig = {
  manual: { label: "Manual", color: "var(--chart-1)" },
  automatic: { label: "Automatic", color: "var(--chart-2)" },
  server: { label: "Server", color: "var(--chart-3)" },
  adminForce: { label: "Admin forced", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function ClockOutPieChart({ stats }: ClockOutPieChartProps) {
  const data = [
    { key: "manual", value: stats?.manual ?? 0 },
    { key: "automatic", value: stats?.automatic ?? 0 },
    { key: "server", value: stats?.server ?? 0 },
    { key: "adminForce", value: stats?.adminForce ?? 0 },
  ];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const hasData = total > 0;

  return (
    <div className="flex h-64 w-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/10 sm:h-80 sm:p-6 lg:h-116.25 lg:w-90 lg:shrink-0">
      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Clock-out breakdown
        </span>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
          {total.toLocaleString()}
        </p>
      </div>

      {hasData ? (
        <>
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-32 w-32 sm:h-48 sm:w-48 lg:h-70 lg:w-70"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent hideLabel nameKey="key" />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                innerRadius={55}
                strokeWidth={4}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ChartLegend
            content={<ChartLegendContent nameKey="key" payload={undefined} />}
            className="flex-wrap"
          />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No clock-outs yet
          </p>
          <p className="text-xs text-muted-foreground/60">
            Breakdown shows up once sessions are closed out.
          </p>
        </div>
      )}
    </div>
  );
}
