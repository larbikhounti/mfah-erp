import { DataTableProps } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { IconEdit, IconTrash } from "@tabler/icons-react"

export interface GameType {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export const getGameTypeTableConfig = (
  onEditGameType: (gameType: GameType) => void,
  onDeleteGameType: (id: number) => void
): Pick<DataTableProps<GameType>, 'columns' | 'searchKeys' | 'actions' | 'searchPlaceholder'> => ({
  columns: [
    { key: "name", label: "Name" },
    { 
      key: "createdAt", 
      label: "Created At",
      render: (gameType) => new Date(gameType.createdAt).toLocaleDateString()
    },
    { 
      key: "updatedAt", 
      label: "Updated At",
      render: (gameType) => new Date(gameType.updatedAt).toLocaleDateString()
    },
  ],
  searchKeys: ["name"],
  searchPlaceholder: "Search game types...",
  actions: (gameType) => (
    <>
      <Button variant="ghost" size="sm" onClick={() => onEditGameType(gameType)}>
        <IconEdit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onDeleteGameType(gameType.id)}>
        <IconTrash className="h-4 w-4" />
      </Button>
    </>
  ),
})
