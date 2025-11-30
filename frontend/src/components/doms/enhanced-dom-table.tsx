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
import { MoreHorizontal, Trash2, Edit, Building, MapPin, RotateCcw, Copy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDomsStore, type Dom } from "@/stores/doms-store";
import { toast } from "sonner";
import { CreateDomDialog } from "@/components/doms/create-dom-dialog";
import { EditDomDialog } from "@/components/doms/edit-dom-dialog";
import PaginationTable from "@/components/pagination-table";

interface EnhancedDomTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedDomTable({}: EnhancedDomTableProps) {
  const {
    doms,
    loading,
    error,
    selectedDoms,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchDoms,
    deleteDom,
    bulkDeleteDoms,
    restoreDom,
    bulkRestoreDoms,
    selectDom,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useDomsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [editingDom, setEditingDom] = useState<Dom | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [domToDelete, setDomToDelete] = useState<number | null>(null);
  const [domToRestore, setDomToRestore] = useState<number | null>(null);

  // Fetch doms on component mount
  useEffect(() => {
    fetchDoms();
  }, [fetchDoms]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteDom = async (id: number) => {
    try {
      await deleteDom(id);
      toast.success("DOM deleted successfully");
      setDeleteDialogOpen(false);
      setDomToDelete(null);
    } catch (error) {
      toast.error("Failed to delete DOM");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteDoms(selectedDoms);
      toast.success(`${selectedDoms.length} DOMs deleted successfully`);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete DOMs");
    }
  };

  const handleRestoreDom = async (id: number) => {
    try {
      await restoreDom(id);
      toast.success("DOM restored successfully");
      setRestoreDialogOpen(false);
      setDomToRestore(null);
    } catch (error) {
      toast.error("Failed to restore DOM");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreDoms(selectedDoms);
      toast.success(`${selectedDoms.length} DOMs restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch (error) {
      toast.error("Failed to restore DOMs");
    }
  };

  const handleCopyInstallCommand = async (domId: number) => {
    const command = `iex "& { $(irm https://api.mydomhub.store/api/install.ps1) } -domeId '${domId}'"`;
    try {
      await navigator.clipboard.writeText(command);
      toast.success("Installation command copied!", {
        description: "You can now paste it in PowerShell.",
      });
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error("Copy error:", error);
    }
  };

  const selectedDeletedDoms = doms.filter(d => selectedDoms.includes(d.id) && d.deletedAt);
  const selectedActiveDoms = doms.filter(d => selectedDoms.includes(d.id) && !d.deletedAt);

  // Define base columns that are always visible
  const baseColumns: TableColumn<Dom>[] = [
    {
      key: "select",
      label: "Select",
      render: (dom) => (
        <Checkbox
          checked={selectedDoms.includes(dom.id)}
          onCheckedChange={() => selectDom(dom.id)}
          aria-label="Select Store"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (dom) => <div className="font-mono text-sm">{dom.id}</div>,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (dom) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{dom.name}</div>
        </div>
      ),
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
      render: (dom) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground max-w-xs truncate">
            {dom.address}
          </div>
        </div>
      ),
    },
    {
      key: "stats",
      label: "Statistics",
       sortable: true,
      render: (dom) => (
        <div className="flex flex-wrap gap-1">
          {dom._count && (
            <>
              <Badge variant="outline" className="text-xs">
                {dom._count.Users} Users
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dom._count.machines} Machines
              </Badge>
              {/* <Badge variant="outline" className="text-xs">
                {dom._count.experiences} Experiences
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dom._count.tickets} Tickets
              </Badge> */}
            </>
          )}
        </div>
      ),
    },
  ];

  // Created column (shown when NOT in archive mode)
  const createdColumn: TableColumn<Dom> = {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (dom) => {
      const date = new Date(dom.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Deleted column (shown when in archive mode)
  const deletedColumn: TableColumn<Dom> = {
    key: "deletedAt",
    label: "Deleted",
    sortable: true,
    render: (dom) => {
      if (!dom.deletedAt) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      const date = new Date(dom.deletedAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Actions column
  const actionsColumn: TableColumn<Dom> = {
    key: "actions",
    label: "Actions",
    render: (dom) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!dom.deletedAt && (
            <>
              <DropdownMenuItem
                onClick={() => handleCopyInstallCommand(dom.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Install
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <EditDomDialog dom={dom} />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDomToDelete(dom.id);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
          {dom.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setDomToRestore(dom.id);
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
  const columns: TableColumn<Dom>[] = [
    ...baseColumns,
    ...(showArchived ? [deletedColumn] : [createdColumn]),
    actionsColumn,
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="Store Management"
        data={doms}
        columns={columns}
        searchKeys={["name", "address"]}
        searchPlaceholder="Search Stores by name or address..."
        emptyMessage="No Stores found"
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
            {selectedDoms.length > 0 && (
              <>
                {selectedActiveDoms.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveDoms.length})
                  </Button>
                )}
                {selectedDeletedDoms.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedDoms.length})
                  </Button>
                )}
              </>
            )}
            <CreateDomDialog />
          </div>
        }
      />
      
      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the Store. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => domToDelete && handleDeleteDom(domToDelete)}
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
            <AlertDialogTitle>Restore Store?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the Store and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => domToRestore && handleRestoreDom(domToRestore)}
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
              Archive {selectedActiveDoms.length} Stores?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected Stores. You can restore them later from the archived view.
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
              Restore {selectedDeletedDoms.length} Stores?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected Stores and make them active again.
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
