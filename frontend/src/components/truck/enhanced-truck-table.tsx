"use client";

import { useState, useEffect } from "react";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal, Trash2, Paperclip, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTrucksStore, type Truck, type TruckStatus } from "@/stores/trucks-store";
import { toast } from "sonner";
import { CreateTruckDialog } from "@/components/truck/create-truck-dialog";
import { EditTruckDialog } from "@/components/truck/edit-truck-dialog";
import { AttachmentsPanel } from "@/components/shared/attachments-panel";
import PaginationTable from "@/components/pagination-table";

const STATUS_VARIANT: Record<TruckStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DISPO: "default",
  EN_MISSION: "secondary",
  MAINTENANCE: "outline",
  INDISPONIBLE: "destructive",
};

export function EnhancedTruckTable() {
  const {
    trucks,
    loading,
    error,
    selectedTrucks,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchTrucks,
    deleteTruck,
    bulkDeleteTrucks,
    restoreTruck,
    bulkRestoreTrucks,
    selectTruck,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useTrucksStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState<number | null>(null);
  const [truckToRestore, setTruckToRestore] = useState<number | null>(null);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteTruck = async (id: number) => {
    try {
      await deleteTruck(id);
      toast.success("Truck archived successfully");
      setDeleteDialogOpen(false);
      setTruckToDelete(null);
    } catch {
      toast.error("Failed to archive truck");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteTrucks(selectedTrucks);
      toast.success(`${selectedTrucks.length} trucks archived successfully`);
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to archive trucks");
    }
  };

  const handleRestoreTruck = async (id: number) => {
    try {
      await restoreTruck(id);
      toast.success("Truck restored successfully");
      setRestoreDialogOpen(false);
      setTruckToRestore(null);
    } catch {
      toast.error("Failed to restore truck");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreTrucks(selectedTrucks);
      toast.success(`${selectedTrucks.length} trucks restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch {
      toast.error("Failed to restore trucks");
    }
  };

  const selectedDeletedTrucks = trucks.filter((t) => selectedTrucks.includes(t.id) && t.deletedAt);
  const selectedActiveTrucks = trucks.filter((t) => selectedTrucks.includes(t.id) && !t.deletedAt);

  const baseColumns: TableColumn<Truck>[] = [
    {
      key: "select",
      label: "Select",
      render: (truck) => (
        <Checkbox
          checked={selectedTrucks.includes(truck.id)}
          onCheckedChange={() => selectTruck(truck.id)}
          aria-label="Select truck"
        />
      ),
    },
    {
      key: "plateNumber",
      label: "Plate Number",
      sortable: true,
      render: (truck) => <div className="font-medium">{truck.plateNumber}</div>,
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (truck) => <div className="text-sm text-muted-foreground">{truck.type}</div>,
    },
    {
      key: "ptac",
      label: "PTAC",
      sortable: true,
      render: (truck) => <div className="text-sm">{truck.ptac.toLocaleString()} kg</div>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (truck) => <Badge variant={STATUS_VARIANT[truck.status]}>{truck.status}</Badge>,
    },
    {
      key: "insuranceExpiry",
      label: "Insurance Expiry",
      sortable: true,
      render: (truck) => (
        <div className="text-sm text-muted-foreground">
          {new Date(truck.insuranceExpiry).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const actionsColumn: TableColumn<Truck> = {
    key: "actions",
    label: "Actions",
    render: (truck) => (
      <div className="flex items-center justify-end gap-1">
        <AttachmentsPanel
          resourcePath="trucks"
          ownerId={truck.id}
          ownerLabel={truck.plateNumber}
          trigger={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!truck.deletedAt && (
              <>
                <DropdownMenuItem asChild>
                  <EditTruckDialog truck={truck} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTruckToDelete(truck.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {truck.deletedAt && (
              <DropdownMenuItem
                onClick={() => {
                  setTruckToRestore(truck.id);
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
      </div>
    ),
  };

  const columns: TableColumn<Truck>[] = [...baseColumns, actionsColumn];

  return (
    <div className="space-y-4">
      <DataTable
        title="Fleet Management"
        data={trucks}
        columns={columns}
        searchKeys={["plateNumber", "type"]}
        searchPlaceholder="Search trucks by plate number or type..."
        emptyMessage="No trucks found"
        showCount={true}
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
            {selectedTrucks.length > 0 && (
              <>
                {selectedActiveTrucks.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveTrucks.length})
                  </Button>
                )}
                {selectedDeletedTrucks.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedTrucks.length})
                  </Button>
                )}
              </>
            )}
            <CreateTruckDialog />
          </div>
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the truck. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => truckToDelete && handleDeleteTruck(truckToDelete)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore truck?</AlertDialogTitle>
            <AlertDialogDescription>This will restore the truck and make it active again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => truckToRestore && handleRestoreTruck(truckToRestore)}
              className="bg-green-600 hover:bg-green-700"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedActiveTrucks.length} trucks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected trucks. You can restore them later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Archive All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkRestoreDialogOpen} onOpenChange={setBulkRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore {selectedDeletedTrucks.length} trucks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected trucks and make them active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRestore} className="bg-green-600 hover:bg-green-700">
              Restore All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {total > 0 && (
        <PaginationTable
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
