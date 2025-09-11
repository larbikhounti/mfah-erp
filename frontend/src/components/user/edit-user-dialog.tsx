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
import { EditUser } from "@/app/lib/types"

interface EditUserDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onEditUser: (user: EditUser) => void
}

export function EditUserDialog({ user, isOpen, onClose, onEditUser }: EditUserDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [dom, setDom] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPassword("")
      setRole(user.role)
      setDom(user.dom)
    }
  }, [user])



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name || !email || !role || !dom) {
      return
    }

    onEditUser({
      id: user.id,
      name,
      email,
      password,
      role,
      dom,
    })

    onClose()
  }

  const handleClose = () => {
    setName("")
    setEmail("")
    setPassword("")
    setRole("")
    setDom("")
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={role}
                onValueChange={(value: "backoffice" | "front office") => setRole(value)}
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
                value={dom}
                onValueChange={(value) => setDom(value)}
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
