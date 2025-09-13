"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUsersStore, type User } from "@/stores/users-store";
import { useRolesStore } from "@/stores/roles-store";
import { useDomsStore } from "@/stores/doms-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { Loader } from "../loader";

interface EditUserDialogProps {
  user: User | null;
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const { updateUser, loading } = useUsersStore();
  const { roles, fetchRoles, loading: rolesLoading } = useRolesStore();
  const { doms, fetchDoms, loading: domsLoading } = useDomsStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [dom, setDom] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setRole(user.role?.toString() || "");
      setDom(user.dom?.toString() || "");
    }
  }, [user]);

  // Fetch roles and DOMs when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchDoms();
    }
  }, [isOpen, fetchRoles, fetchDoms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !email || !role || !dom) return;

    try {
      await updateUser(user.id, {
        name,
        email,
        password: password || undefined, // update only if filled
        role_id: parseInt(role),
        dom_id: parseInt(dom),
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
      setDom(user.dom?.toString() || "");
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
          <DialogDescription>
            Update user account information.
          </DialogDescription>
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

            {/* Role + DOM */}
            <div className="w-full grid md:grid-cols-2 gap-4">
              <div className="grid gap-2 w-full">
                <Label htmlFor="edit-role">Role</Label>
                <Select  value={role} onValueChange={(value) => setRole(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesLoading ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Loading roles...
                      </div>
                    ) : roles.length > 0 ? (
                      roles.map((roleItem) => (
                        <SelectItem key={roleItem.id} value={roleItem.id.toString()}>
                          {roleItem.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No roles available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 w-full">
                <Label htmlFor="edit-dom">DOM</Label>
                <Select value={dom} onValueChange={(value) => setDom(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select DOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {domsLoading ? (
                      <SelectItem value="" disabled>
                        Loading DOMs...
                      </SelectItem>
                    ) : doms.length > 0 ? (
                      doms.map((domItem) => (
                        <SelectItem key={domItem.id} value={domItem.id.toString()}>
                          {domItem.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No DOMs available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
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
