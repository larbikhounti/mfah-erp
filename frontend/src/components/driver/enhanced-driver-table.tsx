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
import { useDriversStore, type Driver, type DriverStatus } from "@/stores/drivers-store";
import { toast } from "sonner";
import { CreateDriverDialog } from "@/components/driver/create-driver-dialog";
import { EditDriverDialog } from "@/components/driver/edit-driver-dialog";
import { AttachmentsPanel } from "@/components/shared/attachments-panel";
import { ExportExcelButton } from "@/components/shared/export-excel-button";
import PaginationTable from "@/components/pagination-table";

const STATUS_VARIANT: Record<DriverStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIF: "default",
  EN_CONGE: "outline",
  EN_MISSION: "secondary",
  INDISPONIBLE: "destructive",
};

export function EnhancedDriverTable() {
  const {
    drivers,
    loading,
    error,
    selectedDrivers,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchDrivers,
    deleteDriver,
    bulkDeleteDrivers,
    restoreDriver,
    bulkRestoreDrivers,
    selectDriver,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useDriversStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<number | null>(null);
  const [driverToRestore, setDriverToRestore] = useState<number | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteDriver = async (id: number) => {
    try {
      await deleteDriver(id);
      toast.success("Driver archived successfully");
      setDeleteDialogOpen(false);
      setDriverToDelete(null);
    } catch {
      toast.error("Failed to archive driver");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteDrivers(selectedDrivers);
      toast.success(`${selectedDrivers.length} drivers archived successfully`);
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to archive drivers");
    }
  };

  const handleRestoreDriver = async (id: number) => {
    try {
      await restoreDriver(id);
      toast.success("Driver restored successfully");
      setRestoreDialogOpen(false);
      setDriverToRestore(null);
    } catch {
      toast.error("Failed to restore driver");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreDrivers(selectedDrivers);
      toast.success(`${selectedDrivers.length} drivers restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch {
      toast.error("Failed to restore drivers");
    }
  };

  const selectedDeletedDrivers = drivers.filter((d) => selectedDrivers.includes(d.id) && d.deletedAt);
  const selectedActiveDrivers = drivers.filter((d) => selectedDrivers.includes(d.id) && !d.deletedAt);

  const baseColumns: TableColumn<Driver>[] = [
    {
      key: "select",
      label: "Select",
      render: (driver) => (
        <Checkbox
          checked={selectedDrivers.includes(driver.id)}
          onCheckedChange={() => selectDriver(driver.id)}
          aria-label="Select driver"
        />
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      sortable: true,
      render: (driver) => <div className="font-medium">{driver.fullName}</div>,
    },
    {
      key: "cin",
      label: "CIN",
      sortable: true,
      render: (driver) => <div className="font-mono text-sm">{driver.cin}</div>,
    },
    {
      key: "phone",
      label: "Phone",
      render: (driver) => <div className="text-sm text-muted-foreground">{driver.phone}</div>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (driver) => <Badge variant={STATUS_VARIANT[driver.status]}>{driver.status}</Badge>,
    },
  ];

  const actionsColumn: TableColumn<Driver> = {
    key: "actions",
    label: "Actions",
    render: (driver) => (
      <div className="flex items-center justify-end gap-1">
        <AttachmentsPanel
          resourcePath="drivers"
          ownerId={driver.id}
          ownerLabel={driver.fullName}
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
            {!driver.deletedAt && (
              <>
                <DropdownMenuItem asChild>
                  <EditDriverDialog driver={driver} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDriverToDelete(driver.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {driver.deletedAt && (
              <DropdownMenuItem
                onClick={() => {
                  setDriverToRestore(driver.id);
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

  const columns: TableColumn<Driver>[] = [...baseColumns, actionsColumn];

  return (
    <div className="space-y-4">
      <DataTable
        title="Driver Management"
        data={drivers}
        columns={columns}
        searchKeys={["fullName", "cin", "phone"]}
        searchPlaceholder="Search drivers by name, CIN, or phone..."
        emptyMessage="No drivers found"
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
            <ExportExcelButton<Driver>
              endpoint="/drivers"
              total={total}
              extraParams={{ showArchived }}
              filenamePrefix="drivers"
              sheetName="Drivers"
              mapRow={(d) => ({
                "Full Name": d.fullName,
                CIN: d.cin,
                Phone: d.phone,
                Status: d.status,
                Note: d.note ?? "",
              })}
              columns={[
                { key: "Full Name", header: "Full Name" },
                { key: "CIN", header: "CIN" },
                { key: "Phone", header: "Phone" },
                { key: "Status", header: "Status" },
                { key: "Note", header: "Note" },
              ]}
            />
            {selectedDrivers.length > 0 && (
              <>
                {selectedActiveDrivers.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveDrivers.length})
                  </Button>
                )}
                {selectedDeletedDrivers.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedDrivers.length})
                  </Button>
                )}
              </>
            )}
            <CreateDriverDialog />
          </div>
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the driver. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => driverToDelete && handleDeleteDriver(driverToDelete)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore driver?</AlertDialogTitle>
            <AlertDialogDescription>This will restore the driver and make it active again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => driverToRestore && handleRestoreDriver(driverToRestore)}
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
            <AlertDialogTitle>Archive {selectedActiveDrivers.length} drivers?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected drivers. You can restore them later from the archived view.
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
            <AlertDialogTitle>Restore {selectedDeletedDrivers.length} drivers?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected drivers and make them active again.
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
