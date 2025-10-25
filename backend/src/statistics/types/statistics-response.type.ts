export interface DomStatistics {
  totalExperiences: number;
  fractionedExperiences: number;
  soldTickets: number;
  unsoldTickets: number;
  moneyMade: number;
  potentialRevenue: number;
  domId?: number;
  domName?: string;
}

export interface StatisticsResponse {
  success: boolean;
  data: DomStatistics;
  message?: string;
}

export interface MachineStatistics {
  id: number;
  name: string;
  alias: string;
  domName: string;
  experiencesCount: number;
  totalRevenue: number;
}

export interface MachineStatisticsResponse {
  success: boolean;
  data: MachineStatistics[];
  message?: string;
}
