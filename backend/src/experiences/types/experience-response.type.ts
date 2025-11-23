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

export interface CouponUsed {
  id: number;
  code: string;
  discount: number;
  usageCount: number;
}

export interface CommentUsed {
  id: number;
  content: string;
  createdAt: string;
  usageCount: number;
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
  // Extended information
  machineType: string;
  machineChairs: MachineChair[];
  gamePrice: number;
  gamePlayTime: number;
  gameType: string;
  requiredMachineType: string;
  domeAddress: string;
  ticketCount: number;
  ticketSummary: TicketSummary;
  couponsUsed: CouponUsed[];
  commentsUsed: CommentUsed[];
}
