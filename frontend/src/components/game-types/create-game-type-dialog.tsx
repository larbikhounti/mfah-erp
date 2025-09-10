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
import { GameType } from "@/app/lib/types"

interface CreateGameTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateGameType: (gameType: Omit<GameType, "id" | "createdAt" | "updatedAt">) => void
}

export function CreateGameTypeDialog({ open, onOpenChange, onCreateGameType }: CreateGameTypeDialogProps) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateGameType({
        name: name.trim(),
      })
      setName("")
      onOpenChange(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Game Type</DialogTitle>
          <DialogDescription>Add a new game type to the system.</DialogDescription>
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
            <Button type="submit">Create Game Type</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
