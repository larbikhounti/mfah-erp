"use client"

import { useState } from "react"
import { MachineTable } from "@/components/machines/machine-table"
import { CreateMachineDialog } from "@/components/machines/create-machine-dialog"
import { EditMachineDialog } from "@/components/machines/edit-machine-dialog"
import { Dom, Machine, MachineType } from "@/app/lib/types"

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([
    {
      id: 1,
      name: "Pac-Man Arcade",
      machineTypeId: 1,
      domeId: 1,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      machineType: {
        id: 1,
        name: "Arcade Cabinet",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      dom: {
        id: 1,
        name: "Dom 1",
        address: "123 Main St",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    },
    {
      id: 2,
      name: "Medieval Madness",
      machineTypeId: 2,
      domeId: 2,
      createdAt: "2024-01-16T11:00:00Z",
      updatedAt: "2024-01-16T11:00:00Z",
      machineType: {
        id: 2,
        name: "Pinball Machine",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      dom: {
        id: 2,
        name: "Dom 2",
        address: "456 Oak Ave",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    },
    {
      id: 3,
      name: "Lucky Sevens",
      machineTypeId: 3,
      createdAt: "2024-01-17T12:00:00Z",
      updatedAt: "2024-01-17T12:00:00Z",
      machineType: {
        id: 3,
        name: "Slot Machine",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    },
  ])

  const [machineTypes] = useState<MachineType[]>([
    { id: 1, name: "Arcade Cabinet", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    { id: 2, name: "Pinball Machine", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    { id: 3, name: "Slot Machine", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    { id: 4, name: "Claw Machine", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
    { id: 5, name: "Racing Simulator", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  ])

  const [doms] = useState<Dom[]>([
    {
      id: 1,
      name: "Dom 1",
      address: "123 Main St",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "Dom 2",
      address: "456 Oak Ave",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 3,
      name: "Dom 3",
      address: "789 Pine Rd",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ])

  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)

  const handleCreateMachine = (machineData: Omit<Machine, "id" | "createdAt" | "updatedAt">) => {
    const newMachine: Machine = {
      ...machineData,
      id: Math.max(...machines.map((m) => m.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      machineType: machineData.machineTypeId
        ? machineTypes.find((mt) => mt.id === machineData.machineTypeId)
        : undefined,
      dom: machineData.domeId ? doms.find((d) => d.id === machineData.domeId) : undefined,
    }
    setMachines([...machines, newMachine])
  }

  const handleEditMachine = (machineData: Omit<Machine, "id" | "createdAt" | "updatedAt">) => {
    if (!editingMachine) return

    const updatedMachine: Machine = {
      ...editingMachine,
      ...machineData,
      updatedAt: new Date().toISOString(),
      machineType: machineData.machineTypeId
        ? machineTypes.find((mt) => mt.id === machineData.machineTypeId)
        : undefined,
      dom: machineData.domeId ? doms.find((d) => d.id === machineData.domeId) : undefined,
    }

    setMachines(machines.map((machine) => (machine.id === editingMachine.id ? updatedMachine : machine)))
    setEditingMachine(null)
  }

  const handleDeleteMachine = (id: number) => {
    setMachines(machines.filter((machine) => machine.id !== id))
  }

  const handleOpenEdit = (machine: Machine) => {
    setEditingMachine(machine)
  }

  const handleCloseEdit = () => {
    setEditingMachine(null)
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Machines</h2>
        <div className="flex items-center space-x-2">
          <CreateMachineDialog onCreateMachine={handleCreateMachine} machineTypes={machineTypes} doms={doms} />
        </div>
      </div>
      <MachineTable machines={machines} onDeleteMachine={handleDeleteMachine} onEditMachine={handleOpenEdit} />
      {editingMachine && (
        <EditMachineDialog
          machine={editingMachine}
          machineTypes={machineTypes}
          doms={doms}
          onEditMachine={handleEditMachine}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  )
}
