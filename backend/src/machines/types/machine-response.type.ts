export interface MachineResponse {
  id: number;
  name: string;
  alias: string;
  status: string;
  machineTypeId: number | null;
  machineType: string | null;
  domeId: number | null;
  dome: string | null;
  chairsCount: number;
  chairs: {
    id: number;
    name: string;
    status: number;
  }[];
  createdAt: string;
  updatedAt: string;
}
