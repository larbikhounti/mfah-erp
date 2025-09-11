"use client"

import { useState, useMemo, useCallback, ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSearch, IconX } from "@tabler/icons-react"

export interface TableColumn<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  sortable?: boolean
}

export interface FilterOption<T = unknown> {
  key: string
  label: string
  placeholder: string
  options: Array<{ value: string; label: string }>
  getValue: (item: T) => string
}

export interface DataTableProps<T> {
  title: string
  data: T[]
  columns: TableColumn<T>[]
  searchKeys: string[] // Keys to search within each item
  searchPlaceholder?: string
  filters?: FilterOption<T>[]
  onRowClick?: (item: T) => void
  actions?: (item: T) => ReactNode
  addButton?: ReactNode
  showCount?: boolean
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends object>({

  data,
  columns,
  searchKeys,
  searchPlaceholder = "Search...",
  filters = [],
  onRowClick,
  actions,
  addButton,
  showCount = true,
  emptyMessage,
  className = "",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    filters.reduce((acc, filter) => ({ ...acc, [filter.key]: "all" }), {})
  )

  // Helper function to get nested values (e.g., "machine.name")
  const getNestedValue = useCallback((obj: T, path: string): unknown => {
    return path.split('.').reduce((curr: unknown, key: string) => {
      if (curr && typeof curr === 'object' && key in curr) {
        return (curr as Record<string, unknown>)[key]
      }
      return undefined
    }, obj as unknown)
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter
      const matchesSearch = searchKeys.some((key) => {
        const value = getNestedValue(item, key)
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })

      // Custom filters
      const matchesFilters = filters.every((filter) => {
        const filterValue = filterValues[filter.key]
        if (filterValue === "all") return true
        return filter.getValue(item) === filterValue
      })

      return matchesSearch && matchesFilters
    })
  }, [data, searchTerm, filterValues, searchKeys, filters, getNestedValue])

  const clearFilters = () => {
    setSearchTerm("")
    setFilterValues(filters.reduce((acc, filter) => ({ ...acc, [filter.key]: "all" }), {}))
  }

  const hasActiveFilters = searchTerm || Object.values(filterValues).some((value) => value !== "all")

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [filterKey]: value }))
  }

  const renderCell = (item: T, column: TableColumn<T>) => {
    if (column.render) {
      return column.render(item)
    }
    const value = getNestedValue(item, column.key)
    if (value === null || value === undefined) {
      return "N/A"
    }
    return String(value)
  }

  const tableContent = (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key]}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="px-3 bg-transparent">
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>
        {showCount && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} items
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={actions && column.key === columns[columns.length - 1].key ? "text-right" : ""}>
                    {column.label}
                  </TableHead>
                ))}
                {actions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                    {emptyMessage || (hasActiveFilters ? `No items match your filters.` : `No items found.`)}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow
                    key={('id' in item ? String(item.id) : undefined) || `row-${index}`}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.key === "id" ? "font-medium" : ""}>
                        {renderCell(item, column)}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions(item)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  // If there's an add button, wrap the table in a div with the button outside
  if (addButton) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          {addButton}
        </div>
        {tableContent}
      </div>
    )
  }

  return tableContent
}
