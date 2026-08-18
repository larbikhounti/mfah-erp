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
import { MoreHorizontal, Trash2, Paperclip, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSubcontractorBillsStore, type SubcontractorBill, type InvoiceStatus } from "@/stores/subcontractor-bills-store";
import { toast } from "sonner";
import { CreateSubcontractorBillDialog } from "@/components/subcontractor-bill/create-subcontractor-bill-dialog";
import { RecordPaymentDialog } from "@/components/subcontractor-bill/record-payment-dialog";
import { AttachmentsPanel } from "@/components/shared/attachments-panel";
import { ViewMissionDialog } from "@/components/mission/view-mission-dialog";
import PaginationTable from "@/components/pagination-table";

const STATUS_VARIANT: Record<InvoiceStatus, "default" | "secondary" | "destructive" | "outline"> = {
  UNPAID: "destructive",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
};

export function EnhancedSubcontractorBillTable() {
  const {
    bills,
    loading,
    error,
    selectedBills,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchBills,
    deleteBill,
    bulkDeleteBills,
    restoreBill,
    bulkRestoreBills,
    selectBill,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useSubcontractorBillsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<number | null>(null);
  const [billToRestore, setBillToRestore] = useState<number | null>(null);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDelete = async (id: number) => {
    try {
      await deleteBill(id);
      toast.success("Bill archived successfully");
      setDeleteDialogOpen(false);
      setBillToDelete(null);
    } catch {
      toast.error("Failed to archive bill");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteBills(selectedBills);
      toast.success(`${selectedBills.length} bills archived successfully`);
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to archive bills");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreBill(id);
      toast.success("Bill restored successfully");
      setRestoreDialogOpen(false);
      setBillToRestore(null);
    } catch {
      toast.error("Failed to restore bill");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreBills(selectedBills);
      toast.success(`${selectedBills.length} bills restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch {
      toast.error("Failed to restore bills");
    }
  };

  const selectedDeleted = bills.filter((b) => selectedBills.includes(b.id) && b.deletedAt);
  const selectedActive = bills.filter((b) => selectedBills.includes(b.id) && !b.deletedAt);

  const baseColumns: TableColumn<SubcontractorBill>[] = [
    {
      key: "select",
      label: "Select",
      render: (bill) => (
        <Checkbox
          checked={selectedBills.includes(bill.id)}
          onCheckedChange={() => selectBill(bill.id)}
          aria-label="Select bill"
        />
      ),
    },
    {
      key: "billNumber",
      label: "Bill Number",
      sortable: true,
      render: (bill) => <div className="font-mono text-sm font-medium">{bill.billNumber}</div>,
    },
    {
      key: "missionId",
      label: "Mission",
      render: (bill) => (
        <ViewMissionDialog
          missionId={bill.missionId}
          trigger={
            <button
              type="button"
              className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            >
              View Mission
            </button>
          }
        />
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (bill) => (
        <div className="text-sm">
          {Number(bill.amount).toLocaleString()} {bill.currency}
        </div>
      ),
    },
    {
      key: "amountPaid",
      label: "Paid",
      render: (bill) => (
        <div className="text-sm text-muted-foreground">
          {Number(bill.amountPaid).toLocaleString()} {bill.currency}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (bill) => <Badge variant={STATUS_VARIANT[bill.status]}>{bill.status.replace("_", " ")}</Badge>,
    },
    {
      key: "issueDate",
      label: "Issue Date",
      sortable: true,
      render: (bill) => (
        <div className="text-sm text-muted-foreground">{new Date(bill.issueDate).toLocaleDateString()}</div>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (bill) => (
        <div className="text-sm text-muted-foreground">
          {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "-"}
        </div>
      ),
    },
  ];

  const actionsColumn: TableColumn<SubcontractorBill> = {
    key: "actions",
    label: "Actions",
    render: (bill) => (
      <div className="flex items-center justify-end gap-1">
        <AttachmentsPanel
          resourcePath="subcontractor-bills"
          ownerId={bill.id}
          ownerLabel={bill.billNumber}
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
            {!bill.deletedAt && (
              <>
                <DropdownMenuItem asChild>
                  <RecordPaymentDialog bill={bill} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setBillToDelete(bill.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {bill.deletedAt && (
              <DropdownMenuItem
                onClick={() => {
                  setBillToRestore(bill.id);
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

  const columns: TableColumn<SubcontractorBill>[] = [...baseColumns, actionsColumn];

  return (
    <div className="space-y-4">
      <DataTable
        title="Subcontractor Bills"
        data={bills}
        columns={columns}
        searchKeys={["billNumber"]}
        searchPlaceholder="Search by bill number..."
        emptyMessage="No subcontractor bills found"
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
            {selectedBills.length > 0 && (
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
            <CreateSubcontractorBillDialog />
          </div>
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the bill. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => billToDelete && handleDelete(billToDelete)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore bill?</AlertDialogTitle>
            <AlertDialogDescription>This will restore the bill and make it active again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => billToRestore && handleRestore(billToRestore)}
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
            <AlertDialogTitle>Archive {selectedActive.length} bills?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected bills. You can restore them later from the archived view.
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
            <AlertDialogTitle>Restore {selectedDeleted.length} bills?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected bills and make them active again.
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
