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
import { MoreHorizontal, Trash2, Ticket } from "lucide-react";
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
    fetchCoupons,
    deleteCoupon,
    bulkDeleteCoupons,
    selectCoupon,
    clearSelection,
    clearError,
  } = useCouponsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<number | null>(null);

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

  // Handle search with debounce
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Define table columns
  const columns: TableColumn<Coupon>[] = [
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
      render: (coupon) => (
        <Badge variant="outline">
          {coupon._count?.tickets || 0} ticket{coupon._count?.tickets !== 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (coupon) => {
        const date = new Date(coupon.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (coupon) => {
        const date = new Date(coupon.updatedAt);
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
      render: (coupon) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
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
          <div className="flex items-center gap-2">
            {selectedCoupons.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedCoupons.length})
              </Button>
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
              This action cannot be undone. This will permanently delete the
              coupon and may affect tickets using this coupon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Coupon
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
            <AlertDialogTitle>Delete Multiple Coupons</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCoupons.length} coupon{selectedCoupons.length !== 1 ? 's' : ''}?
              This action cannot be undone and may affect tickets using these coupons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Coupons
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
