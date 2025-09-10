"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconSearch, IconX } from "@tabler/icons-react"
import { Experience } from "@/app/lib/types"

interface ExperienceTableProps {
  experiences: Experience[]
  onExperienceClick: (experience: Experience) => void
}

export function ExperienceTable({ experiences, onExperienceClick }: ExperienceTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [machineFilter, setMachineFilter] = useState<string>("all")
  const [domFilter, setDomFilter] = useState<string>("all")

  // Get unique machines and doms for filter options
  const machines = useMemo(() => {
    const uniqueMachines = experiences.reduce(
      (acc, exp) => {
        if (exp.machine && !acc.find((m) => m.id === exp.machine!.id)) {
          acc.push(exp.machine)
        }
        return acc
      },
      [] as NonNullable<Experience["machine"]>[],
    )
    return uniqueMachines
  }, [experiences])

  const doms = useMemo(() => {
    const uniqueDoms = experiences.reduce(
      (acc, exp) => {
        if (exp.dom && !acc.find((d) => d.id === exp.dom!.id)) {
          acc.push(exp.dom)
        }
        return acc
      },
      [] as NonNullable<Experience["dom"]>[],
    )
    return uniqueDoms
  }, [experiences])

  const filteredExperiences = useMemo(() => {
    return experiences.filter((experience) => {
      const matchesSearch =
        experience.machine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.game?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        experience.dom?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMachine = machineFilter === "all" || experience.machineId.toString() === machineFilter
      const matchesDom = domFilter === "all" || experience.domeId.toString() === domFilter

      return matchesSearch && matchesMachine && matchesDom
    })
  }, [experiences, searchTerm, machineFilter, domFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setMachineFilter("all")
    setDomFilter("all")
  }

  const hasActiveFilters = searchTerm || machineFilter !== "all" || domFilter !== "all"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiences</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={machineFilter} onValueChange={setMachineFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              {machines.map((machine) => (
                <SelectItem key={machine.id} value={machine.id.toString()}>
                  {machine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={domFilter} onValueChange={setDomFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by dom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doms</SelectItem>
              {doms.map((dom) => (
                <SelectItem key={dom.id} value={dom.id.toString()}>
                  {dom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="px-3 bg-transparent">
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredExperiences.length} of {experiences.length} experiences
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Dom</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Play Time</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperiences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {hasActiveFilters ? "No experiences match your filters." : "No experiences found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExperiences.map((experience) => (
                  <TableRow
                    key={experience.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onExperienceClick(experience)}
                  >
                    <TableCell className="font-medium">{experience.id}</TableCell>
                    <TableCell>{experience.machine?.name || "N/A"}</TableCell>
                    <TableCell>{experience.game?.name || "N/A"}</TableCell>
                    <TableCell>{experience.dom?.name || "N/A"}</TableCell>
                    <TableCell>${experience.game?.price?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{experience.game?.playTime || 0} min</TableCell>
                    <TableCell>{new Date(experience.createdAt).toLocaleDateString()}</TableCell>
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
