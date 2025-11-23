"use client";

import { useState, useEffect } from "react";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Eye, Clock, MapPin, Gamepad, Monitor, Users, MoreHorizontal, Trash2, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
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
                €{experience.gamePrice.toFixed(2)}
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
            {/*
            <div className="col-span-2 flex gap-1">
              <label className="text-sm font-medium text-muted-foreground">
                Required Machine Type
              </label>
              <Badge variant="secondary">
                {experience.requiredMachineType}
              </Badge>
            </div> */}
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
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Store Name
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

      {/* Coupons Used */}
      {experience.couponsUsed && experience.couponsUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {experience.couponsUsed.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{coupon.code}</span>
                    <span className="text-sm text-muted-foreground">
                      {coupon.discount}% discount
                    </span>
                  </div>
                  <Badge variant="secondary">{coupon.usageCount} uses</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Used */}
      {experience.commentsUsed && experience.commentsUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {experience.commentsUsed.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start justify-between p-3 border rounded"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-sm">{comment.content}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="secondary">{comment.usageCount} uses</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                €{experience.ticketSummary.totalRevenue.toFixed(2)}
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
    selectedExperiences,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchExperiences,
    deleteExperience,
    bulkDeleteExperiences,
    restoreExperience,
    bulkRestoreExperiences,
    selectExperience,
    clearSelection,
    setPage,
    setPageSize,
    setShowArchived,
    clearError,
  } = useExperiencesStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<number | null>(null);
  const [experienceToRestore, setExperienceToRestore] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });

  // Handle date range change
  const handleDateRangeChange = (date: DateRange | undefined) => {
    setDateRange(date);
  };

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
  }, [searchTerm, dateRange, currentPage, pageSize]);

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

  const handleDeleteExperience = async (id: number) => {
    try {
      await deleteExperience(id);
      toast.success("Experience deleted successfully");
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
    } catch (error) {
      toast.error("Failed to delete experience");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteExperiences(selectedExperiences);
      toast.success(`${selectedExperiences.length} experiences deleted successfully`);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete experiences");
    }
  };

  const handleRestoreExperience = async (id: number) => {
    try {
      await restoreExperience(id);
      toast.success("Experience restored successfully");
      setRestoreDialogOpen(false);
      setExperienceToRestore(null);
    } catch (error) {
      toast.error("Failed to restore experience");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreExperiences(selectedExperiences);
      toast.success(`${selectedExperiences.length} experiences restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch (error) {
      toast.error("Failed to restore experiences");
    }
  };

  const selectedDeletedExperiences = experiences.filter(e => selectedExperiences.includes(e.id) && e.deletedAt);
  const selectedActiveExperiences = experiences.filter(e => selectedExperiences.includes(e.id) && !e.deletedAt);

  // Define base columns that are always visible
  const baseColumns: TableColumn<Experience>[] = [
    {
      key: "select",
      label: "Select",
      render: (experience) => (
        <Checkbox
          checked={selectedExperiences.includes(experience.id)}
          onCheckedChange={() => selectExperience(experience.id)}
          aria-label="Select experience"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (experience) => (
        <div className="font-mono text-sm">{experience.id}</div>
      ),
    },
    {
      key: "machine",
      label: "Machine",
      sortable: true,
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
      sortable: true,
      render: (experience) => (
        <div className="space-y-1">
          <Badge variant="secondary">{experience.game}</Badge>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            €{experience.gamePrice.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: "dome",
      label: "DOM",
      sortable: true,
      render: (experience) => (
        <Badge variant="secondary">{experience.dome}</Badge>
      ),
    },
    {
      key: "tickets",
      label: "Tickets",
       sortable: true,
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
       sortable: true,
      render: (experience) => {
        const seconds = experience.gamePlayTime;
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        let timeString;
        if (hours > 0) {
          timeString = `${hours}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
          timeString = `${mins}m ${secs}s`;
        } else {
          timeString = `${secs}s`;
        }

        return (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            {timeString}
          </div>
        );
      },
    },
  ];

  // Created column (shown when NOT in archive mode)
  const createdColumn: TableColumn<Experience> = {
    key: "createdAt",
    label: "Created",
    sortable: true,
    sortFunction: (a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    },
    render: (experience) => {
      const date = new Date(experience.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      );
    },
  };

  // Deleted column (shown when in archive mode)
  const deletedColumn: TableColumn<Experience> = {
    key: "deletedAt",
    label: "Deleted",
    sortable: true,
    render: (experience) => {
      if (!experience.deletedAt) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      const date = new Date(experience.deletedAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Actions column
  const actionsColumn: TableColumn<Experience> = {
    key: "actions",
    label: "Actions",
    render: (experience) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Sheet>
              <SheetTrigger asChild>
                <span className="cursor-pointer hover:underline flex items-center w-full px-2 py-1.5">
                  <Eye className="h-4 w-4 mr-2" />
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
          </DropdownMenuItem>
          {!experience.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setExperienceToDelete(experience.id);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
          {experience.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setExperienceToRestore(experience.id);
                setRestoreDialogOpen(true);
              }}
              className="text-green-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  // Build the final columns array based on showArchived state
  const columns: TableColumn<Experience>[] = [
    ...baseColumns,
    ...(showArchived ? [deletedColumn] : [createdColumn]),
    actionsColumn,
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
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={setShowArchived}
                className="data-[state=checked]:bg-red-600"
              />
              <Label htmlFor="show-archived" className="text-sm font-medium">
                Archive
              </Label>
            </div>
            {selectedExperiences.length > 0 && (
              <>
                {selectedActiveExperiences.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveExperiences.length})
                  </Button>
                )}
                {selectedDeletedExperiences.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedExperiences.length})
                  </Button>
                )}
              </>
            )}
            <RangeDate onDateChange={handleDateRangeChange} initialDate={dateRange} />
          </div>
        }
      />

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the experience. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => experienceToDelete && handleDeleteExperience(experienceToDelete)}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore experience?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the experience and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => experienceToRestore && handleRestoreExperience(experienceToRestore)}
              className="bg-green-600 hover:bg-green-700"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archive {selectedActiveExperiences.length} experiences?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected experiences. You can restore them later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Archive All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Restore Dialog */}
      <AlertDialog
        open={bulkRestoreDialogOpen}
        onOpenChange={setBulkRestoreDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restore {selectedDeletedExperiences.length} experiences?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected experiences and make them active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRestore}
              className="bg-green-600 hover:bg-green-700"
            >
              Restore All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
