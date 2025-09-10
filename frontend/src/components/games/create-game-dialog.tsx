"use client"

import type React from "react"

import { useState } from "react"
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


interface CreateGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (game: Omit<Game, "id" | "createdAt" | "updatedAt">) => void
  gameTypes: GameType[]
  machineTypes: MachineType[]
}

export function CreateGameDialog({ open, onOpenChange, onSubmit, gameTypes, machineTypes }: CreateGameDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    playTime: "",
    gameTypeId: "",
    machineTypeId: "",
  })

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

    // Reset form
    setFormData({
      name: "",
      price: "",
      playTime: "",
      gameTypeId: "",
      machineTypeId: "",
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        name: "",
        price: "",
        playTime: "",
        gameTypeId: "",
        machineTypeId: "",
      })
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Game</DialogTitle>
          <DialogDescription>Create a new game entry with pricing and compatibility information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Game Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter game name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
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
              <Label htmlFor="playTime">Play Time (minutes)</Label>
              <Input
                id="playTime"
                type="number"
                min="1"
                value={formData.playTime}
                onChange={(e) => setFormData({ ...formData, playTime: e.target.value })}
                placeholder="Enter play time in minutes"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gameType">Game Type</Label>
              <Select
                value={formData.gameTypeId}
                onValueChange={(value) => setFormData({ ...formData, gameTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select game type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {gameTypes.map((gameType) => (
                    <SelectItem key={gameType.id} value={gameType.id.toString()}>
                      {gameType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="machineType">Compatible Machine Type</Label>
              <Select
                value={formData.machineTypeId}
                onValueChange={(value) => setFormData({ ...formData, machineTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select machine type (optional)" />
                </SelectTrigger>
                <SelectContent>
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Game</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
