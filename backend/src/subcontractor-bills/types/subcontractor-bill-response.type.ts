import { Currency, InvoiceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface SubcontractorBillResponse {
  id: number;
  missionId: number;
  subcontractorId: number;
  billNumber: string;
  amount: Decimal;
  amountPaid: Decimal;
  currency: Currency;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
