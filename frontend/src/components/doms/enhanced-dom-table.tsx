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
import { MoreHorizontal, Trash2, Edit, Building, MapPin } from "lucide-react";
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
    fetchDoms,
    deleteDom,
    bulkDeleteDoms,
    selectDom,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
  } = useDomsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDom, setEditingDom] = useState<Dom | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [domToDelete, setDomToDelete] = useState<number | null>(null);

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


  const columns: TableColumn<Dom>[] = [
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
      render: (dom) => <div className="font-mono text-sm">{dom.id}</div>,
    },
    {
      key: "name",
      label: "Name",
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
    {
      key: "createdAt",
      label: "Created",
      render: (dom) => {
        const date = new Date(dom.createdAt);
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
      render: (dom) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
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
          <div className="flex items-center gap-2">
            {selectedDoms.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedDoms.length})
              </Button>
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
              This action cannot be undone. This will permanently delete the
              Store and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => domToDelete && handleDeleteDom(domToDelete)}
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
              Delete {selectedDoms.length} DOMs?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected Stores and all associated data.
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
