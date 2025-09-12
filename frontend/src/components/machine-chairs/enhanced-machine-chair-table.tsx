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
  useMachineChairsStore,
  type MachineChair,
} from "@/stores/machine-chairs-store";
import { toast } from "sonner";
import { EditMachineChairDialog } from "./edit-machine-chair-dialog";
import { CreateMachineChairDialog } from "./create-machine-chair-dialog";
import PaginationTable from "@/components/pagination-table";

interface EnhancedMachineChairTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedMachineChairTable({}: EnhancedMachineChairTableProps) {
  const {
    machineChairs,
    loading,
    error,
    selectedMachineChairs,
    total,
    currentPage,
    pageSize,
    totalPages,
    fetchMachineChairs,
    deleteMachineChair,
    bulkDeleteMachineChairs,
    selectMachineChair,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
  } = useMachineChairsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMachineChair, setEditingMachineChair] =
    useState<MachineChair | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [machineChairToDelete, setMachineChairToDelete] = useState<
    number | null
  >(null);

  // Fetch machine chairs on component mount
  useEffect(() => {
    fetchMachineChairs();
  }, [fetchMachineChairs]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteMachineChair = async (id: number) => {
    try {
      await deleteMachineChair(id);
      toast.success("Machine chair deleted successfully");
      setDeleteDialogOpen(false);
      setMachineChairToDelete(null);
    } catch (error) {
      toast.error("Failed to delete machine chair");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMachineChairs(selectedMachineChairs);
      toast.success(
        `${selectedMachineChairs.length} machine chairs deleted successfully`
      );
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete machine chairs");
    }
  };

  const handleEditMachineChair = (machineChair: MachineChair) => {
    setEditingMachineChair(machineChair);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingMachineChair(null);
    setIsEditDialogOpen(false);
  };

  const handleCreateMachineChair = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleSelectMachineChair = (id: number) => {
    selectMachineChair(id);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="default">Available</Badge>;
      case 1:
        return <Badge variant="destructive">Occupied</Badge>;
      case 2:
        return <Badge variant="secondary">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const columns: TableColumn<MachineChair>[] = [
    {
      key: "select",
      label: "Select",
      render: (machineChair) => (
        <Checkbox
          checked={selectedMachineChairs.includes(machineChair.id)}
          onCheckedChange={() => handleSelectMachineChair(machineChair.id)}
          aria-label="Select machine chair"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      render: (machineChair) => (
        <div className="font-mono text-sm">{machineChair.id}</div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (machineChair) => (
        <div className="font-medium">{machineChair.name}</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (machineChair) => getStatusBadge(machineChair.status),
    },
    {
      key: "machine",
      label: "Machine",
      render: (machineChair) => (
        <Badge variant="secondary">
          {machineChair.machines?.name || `Machine ${machineChair.machineId}`}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (machineChair) => {
        const date = new Date(machineChair.createdAt);
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
      render: (machineChair) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleEditMachineChair(machineChair)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setMachineChairToDelete(machineChair.id);
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
        title="Machine Chair Management"
        data={machineChairs}
        columns={columns}
        searchKeys={["name", "machines.name"]}
        searchPlaceholder="Search machine chairs by name or machine..."
        emptyMessage="No machine chairs found"
        showCount={true}
        customHeader={
          <div className="flex items-center gap-2">
            {selectedMachineChairs.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedMachineChairs.length})
              </Button>
            )}
            <CreateMachineChairDialog />
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
              machine chair.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                machineChairToDelete &&
                handleDeleteMachineChair(machineChairToDelete)
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
              Delete {selectedMachineChairs.length} machine chairs?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected machine chairs.
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

      {/* Edit Dialog */}
      {editingMachineChair && (
        <EditMachineChairDialog
          machineChair={editingMachineChair}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

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
