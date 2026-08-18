"use client";

import * as React from "react";
import { Label, Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DashboardSummary, MissionStatus } from "@/stores/dashboard-store";

const missionStatusConfig = {
  count: { label: "Missions" },
  PLANNED: { label: "Planned", color: "var(--chart-1)" },
  IN_PROGRESS: { label: "In Progress", color: "var(--chart-2)" },
  FINISHED: { label: "Finished", color: "var(--chart-3)" },
  CANCELLED: { label: "Cancelled", color: "var(--chart-4)" },
} satisfies ChartConfig;

const financeConfig = {
  clientRevenue: { label: "Client Revenue", color: "var(--chart-1)" },
  clientOutstanding: { label: "Client Outstanding", color: "var(--chart-2)" },
  subcontractorSpend: { label: "Subcontractor Spend", color: "var(--chart-3)" },
  subcontractorOutstanding: { label: "Subcontractor Outstanding", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function DashboardCharts({ summary }: { summary: DashboardSummary }) {
  const missionStatusData = (Object.keys(missionStatusConfig) as (MissionStatus | "count")[])
    .filter((status): status is MissionStatus => status !== "count")
    .map((status) => ({
      status,
      count: summary.missionsByStatus[status] ?? 0,
      fill: `var(--color-${status})`,
    }));

  const totalMissions = React.useMemo(
    () => missionStatusData.reduce((sum, row) => sum + row.count, 0),
    [missionStatusData]
  );

  const financeData = [
    {
      currency: "MAD",
      clientRevenue: summary.revenue.MAD,
      clientOutstanding: summary.outstanding.MAD,
      subcontractorSpend: summary.subcontractorSpend.MAD,
      subcontractorOutstanding: summary.subcontractorOutstanding.MAD,
    },
    {
      currency: "EUR",
      clientRevenue: summary.revenue.EUR,
      clientOutstanding: summary.outstanding.EUR,
      subcontractorSpend: summary.subcontractorSpend.EUR,
      subcontractorOutstanding: summary.subcontractorOutstanding.EUR,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Mission Status</CardTitle>
          <CardDescription>Distribution for the selected period</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          {totalMissions === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No missions in this period.
            </p>
          ) : (
            <ChartContainer
              config={missionStatusConfig}
              className="mx-auto aspect-square max-h-[260px]"
            >
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={missionStatusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={4}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null;
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalMissions.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-sm">
                            Missions
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs. Spend</CardTitle>
          <CardDescription>Client billing vs. subcontractor payables, by currency</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={financeConfig} className="max-h-[280px] w-full">
            <BarChart accessibilityLayer data={financeData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="currency" tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="clientRevenue" fill="var(--color-clientRevenue)" radius={4} />
              <Bar dataKey="clientOutstanding" fill="var(--color-clientOutstanding)" radius={4} />
              <Bar dataKey="subcontractorSpend" fill="var(--color-subcontractorSpend)" radius={4} />
              <Bar dataKey="subcontractorOutstanding" fill="var(--color-subcontractorOutstanding)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
