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
