"use client"

import { useState } from "react"

import { MachineTypeTable } from "@/components/machine-types/machine-type-table"
import { EditMachineTypeDialog } from "@/components/machine-types/edit-machine-type-dialog"
import { MachineType } from "@/app/lib/types"

export default function MachineTypesPage() {
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([
    {
      id: 1,
      name: "Arcade Cabinet",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "Pinball Machine",
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-16T14:20:00Z",
    },
    {
      id: 3,
      name: "Slot Machine",
      createdAt: "2024-01-17T09:15:00Z",
      updatedAt: "2024-01-17T09:15:00Z",
    },
    {
      id: 4,
      name: "Claw Machine",
      createdAt: "2024-01-18T16:45:00Z",
      updatedAt: "2024-01-18T16:45:00Z",
    },
    {
      id: 5,
      name: "Racing Simulator",
      createdAt: "2024-01-19T11:30:00Z",
      updatedAt: "2024-01-19T11:30:00Z",
    },
  ])

  const [editingMachineType, setEditingMachineType] = useState<MachineType | null>(null)

  const handleCreateMachineType = (machineTypeData: { name: string }) => {
    const newMachineType: MachineType = {
      id: Math.max(...machineTypes.map((mt) => mt.id)) + 1,
      name: machineTypeData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setMachineTypes([...machineTypes, newMachineType])
  }

  const handleEditMachineType = (machineType: MachineType) => {
    setEditingMachineType(machineType)
  }

  const handleUpdateMachineType = (updatedMachineType: MachineType) => {
    setMachineTypes(
      machineTypes.map((mt) =>
        mt.id === updatedMachineType.id ? { ...updatedMachineType, updatedAt: new Date().toISOString() } : mt,
      ),
    )
    setEditingMachineType(null)
  }

  const handleDeleteMachineType = (id: number) => {
    setMachineTypes(machineTypes.filter((mt) => mt.id !== id))
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Machine Types</h2>
      </div>
      <MachineTypeTable
        machineTypes={machineTypes}
        onCreateMachineType={handleCreateMachineType}
        onEditMachineType={handleEditMachineType}
        onDeleteMachineType={handleDeleteMachineType}
      />
      {editingMachineType && (
        <EditMachineTypeDialog
          machineType={editingMachineType}
          open={!!editingMachineType}
          onOpenChange={(open) => !open && setEditingMachineType(null)}
          onUpdateMachineType={handleUpdateMachineType}
        />
      )}
    </div>
  )
}
