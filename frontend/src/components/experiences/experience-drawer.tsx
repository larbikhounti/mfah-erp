"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Experience } from "@/app/lib/types"


interface ExperienceDrawerProps {
  experience: Experience | null
  isOpen: boolean
  onClose: () => void
}

export function ExperienceDrawer({ experience, isOpen, onClose }: ExperienceDrawerProps) {
  if (!experience) return null

  // Mock ticket and financial data
  const ticketData = {
    ticketNumber: `TKT-${experience.id.toString().padStart(6, "0")}`,
    chairs: 2,
    pricePerTicket: experience.game?.price || 0,
    totalTickets: 2,
    totalMoney: (experience.game?.price || 0) * 2,
    paymentMethod: "Credit Card",
    transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Experience Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Experience Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Experience #{experience.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm text-muted-foreground">{new Date(experience.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Ticket Number:</span>
                <span className="text-sm font-mono">{ticketData.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Number of Chairs:</span>
                <span className="text-sm">{ticketData.chairs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Tickets:</span>
                <span className="text-sm">{ticketData.totalTickets}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Price per Ticket:</span>
                <span className="text-sm">${ticketData.pricePerTicket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-sm">Total Money:</span>
                <span className="text-sm">${ticketData.totalMoney.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Machine Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Machine Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Machine Name:</span>
                <span className="text-sm">{experience.machine?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Machine ID:</span>
                <span className="text-sm font-mono">#{experience.machineId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Location:</span>
                <span className="text-sm">{experience.dom?.name || "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Game Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Game Name:</span>
                <span className="text-sm">{experience.game?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Game ID:</span>
                <span className="text-sm font-mono">#{experience.gameId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Play Time:</span>
                <span className="text-sm">{experience.game?.playTime || 0} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Base Price:</span>
                <span className="text-sm">${experience.game?.price?.toFixed(2) || "0.00"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Payment Method:</span>
                <span className="text-sm">{ticketData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Transaction ID:</span>
                <span className="text-sm font-mono">{ticketData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Payment Status:</span>
                <Badge variant="default">Completed</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
