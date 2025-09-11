"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useUsersStore, type CreateUserPayload } from "@/stores/users-store";
import { axiosInstance } from "@/lib/utils";
import { toast } from "sonner";

interface Role {
  id: number;
  name: string;
}

interface Dom {
  id: number;
  name: string;
  address: string;
}

interface CreateUserFormProps {
  trigger?: React.ReactNode;
}

export function CreateUserForm({ trigger }: CreateUserFormProps) {
  const { createUser, loading } = useUsersStore();
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [doms, setDoms] = useState<Dom[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: "",
    email: "",
    password: "",
    role_id: undefined,
    dom_id: undefined,
  });

  // Fetch roles and DOMs when component mounts or dialog opens
  useEffect(() => {
    fetchRolesAndDoms();
  });

  const fetchRolesAndDoms = async () => {
    setLoadingData(true);
    try {
      // Fetch roles
      const rolesResponse = await axiosInstance.get<Role[]>(
        "/users/admin/roles"
      );

      setRoles(rolesResponse.data);

      // Fetch DOMs
      const domsResponse = await axiosInstance.get<{ data: Dom[] }>(
        "/doms/all"
      );
      setDoms(domsResponse.data.data);
    } catch (error) {
      console.error("Failed to fetch roles and DOMs:", error);
      toast.error("Failed to load roles and DOMs");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createUser(formData);
      toast.success("User created successfully");
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role_id: undefined,
        dom_id: undefined,
      });
    } catch (error) {
      // Error is handled in the store
    }
  };

  const defaultTrigger = (
    <Button>
      <UserPlus className="mr-2 h-4 w-4" />
      Add User
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter user name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role_id?.toString() || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  role_id: value ? parseInt(value) : undefined,
                }))
              }
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingData ? "Loading roles..." : "Select a role"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dom">DOM</Label>
            <Select
              value={formData.dom_id?.toString() || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  dom_id: value ? parseInt(value) : undefined,
                }))
              }
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingData ? "Loading DOMs..." : "Select a DOM"}
                />
              </SelectTrigger>
              <SelectContent>
                {doms.map((dom) => (
                  <SelectItem key={dom.id} value={dom.id.toString()}>
                    {dom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
