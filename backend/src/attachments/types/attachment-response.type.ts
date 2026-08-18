import { AttachmentOwnerType } from '@prisma/client';

export interface AttachmentResponse {
  id: number;
  ownerType: AttachmentOwnerType;
  truckId: number | null;
  driverId: number | null;
  clientId: number | null;
  subcontractorId: number | null;
  clientInvoiceId: number | null;
  subcontractorBillId: number | null;
  label: string;
  fileName: string;
  filePath: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedAt: Date;
}
