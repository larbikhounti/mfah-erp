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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import PaginationTable from "@/components/pagination-table";
import { Eye, Clock, MapPin, Gamepad, Monitor, Users, MoreHorizontal, Trash2, RotateCcw, Tag, Ticket } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import RangeDate from "../range-date";
import { DateRange } from "react-day-picker";

interface EnhancedExperienceTableProps {
  // Remove the callback props since we'll handle them internally
}

interface ExperienceDetailDialogProps {
  experience: Experience;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ExperienceDetailDialog({ experience, open, onOpenChange }: ExperienceDetailDialogProps) {
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};

  const getEffectivePrice = (ticket: any) => {
    // Use ticket price if available (already discounted)
    if (ticket.price !== null && ticket.price !== undefined) {
      return ticket.price;
    }

    // Calculate from coupon if available
    if (ticket.coupon) {
      const discountMultiplier = 1 - ticket.coupon.discount / 100;
      return Math.max(0, Math.round(experience.gamePrice * discountMultiplier * 100) / 100);
    }

    return experience.gamePrice;
  };

  const getPaymentMethodLabel = (paidWith: number | null) => {
    if (paidWith === null) return null;
    return paidWith === 0 ? "Cash" : "Card";
  };

  const calculateTimeDifference = (startDate: string, endDate: string | null) => {
    if (!endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes;
  };

  const createdToStartedMins = experience.startedAt
    ? calculateTimeDifference(experience.createdAt, experience.startedAt)
    : null;

  const startedToEndedMins = experience.startedAt && experience.endedAt
    ? calculateTimeDifference(experience.startedAt, experience.endedAt)
    : null;

  const tickets = experience.tickets || [];
  const paidTickets = tickets.filter(t => t.isPaid);
  const unpaidTickets = tickets.filter(t => !t.isPaid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-fit max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Experience Details - {experience.machine}
          </DialogTitle>
          <DialogDescription>
            Viewing details for experience #{experience.id}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Timing Information */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Created:</span>
                <p>{formatDate(experience.createdAt)}</p>
              </div>
              {experience.startedAt && (
                <div>
                  <span className="font-medium">Started:</span>
                  <p>{formatDate(experience.startedAt)}</p>
                  {createdToStartedMins !== null && (
                    <p className="text-xs text-muted-foreground">
                      +{createdToStartedMins} min from created
                    </p>
                  )}
                </div>
              )}
              {experience.endedAt && (
                <div>
                  <span className="font-medium">Ended:</span>
                  <p>{formatDate(experience.endedAt)}</p>
                  {startedToEndedMins !== null && (
                    <p className="text-xs text-muted-foreground">
                      +{startedToEndedMins} min from started
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tickets Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Experience Tickets</h3>
              <div className="ml-auto flex items-center gap-2">
                {paidTickets.length > 0 && unpaidTickets.length > 0 ? (
                  <>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full dark:bg-green-900/50 dark:text-green-200">
                      {paidTickets.length} Sold
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full dark:bg-blue-900/50 dark:text-blue-200">
                      {unpaidTickets.length} Available
                    </span>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      tickets.every(t => t.isPaid)
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                    }`}
                  >
                    {tickets.length} {tickets.every(t => t.isPaid) ? 'Sold' : 'Available'}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {tickets.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="text-muted-foreground">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No tickets available</p>
                    <p className="text-sm">There are no tickets to display at the moment.</p>
                  </div>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const effectivePrice = getEffectivePrice(ticket);
                  const hasDiscount = ticket.coupon && effectivePrice < experience.gamePrice;
                  const paymentMethod = getPaymentMethodLabel(ticket.paidWith);

                  return (
                    <div
                      key={ticket.id}
                      className={cn(
                        "relative group transition-all duration-200",
                        ticket.isPaid ? "opacity-75" : ""
                      )}
                    >
                      <div className="p-4 rounded-lg border-2 transition-all duration-200 bg-card border-border">
                        {/* Ticket Info */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="px-3 py-1 rounded-full text-sm font-bold bg-secondary text-secondary-foreground">
                              {ticket.alias}
                            </div>
                            {ticket.isPaid ? (
                              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/50 dark:text-green-200">
                                SOLD
                              </div>
                            ) : hasDiscount ? (
                              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/50 dark:text-green-200">
                                DISCOUNTED
                              </div>
                            ) : (
                              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900/50 dark:text-blue-200">
                                AVAILABLE
                              </div>
                            )}
                          </div>

                          {/* Game & Chair */}
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-foreground">{experience.game}</h3>
                            <p className="text-sm text-muted-foreground">{ticket.chairName}</p>
                          </div>

                          {/* Price Info */}
                          <div className="space-y-1 border-t pt-2">
                            <div className="flex justify-between text-sm">
                              <span>Price:</span>
                              <span className={hasDiscount ? "line-through text-muted-foreground" : "font-bold"}>
                                €{experience.gamePrice.toFixed(2)}
                              </span>
                            </div>
                            {hasDiscount && (
                              <div className="flex justify-between text-sm font-bold text-green-600">
                                <span>Final Price:</span>
                                <span>€{effectivePrice.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          {/* Payment Method */}
                          {ticket.isPaid && paymentMethod && (
                            <div className="text-center text-sm">
                              <span className="px-2 py-1 bg-muted rounded text-xs">
                                Paid with {paymentMethod}
                              </span>
                            </div>
                          )}

                          {/* Coupon */}
                          {ticket.coupon && (
                            <div className="space-y-1 pt-2 border-t">
                              <label className="text-xs font-medium text-muted-foreground">Coupon:</label>
                              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-sm">
                                <p className="font-medium">{ticket.coupon.code}</p>
                                <p className="text-xs text-muted-foreground">{ticket.coupon.discount}% discount</p>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {ticket.notes && (
                            <div className="space-y-1 pt-2 border-t">
                              <label className="text-xs font-medium text-muted-foreground">Note:</label>
                              <div className="p-2 bg-muted rounded-md text-sm">
                                {ticket.notes}
                              </div>
                            </div>
                          )}

                          {/* Comments */}
                          {ticket.comments && ticket.comments.length > 0 && (
                            <div className="space-y-1 pt-2 border-t">
                              <label className="text-xs font-medium text-muted-foreground">
                                Comments ({ticket.comments.length}):
                              </label>
                              <div className="space-y-1">
                                {ticket.comments.map((comment) => (
                                  <div key={comment.id} className="p-2 bg-muted rounded-md text-sm break-words">
                                    {comment.content}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Fractioned Info */}
                          {ticket.parentTicket && (
                            <div className="space-y-1 pt-2 border-t">
                              <label className="text-xs font-medium text-orange-600">FRACTIONED FROM:</label>
                              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md text-xs space-y-1">
                                <p><span className="font-medium">Parent Alias:</span> {ticket.parentTicket.alias}</p>
                                <p><span className="font-medium">Parent Chair:</span> {ticket.parentTicket.chairName}</p>
                                <p><span className="font-medium">Parent Machine:</span> {ticket.parentTicket.machineName}</p>
                                <p><span className="font-medium">Parent Game:</span> {ticket.parentTicket.gameName}</p>
                                <p><span className="font-medium">Parent Price:</span> €{ticket.parentTicket.gamePrice.toFixed(2)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>


          {/* Coupons Summary 
          {experience.couponsUsed && experience.couponsUsed.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Coupons Summary
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
          )}*/}

          {/* Comments Summary 
          {experience.commentsUsed && experience.commentsUsed.length > 0 && (
            <Card className="mt-6 mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Comments Summary
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
          )}*/}
        </div>
      </DialogContent>
    </Dialog>
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

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
         {/*<div className="text-xs text-muted-foreground">
            {experience.machineType}
          </div>*/} 
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
        </div>
      ),
    },
    {
      key: "dome",
      label: "Store",
      sortable: true,
      render: (experience) => (
        <Badge variant="secondary">{experience.dome}</Badge>
      ),
    },
    {
      key: "tickets",
      label: "Tickets",
       sortable: true,
      render: (experience) => {
        const soldCount = experience.tickets?.filter(t => t.isPaid).length || 0;
        const totalCount = experience.ticketCount || 0;
        const allSold = soldCount === totalCount && totalCount > 0;

        return (
          <div className="space-y-1">
            <div className={cn(
              "font-bold text-lg",
              allSold ? "text-green-600" : ""
            )}>
              {soldCount}/{totalCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {soldCount} sold
            </div>
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Price",
       sortable: true,
      render: (experience) => {
        const getEffectivePrice = (ticket: any) => {
          // Use ticket price if available (already discounted)
          if (ticket.price !== null && ticket.price !== undefined) {
            return ticket.price;
          }

          // Calculate from coupon if available
          if (ticket.coupon) {
            const discountMultiplier = 1 - ticket.coupon.discount / 100;
            return Math.max(0, Math.round(experience.gamePrice * discountMultiplier * 100) / 100);
          }

          return experience.gamePrice;
        };

        const soldTickets = experience.tickets?.filter(t => t.isPaid) || [];
        const totalRevenue = soldTickets.reduce((sum, ticket) => {
          return sum + getEffectivePrice(ticket);
        }, 0);

        return (
          <div className="space-y-1">
            <div className="font-bold text-lg">
              €{totalRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              revenue
            </div>
          </div>
        );
      },
    },
    {
      key: "waitingTime",
      label: "Waiting Time",
       sortable: true,
      render: (experience) => {
        if (!experience.startedAt) {
          return (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Not started
            </div>
          );
        }

        const createdDate = new Date(experience.createdAt);
        const startedDate = new Date(experience.startedAt);
        const diffMs = startedDate.getTime() - createdDate.getTime();
        const seconds = Math.floor(diffMs / 1000);

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
          <DropdownMenuItem
            onClick={() => {
              setSelectedExperience(experience);
              setDetailDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
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

      {/* Experience Detail Dialog */}
      {selectedExperience && (
        <ExperienceDetailDialog
          experience={selectedExperience}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}

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
