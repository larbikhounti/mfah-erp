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
import { Dom, Machine, MachineType } from "@/app/lib/types"

interface EditMachineDialogProps {
  machine: Machine
  machineTypes: MachineType[]
  doms: Dom[]
  onEditMachine: (machine: Omit<Machine, "id" | "createdAt" | "updatedAt">) => void
  onClose: () => void
}

export function EditMachineDialog({ machine, machineTypes, doms, onEditMachine, onClose }: EditMachineDialogProps) {
  const [name, setName] = useState(machine.name)
  const [machineTypeId, setMachineTypeId] = useState<string>(machine.machineTypeId?.toString() || "0")
  const [domeId, setDomeId] = useState<string>(machine.domeId?.toString() || "0")

  useEffect(() => {
    setName(machine.name)
    setMachineTypeId(machine.machineTypeId?.toString() || "0")
    setDomeId(machine.domeId?.toString() || "0")
  }, [machine])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onEditMachine({
        name: name.trim(),
        machineTypeId: machineTypeId ? Number.parseInt(machineTypeId) : undefined,
        domeId: domeId ? Number.parseInt(domeId) : undefined,
      })
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Machine</DialogTitle>
          <DialogDescription>
            Update the machine details. Choose a machine type and optionally assign it to a dom.
          </DialogDescription>
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
                placeholder="Enter machine name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="machineType" className="text-right">
                Machine Type
              </Label>
              <Select value={machineTypeId} onValueChange={setMachineTypeId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
                <SelectContent>
                  {machineTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dom" className="text-right">
                Dom
              </Label>
              <Select value={domeId} onValueChange={setDomeId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select dom (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Dom</SelectItem>
                  {doms.map((dom) => (
                    <SelectItem key={dom.id} value={dom.id.toString()}>
                      {dom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
