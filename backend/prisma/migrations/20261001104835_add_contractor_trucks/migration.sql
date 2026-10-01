-- AlterEnum
ALTER TYPE "public"."PermissionModule" ADD VALUE 'CONTRACTOR_TRUCKS';

-- AlterTable
ALTER TABLE "public"."Mission" ADD COLUMN     "contractorTruckId" INTEGER;

-- CreateTable
CREATE TABLE "public"."ContractorTruck" (
    "id" SERIAL NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "subcontractorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ContractorTruck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractorTruck_plateNumber_key" ON "public"."ContractorTruck"("plateNumber");

-- CreateIndex
CREATE INDEX "ContractorTruck_subcontractorId_idx" ON "public"."ContractorTruck"("subcontractorId");

-- CreateIndex
CREATE INDEX "Mission_contractorTruckId_idx" ON "public"."Mission"("contractorTruckId");

-- AddForeignKey
ALTER TABLE "public"."ContractorTruck" ADD CONSTRAINT "ContractorTruck_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "public"."Subcontractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_contractorTruckId_fkey" FOREIGN KEY ("contractorTruckId") REFERENCES "public"."ContractorTruck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
