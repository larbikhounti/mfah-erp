"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable, TableColumn } from "@/components/shared/data-table";
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
import { MoreHorizontal, Trash2, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useContractorTrucksStore, type ContractorTruck } from "@/stores/contractor-trucks-store";
import { useSubcontractorsStore } from "@/stores/subcontractors-store";
import { toast } from "sonner";
import { CreateContractorTruckDialog } from "@/components/contractor-truck/create-contractor-truck-dialog";
import { EditContractorTruckDialog } from "@/components/contractor-truck/edit-contractor-truck-dialog";
import PaginationTable from "@/components/pagination-table";

export function EnhancedContractorTruckTable() {
  const {
    contractorTrucks,
    loading,
    error,
    selectedContractorTrucks,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchContractorTrucks,
    deleteContractorTruck,
    bulkDeleteContractorTrucks,
    restoreContractorTruck,
    bulkRestoreContractorTrucks,
    selectContractorTruck,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useContractorTrucksStore();

  const { subcontractors, fetchSubcontractors } = useSubcontractorsStore();
  const subcontractorNameById = useMemo(
    () => new Map(subcontractors.map((s) => [s.id, s.companyName])),
    [subcontractors]
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [truckToDelete, setTruckToDelete] = useState<number | null>(null);
  const [truckToRestore, setTruckToRestore] = useState<number | null>(null);

  useEffect(() => {
    fetchContractorTrucks();
    fetchSubcontractors({ limit: 100 });
  }, [fetchContractorTrucks, fetchSubcontractors]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteTruck = async (id: number) => {
    try {
      await deleteContractorTruck(id);
      toast.success("Contractor truck archived successfully");
      setDeleteDialogOpen(false);
      setTruckToDelete(null);
    } catch {
      toast.error("Failed to archive contractor truck");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteContractorTrucks(selectedContractorTrucks);
      toast.success(`${selectedContractorTrucks.length} contractor trucks archived successfully`);
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to archive contractor trucks");
    }
  };

  const handleRestoreTruck = async (id: number) => {
    try {
      await restoreContractorTruck(id);
      toast.success("Contractor truck restored successfully");
      setRestoreDialogOpen(false);
      setTruckToRestore(null);
    } catch {
      toast.error("Failed to restore contractor truck");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreContractorTrucks(selectedContractorTrucks);
      toast.success(`${selectedContractorTrucks.length} contractor trucks restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch {
      toast.error("Failed to restore contractor trucks");
    }
  };

  const selectedDeletedTrucks = contractorTrucks.filter(
    (t) => selectedContractorTrucks.includes(t.id) && t.deletedAt
  );
  const selectedActiveTrucks = contractorTrucks.filter(
    (t) => selectedContractorTrucks.includes(t.id) && !t.deletedAt
  );

  const baseColumns: TableColumn<ContractorTruck>[] = [
    {
      key: "select",
      label: "Select",
      render: (truck) => (
        <Checkbox
          checked={selectedContractorTrucks.includes(truck.id)}
          onCheckedChange={() => selectContractorTruck(truck.id)}
          aria-label="Select contractor truck"
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
      key: "subcontractorId",
      label: "Subcontractor",
      sortable: true,
      render: (truck) => (
        <div className="text-sm text-muted-foreground">
          {subcontractorNameById.get(truck.subcontractorId) ?? `Subcontractor #${truck.subcontractorId}`}
        </div>
      ),
    },
  ];

  const actionsColumn: TableColumn<ContractorTruck> = {
    key: "actions",
    label: "Actions",
    render: (truck) => (
      <div className="flex items-center justify-end gap-1">
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
                  <EditContractorTruckDialog contractorTruck={truck} />
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

  const columns: TableColumn<ContractorTruck>[] = [...baseColumns, actionsColumn];

  return (
    <div className="space-y-4">
      <DataTable
        title="Contractor Trucks"
        data={contractorTrucks}
        columns={columns}
        searchKeys={["plateNumber"]}
        searchPlaceholder="Search contractor trucks by plate number..."
        emptyMessage="No contractor trucks found"
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
            {selectedContractorTrucks.length > 0 && (
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
            <CreateContractorTruckDialog />
          </div>
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the contractor truck. You can restore it later from the archived view.
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
            <AlertDialogTitle>Restore contractor truck?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the contractor truck and make it active again.
            </AlertDialogDescription>
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
            <AlertDialogTitle>Archive {selectedActiveTrucks.length} contractor trucks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected contractor trucks. You can restore them later from the archived
              view.
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
            <AlertDialogTitle>Restore {selectedDeletedTrucks.length} contractor trucks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected contractor trucks and make them active again.
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
