import { Currency, InvoiceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface ClientInvoiceResponse {
  id: number;
  missionId: number;
  clientId: number;
  invoiceNumber: string;
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
