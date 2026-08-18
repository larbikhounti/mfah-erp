-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID');

-- AlterEnum
ALTER TYPE "public"."AttachmentOwnerType" ADD VALUE 'CLIENT_INVOICE';
ALTER TYPE "public"."AttachmentOwnerType" ADD VALUE 'SUBCONTRACTOR_BILL';

-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "clientInvoiceId" INTEGER,
ADD COLUMN     "subcontractorBillId" INTEGER;

-- CreateTable
CREATE TABLE "public"."ClientInvoice" (
    "id" SERIAL NOT NULL,
    "missionId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" "public"."Currency" NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubcontractorBill" (
    "id" SERIAL NOT NULL,
    "missionId" INTEGER NOT NULL,
    "subcontractorId" INTEGER NOT NULL,
    "billNumber" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" "public"."Currency" NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubcontractorBill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientInvoice_missionId_key" ON "public"."ClientInvoice"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientInvoice_invoiceNumber_key" ON "public"."ClientInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "ClientInvoice_clientId_idx" ON "public"."ClientInvoice"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "SubcontractorBill_missionId_key" ON "public"."SubcontractorBill"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubcontractorBill_billNumber_key" ON "public"."SubcontractorBill"("billNumber");

-- CreateIndex
CREATE INDEX "SubcontractorBill_subcontractorId_idx" ON "public"."SubcontractorBill"("subcontractorId");

-- CreateIndex
CREATE INDEX "Attachment_clientInvoiceId_idx" ON "public"."Attachment"("clientInvoiceId");

-- CreateIndex
CREATE INDEX "Attachment_subcontractorBillId_idx" ON "public"."Attachment"("subcontractorBillId");

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_clientInvoiceId_fkey" FOREIGN KEY ("clientInvoiceId") REFERENCES "public"."ClientInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_subcontractorBillId_fkey" FOREIGN KEY ("subcontractorBillId") REFERENCES "public"."SubcontractorBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientInvoice" ADD CONSTRAINT "ClientInvoice_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientInvoice" ADD CONSTRAINT "ClientInvoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubcontractorBill" ADD CONSTRAINT "SubcontractorBill_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubcontractorBill" ADD CONSTRAINT "SubcontractorBill_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "public"."Subcontractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
