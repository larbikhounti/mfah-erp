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
import { MoreHorizontal, Trash2, Edit, Plus } from "lucide-react";
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
    fetchMachineTypes,
    deleteMachineType,
    bulkDeleteMachineTypes,
    selectMachineType,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
  } = useMachineTypesStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMachineType, setEditingMachineType] =
    useState<MachineType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [machineTypeToDelete, setMachineTypeToDelete] = useState<number | null>(
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

  const columns: TableColumn<MachineType>[] = [
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
      render: (machineType) => (
        <div className="font-mono text-sm">{machineType.id}</div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (machineType) => (
        <div className="font-medium">{machineType.name}</div>
      ),
    },
    {
      key: "machinesCount",
      label: "Machines Count",
      render: (machineType) => (
        <Badge variant="secondary">{machineType.machinesCount} machines</Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (machineType) => {
        const date = new Date(machineType.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
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
          <div className="flex items-center gap-2">
            {selectedMachineTypes.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedMachineTypes.length})
              </Button>
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
              This action cannot be undone. This will permanently delete the
              machine type.
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
              Delete
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
              Delete {selectedMachineTypes.length} machine types?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected machine types.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Delete All
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
