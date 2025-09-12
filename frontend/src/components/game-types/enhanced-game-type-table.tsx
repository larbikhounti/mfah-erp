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
import { MoreHorizontal, Trash2, Edit, Plus } from "lucide-react";
import { useGameTypesStore, type GameType } from "@/stores/game-types-store";
import { toast } from "sonner";
import PaginationTable from "@/components/pagination-table";
import { EditGameTypeDialog } from "./edit-game-type-dialog";
import { CreateGameTypeDialog } from "./create-game-type-dialog";

interface EnhancedGameTypeTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedGameTypeTable({}: EnhancedGameTypeTableProps) {
  const {
    gameTypes,
    loading,
    error,
    selectedGameTypes,
    total,
    currentPage,
    pageSize,
    totalPages,
    fetchGameTypes,
    deleteGameType,
    bulkDeleteGameTypes,
    selectGameType,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
  } = useGameTypesStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGameType, setEditingGameType] = useState<GameType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [gameTypeToDelete, setGameTypeToDelete] = useState<number | null>(null);

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

  const columns: TableColumn<GameType>[] = [
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
      render: (gameType) => (
        <div className="font-mono text-sm">{gameType.id}</div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (gameType) => <div className="font-medium">{gameType.name}</div>,
    },
    {
      key: "gamesCount",
      label: "Games Count",
      render: (gameType) => (
        <Badge variant="secondary">{gameType.gamesCount} games</Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (gameType) => {
        const date = new Date(gameType.createdAt);
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
      render: (gameType) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
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
          <div className="flex items-center gap-2">
            {selectedGameTypes.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedGameTypes.length})
              </Button>
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
              This action cannot be undone. This will permanently delete the
              game type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                gameTypeToDelete && handleDeleteGameType(gameTypeToDelete)
              }
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
              Delete {selectedGameTypes.length} game types?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected game types.
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
