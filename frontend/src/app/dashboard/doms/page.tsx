"use client"

import { useState } from "react"
import { DomTable } from "@/components/doms/dom-table"
import { CreateDomDialog } from "@/components/doms/create-dom-dialog"
import { EditDomDialog } from "@/components/doms/edit-dom-dialog"
import { Dom } from "@/app/lib/types"

export default function DomsPage() {
  const [doms, setDoms] = useState<Dom[]>([
    {
      id: 1,
      name: "dom1",
      address: "192.168.1.1",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "dom2",
      address: "192.168.1.2",
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-16T14:20:00Z",
    },
    {
      id: 3,
      name: "dom3",
      address: "192.168.1.3",
      createdAt: "2024-01-17T09:15:00Z",
      updatedAt: "2024-01-17T09:15:00Z",
    },
  ])

  const [editingDom, setEditingDom] = useState<Dom | null>(null)

  const handleCreateDom = (domData: Omit<Dom, "id" | "createdAt" | "updatedAt">) => {
    const newDom: Dom = {
      ...domData,
      id: Math.max(...doms.map((d) => d.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setDoms([...doms, newDom])
  }

  const handleEditDom = (dom: Dom) => {
    setEditingDom(dom)
  }

  const handleUpdateDom = (updatedDom: Dom) => {
    setDoms(
      doms.map((dom) => (dom.id === updatedDom.id ? { ...updatedDom, updatedAt: new Date().toISOString() } : dom)),
    )
    setEditingDom(null)
  }

  const handleDeleteDom = (id: number) => {
    setDoms(doms.filter((dom) => dom.id !== id))
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Doms</h2>
        <CreateDomDialog onCreateDom={handleCreateDom} />
      </div>
      <DomTable doms={doms} onEditDom={handleEditDom} onDeleteDom={handleDeleteDom} />
      {editingDom && (
        <EditDomDialog dom={editingDom} onUpdateDom={handleUpdateDom} onClose={() => setEditingDom(null)} />
      )}
    </div>
  )
}
