"use client";

import { IconActivity, IconCoin, IconTrendingUp, IconCash, IconCreditCard } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStatisticsStore } from "@/stores/statistics-store";
import { Loader } from "@/components/loader";

export function SectionCards() {
  const { statistics, loading } = useStatisticsStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size={24} />
        <span className="ml-2 text-sm text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-sm text-gray-600">No statistics available</span>
      </div>
    );
  }

  const totalTickets = statistics.soldTickets + statistics.unsoldTickets;
  const soldPercentage = totalTickets > 0
    ? ((statistics.soldTickets / totalTickets) * 100).toFixed(1)
    : "0";

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @md/main:grid-cols-2 @3xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Experiences</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {statistics.totalExperiences.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconActivity className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {statistics.fractionedExperiences} fractioned
          </div>
          <div className="text-muted-foreground">Active experiences</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sold Tickets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {statistics.soldTickets.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="size-4" />
              {soldPercentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {statistics.unsoldTickets.toLocaleString()} unsold tickets
          </div>
          <div className="text-muted-foreground">
            {soldPercentage}% conversion rate
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenu</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            €{statistics.moneyMade.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCoin className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="grid grid-cols-2 divide-x p-0">
          {/* Cash Section */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <IconCash className="size-4 text-amber-600" />
              <span className="text-xs font-medium text-muted-foreground">Cash</span>
            </div>
            <div className="text-lg font-semibold tabular-nums">
              €{statistics.cashRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {statistics.cashTicketsCount} tickets
            </div>
          </div>

          {/* Card Section */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <IconCreditCard className="size-4 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">Card</span>
            </div>
            <div className="text-lg font-semibold tabular-nums">
              €{statistics.cardRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {statistics.cardTicketsCount} tickets
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Potential Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            €{statistics.potentialRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTicket className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            From {statistics.unsoldTickets} unpaid tickets
          </div>
          <div className="text-muted-foreground">Potential income</div>
        </CardFooter>
      </Card> */}

      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Tickets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalTickets.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTicket className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {statistics.soldTickets} paid / {statistics.unsoldTickets} unpaid
          </div>
          <div className="text-muted-foreground">All ticket bookings</div>
        </CardFooter>
      </Card> */}

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Fractioned Experiences</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {statistics.fractionedExperiences.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconActivity className="size-4" />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Split experiences
          </div>
          <div className="text-muted-foreground">Fractioned sessions</div>
        </CardFooter>
      </Card>
    </div>
  );
}
