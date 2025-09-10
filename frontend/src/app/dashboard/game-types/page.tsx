"use client"

import { useState } from "react"
import { GameTypeTable } from "@/components/game-types/game-type-table"
import { EditGameTypeDialog } from "@/components/game-types/edit-game-type-dialog"
import { GameType } from "@/app/lib/types"
export default function GameTypesPage() {
  const [gameTypes, setGameTypes] = useState<GameType[]>([
    {
      id: 1,
      name: "Horror",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "Action",
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-16T14:20:00Z",
    },
    {
      id: 3,
      name: "Adventure",
      createdAt: "2024-01-17T09:15:00Z",
      updatedAt: "2024-01-17T09:15:00Z",
    },
    {
      id: 4,
      name: "RPG",
      createdAt: "2024-01-18T16:45:00Z",
      updatedAt: "2024-01-18T16:45:00Z",
    },
    {
      id: 5,
      name: "Strategy",
      createdAt: "2024-01-19T11:30:00Z",
      updatedAt: "2024-01-19T11:30:00Z",
    },
  ])

  const [editingGameType, setEditingGameType] = useState<GameType | null>(null)

  const handleCreateGameType = (newGameType: Omit<GameType, "id" | "createdAt" | "updatedAt">) => {
    const gameType: GameType = {
      ...newGameType,
      id: Math.max(...gameTypes.map((r) => r.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setGameTypes([...gameTypes, gameType])
  }

  const handleEditGameType = (updatedGameType: GameType) => {
    setGameTypes(
      gameTypes.map((gameType) =>
        gameType.id === updatedGameType.id ? { ...updatedGameType, updatedAt: new Date().toISOString() } : gameType,
      ),
    )
    setEditingGameType(null)
  }

  const handleDeleteGameType = (id: number) => {
    setGameTypes(gameTypes.filter((gameType) => gameType.id !== id))
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Game Types</h2>
      </div>

      <GameTypeTable
        gameTypes={gameTypes}
        onEdit={setEditingGameType}
        onDelete={handleDeleteGameType}
        onCreateGameType={handleCreateGameType}
      />

      {editingGameType && (
        <EditGameTypeDialog
          gameType={editingGameType}
          open={!!editingGameType}
          onOpenChange={(open) => !open && setEditingGameType(null)}
          onEditGameType={handleEditGameType}
        />
      )}
    </div>
  )
}
