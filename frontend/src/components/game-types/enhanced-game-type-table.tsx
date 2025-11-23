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
import { MoreHorizontal, Trash2, Edit, Plus, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGameTypesStore, type GameType } from "@/stores/game-types-store";
import { toast } from "sonner";
import PaginationTable from "@/components/pagination-table";
import { EditGameTypeDialog } from "./edit-game-type-dialog";
import { CreateGameTypeDialog } from "./create-game-type-dialog";

interface EnhancedGameTypeTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedGameTypeTable({ }: EnhancedGameTypeTableProps) {
  const {
    gameTypes,
    loading,
    error,
    selectedGameTypes,
    total,
    currentPage,
    pageSize,
    totalPages,
    showArchived,
    fetchGameTypes,
    deleteGameType,
    bulkDeleteGameTypes,
    restoreGameType,
    bulkRestoreGameTypes,
    selectGameType,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useGameTypesStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [editingGameType, setEditingGameType] = useState<GameType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [gameTypeToDelete, setGameTypeToDelete] = useState<number | null>(null);
  const [gameTypeToRestore, setGameTypeToRestore] = useState<number | null>(null);

  // Fetch game types on component mount
  useEffect(() => {
    fetchGameTypes();
  }, [fetchGameTypes]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteGameType = async (id: number) => {
    try {
      await deleteGameType(id);
      toast.success("Game type deleted successfully");
      setDeleteDialogOpen(false);
      setGameTypeToDelete(null);
    } catch (error) {
      toast.error("Failed to delete game type");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteGameTypes(selectedGameTypes);
      toast.success(
        `${selectedGameTypes.length} game types deleted successfully`
      );
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete game types");
    }
  };

  const handleEditGameType = (gameType: GameType) => {
    setEditingGameType(gameType);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingGameType(null);
    setIsEditDialogOpen(false);
  };

  const handleCreateGameType = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleRestoreGameType = async (id: number) => {
    try {
      await restoreGameType(id);
      toast.success("Game type restored successfully");
      setRestoreDialogOpen(false);
      setGameTypeToRestore(null);
    } catch (error) {
      toast.error("Failed to restore game type");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreGameTypes(selectedGameTypes);
      toast.success(
        `${selectedGameTypes.length} game types restored successfully`
      );
      setBulkRestoreDialogOpen(false);
    } catch (error) {
      toast.error("Failed to restore game types");
    }
  };

  const selectedDeletedGameTypes = gameTypes.filter(gt => selectedGameTypes.includes(gt.id) && gt.deletedAt);
  const selectedActiveGameTypes = gameTypes.filter(gt => selectedGameTypes.includes(gt.id) && !gt.deletedAt);

  // Define base columns that are always visible
  const baseColumns: TableColumn<GameType>[] = [
    {
      key: "select",
      label: "Select",
      render: (gameType) => (
        <Checkbox
          checked={selectedGameTypes.includes(gameType.id)}
          onCheckedChange={() => selectGameType(gameType.id)}
          aria-label="Select game type"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (gameType) => (
        <div className="font-mono text-sm">{gameType.id}</div>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (gameType) => <div className="font-medium">{gameType.name}</div>,
    },
    {
      key: "gamesCount",
      label: "Games Count",
      sortable: true,
      render: (gameType) => (
        <Badge variant="secondary">{gameType.gamesCount} games</Badge>
      ),
    },
  ];

  // Created column (shown when NOT in archive mode)
  const createdColumn: TableColumn<GameType> = {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (gameType) => {
      const date = new Date(gameType.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Deleted column (shown when in archive mode)
  const deletedColumn: TableColumn<GameType> = {
    key: "deletedAt",
    label: "Deleted",
    sortable: true,
    render: (gameType) => {
      if (!gameType.deletedAt) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      const date = new Date(gameType.deletedAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Actions column
  const actionsColumn: TableColumn<GameType> = {
    key: "actions",
    label: "Actions",
    render: (gameType) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!gameType.deletedAt && (
            <>
              <DropdownMenuItem asChild>
                <EditGameTypeDialog gameType={gameType} />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setGameTypeToDelete(gameType.id);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
          {gameType.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setGameTypeToRestore(gameType.id);
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
  const columns: TableColumn<GameType>[] = [
    ...baseColumns,
    ...(showArchived ? [deletedColumn] : [createdColumn]),
    actionsColumn,
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="Game Type Management"
        data={gameTypes}
        columns={columns}
        searchKeys={["name"]}
        searchPlaceholder="Search game types by name..."
        emptyMessage="No game types found"
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
            {selectedGameTypes.length > 0 && (
              <>
                {selectedActiveGameTypes.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveGameTypes.length})
                  </Button>
                )}
                {selectedDeletedGameTypes.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedGameTypes.length})
                  </Button>
                )}
              </>
            )}
            <CreateGameTypeDialog />
          </div>
        }
      />
      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the game type. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                gameTypeToDelete && handleDeleteGameType(gameTypeToDelete)
              }
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
            <AlertDialogTitle>Restore game type?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the game type and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                gameTypeToRestore && handleRestoreGameType(gameTypeToRestore)
              }
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
              Archive {selectedActiveGameTypes.length} game types?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected game types. You can restore them later from the archived view.
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
              Restore {selectedDeletedGameTypes.length} game types?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected game types and make them active again.
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
