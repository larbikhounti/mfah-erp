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
import { useClientsStore, type Client } from "@/stores/clients-store";
import { toast } from "sonner";
import { CreateClientDialog } from "@/components/client/create-client-dialog";
import { EditClientDialog } from "@/components/client/edit-client-dialog";
import { AttachmentsPanel } from "@/components/shared/attachments-panel";
import { ExportExcelButton } from "@/components/shared/export-excel-button";
import PaginationTable from "@/components/pagination-table";

export function EnhancedClientTable() {
  const {
    clients,
    loading,
    error,
    selectedClients,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchClients,
    deleteClient,
    bulkDeleteClients,
    restoreClient,
    bulkRestoreClients,
    selectClient,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useClientsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [clientToRestore, setClientToRestore] = useState<number | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteClient = async (id: number) => {
    try {
      await deleteClient(id);
      toast.success("Client archived successfully");
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch {
      toast.error("Failed to archive client");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteClients(selectedClients);
      toast.success(`${selectedClients.length} clients archived successfully`);
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to archive clients");
    }
  };

  const handleRestoreClient = async (id: number) => {
    try {
      await restoreClient(id);
      toast.success("Client restored successfully");
      setRestoreDialogOpen(false);
      setClientToRestore(null);
    } catch {
      toast.error("Failed to restore client");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreClients(selectedClients);
      toast.success(`${selectedClients.length} clients restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch {
      toast.error("Failed to restore clients");
    }
  };

  const selectedDeletedClients = clients.filter((c) => selectedClients.includes(c.id) && c.deletedAt);
  const selectedActiveClients = clients.filter((c) => selectedClients.includes(c.id) && !c.deletedAt);

  const baseColumns: TableColumn<Client>[] = [
    {
      key: "select",
      label: "Select",
      render: (client) => (
        <Checkbox
          checked={selectedClients.includes(client.id)}
          onCheckedChange={() => selectClient(client.id)}
          aria-label="Select client"
        />
      ),
    },
    {
      key: "companyName",
      label: "Company",
      sortable: true,
      render: (client) => <div className="font-medium">{client.companyName}</div>,
    },
    {
      key: "ice",
      label: "ICE",
      sortable: true,
      render: (client) => <div className="font-mono text-sm">{client.ice}</div>,
    },
    {
      key: "contactName",
      label: "Contact",
      render: (client) => (
        <div className="text-sm text-muted-foreground">
          {client.contactName || "-"}
          {client.contactPhone ? ` · ${client.contactPhone}` : ""}
        </div>
      ),
    },
    {
      key: "contactEmail",
      label: "Email",
      render: (client) => <div className="text-sm text-muted-foreground">{client.contactEmail || "-"}</div>,
    },
  ];

  const actionsColumn: TableColumn<Client> = {
    key: "actions",
    label: "Actions",
    render: (client) => (
      <div className="flex items-center justify-end gap-1">
        <AttachmentsPanel
          resourcePath="clients"
          ownerId={client.id}
          ownerLabel={client.companyName}
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
            {!client.deletedAt && (
              <>
                <DropdownMenuItem asChild>
                  <EditClientDialog client={client} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setClientToDelete(client.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {client.deletedAt && (
              <DropdownMenuItem
                onClick={() => {
                  setClientToRestore(client.id);
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

  const columns: TableColumn<Client>[] = [...baseColumns, actionsColumn];

  return (
    <div className="space-y-4">
      <DataTable
        title="Client Management"
        data={clients}
        columns={columns}
        searchKeys={["companyName", "ice", "contactName", "contactEmail"]}
        searchPlaceholder="Search clients by company, ICE, or contact..."
        emptyMessage="No clients found"
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
            <ExportExcelButton<Client>
              endpoint="/clients"
              total={total}
              extraParams={{ showArchived }}
              filenamePrefix="clients"
              sheetName="Clients"
              mapRow={(c) => ({
                Company: c.companyName,
                ICE: c.ice,
                Contact: c.contactName ?? "",
                Phone: c.contactPhone ?? "",
                Email: c.contactEmail ?? "",
                Address: c.address ?? "",
              })}
              columns={[
                { key: "Company", header: "Company" },
                { key: "ICE", header: "ICE" },
                { key: "Contact", header: "Contact" },
                { key: "Phone", header: "Phone" },
                { key: "Email", header: "Email" },
                { key: "Address", header: "Address" },
              ]}
            />
            {selectedClients.length > 0 && (
              <>
                {selectedActiveClients.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveClients.length})
                  </Button>
                )}
                {selectedDeletedClients.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedClients.length})
                  </Button>
                )}
              </>
            )}
            <CreateClientDialog />
          </div>
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the client. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore client?</AlertDialogTitle>
            <AlertDialogDescription>This will restore the client and make it active again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clientToRestore && handleRestoreClient(clientToRestore)}
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
            <AlertDialogTitle>Archive {selectedActiveClients.length} clients?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected clients. You can restore them later from the archived view.
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
            <AlertDialogTitle>Restore {selectedDeletedClients.length} clients?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected clients and make them active again.
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
