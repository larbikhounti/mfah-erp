"use client"

import { useState } from "react"
import { DomTable } from "@/components/doms/dom-table"
import { CreateDomDialog } from "@/components/doms/create-dom-dialog"
import { EditDomDialog } from "@/components/doms/edit-dom-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { Dom } from "@/app/lib/types"

export default function DomsPage() {
  const [doms, setDoms] = useState<Dom[]>([
    {
      id: 1,
      name: "dom1",
      address: "5th avenue",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "dom2",
      address: "Main street",
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-16T14:20:00Z",
    },
    {
      id: 3,
      name: "dom3",
      address: "4th street",
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
    <div className="flex-1 space-y-4 p-4 pt-6">
      <PageHeader title="Doms">
        <CreateDomDialog onCreateDom={handleCreateDom} />
      </PageHeader>
      <DomTable doms={doms} onEditDom={handleEditDom} onDeleteDom={handleDeleteDom} />
      {editingDom && (
        <EditDomDialog dom={editingDom} onUpdateDom={handleUpdateDom} onClose={() => setEditingDom(null)} />
      )}
    </div>
  )
}
