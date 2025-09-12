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
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Plus,
  Clock,
  DollarSign,
} from "lucide-react";
import { useGamesStore, type Game } from "@/stores/games-store";
import { toast } from "sonner";
import PaginationTable from "@/components/pagination-table";
import { EditGameDialog } from "./edit-game-dialog";
import { CreateGameDialog } from "./create-game-dialog";

interface EnhancedGameTableProps {
  // Remove the callback props since we'll handle them internally
}

export function EnhancedGameTable({}: EnhancedGameTableProps) {
  const {
    games,
    loading,
    error,
    selectedGames,
    total,
    currentPage,
    pageSize,
    totalPages,
    fetchGames,
    deleteGame,
    bulkDeleteGames,
    selectGame,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
  } = useGamesStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<number | null>(null);

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleDeleteGame = async (id: number) => {
    try {
      await deleteGame(id);
      toast.success("Game deleted successfully");
      setDeleteDialogOpen(false);
      setGameToDelete(null);
    } catch (error) {
      toast.error("Failed to delete game");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteGames(selectedGames);
      toast.success(`${selectedGames.length} games deleted successfully`);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete games");
    }
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingGame(null);
    setIsEditDialogOpen(false);
  };

  const handleCreateGame = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const columns: TableColumn<Game>[] = [
    {
      key: "select",
      label: "Select",
      render: (game) => (
        <Checkbox
          checked={selectedGames.includes(game.id)}
          onCheckedChange={() => selectGame(game.id)}
          aria-label="Select game"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      render: (game) => <div className="font-mono text-sm">{game.id}</div>,
    },
    {
      key: "name",
      label: "Name",
      render: (game) => <div className="font-medium">{game.name}</div>,
    },
    {
      key: "price",
      label: "Price",
      render: (game) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">${game.price.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: "playTime",
      label: "Play Time",
      render: (game) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-blue-600" />
          <span>{game.playTime} min</span>
        </div>
      ),
    },
    {
      key: "gameType",
      label: "Game Type",
      render: (game) => (
        <Badge variant="secondary">{game.gameType?.name || "No Type"}</Badge>
      ),
    },
    {
      key: "machineType",
      label: "Machine Type",
      render: (game) => (
        <Badge variant="secondary">
          {game.machineType?.name || "No Machine Type"}
        </Badge>
      ),
    },
    {
      key: "experiencesCount",
      label: "Experiences",
      render: (game) => (
        <Badge variant="secondary">
          {game.experiencesCount || 0} experiences
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (game) => {
        const date = new Date(game.createdAt);
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
      render: (game) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <EditGameDialog game={game} />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setGameToDelete(game.id);
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
        title="Game Management"
        data={games}
        columns={columns}
        searchKeys={["name", "gameType.name", "machineType.name"]}
        searchPlaceholder="Search games by name, game type, or machine type..."
        emptyMessage="No games found"
        showCount={true}
        customHeader={
          <div className="flex items-center gap-2">
            {selectedGames.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedGames.length})
              </Button>
            )}
            <CreateGameDialog />
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
              game and all its associated experiences.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => gameToDelete && handleDeleteGame(gameToDelete)}
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
              Delete {selectedGames.length} games?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected games and all their associated experiences.
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
