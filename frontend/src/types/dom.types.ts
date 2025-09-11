export interface Dom {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    Users: number;
    experiences: number;
    machines: number;
    tickets: number;
  };
}

export interface CreateDomPayload {
  name: string;
  address: string;
}

export interface UpdateDomPayload {
  name?: string;
  address?: string;
}

export interface FilterDomsParams {
  offset?: number;
  limit?: number;
  search?: string;
  domId?: number;
}

export interface DomsResponse {
  data: Dom[];
  total: number;
}
