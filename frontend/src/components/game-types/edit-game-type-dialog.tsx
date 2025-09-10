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
import { GameType } from "@/app/lib/types"


interface EditGameTypeDialogProps {
  gameType: GameType
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditGameType: (gameType: GameType) => void
}

export function EditGameTypeDialog({ gameType, open, onOpenChange, onEditGameType }: EditGameTypeDialogProps) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (gameType) {
      setName(gameType.name)
    }
  }, [gameType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onEditGameType({
        ...gameType,
        name: name.trim(),
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName(gameType?.name || "")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Game Type</DialogTitle>
          <DialogDescription>Update the game type information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Horror, Action, RPG"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Game Type</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
