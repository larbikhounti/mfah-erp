"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientInvoicesStore, type ClientInvoice, type InvoiceStatus } from "@/stores/client-invoices-store";
import { toast } from "sonner";
import { CreateClientInvoiceDialog } from "@/components/client-invoice/create-client-invoice-dialog";
import { EditClientInvoiceDialog } from "@/components/client-invoice/edit-client-invoice-dialog";
import { RecordPaymentDialog } from "@/components/client-invoice/record-payment-dialog";
import { AttachmentsPanel } from "@/components/shared/attachments-panel";
import { ViewMissionDialog, MISSION_LINK_COLOR } from "@/components/mission/view-mission-dialog";
import { useMissionsStore, type Mission } from "@/stores/missions-store";
import { useClientsStore } from "@/stores/clients-store";
import { ExportExcelButton } from "@/components/shared/export-excel-button";
import PaginationTable from "@/components/pagination-table";

const STATUS_VARIANT: Record<InvoiceStatus, "default" | "secondary" | "destructive" | "outline"> = {
  UNPAID: "destructive",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
};

export function EnhancedClientInvoiceTable() {
  const {
    invoices,
    loading,
    error,
    selectedInvoices,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    filterClientId,
    fetchInvoices,
    deleteInvoice,
    bulkDeleteInvoices,
    restoreInvoice,
    bulkRestoreInvoices,
    selectInvoice,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
    setFilterClientId,
  } = useClientInvoicesStore();

  const { missions, fetchMissions } = useMissionsStore();
  const { clients, fetchClients } = useClientsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
  const [invoiceToRestore, setInvoiceToRestore] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchMissions({ limit: 100 });
    fetchClients({ limit: 100 });
  }, [fetchInvoices, fetchMissions, fetchClients]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const missionStatusById = useMemo(() => {
    const map = new Map<number, Mission["status"]>();
    missions.forEach((m) => map.set(m.id, m.status));
    return map;
  }, [missions]);

  const clientNameById = useMemo(() => {
    const map = new Map<number, string>();
    clients.forEach((c) => map.set(c.id, c.companyName));
    return map;
  }, [clients]);

  const handleDelete = async (id: number) => {
    try {
      await deleteInvoice(id);
      toast.success("Invoice archived successfully");
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    } catch {
      toast.error("Failed to archive invoice");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteInvoices(selectedInvoices);
      toast.success(`${selectedInvoices.length} invoices archived successfully`);
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to archive invoices");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreInvoice(id);
      toast.success("Invoice restored successfully");
      setRestoreDialogOpen(false);
      setInvoiceToRestore(null);
    } catch {
      toast.error("Failed to restore invoice");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreInvoices(selectedInvoices);
      toast.success(`${selectedInvoices.length} invoices restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch {
      toast.error("Failed to restore invoices");
    }
  };

  const selectedDeleted = invoices.filter((i) => selectedInvoices.includes(i.id) && i.deletedAt);
  const selectedActive = invoices.filter((i) => selectedInvoices.includes(i.id) && !i.deletedAt);

  const baseColumns: TableColumn<ClientInvoice>[] = [
    {
      key: "select",
      label: "Select",
      render: (invoice) => (
        <Checkbox
          checked={selectedInvoices.includes(invoice.id)}
          onCheckedChange={() => selectInvoice(invoice.id)}
          aria-label="Select invoice"
        />
      ),
    },
    {
      key: "invoiceNumber",
      label: "Invoice Number",
      sortable: true,
      render: (invoice) => <div className="font-mono text-sm font-medium">{invoice.invoiceNumber}</div>,
    },
    {
      key: "clientId",
      label: "Client",
      render: (invoice) => (
        <div className="text-sm">{clientNameById.get(invoice.clientId) ?? `#${invoice.clientId}`}</div>
      ),
    },
    {
      key: "missionId",
      label: "Mission",
      render: (invoice) => {
        const missionStatus = missionStatusById.get(invoice.missionId);
        const colorClass = missionStatus ? MISSION_LINK_COLOR[missionStatus] : "text-primary";
        return (
          <ViewMissionDialog
            missionId={invoice.missionId}
            trigger={
              <button
                type="button"
                className={`${colorClass} text-sm font-medium underline-offset-4 hover:underline`}
              >
                View Mission
              </button>
            }
          />
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (invoice) => (
        <div className="text-sm">
          {Number(invoice.amount).toLocaleString()} {invoice.currency}
        </div>
      ),
    },
    {
      key: "amountPaid",
      label: "Paid",
      render: (invoice) => (
        <div className="text-sm text-muted-foreground">
          {Number(invoice.amountPaid).toLocaleString()} {invoice.currency}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (invoice) => <Badge variant={STATUS_VARIANT[invoice.status]}>{invoice.status.replace("_", " ")}</Badge>,
    },
    {
      key: "issueDate",
      label: "Issue Date",
      sortable: true,
      render: (invoice) => (
        <div className="text-sm text-muted-foreground">{new Date(invoice.issueDate).toLocaleDateString()}</div>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (invoice) => (
        <div className="text-sm text-muted-foreground">
          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}
        </div>
      ),
    },
  ];

  const actionsColumn: TableColumn<ClientInvoice> = {
    key: "actions",
    label: "Actions",
    render: (invoice) => (
      <div className="flex items-center justify-end gap-1">
        <AttachmentsPanel
          resourcePath="client-invoices"
          ownerId={invoice.id}
          ownerLabel={invoice.invoiceNumber}
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
            {!invoice.deletedAt && (
              <>
                <DropdownMenuItem asChild>
                  <EditClientInvoiceDialog invoice={invoice} />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <RecordPaymentDialog invoice={invoice} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setInvoiceToDelete(invoice.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {invoice.deletedAt && (
              <DropdownMenuItem
                onClick={() => {
                  setInvoiceToRestore(invoice.id);
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

  const columns: TableColumn<ClientInvoice>[] = [...baseColumns, actionsColumn];

  return (
    <div className="space-y-4">
      <DataTable
        title="Client Invoices"
        data={invoices}
        columns={columns}
        searchKeys={["invoiceNumber"]}
        searchPlaceholder="Search by invoice number..."
        emptyMessage="No client invoices found"
        showCount={true}
        customHeader={
          <div className="flex items-center gap-4">
            <Select
              value={filterClientId ? String(filterClientId) : "all"}
              onValueChange={(value) => setFilterClientId(value === "all" ? null : Number(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <ExportExcelButton<ClientInvoice>
              endpoint="/client-invoices"
              total={total}
              extraParams={{ showArchived, clientId: filterClientId ?? undefined }}
              filenamePrefix="client-invoices"
              sheetName="Client Invoices"
              mapRow={(invoice) => ({
                "Invoice Number": invoice.invoiceNumber,
                Client: clientNameById.get(invoice.clientId) ?? `#${invoice.clientId}`,
                Amount: Number(invoice.amount),
                Paid: Number(invoice.amountPaid),
                Currency: invoice.currency,
                Status: invoice.status,
                "Issue Date": new Date(invoice.issueDate).toLocaleDateString(),
                "Due Date": invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "",
              })}
              columns={[
                { key: "Invoice Number", header: "Invoice Number" },
                { key: "Client", header: "Client" },
                { key: "Amount", header: "Amount" },
                { key: "Paid", header: "Paid" },
                { key: "Currency", header: "Currency" },
                { key: "Status", header: "Status" },
                { key: "Issue Date", header: "Issue Date" },
                { key: "Due Date", header: "Due Date" },
              ]}
            />
            {selectedInvoices.length > 0 && (
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
            <CreateClientInvoiceDialog />
          </div>
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the invoice. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => invoiceToDelete && handleDelete(invoiceToDelete)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore invoice?</AlertDialogTitle>
            <AlertDialogDescription>This will restore the invoice and make it active again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => invoiceToRestore && handleRestore(invoiceToRestore)}
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
            <AlertDialogTitle>Archive {selectedActive.length} invoices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected invoices. You can restore them later from the archived view.
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
            <AlertDialogTitle>Restore {selectedDeleted.length} invoices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected invoices and make them active again.
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
