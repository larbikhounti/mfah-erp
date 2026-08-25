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
import { MoreHorizontal, Trash2, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMissionsStore, type Mission, type MissionStatus } from "@/stores/missions-store";
import { useClientsStore } from "@/stores/clients-store";
import { toast } from "sonner";
import { CreateMissionDialog } from "@/components/mission/create-mission-dialog";
import { EditMissionDialog } from "@/components/mission/edit-mission-dialog";
import { ChangeMissionStatusDialog } from "@/components/mission/change-mission-status-dialog";
import { ExportExcelButton } from "@/components/shared/export-excel-button";
import PaginationTable from "@/components/pagination-table";

const STATUS_VARIANT: Record<MissionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PLANNED: "outline",
  IN_PROGRESS: "secondary",
  FINISHED: "default",
  CANCELLED: "destructive",
};

export function EnhancedMissionTable() {
  const {
    missions,
    loading,
    error,
    selectedMissions,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchMissions,
    deleteMission,
    bulkDeleteMissions,
    restoreMission,
    bulkRestoreMissions,
    selectMission,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useMissionsStore();

  const { clients, fetchClients } = useClientsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<number | null>(null);
  const [missionToRestore, setMissionToRestore] = useState<number | null>(null);

  useEffect(() => {
    fetchMissions();
    fetchClients({ limit: 100 });
  }, [fetchMissions, fetchClients]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const clientNameById = useMemo(() => {
    const map = new Map<number, string>();
    clients.forEach((c) => map.set(c.id, c.companyName));
    return map;
  }, [clients]);

  const handleDeleteMission = async (id: number) => {
    try {
      await deleteMission(id);
      toast.success("Mission archived successfully");
      setDeleteDialogOpen(false);
      setMissionToDelete(null);
    } catch {
      toast.error("Failed to archive mission");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMissions(selectedMissions);
      toast.success(`${selectedMissions.length} missions archived successfully`);
      setBulkDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to archive missions");
    }
  };

  const handleRestoreMission = async (id: number) => {
    try {
      await restoreMission(id);
      toast.success("Mission restored successfully");
      setRestoreDialogOpen(false);
      setMissionToRestore(null);
    } catch {
      toast.error("Failed to restore mission");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreMissions(selectedMissions);
      toast.success(`${selectedMissions.length} missions restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch {
      toast.error("Failed to restore missions");
    }
  };

  const selectedDeletedMissions = missions.filter((m) => selectedMissions.includes(m.id) && m.deletedAt);
  const selectedActiveMissions = missions.filter((m) => selectedMissions.includes(m.id) && !m.deletedAt);

  const baseColumns: TableColumn<Mission>[] = [
    {
      key: "select",
      label: "Select",
      render: (mission) => (
        <Checkbox
          checked={selectedMissions.includes(mission.id)}
          onCheckedChange={() => selectMission(mission.id)}
          aria-label="Select mission"
        />
      ),
    },
    {
      key: "reference",
      label: "Reference",
      sortable: true,
      render: (mission) => <div className="font-mono text-sm font-medium">{mission.reference}</div>,
    },
    {
      key: "clientId",
      label: "Client",
      render: (mission) => (
        <div className="text-sm">{clientNameById.get(mission.clientId) || `Client #${mission.clientId}`}</div>
      ),
    },
    {
      key: "route",
      label: "Route",
      render: (mission) => (
        <div className="text-sm text-muted-foreground">
          {mission.loadingLocation} → {mission.deliveryLocation}
        </div>
      ),
    },
    {
      key: "executionMode",
      label: "Mode",
      render: (mission) => (
        <Badge variant={mission.executionMode === "IN_HOUSE" ? "default" : "secondary"}>
          {mission.executionMode === "IN_HOUSE" ? "In-house" : "Subcontracted"}
        </Badge>
      ),
    },
    {
      key: "clientPrice",
      label: "Price",
      sortable: true,
      render: (mission) => (
        <div className="text-sm font-medium">
          {Number(mission.clientPrice).toLocaleString()} {mission.currency}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (mission) => <Badge variant={STATUS_VARIANT[mission.status]}>{mission.status}</Badge>,
    },
    {
      key: "missionDate",
      label: "Date",
      sortable: true,
      render: (mission) => (
        <div className="text-sm text-muted-foreground">{new Date(mission.missionDate).toLocaleDateString()}</div>
      ),
    },
  ];

  const actionsColumn: TableColumn<Mission> = {
    key: "actions",
    label: "Actions",
    render: (mission) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!mission.deletedAt && (
            <>
              <DropdownMenuItem asChild>
                <EditMissionDialog mission={mission} />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <ChangeMissionStatusDialog mission={mission} />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMissionToDelete(mission.id);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
          {mission.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setMissionToRestore(mission.id);
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

  const columns: TableColumn<Mission>[] = [...baseColumns, actionsColumn];

  return (
    <div className="space-y-4">
      <DataTable
        title="Mission Management"
        data={missions}
        columns={columns}
        searchKeys={["reference", "loadingLocation", "deliveryLocation"]}
        searchPlaceholder="Search missions by reference or location..."
        emptyMessage="No missions found"
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
            <ExportExcelButton<Mission>
              endpoint="/missions"
              total={total}
              extraParams={{ showArchived }}
              filenamePrefix="missions"
              sheetName="Missions"
              mapRow={(m) => ({
                Reference: m.reference,
                Client: clientNameById.get(m.clientId) || `Client #${m.clientId}`,
                Route: `${m.loadingLocation} -> ${m.deliveryLocation}`,
                Mode: m.executionMode === "IN_HOUSE" ? "In-house" : "Subcontracted",
                Price: Number(m.clientPrice),
                Currency: m.currency,
                Status: m.status,
                Date: new Date(m.missionDate).toLocaleDateString(),
              })}
              columns={[
                { key: "Reference", header: "Reference" },
                { key: "Client", header: "Client" },
                { key: "Route", header: "Route" },
                { key: "Mode", header: "Mode" },
                { key: "Price", header: "Price" },
                { key: "Currency", header: "Currency" },
                { key: "Status", header: "Status" },
                { key: "Date", header: "Date" },
              ]}
            />
            {selectedMissions.length > 0 && (
              <>
                {selectedActiveMissions.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveMissions.length})
                  </Button>
                )}
                {selectedDeletedMissions.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedMissions.length})
                  </Button>
                )}
              </>
            )}
            <CreateMissionDialog />
          </div>
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the mission. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => missionToDelete && handleDeleteMission(missionToDelete)}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore mission?</AlertDialogTitle>
            <AlertDialogDescription>This will restore the mission and make it active again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => missionToRestore && handleRestoreMission(missionToRestore)}
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
            <AlertDialogTitle>Archive {selectedActiveMissions.length} missions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected missions. You can restore them later from the archived view.
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
            <AlertDialogTitle>Restore {selectedDeletedMissions.length} missions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected missions and make them active again.
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
