"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Trash2, Edit, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateGameTypeDialog } from "./create-game-type-dialog"
import { GameType } from "@/app/lib/types"

interface GameTypeTableProps {
  gameTypes: GameType[]
  onEdit: (gameType: GameType) => void
  onDelete: (id: number) => void
  onCreateGameType: (gameType: Omit<GameType, "id" | "createdAt" | "updatedAt">) => void
}

export function GameTypeTable({ gameTypes, onEdit, onDelete, onCreateGameType }: GameTypeTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredGameTypes = useMemo(() => {
    return gameTypes.filter((gameType) => gameType.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [gameTypes, searchTerm])

  const clearFilters = () => {
    setSearchTerm("")
  }

  const hasActiveFilters = searchTerm.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search game types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
              Clear filters
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Game Type
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredGameTypes.length} of {gameTypes.length} game types
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGameTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {hasActiveFilters ? "No game types match your search." : "No game types found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredGameTypes.map((gameType) => (
                <TableRow key={gameType.id}>
                  <TableCell className="font-medium">{gameType.name}</TableCell>
                  <TableCell>{new Date(gameType.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(gameType.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(gameType)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(gameType.id)}>
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

      <CreateGameTypeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateGameType={onCreateGameType}
      />
    </div>
  )
}
