"use client"

import { DataTable } from "@/components/shared/data-table"
import { Game, GameType, MachineType } from "@/app/lib/types"
import { getGameTableConfig } from "@/components/shared/table-configs/game-table-config"

interface GameTableProps {
  games: Game[]
  gameTypes: GameType[]
  machineTypes: MachineType[]
  onEdit: (game: Game) => void
  onDelete: (gameId: number) => void
}

export function GameTable({ games, gameTypes, machineTypes, onEdit, onDelete }: GameTableProps) {
  const tableConfig = getGameTableConfig(games, gameTypes, machineTypes, onEdit, onDelete)

  return (
    <DataTable
      title="Games"
      data={games}
      {...tableConfig}
    />
  )
}
