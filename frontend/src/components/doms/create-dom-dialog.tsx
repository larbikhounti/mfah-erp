"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { Dom } from "@/app/lib/types"


interface CreateDomDialogProps {
  onCreateDom: (dom: Omit<Dom, "id" | "createdAt" | "updatedAt">) => void
}

export function CreateDomDialog({ onCreateDom }: CreateDomDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.address) {
      onCreateDom(formData)
      setFormData({ name: "", address: "" })
      setOpen(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Dom
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Dom</DialogTitle>
          <DialogDescription>Create a new dom entry. Fill in the name and address.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                className="col-span-3"
                placeholder="dom1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange("address")}
                className="col-span-3"
                placeholder="192.168.1.1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Dom</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
