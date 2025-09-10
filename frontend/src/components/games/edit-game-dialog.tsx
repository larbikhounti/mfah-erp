"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Game, GameType, MachineType } from "@/app/lib/types"


interface EditGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (game: Omit<Game, "id" | "createdAt" | "updatedAt">) => void
  game: Game
  gameTypes: GameType[]
  machineTypes: MachineType[]
}

export function EditGameDialog({ open, onOpenChange, onSubmit, game, gameTypes, machineTypes }: EditGameDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    playTime: "",
    gameTypeId: "0", // Updated default value to be a non-empty string
    machineTypeId: "0", // Updated default value to be a non-empty string
  })

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name,
        price: game.price.toString(),
        playTime: game.playTime.toString(),
        gameTypeId: game.gameTypeId?.toString() || "0", // Updated default value to be a non-empty string
        machineTypeId: game.machineTypeId?.toString() || "0", // Updated default value to be a non-empty string
      })
    }
  }, [game])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.price || !formData.playTime) {
      return
    }

    onSubmit({
      name: formData.name.trim(),
      price: Number.parseFloat(formData.price),
      playTime: Number.parseInt(formData.playTime),
      gameTypeId: formData.gameTypeId ? Number.parseInt(formData.gameTypeId) : undefined,
      machineTypeId: formData.machineTypeId ? Number.parseInt(formData.machineTypeId) : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>Update the game information, pricing, and compatibility.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Game Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter game name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-playTime">Play Time (minutes)</Label>
              <Input
                id="edit-playTime"
                type="number"
                min="1"
                value={formData.playTime}
                onChange={(e) => setFormData({ ...formData, playTime: e.target.value })}
                placeholder="Enter play time in minutes"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-gameType">Game Type</Label>
              <Select
                value={formData.gameTypeId}
                onValueChange={(value) => setFormData({ ...formData, gameTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select game type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No game type</SelectItem> {/* Updated value to be a non-empty string */}
                  {gameTypes.map((gameType) => (
                    <SelectItem key={gameType.id} value={gameType.id.toString()}>
                      {gameType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-machineType">Compatible Machine Type</Label>
              <Select
                value={formData.machineTypeId}
                onValueChange={(value) => setFormData({ ...formData, machineTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select machine type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No machine type</SelectItem> {/* Updated value to be a non-empty string */}
                  {machineTypes.map((machineType) => (
                    <SelectItem key={machineType.id} value={machineType.id.toString()}>
                      {machineType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Game</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
