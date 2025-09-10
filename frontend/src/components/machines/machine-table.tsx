"use client"

import { useState, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconSearch, IconEdit, IconTrash, IconX } from "@tabler/icons-react"
import { Machine } from "@/app/lib/types"

interface MachineTableProps {
  machines: Machine[]
  onDeleteMachine: (id: number) => void
  onEditMachine: (machine: Machine) => void
}

export function MachineTable({ machines, onDeleteMachine, onEditMachine }: MachineTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [domFilter, setDomFilter] = useState<string>("all")

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === "all" || machine.machineType?.name === typeFilter
      const matchesDom = domFilter === "all" || machine.dom?.name === domFilter
      return matchesSearch && matchesType && matchesDom
    })
  }, [machines, searchTerm, typeFilter, domFilter])

  const uniqueTypes = Array.from(new Set(machines.map((m) => m.machineType?.name).filter(Boolean)))
  const uniqueDoms = Array.from(new Set(machines.map((m) => m.dom?.name).filter(Boolean)))

  const hasActiveFilters = searchTerm || typeFilter !== "all" || domFilter !== "all"

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setDomFilter("all")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type!}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={domFilter} onValueChange={setDomFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by dom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doms</SelectItem>
            {uniqueDoms.map((dom) => (
              <SelectItem key={dom} value={dom!}>
                {dom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            <IconX className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredMachines.length} of {machines.length} machines
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Machine Type</TableHead>
              <TableHead>Dom</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMachines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {hasActiveFilters ? "No machines match your filters." : "No machines found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredMachines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.name}</TableCell>
                  <TableCell>{machine.machineType?.name || "Not assigned"}</TableCell>
                  <TableCell>{machine.dom?.name || "Not assigned"}</TableCell>
                  <TableCell>{new Date(machine.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEditMachine(machine)}>
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDeleteMachine(machine.id)}>
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
    </div>
  )
}
