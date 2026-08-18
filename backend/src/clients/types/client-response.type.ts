export interface ClientResponse {
  id: number;
  companyName: string;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  ice: string;
  bankName?: string | null;
  bankRib?: string | null;
  bankIban?: string | null;
  bankSwift?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
