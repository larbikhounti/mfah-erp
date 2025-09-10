"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, X } from "lucide-react"
import { Game, GameType, MachineType } from "@/app/lib/types"


interface GameTableProps {
  games: Game[]
  gameTypes: GameType[]
  machineTypes: MachineType[]
  onEdit: (game: Game) => void
  onDelete: (gameId: number) => void
}

export function GameTable({ games, gameTypes, machineTypes, onEdit, onDelete }: GameTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [gameTypeFilter, setGameTypeFilter] = useState<string>("all")
  const [machineTypeFilter, setMachineTypeFilter] = useState<string>("all")

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGameType = gameTypeFilter === "all" || game.gameTypeId?.toString() === gameTypeFilter
      const matchesMachineType = machineTypeFilter === "all" || game.machineTypeId?.toString() === machineTypeFilter

      return matchesSearch && matchesGameType && matchesMachineType
    })
  }, [games, searchTerm, gameTypeFilter, machineTypeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setGameTypeFilter("all")
    setMachineTypeFilter("all")
  }

  const hasActiveFilters = searchTerm || gameTypeFilter !== "all" || machineTypeFilter !== "all"

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Game Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Game Types</SelectItem>
              {gameTypes.map((gameType) => (
                <SelectItem key={gameType.id} value={gameType.id.toString()}>
                  {gameType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={machineTypeFilter} onValueChange={setMachineTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Machine Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machine Types</SelectItem>
              {machineTypes.map((machineType) => (
                <SelectItem key={machineType.id} value={machineType.id.toString()}>
                  {machineType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredGames.length} of {games.length} games
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Play Time</TableHead>
              <TableHead>Game Type</TableHead>
              <TableHead>Machine Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGames.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {hasActiveFilters ? "No games match your filters." : "No games found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.name}</TableCell>
                  <TableCell>{formatPrice(game.price)}</TableCell>
                  <TableCell>{formatPlayTime(game.playTime)}</TableCell>
                  <TableCell>
                    {game.gameType ? (
                      <Badge variant="secondary">{game.gameType.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {game.machineType ? (
                      <Badge variant="outline">{game.machineType.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(game)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(game.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
