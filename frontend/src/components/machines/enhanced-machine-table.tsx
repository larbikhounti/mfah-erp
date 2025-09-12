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
import { useMachinesStore, type Machine } from "@/stores/machines-store";
import { toast } from "sonner";
import PaginationTable from "@/components/pagination-table";
import { EditMachineDialog } from "./edit-machine-dialog-new";
import { CreateMachineDialog } from "./create-machine-dialog-new";

interface EnhancedMachineTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedMachineTable({}: EnhancedMachineTableProps) {
  const {
    machines,
    loading,
    error,
    selectedMachines,
    total,
    currentPage,
    pageSize,
    totalPages,
    fetchMachines,
    deleteMachine,
    bulkDeleteMachines,
    selectMachine,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
  } = useMachinesStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<number | null>(null);

  // Fetch machines on component mount
  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteMachine = async (id: number) => {
    try {
      await deleteMachine(id);
      toast.success("Machine deleted successfully");
      setDeleteDialogOpen(false);
      setMachineToDelete(null);
    } catch (error) {
      toast.error("Failed to delete machine");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMachines(selectedMachines);
      toast.success(`${selectedMachines.length} machines deleted successfully`);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete machines");
    }
  };

  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingMachine(null);
    setIsEditDialogOpen(false);
  };

  const handleCreateMachine = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const columns: TableColumn<Machine>[] = [
    {
      key: "select",
      label: "Select",
      render: (machine) => (
        <Checkbox
          checked={selectedMachines.includes(machine.id)}
          onCheckedChange={() => selectMachine(machine.id)}
          aria-label="Select machine"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      render: (machine) => (
        <div className="font-mono text-sm">{machine.id}</div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (machine) => <div className="font-medium">{machine.name}</div>,
    },
    {
      key: "machineType",
      label: "Machine Type",
      render: (machine) => (
        <Badge variant="secondary">{machine.machineType || "No Type"}</Badge>
      ),
    },
    {
      key: "dome",
      label: "DOM",
      render: (machine) => (
        <Badge variant="secondary">{machine.dome || "No DOM"}</Badge>
      ),
    },
    {
      key: "chairsCount",
      label: "Chairs",
      render: (machine) => (
        <Badge variant="secondary">{machine.chairsCount || 0} chairs</Badge>
      ),
    },
    {
      key: "experiencesCount",
      label: "Experiences",
      render: (machine) => (
        <Badge variant="secondary">
          {machine.experiencesCount || 0} experiences
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (machine) => {
        const date = new Date(machine.createdAt);
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
      render: (machine) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <EditMachineDialog machine={machine} />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setMachineToDelete(machine.id);
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
        title="Machine Management"
        data={machines}
        columns={columns}
        searchKeys={["name", "machineType.name", "dome.name"]}
        searchPlaceholder="Search machines by name, type, or DOM..."
        emptyMessage="No machines found"
        showCount={true}
        customHeader={
          <div className="flex items-center gap-2">
            {selectedMachines.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedMachines.length})
              </Button>
            )}
            <CreateMachineDialog />
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
              machine and all its associated chairs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                machineToDelete && handleDeleteMachine(machineToDelete)
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
              Delete {selectedMachines.length} machines?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected machines and all their associated chairs.
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
