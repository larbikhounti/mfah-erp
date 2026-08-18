-- CreateEnum
CREATE TYPE "public"."TransportType" AS ENUM ('EXPORT', 'IMPORT');

-- CreateEnum
CREATE TYPE "public"."ExecutionMode" AS ENUM ('IN_HOUSE', 'SUBCONTRACTED');

-- CreateEnum
CREATE TYPE "public"."MissionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('MAD', 'EUR');

-- AlterEnum
ALTER TYPE "public"."DriverStatus" ADD VALUE 'EN_MISSION';

-- CreateTable
CREATE TABLE "public"."Mission" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "transportType" "public"."TransportType" NOT NULL,
    "executionMode" "public"."ExecutionMode" NOT NULL,
    "loadingLocation" TEXT NOT NULL,
    "deliveryLocation" TEXT NOT NULL,
    "clientPrice" DECIMAL(12,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "subcontractorId" INTEGER,
    "subcontractorCost" DECIMAL(12,2),
    "truckId" INTEGER,
    "driverId" INTEGER,
    "status" "public"."MissionStatus" NOT NULL DEFAULT 'PLANNED',
    "missionDate" TIMESTAMP(3) NOT NULL,
    "autoInvoice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mission_reference_key" ON "public"."Mission"("reference");

-- CreateIndex
CREATE INDEX "Mission_clientId_idx" ON "public"."Mission"("clientId");

-- CreateIndex
CREATE INDEX "Mission_subcontractorId_idx" ON "public"."Mission"("subcontractorId");

-- CreateIndex
CREATE INDEX "Mission_truckId_idx" ON "public"."Mission"("truckId");

-- CreateIndex
CREATE INDEX "Mission_driverId_idx" ON "public"."Mission"("driverId");

-- CreateIndex
CREATE INDEX "Mission_missionDate_idx" ON "public"."Mission"("missionDate");

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "public"."Subcontractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "public"."Truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
