export interface MachineTypeResponse {
  id: number;
  name: string;
  machinesCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
