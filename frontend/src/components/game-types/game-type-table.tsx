"use client"

import { DataTable } from "@/components/shared/data-table"
import { GameType, getGameTypeTableConfig } from "@/components/shared/table-configs/game-type-table-config"

interface GameTypeTableProps {
  gameTypes: GameType[]
  onEdit: (gameType: GameType) => void
  onDelete: (id: number) => void
}

export function GameTypeTable({ gameTypes, onEdit, onDelete }: GameTypeTableProps) {
  const tableConfig = getGameTypeTableConfig(onEdit, onDelete)

  return (
    <DataTable
      title="Game Types"
      data={gameTypes}
      {...tableConfig}
    />
  )
}
