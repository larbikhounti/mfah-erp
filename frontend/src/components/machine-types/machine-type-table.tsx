"use client"

import { useState, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { IconSearch, IconEdit, IconTrash, IconX } from "@tabler/icons-react"
import { MachineType } from "@/app/lib/types"
import { CreateMachineTypeDialog } from "./create-machine-type-dialog"

interface MachineTypeTableProps {
  machineTypes: MachineType[]
  onCreateMachineType: (machineTypeData: { name: string }) => void
  onEditMachineType: (machineType: MachineType) => void
  onDeleteMachineType: (id: number) => void
}

export function MachineTypeTable({
  machineTypes,
  onCreateMachineType,
  onEditMachineType,
  onDeleteMachineType,
}: MachineTypeTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMachineTypes = useMemo(() => {
    return machineTypes.filter((machineType) => machineType.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [machineTypes, searchTerm])

  const clearFilters = () => {
    setSearchTerm("")
  }

  const hasActiveFilters = searchTerm.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Machine Types</CardTitle>
            <CardDescription>Manage machine types for your gaming systems</CardDescription>
          </div>
          <CreateMachineTypeDialog onCreateMachineType={onCreateMachineType} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search machine types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-2 bg-transparent">
              <IconX className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredMachineTypes.length} of {machineTypes.length} machine types
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachineTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {hasActiveFilters ? "No machine types match your search." : "No machine types found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMachineTypes.map((machineType) => (
                  <TableRow key={machineType.id}>
                    <TableCell className="font-medium">{machineType.name}</TableCell>
                    <TableCell>{new Date(machineType.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(machineType.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEditMachineType(machineType)}>
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDeleteMachineType(machineType.id)}>
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
