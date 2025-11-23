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
  Star,
  RotateCcw,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    showArchived,
    fetchGames,
    deleteGame,
    bulkDeleteGames,
    restoreGame,
    bulkRestoreGames,
    toggleFavorite,
    selectGame,
    clearSelection,
    clearError,
    setPage,
    setPageSize,
    setShowArchived,
  } = useGamesStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<number | null>(null);
  const [gameToRestore, setGameToRestore] = useState<number | null>(null);

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

  const handleToggleFavorite = async (id: number) => {
    try {
      await toggleFavorite(id);
      toast.success("Favorite status updated");
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const handleRestoreGame = async (id: number) => {
    try {
      await restoreGame(id);
      toast.success("Game restored successfully");
      setRestoreDialogOpen(false);
      setGameToRestore(null);
    } catch (error) {
      toast.error("Failed to restore game");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreGames(selectedGames);
      toast.success(`${selectedGames.length} games restored successfully`);
      setBulkRestoreDialogOpen(false);
    } catch (error) {
      toast.error("Failed to restore games");
    }
  };

  const hasDeletedGames = games.some(game => game.deletedAt);
  const hasActiveGames = games.some(game => !game.deletedAt);
  const selectedDeletedGames = games.filter(g => selectedGames.includes(g.id) && g.deletedAt);
  const selectedActiveGames = games.filter(g => selectedGames.includes(g.id) && !g.deletedAt);

  // Define base columns that are always visible
  const baseColumns: TableColumn<Game>[] = [
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
      sortable: true,
      render: (game) => <div className="font-mono text-sm">{game.id}</div>,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (game) => <div className="font-medium">{game.name}</div>,
    },
    {
      key: "favorite",
      label: "Favorite",
      sortable: true,
      render: (game) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggleFavorite(game.id)}
          className="h-8 w-8 p-0"
        >
          <Star
            className={`h-4 w-4 ${
              game.isFavored
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400 hover:text-yellow-400"
            }`}
          />
        </Button>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (game) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">€{game.price.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: "playTime",
      label: "Play Time",
      sortable: true,
      render: (game) => {
        const minutes = Math.floor(game.playTime / 60);
        const seconds = game.playTime % 60;
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-600" />
            <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
        );
      },
    },
    {
      key: "age",
      label: "Game Age",
       sortable: true,
      render: (game) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{game.age || "N/A"}+</span>
        </div>
      ),
    },
    {
      key: "gameType",
      label: "Game Type",
       sortable: true,
      render: (game) => (
        <Badge variant="secondary">{game.gameType?.name || "No Type"}</Badge>
      ),
    },
    {
      key: "machineTypes",
      label: "Machine Types",
       sortable: true,
      render: (game) => (
        <div className="flex flex-wrap gap-1">
          {game.machineTypes && game.machineTypes.length > 0 ? (
            game.machineTypes.map((machineType) => (
              <Badge key={machineType.id} variant="secondary" className="text-xs">
                {machineType.name}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs">No Machine Types</Badge>
          )}
        </div>
      ),
    },
  ];

  // Created column (shown when NOT in archive mode)
  const createdColumn: TableColumn<Game> = {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (game) => {
      const date = new Date(game.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Deleted column (shown when in archive mode)
  const deletedColumn: TableColumn<Game> = {
    key: "deletedAt",
    label: "Deleted",
    sortable: true,
    render: (game) => {
      if (!game.deletedAt) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      const date = new Date(game.deletedAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Actions column
  const actionsColumn: TableColumn<Game> = {
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
          {!game.deletedAt && (
            <>
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
            </>
          )}
          {game.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setGameToRestore(game.id);
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
  const columns: TableColumn<Game>[] = [
    ...baseColumns,
    ...(showArchived ? [deletedColumn] : [createdColumn]),
    actionsColumn,
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="Game Management"
        data={games}
        columns={columns}
        searchKeys={["name", "gameType.name", "machineTypes.name"]}
        searchPlaceholder="Search games by name, game type, or machine type..."
        emptyMessage="No games found"
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
            {selectedGames.length > 0 && (
              <>
                {selectedActiveGames.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveGames.length})
                  </Button>
                )}
                {selectedDeletedGames.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedGames.length})
                  </Button>
                )}
              </>
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
              This will archive the game. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => gameToDelete && handleDeleteGame(gameToDelete)}
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
            <AlertDialogTitle>Restore game?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the game and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => gameToRestore && handleRestoreGame(gameToRestore)}
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
              Archive {selectedActiveGames.length} games?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected games. You can restore them later from the archived view.
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
              Restore {selectedDeletedGames.length} games?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected games and make them active again.
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
