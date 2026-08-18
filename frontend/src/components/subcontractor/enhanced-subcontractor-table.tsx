"use client";

import { useState, useEffect } from "react";
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
import { MoreHorizontal, Trash2, Paperclip, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSubcontractorsStore, type Subcontractor } from "@/stores/subcontractors-store";
import { toast } from "sonner";
import { CreateSubcontractorDialog } from "@/components/subcontractor/create-subcontractor-dialog";
import { EditSubcontractorDialog } from "@/components/subcontractor/edit-subcontractor-dialog";
import { AttachmentsPanel } from "@/components/shared/attachments-panel";
import PaginationTable from "@/components/pagination-table";

export function EnhancedSubcontractorTable() {
  const {
    subcontractors,
    loading,
    error,
    selectedSubcontractors,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchSubcontractors,
    deleteSubcontractor,
    bulkDeleteSubcontractors,
    restoreSubcontractor,
    bulkRestoreSubcontractors,
    selectSubcontractor,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useSubcontractorsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [subcontractorToDelete, setSubcontractorToDelete] = useState<number | null>(null);
  const [subcontractorToRestore, setSubcontractorToRestore] = useState<number | null>(null);

  useEffect(() => {
    fetchSubcontractors();
  }, [fetchSubcontractors]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDelete = async (id: number) => {
    try {
      await deleteSubcontractor(id);
      toast.success("Subcontractor archived successfully");
      setDeleteDialogOpen(false);
      setSubcontractorToDelete(null);
    } catch {
      toast.error("Failed to archive subcontractor");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteSubcontractors(selectedSubcontractors);
      toast.success(`${selectedSubcontractors.length} subcontractors archived successfully`);
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to archive subcontractors");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreSubcontractor(id);
      toast.success("Subcontractor restored successfully");
      setRestoreDialogOpen(false);
      setSubcontractorToRestore(null);
    } catch {
      toast.error("Failed to restore subcontractor");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreSubcontractors(selectedSubcontractors);
      toast.success(`${selectedSubcontractors.length} subcontractors restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch {
      toast.error("Failed to restore subcontractors");
    }
  };

  const selectedDeleted = subcontractors.filter((s) => selectedSubcontractors.includes(s.id) && s.deletedAt);
  const selectedActive = subcontractors.filter((s) => selectedSubcontractors.includes(s.id) && !s.deletedAt);

  const baseColumns: TableColumn<Subcontractor>[] = [
    {
      key: "select",
      label: "Select",
      render: (s) => (
        <Checkbox
          checked={selectedSubcontractors.includes(s.id)}
          onCheckedChange={() => selectSubcontractor(s.id)}
          aria-label="Select subcontractor"
        />
      ),
    },
    {
      key: "companyName",
      label: "Company",
      sortable: true,
      render: (s) => <div className="font-medium">{s.companyName}</div>,
    },
    {
      key: "ice",
      label: "ICE",
      sortable: true,
      render: (s) => <div className="font-mono text-sm">{s.ice}</div>,
    },
    {
      key: "contactName",
      label: "Contact",
      render: (s) => (
        <div className="text-sm text-muted-foreground">
          {s.contactName || "-"}
          {s.contactPhone ? ` · ${s.contactPhone}` : ""}
        </div>
      ),
    },
    {
      key: "contactEmail",
      label: "Email",
      render: (s) => <div className="text-sm text-muted-foreground">{s.contactEmail || "-"}</div>,
    },
  ];

  const actionsColumn: TableColumn<Subcontractor> = {
    key: "actions",
    label: "Actions",
    render: (s) => (
      <div className="flex items-center justify-end gap-1">
        <AttachmentsPanel
          resourcePath="subcontractors"
          ownerId={s.id}
          ownerLabel={s.companyName}
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
            {!s.deletedAt && (
              <>
                <DropdownMenuItem asChild>
                  <EditSubcontractorDialog subcontractor={s} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSubcontractorToDelete(s.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {s.deletedAt && (
              <DropdownMenuItem
                onClick={() => {
                  setSubcontractorToRestore(s.id);
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

  const columns: TableColumn<Subcontractor>[] = [...baseColumns, actionsColumn];

  return (
    <div className="space-y-4">
      <DataTable
        title="Subcontractor Management"
        data={subcontractors}
        columns={columns}
        searchKeys={["companyName", "ice", "contactName", "contactEmail"]}
        searchPlaceholder="Search subcontractors by company, ICE, or contact..."
        emptyMessage="No subcontractors found"
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
            {selectedSubcontractors.length > 0 && (
              <>
                {selectedActive.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActive.length})
                  </Button>
                )}
                {selectedDeleted.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeleted.length})
                  </Button>
                )}
              </>
            )}
            <CreateSubcontractorDialog />
          </div>
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the subcontractor. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => subcontractorToDelete && handleDelete(subcontractorToDelete)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore subcontractor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the subcontractor and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => subcontractorToRestore && handleRestore(subcontractorToRestore)}
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
            <AlertDialogTitle>Archive {selectedActive.length} subcontractors?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected subcontractors. You can restore them later from the archived view.
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
            <AlertDialogTitle>Restore {selectedDeleted.length} subcontractors?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected subcontractors and make them active again.
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
