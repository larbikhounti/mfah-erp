"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconEdit, IconTrash, IconSearch, IconX } from "@tabler/icons-react"
import { Role } from "@/app/dashboard/roles/page"

interface RoleTableProps {
  roles: Role[]
  onEditRole: (role: Role) => void
  onDeleteRole: (roleId: number) => void
}

export function RoleTable({ roles, onEditRole, onDeleteRole }: RoleTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [roles, searchTerm])

  const clearFilters = () => {
    setSearchTerm("")
  }

  const hasActiveFilters = searchTerm.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
        <CardDescription>Manage system roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2 bg-transparent">
              <IconX className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredRoles.length} of {roles.length} roles
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {hasActiveFilters ? "No roles match your search criteria." : "No roles found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <Badge variant="secondary">{role.name}</Badge>
                    </TableCell>
                    <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(role.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEditRole(role)}>
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteRole(role.id)}>
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
