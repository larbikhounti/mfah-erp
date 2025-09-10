import { DataTableProps } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { Game, GameType, MachineType } from "@/app/lib/types"

export const getGameTableConfig = (
  games: Game[],
  gameTypes: GameType[],
  machineTypes: MachineType[],
  onEdit: (game: Game) => void,
  onDelete: (gameId: number) => void
): Pick<DataTableProps<Game>, 'columns' | 'searchKeys' | 'filters' | 'actions' | 'searchPlaceholder'> => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatPlayTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return {
    columns: [
      { key: "name", label: "Name" },
      { 
        key: "price", 
        label: "Price",
        render: (game) => formatPrice(game.price)
      },
      { 
        key: "playTime", 
        label: "Play Time",
        render: (game) => formatPlayTime(game.playTime)
      },
      {
        key: "gameType",
        label: "Game Type",
        render: (game) => game.gameType ? (
          <Badge variant="secondary">{game.gameType.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
      {
        key: "machineType",
        label: "Machine Type",
        render: (game) => game.machineType ? (
          <Badge variant="outline">{game.machineType.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    ],
    searchKeys: ["name"],
    searchPlaceholder: "Search games...",
    filters: [
      {
        key: "gameType",
        label: "All Game Types",
        placeholder: "Game Type",
        options: gameTypes.map((gameType) => ({
          value: gameType.id.toString(),
          label: gameType.name,
        })),
        getValue: (game: Game) => game.gameTypeId?.toString() || "",
      },
      {
        key: "machineType",
        label: "All Machine Types",
        placeholder: "Machine Type",
        options: machineTypes.map((machineType) => ({
          value: machineType.id.toString(),
          label: machineType.name,
        })),
        getValue: (game: Game) => game.machineTypeId?.toString() || "",
      },
    ],
    actions: (game) => (
      <>
        <Button variant="ghost" size="sm" onClick={() => onEdit(game)}>
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(game.id)}>
          <IconTrash className="h-4 w-4" />
        </Button>
      </>
    ),
  }
}
