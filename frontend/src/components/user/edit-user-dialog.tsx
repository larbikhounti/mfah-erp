"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "./user-table"

interface EditUserDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onEditUser: (user: User) => void
}

export function EditUserDialog({ user, isOpen, onClose, onEditUser }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as "backoffice" | "front office" | "",
    dom: "" as "dom1" | "dom2" | "dom3" | "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't populate password for security
        role: user.role,
        dom: user.dom,
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.name || !formData.email || !formData.role || !formData.dom) {
      return
    }

    onEditUser({
      id: user.id,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      dom: formData.dom,
    })

    onClose()
  }

  const handleClose = () => {
    setFormData({ name: "", email: "", password: "", role: "", dom: "" })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user account information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "backoffice" | "front office") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backoffice">Backoffice</SelectItem>
                  <SelectItem value="front office">Front Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-dom">dom</Label>
              <Select
                value={formData.dom}
                onValueChange={(value: "dom1" | "dom2" | "dom3") => setFormData({ ...formData, dom: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dom1">Dom 1</SelectItem>
                  <SelectItem value="dom2">Dom 2</SelectItem>
                  <SelectItem value="dom3">Dom 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Update User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
