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
import { MoreHorizontal, Trash2, Ticket, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCouponsStore, type Coupon } from "@/stores/coupons-store";
import { toast } from "sonner";
import { EditCouponDialog } from "./edit-coupon-dialog";
import { CreateCouponDialog } from "./create-coupon-dialog";

interface EnhancedCouponTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedCouponTable({}: EnhancedCouponTableProps) {
  const {
    coupons,
    loading,
    error,
    selectedCoupons,
    showArchived,
    fetchCoupons,
    deleteCoupon,
    bulkDeleteCoupons,
    restoreCoupon,
    bulkRestoreCoupons,
    selectCoupon,
    clearSelection,
    clearError,
    setShowArchived,
  } = useCouponsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<number | null>(null);
  const [couponToRestore, setCouponToRestore] = useState<number | null>(null);

  // Clear error when component unmounts or when error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Handle individual coupon deletion
  const handleDeleteCoupon = async () => {
    if (couponToDelete) {
      try {
        await deleteCoupon(couponToDelete);
        toast.success("Coupon deleted successfully");
        setDeleteDialogOpen(false);
        setCouponToDelete(null);
      } catch (error) {
        console.error("Failed to delete coupon:", error);
        toast.error("Failed to delete coupon");
      }
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedCoupons.length > 0) {
      try {
        await bulkDeleteCoupons(selectedCoupons);
        toast.success(`${selectedCoupons.length} coupon(s) deleted successfully`);
        setBulkDeleteDialogOpen(false);
        clearSelection();
      } catch (error) {
        console.error("Failed to delete coupons:", error);
        toast.error("Failed to delete coupons");
      }
    }
  };

  const handleRestoreCoupon = async () => {
    if (couponToRestore) {
      try {
        await restoreCoupon(couponToRestore);
        toast.success("Coupon restored successfully");
        setRestoreDialogOpen(false);
        setCouponToRestore(null);
      } catch (error) {
        console.error("Failed to restore coupon:", error);
        toast.error("Failed to restore coupon");
      }
    }
  };

  const handleBulkRestore = async () => {
    if (selectedCoupons.length > 0) {
      try {
        await bulkRestoreCoupons(selectedCoupons);
        toast.success(`${selectedCoupons.length} coupon(s) restored successfully`);
        setBulkRestoreDialogOpen(false);
        clearSelection();
      } catch (error) {
        console.error("Failed to restore coupons:", error);
        toast.error("Failed to restore coupons");
      }
    }
  };

  // Handle search with debounce
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const selectedDeletedCoupons = coupons.filter(c => selectedCoupons.includes(c.id) && c.deletedAt);
  const selectedActiveCoupons = coupons.filter(c => selectedCoupons.includes(c.id) && !c.deletedAt);

  // Define base columns that are always visible
  const baseColumns: TableColumn<Coupon>[] = [
    {
      key: "select",
      label: "Select",
      render: (coupon) => (
        <Checkbox
          checked={selectedCoupons.includes(coupon.id)}
          onCheckedChange={() => selectCoupon(coupon.id)}
          aria-label="Select coupon"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (coupon) => <div className="font-mono text-sm">{coupon.id}</div>,
    },
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium font-mono">{coupon.code}</div>
        </div>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      sortable: true,
      render: (coupon) => (
        <Badge variant="secondary">
          {coupon.discount}%
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (coupon) => (
        <Badge variant={coupon.isActive ? "default" : "destructive"}>
          {coupon.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "tickets",
      label: "Uses",
       sortable: true,
      render: (coupon) => (
        <Badge variant="outline">
          {coupon._count?.tickets || 0} ticket{coupon._count?.tickets !== 1 ? 's' : ''}
        </Badge>
      ),
    },
  ];

  // Created column (shown when NOT in archive mode)
  const createdColumn: TableColumn<Coupon> = {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (coupon) => {
      const date = new Date(coupon.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Deleted column (shown when in archive mode)
  const deletedColumn: TableColumn<Coupon> = {
    key: "deletedAt",
    label: "Deleted",
    sortable: true,
    render: (coupon) => {
      if (!coupon.deletedAt) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      const date = new Date(coupon.deletedAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Actions column
  const actionsColumn: TableColumn<Coupon> = {
    key: "actions",
    label: "Actions",
    render: (coupon) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!coupon.deletedAt && (
            <>
              <DropdownMenuItem asChild>
                <EditCouponDialog coupon={coupon} />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCouponToDelete(coupon.id);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
          {coupon.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setCouponToRestore(coupon.id);
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
  const columns: TableColumn<Coupon>[] = [
    ...baseColumns,
    ...(showArchived ? [deletedColumn] : [createdColumn]),
    actionsColumn,
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="Coupon Management"
        data={coupons}
        columns={columns}
        searchKeys={["code"]}
        searchPlaceholder="Search coupons by code..."
        emptyMessage="No coupons found"
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
            {selectedCoupons.length > 0 && (
              <>
                {selectedActiveCoupons.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveCoupons.length})
                  </Button>
                )}
                {selectedDeletedCoupons.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedCoupons.length})
                  </Button>
                )}
              </>
            )}
            <CreateCouponDialog />
          </div>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the coupon. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCoupon}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the coupon and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreCoupon}
              className="bg-green-600 hover:bg-green-700"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archive {selectedActiveCoupons.length} coupons?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected coupons. You can restore them later from the archived view.
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
              Restore {selectedDeletedCoupons.length} coupons?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected coupons and make them active again.
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
    </div>
  );
}
