"use client"

import { useState, useMemo } from "react"
import { Search, X, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dom } from "@/app/lib/types"


interface DomTableProps {
  doms: Dom[]
  onEditDom: (dom: Dom) => void
  onDeleteDom: (id: number) => void
}

export function DomTable({ doms, onEditDom, onDeleteDom }: DomTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState<string>("all")

  const filteredDoms = useMemo(() => {
    return doms.filter((dom) => {
      const matchesSearch =
        dom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dom.address.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesArea = areaFilter === "all" || dom.address.toLowerCase().includes(areaFilter.toLowerCase())

      return matchesSearch && matchesArea
    })
  }, [doms, searchTerm, areaFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setAreaFilter("all")
  }

  const hasActiveFilters = searchTerm || areaFilter !== "all"

  const uniqueAreas = useMemo(() => {
    const areas = new Set(
      doms
        .map((dom) => {
          const firstWord = dom.address.split(" ")[0]
          return firstWord
        })
        .filter(Boolean),
    )
    return Array.from(areas).sort()
  }, [doms])

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {uniqueAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
              Clear
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredDoms.length} of {doms.length} dom(s)
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Street Address</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {hasActiveFilters ? "No doms match your filters." : "No doms found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredDoms.map((dom) => (
                <TableRow key={dom.id}>
                  <TableCell className="font-medium">{dom.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dom.address}</Badge>
                  </TableCell>
                  <TableCell>{new Date(dom.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(dom.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onEditDom(dom)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDeleteDom(dom.id)}>
                        <Trash2 className="h-4 w-4" />
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
