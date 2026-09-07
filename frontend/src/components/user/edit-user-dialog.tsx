"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUsersStore, type User } from "@/stores/users-store";
import { useRolesStore } from "@/stores/roles-store";
import { Combobox } from "@/components/ui/combobox";
import { Edit } from "lucide-react";
import { Loader } from "../loader";

interface EditUserDialogProps {
  user: User | null;
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const { updateUser, loading } = useUsersStore();
  const { roles, fetchRoles, loading: rolesLoading } = useRolesStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setRole(user.role?.toString() || "");
    }
  }, [user]);

  // Fetch roles when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen, fetchRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !email || !role) return;

    try {
      await updateUser(user.id, {
        name,
        email,
        password: password || undefined, // update only if filled
        role_id: parseInt(role),
      });
      setIsOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form to original user data
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setRole(user.role?.toString() || "");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Password */}
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

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Combobox
                id="edit-role"
                value={role}
                onChange={setRole}
                disabled={rolesLoading}
                placeholder={rolesLoading ? "Loading roles..." : "Select role"}
                searchPlaceholder="Search roles..."
                emptyText="No roles available."
                options={roles.map((roleItem) => ({ value: roleItem.id.toString(), label: roleItem.name }))}
              />
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ?   <span className="flex items-center">
                               <Loader size={16} />
                                <span className="ml-2">
                                  Updating...
                                </span>
                            </span>: "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
