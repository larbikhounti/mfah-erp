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

export interface ParentTicket {
  id: number;
  alias: string;
  chairName: string;
  machineName: string;
  machineAlias: string;
  gameName: string;
  gamePrice: number;
}

export interface DetailedTicket {
  id: number;
  alias: string;
  isPaid: boolean;
  paidWith: number | null;
  price: number | null;
  notes: string | null;
  chairId: number | null;
  chairName: string;
  createdAt: string;
  coupon: {
    id: number;
    code: string;
    discount: number;
  } | null;
  comments: Array<{
    id: number;
    content: string;
  }>;
  parentTicket: ParentTicket | null;
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
  // Timing fields
  startedAt: string | null;
  endedAt: string | null;
  isNext: boolean;
  isStarted: boolean;
  isEnded: boolean;
  isFractioned: boolean;
  // Detailed tickets
  tickets: DetailedTicket[];
}
