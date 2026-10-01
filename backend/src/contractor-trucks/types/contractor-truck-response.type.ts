export interface ContractorTruckResponse {
  id: number;
  plateNumber: string;
  subcontractorId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
