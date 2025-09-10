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
import { MachineType } from "@/app/lib/types"

interface EditMachineTypeDialogProps {
  machineType: MachineType
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateMachineType: (machineType: MachineType) => void
}

export function EditMachineTypeDialog({
  machineType,
  open,
  onOpenChange,
  onUpdateMachineType,
}: EditMachineTypeDialogProps) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (machineType) {
      setName(machineType.name)
    }
  }, [machineType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onUpdateMachineType({
        ...machineType,
        name: name.trim(),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Machine Type</DialogTitle>
            <DialogDescription>Update the machine type information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Enter machine type name"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Machine Type</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
