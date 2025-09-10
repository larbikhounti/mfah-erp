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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconPlus } from "@tabler/icons-react"
import { Dom, Machine, MachineType } from "@/app/lib/types"

interface CreateMachineDialogProps {
  onCreateMachine: (machine: Omit<Machine, "id" | "createdAt" | "updatedAt">) => void
  machineTypes: MachineType[]
  doms: Dom[]
}

export function CreateMachineDialog({ onCreateMachine, machineTypes, doms }: CreateMachineDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [machineTypeId, setMachineTypeId] = useState<string>("1") // Updated default value
  const [domeId, setDomeId] = useState<string>("") // Updated default value

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateMachine({
        name: name.trim(),
        machineTypeId: machineTypeId ? Number.parseInt(machineTypeId) : undefined,
        domeId: domeId ? Number.parseInt(domeId) : undefined,
      })
      setName("")
      setMachineTypeId("")
      setDomeId("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Machine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Machine</DialogTitle>
          <DialogDescription>
            Create a new machine. Choose a machine type and optionally assign it to a dom.
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
                  <SelectItem value="0">No Dom</SelectItem> {/* Updated value prop */}
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
            <Button type="submit">Add Machine</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
