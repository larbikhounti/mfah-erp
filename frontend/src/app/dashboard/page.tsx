"use client";

import { useEffect } from "react";
import { DateRange } from "react-day-picker";
import {
  IconRoute,
  IconCoin,
  IconWallet,
  IconAlertTriangle,
  IconBriefcase,
  IconTruck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader } from "@/components/loader";
import PaginationTable from "@/components/pagination-table";
import RangeDate from "@/components/range-date";
import { useDashboardStore, type MissionStatus } from "@/stores/dashboard-store";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

const STATUS_VARIANT: Record<MissionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PLANNED: "outline",
  IN_PROGRESS: "secondary",
  FINISHED: "default",
  CANCELLED: "destructive",
};

function money(amount: number) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DashboardPage() {
  const {
    summary,
    loading,
    error,
    currentPage,
    pageSize,
    fetchSummary,
    setDateRange,
    setPage,
    setPageSize,
    clearError,
  } = useDashboardStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(
      range?.from ? range.from.toISOString() : null,
      range?.to ? range.to.toISOString() : null
    );
  };

  const totalPages = summary ? Math.ceil(summary.missions.total / pageSize) : 0;

  if (loading && !summary) {
    return (
      <section className="flex flex-col gap-4 w-full px-6 py-4">
        <div className="flex items-center justify-center py-16">
          <Loader size={24} />
        </div>
      </section>
    );
  }

  if (!summary) {
    return null;
  }

  const finishedMissions = summary.missionsByStatus.FINISHED ?? 0;
  const inProgressMissions = summary.missionsByStatus.IN_PROGRESS ?? 0;
  const dispoTrucks = summary.fleetStatus.DISPO ?? 0;
  const totalTrucks = Object.values(summary.fleetStatus).reduce((a, b) => a + b, 0);
  const activeDrivers = summary.driverStatus.ACTIF ?? 0;
  const totalDrivers = Object.values(summary.driverStatus).reduce((a, b) => a + b, 0);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Mission and revenue overview.</p>
        </div>
        <RangeDate onDateChange={handleDateChange} />
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @md/main:grid-cols-2 @3xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Missions</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {summary.missionTotal.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconRoute className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{finishedMissions} finished</div>
            <div className="text-muted-foreground">{inProgressMissions} in progress</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Client Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {money(summary.revenue.MAD)} MAD
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconCoin className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{money(summary.revenue.EUR)} EUR</div>
            <div className="text-muted-foreground">Billed to clients</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Client Outstanding</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {money(summary.outstanding.MAD)} MAD
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconWallet className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{money(summary.outstanding.EUR)} EUR</div>
            <div className="text-muted-foreground">Not yet paid</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Overdue Invoices</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {summary.overdueClientInvoices}
            </CardTitle>
            <CardAction>
              <Badge variant={summary.overdueClientInvoices > 0 ? "destructive" : "outline"}>
                <IconAlertTriangle className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Past due date, still unpaid</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Subcontractor Spend</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {money(summary.subcontractorSpend.MAD)} MAD
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconBriefcase className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{money(summary.subcontractorSpend.EUR)} EUR</div>
            <div className="text-muted-foreground">Owed to subcontractors</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Subcontractor Outstanding</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {money(summary.subcontractorOutstanding.MAD)} MAD
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconWallet className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {money(summary.subcontractorOutstanding.EUR)} EUR
            </div>
            <div className="text-muted-foreground">Not yet paid out</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Overdue Bills</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {summary.overdueSubcontractorBills}
            </CardTitle>
            <CardAction>
              <Badge variant={summary.overdueSubcontractorBills > 0 ? "destructive" : "outline"}>
                <IconAlertTriangle className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Subcontractor bills past due</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Fleet Available</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {dispoTrucks}/{totalTrucks}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTruck className="size-4" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {activeDrivers}/{totalDrivers} drivers active
            </div>
            <div className="text-muted-foreground">Live fleet &amp; driver status</div>
          </CardFooter>
        </Card>
      </div>

      <DashboardCharts summary={summary} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Bill</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.missions.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No missions in this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.missions.data.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell className="font-mono text-sm font-medium">{mission.reference}</TableCell>
                      <TableCell className="text-sm">{mission.clientName}</TableCell>
                      <TableCell>
                        <Badge variant={mission.executionMode === "IN_HOUSE" ? "default" : "secondary"}>
                          {mission.executionMode === "IN_HOUSE" ? "In-house" : "Subcontracted"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {Number(mission.clientPrice).toLocaleString()} {mission.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[mission.status]}>{mission.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {mission.clientInvoiceStatus?.replace("_", " ") || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {mission.subcontractorBillStatus?.replace("_", " ") || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(mission.missionDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {summary.missions.total > 0 && (
            <PaginationTable
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={summary.missions.total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
