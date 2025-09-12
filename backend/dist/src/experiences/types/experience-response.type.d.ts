export interface MachineChair {
    id: number;
    name: string;
    status: number;
    ticketCount: number;
    tickets: TicketInfo[];
}
export interface TicketInfo {
    id: number;
    isPaid: boolean;
    chairId: number | null;
    createdAt: string;
}
export interface TicketSummary {
    totalCount: number;
    paidCount: number;
    unpaidCount: number;
    totalRevenue: number;
    averagePrice: number;
    recentTickets: TicketInfo[];
}
export interface ExperienceResponse {
    id: number;
    machineId: number;
    machine: string;
    gameId: number;
    game: string;
    domeId: number;
    dome: string;
    createdAt: string;
    updatedAt: string;
    machineType: string;
    machineChairs: MachineChair[];
    gamePrice: number;
    gamePlayTime: number;
    gameType: string;
    requiredMachineType: string;
    domeAddress: string;
    ticketCount: number;
    ticketSummary: TicketSummary;
}
