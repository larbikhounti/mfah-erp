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
import { MoreHorizontal, Trash2, Edit, Plus, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useMachineTypesStore,
  type MachineType,
} from "@/stores/machine-types-store";
import { toast } from "sonner";
import { CreateMachineTypeDialog } from "@/components/machine-types/create-machine-type-dialog-new";
import { EditMachineTypeDialog } from "@/components/machine-types/edit-machine-type-dialog-new";
import PaginationTable from "@/components/pagination-table";

interface EnhancedMachineTypeTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedMachineTypeTable({}: EnhancedMachineTypeTableProps) {
  const {
    machineTypes,
    loading,
    error,
    selectedMachineTypes,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchMachineTypes,
    deleteMachineType,
    bulkDeleteMachineTypes,
    restoreMachineType,
    bulkRestoreMachineTypes,
    selectMachineType,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useMachineTypesStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [editingMachineType, setEditingMachineType] =
    useState<MachineType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [machineTypeToDelete, setMachineTypeToDelete] = useState<number | null>(
    null
  );
  const [machineTypeToRestore, setMachineTypeToRestore] = useState<number | null>(
    null
  );

  // Fetch machine types on component mount
  useEffect(() => {
    fetchMachineTypes();
  }, [fetchMachineTypes]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteMachineType = async (id: number) => {
    try {
      await deleteMachineType(id);
      toast.success("Machine type deleted successfully");
      setDeleteDialogOpen(false);
      setMachineTypeToDelete(null);
    } catch (error) {
      toast.error("Failed to delete machine type");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMachineTypes(selectedMachineTypes);
      toast.success(
        `${selectedMachineTypes.length} machine types deleted successfully`
      );
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete machine types");
    }
  };

  const handleEditMachineType = (machineType: MachineType) => {
    setEditingMachineType(machineType);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingMachineType(null);
    setIsEditDialogOpen(false);
  };

  const handleCreateMachineType = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleRestoreMachineType = async (id: number) => {
    try {
      await restoreMachineType(id);
      toast.success("Machine type restored successfully");
      setRestoreDialogOpen(false);
      setMachineTypeToRestore(null);
    } catch (error) {
      toast.error("Failed to restore machine type");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreMachineTypes(selectedMachineTypes);
      toast.success(
        `${selectedMachineTypes.length} machine types restored successfully`
      );
      setBulkRestoreDialogOpen(false);
    } catch (error) {
      toast.error("Failed to restore machine types");
    }
  };

  const selectedDeletedMachineTypes = machineTypes.filter(mt => selectedMachineTypes.includes(mt.id) && mt.deletedAt);
  const selectedActiveMachineTypes = machineTypes.filter(mt => selectedMachineTypes.includes(mt.id) && !mt.deletedAt);

  // Define base columns that are always visible
  const baseColumns: TableColumn<MachineType>[] = [
    {
      key: "select",
      label: "Select",
      render: (machineType) => (
        <Checkbox
          checked={selectedMachineTypes.includes(machineType.id)}
          onCheckedChange={() => selectMachineType(machineType.id)}
          aria-label="Select machine type"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (machineType) => (
        <div className="font-mono text-sm">{machineType.id}</div>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (machineType) => (
        <div className="font-medium">{machineType.name}</div>
      ),
    },
    {
      key: "machinesCount",
      label: "Machines Count",
       sortable: true,
      render: (machineType) => (
        <Badge variant="secondary">{machineType.machinesCount} machines</Badge>
      ),
    },
  ];

  // Created column (shown when NOT in archive mode)
  const createdColumn: TableColumn<MachineType> = {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (machineType) => {
      const date = new Date(machineType.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Deleted column (shown when in archive mode)
  const deletedColumn: TableColumn<MachineType> = {
    key: "deletedAt",
    label: "Deleted",
    sortable: true,
    render: (machineType) => {
      if (!machineType.deletedAt) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      const date = new Date(machineType.deletedAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Actions column
  const actionsColumn: TableColumn<MachineType> = {
    key: "actions",
    label: "Actions",
    render: (machineType) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!machineType.deletedAt && (
            <>
              <DropdownMenuItem asChild>
                <EditMachineTypeDialog machineType={machineType} />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMachineTypeToDelete(machineType.id);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
          {machineType.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setMachineTypeToRestore(machineType.id);
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
  const columns: TableColumn<MachineType>[] = [
    ...baseColumns,
    ...(showArchived ? [deletedColumn] : [createdColumn]),
    actionsColumn,
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="Machine Type Management"
        data={machineTypes}
        columns={columns}
        searchKeys={["name"]}
        searchPlaceholder="Search machine types by name..."
        emptyMessage="No machine types found"
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
            {selectedMachineTypes.length > 0 && (
              <>
                {selectedActiveMachineTypes.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveMachineTypes.length})
                  </Button>
                )}
                {selectedDeletedMachineTypes.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedMachineTypes.length})
                  </Button>
                )}
              </>
            )}
            <CreateMachineTypeDialog />
          </div>
        }
      />
      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the machine type. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                machineTypeToDelete &&
                handleDeleteMachineType(machineTypeToDelete)
              }
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
            <AlertDialogTitle>Restore machine type?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the machine type and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                machineTypeToRestore &&
                handleRestoreMachineType(machineTypeToRestore)
              }
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
              Archive {selectedActiveMachineTypes.length} machine types?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected machine types. You can restore them later from the archived view.
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
              Restore {selectedDeletedMachineTypes.length} machine types?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected machine types and make them active again.
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
