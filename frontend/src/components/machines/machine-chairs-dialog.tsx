"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  useMachineChairsStore,
  type MachineChair,
} from "@/stores/machine-chairs-store";
import { toast } from "sonner";
import { EditMachineChairDialog } from "@/components/machine-chairs/edit-machine-chair-dialog";
import { CreateMachineChairDialog } from "@/components/machine-chairs/create-machine-chair-dialog";

interface MachineChairsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineId: number;
  machineName: string;
}

export function MachineChairsDialog({
  open,
  onOpenChange,
  machineId,
  machineName,
}: MachineChairsDialogProps) {
  const {
    machineChairs,
    error,
    selectedMachineChairs,
    fetchMachineChairs,
    deleteMachineChair,
    bulkDeleteMachineChairs,
    selectMachineChair,
    clearSelection,
    clearError,
  } = useMachineChairsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [chairToDelete, setChairToDelete] = useState<number | null>(null);
  const [editingChair, setEditingChair] = useState<MachineChair | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter chairs for this specific machine
  const machineSpecificChairs = machineChairs.filter(
    (chair) => chair.machineId === machineId
  );

  // Fetch machine chairs when dialog opens
  useEffect(() => {
    if (open) {
      fetchMachineChairs({ machineId });
    }
  }, [open, machineId, fetchMachineChairs]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Clear selection when dialog closes
  useEffect(() => {
    if (!open) {
      clearSelection();
    }
  }, [open, clearSelection]);

  const handleDeleteChair = async (id: number) => {
    try {
      await deleteMachineChair(id);
      toast.success("Chair deleted successfully");
      setDeleteDialogOpen(false);
      setChairToDelete(null);
    } catch (error) {
      toast.error("Failed to delete chair");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMachineChairs(selectedMachineChairs);
      toast.success(`${selectedMachineChairs.length} chairs deleted successfully`);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete chairs");
    }
  };

  const handleEditChair = (chair: MachineChair) => {
    setEditingChair(chair);
    setIsEditDialogOpen(true);
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
      render: (chair) => (
        <Checkbox
          checked={selectedMachineChairs.includes(chair.id)}
          onCheckedChange={() => selectMachineChair(chair.id)}
          aria-label="Select chair"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      render: (chair) => <div className="font-mono text-sm">{chair.id}</div>,
    },
    {
      key: "name",
      label: "Name",
      render: (chair) => <div className="font-medium">{chair.name}</div>,
    },
    {
      key: "status",
      label: "Status",
      render: (chair) => getStatusBadge(chair.status),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (chair) => {
        const date = new Date(chair.createdAt);
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
      render: (chair) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditChair(chair)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setChairToDelete(chair.id);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-[70vw] w-[95vw] max-h-[85vh] p-6 overflow-hidden flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle>Chairs for {machineName}</DialogTitle>
            <DialogDescription>
              View and manage chairs for this machine
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4  flex-1">
            <div className="w-full [&_[data-slot=table-container]]:overflow-x-hidden">
              <DataTable
                title="Chairs"
                data={machineSpecificChairs}
                columns={columns}
                searchKeys={["name"]}
                searchPlaceholder="Search chairs by name..."
                emptyMessage="No chairs found for this machine"
                showCount={true}
                className="[&_[data-slot=table]]:table-fixed"
                customHeader={
                  <div className="flex items-center gap-2">
                    {selectedMachineChairs.length > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedMachineChairs.length})
                      </Button>
                    )}
                    <CreateMachineChairDialog defaultMachineId={machineId} />
                  </div>
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              chair.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => chairToDelete && handleDeleteChair(chairToDelete)}
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
              Delete {selectedMachineChairs.length} chairs?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected chairs.
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
      {editingChair && (
        <EditMachineChairDialog
          machineChair={editingChair}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
