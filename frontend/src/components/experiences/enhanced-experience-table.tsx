"use client";

import { useState, useEffect } from "react";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useExperiencesStore,
  type Experience,
} from "@/stores/experiences-store";
import { toast } from "sonner";
import PaginationTable from "@/components/pagination-table";
import { Eye, Clock, MapPin, Gamepad, Monitor, Users } from "lucide-react";
import RangeDate from "../range-date";
import { DateRange } from "react-day-picker";

interface EnhancedExperienceTableProps {
  // Remove the callback props since we'll handle them internally
}

function ExperienceDetailSheet({ experience }: { experience: Experience }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getChairStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">Available</Badge>;
      case 1:
        return <Badge variant="destructive">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad className="h-5 w-5" />
            Experience Details
          </CardTitle>
          <CardDescription>ID: {experience.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p className="text-sm">{formatDate(experience.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="text-sm">{formatDate(experience.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad className="h-5 w-5" />
            Game Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Game Name
              </label>
              <p className="font-medium">{experience.game}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Game Type
              </label>
              <Badge variant="secondary">{experience.gameType}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Price
              </label>
              <p className="font-medium flex items-center gap-1">
                ${experience.gamePrice.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Play Time
              </label>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatPlayTime(experience.gamePlayTime)}
              </p>
            </div>
            <div className="col-span-2 flex gap-1">
              <label className="text-sm font-medium text-muted-foreground">
                Required Machine Type
              </label>
              <Badge variant="secondary">
                {experience.requiredMachineType}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Machine Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Machine Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Machine Name
              </label>
              <p className="font-medium">{experience.machine}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Machine Type
              </label>
              <Badge variant="secondary">{experience.machineType}</Badge>
            </div>
          </div>

          {experience.machineChairs.length > 0 && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Machine Chairs
                </label>
                <div className="grid gap-2">
                  {experience.machineChairs.map((chair) => (
                    <div
                      key={chair.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">
                          {chair.name}
                        </span>
                        {getChairStatusBadge(chair.status)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-4  w-4" />
                        {chair.ticketCount} tickets
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* DOM Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            DOM Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                DOM Name
              </label>
              <p className="font-medium">{experience.dome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Address
              </label>
              <p className="text-sm">{experience.domeAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Summary */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tickets Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg ">{experience.ticketSummary.totalCount}</p>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
            </div>
            <div>
              <p className="text-lg  ">{experience.ticketSummary.paidCount}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
            <div>
              <p className="text-lg ">{experience.ticketSummary.unpaidCount}</p>
              <p className="text-sm text-muted-foreground">Unpaid</p>
            </div>
            <div>
              <p className="text-lg ">
                ${experience.ticketSummary.totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EnhancedExperienceTable({}: EnhancedExperienceTableProps) {
  const {
    experiences,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    totalPages,
    fetchExperiences,
    setPage,
    setPageSize,
    clearError,
  } = useExperiencesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Handle date range change
  const handleDateRangeChange = (date: DateRange | undefined) => {
    setDateRange(date);
  };

  // Fetch experiences on component mount and when pagination changes
  useEffect(() => {
    fetchExperiences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // Handle search and date filtering with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      // Convert dates to ISO strings for the API
      const startDate = dateRange?.from
        ? dateRange.from.toISOString().split("T")[0]
        : undefined;
      const endDate = dateRange?.to
        ? dateRange.to.toISOString().split("T")[0]
        : undefined;

      fetchExperiences({
        search: searchTerm.trim() || undefined,
        startDate,
        endDate,
      });
    }, 500);

    return () => clearTimeout(delayedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, dateRange]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const columns: TableColumn<Experience>[] = [
    {
      key: "id",
      label: "ID",
      render: (experience) => (
        <div className="font-mono text-sm">{experience.id}</div>
      ),
    },
    {
      key: "machine",
      label: "Machine",
      render: (experience) => (
        <div className="space-y-1">
          <Badge variant="outline">{experience.machine}</Badge>
          <div className="text-xs text-muted-foreground">
            {experience.machineType}
          </div>
        </div>
      ),
    },
    {
      key: "game",
      label: "Game",
      render: (experience) => (
        <div className="space-y-1">
          <Badge variant="secondary">{experience.game}</Badge>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            ${experience.gamePrice.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: "dome",
      label: "DOM",
      render: (experience) => (
        <Badge variant="secondary">{experience.dome}</Badge>
      ),
    },
    {
      key: "tickets",
      label: "Tickets",
      render: (experience) => (
        <div className="">
          <div className="font-bold text-lg">{experience.ticketCount}</div>
          <div className="text-xs text-muted-foreground">tickets</div>
        </div>
      ),
    },
    {
      key: "playTime",
      label: "Duration",
      render: (experience) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-4 w-4" />
          {Math.floor(experience.gamePlayTime / 60) > 0
            ? `${Math.floor(experience.gamePlayTime / 60)}h ${
                experience.gamePlayTime % 60
              }m`
            : `${experience.gamePlayTime}m`}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (experience) => {
        const date = new Date(experience.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (experience) => (
        <Sheet>
          <SheetTrigger asChild>
            <span className="cursor-pointer  hover:underline flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </span>
          </SheetTrigger>
          <SheetContent className=" min-w-[600px] px-6 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Experience Details</SheetTitle>
              <SheetDescription>
                Detailed information about experience #{experience.id}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <ExperienceDetailSheet experience={experience} />
            </div>
          </SheetContent>
        </Sheet>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Experiences"
        data={experiences}
        columns={columns as TableColumn<object>[]}
        searchKeys={["machine", "game", "dome"]}
        searchPlaceholder="Search experiences..."
        filters={[]}
        showCount={true}
        emptyMessage={
          loading ? "Loading experiences..." : "No experiences found"
        }
        customHeader={
          <div className=" relative flex items-center">
            <RangeDate onDateChange={handleDateRangeChange} />
          </div>
        }
      />

      {/* Pagination */}
      <PaginationTable
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={(page) => {
          setPage(page);
        }}
        onPageSizeChange={(size) => {
          setPageSize(size);
        }}
      />
    </div>
  );
}
