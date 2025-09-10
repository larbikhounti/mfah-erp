"use client"

import { useState } from "react"
import { GameTable } from "@/components/games/game-table"
import { CreateGameDialog } from "@/components/games/create-game-dialog"
import { EditGameDialog } from "@/components/games/edit-game-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Game, GameType, MachineType } from "@/app/lib/types"


// Mock data for games
const mockGames: Game[] = [
  {
    id: 1,
    name: "Pac-Man",
    price: 0.25,
    playTime: 10,
    gameTypeId: 1,
    machineTypeId: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    gameType: { id: 1, name: "Arcade", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    machineType: {
      id: 1,
      name: "Arcade Cabinet",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: 2,
    name: "Street Fighter II",
    price: 0.5,
    playTime: 15,
    gameTypeId: 2,
    machineTypeId: 1,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    gameType: { id: 2, name: "Fighting", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    machineType: {
      id: 1,
      name: "Arcade Cabinet",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: 3,
    name: "Medieval Madness",
    price: 1.0,
    playTime: 20,
    gameTypeId: 3,
    machineTypeId: 2,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    gameType: { id: 3, name: "Pinball", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    machineType: {
      id: 2,
      name: "Pinball Machine",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  },
]

// Mock data for game types
const mockGameTypes: GameType[] = [
  { id: 1, name: "Arcade", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Fighting", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Pinball", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Racing", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Puzzle", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
]

// Mock data for machine types
const mockMachineTypes: MachineType[] = [
  { id: 1, name: "Arcade Cabinet", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Pinball Machine", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Racing Simulator", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Claw Machine", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
]

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>(mockGames)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)

  const handleCreateGame = (gameData: Omit<Game, "id" | "createdAt" | "updatedAt">) => {
    const newGame: Game = {
      ...gameData,
      id: Math.max(...games.map((g) => g.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gameType: gameData.gameTypeId ? mockGameTypes.find((gt) => gt.id === gameData.gameTypeId) : undefined,
      machineType: gameData.machineTypeId ? mockMachineTypes.find((mt) => mt.id === gameData.machineTypeId) : undefined,
    }
    setGames([...games, newGame])
    setIsCreateDialogOpen(false)
  }

  const handleEditGame = (gameData: Omit<Game, "id" | "createdAt" | "updatedAt">) => {
    if (!editingGame) return

    const updatedGame: Game = {
      ...gameData,
      id: editingGame.id,
      createdAt: editingGame.createdAt,
      updatedAt: new Date().toISOString(),
      gameType: gameData.gameTypeId ? mockGameTypes.find((gt) => gt.id === gameData.gameTypeId) : undefined,
      machineType: gameData.machineTypeId ? mockMachineTypes.find((mt) => mt.id === gameData.machineTypeId) : undefined,
    }

    setGames(games.map((game) => (game.id === editingGame.id ? updatedGame : game)))
    setEditingGame(null)
  }

  const handleDeleteGame = (gameId: number) => {
    setGames(games.filter((game) => game.id !== gameId))
  }

  const handleOpenEditDialog = (game: Game) => {
    setEditingGame(game)
  }

  const handleCloseEditDialog = () => {
    setEditingGame(null)
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Games</h2>
          <p className="text-muted-foreground">Manage your game library and pricing</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Game
        </Button>
      </div>

      <GameTable
        games={games}
        gameTypes={mockGameTypes}
        machineTypes={mockMachineTypes}
        onEdit={handleOpenEditDialog}
        onDelete={handleDeleteGame}
      />

      <CreateGameDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateGame}
        gameTypes={mockGameTypes}
        machineTypes={mockMachineTypes}
      />

      {editingGame && (
        <EditGameDialog
          open={!!editingGame}
          onOpenChange={handleCloseEditDialog}
          onSubmit={handleEditGame}
          game={editingGame}
          gameTypes={mockGameTypes}
          machineTypes={mockMachineTypes}
        />
      )}
    </div>
  )
}
