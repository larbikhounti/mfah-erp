-- CreateEnum
CREATE TYPE "public"."AttachmentCategory" AS ENUM ('CMR', 'ODOMETER_PHOTO', 'FUEL_RECEIPT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AttachmentOwnerType" ADD VALUE 'MISSION';
ALTER TYPE "public"."AttachmentOwnerType" ADD VALUE 'FUEL_ENTRY';

-- AlterEnum
ALTER TYPE "public"."MissionStatus" ADD VALUE 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "category" "public"."AttachmentCategory",
ADD COLUMN     "fuelEntryId" INTEGER,
ADD COLUMN     "missionId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Mission" ADD COLUMN     "clientReference" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completionComment" TEXT,
ADD COLUMN     "expectedDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "goods" TEXT,
ADD COLUMN     "loadingConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "weightKg" INTEGER;

-- CreateTable
CREATE TABLE "public"."DriverCredential" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "loginPhone" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "failedPinAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PushSubscription" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FuelEntry" (
    "id" SERIAL NOT NULL,
    "missionId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "truckId" INTEGER,
    "litres" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,3) NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "odometerKm" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverCredential_driverId_key" ON "public"."DriverCredential"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverCredential_loginPhone_key" ON "public"."DriverCredential"("loginPhone");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "public"."PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_driverId_idx" ON "public"."PushSubscription"("driverId");

-- CreateIndex
CREATE INDEX "FuelEntry_missionId_idx" ON "public"."FuelEntry"("missionId");

-- CreateIndex
CREATE INDEX "FuelEntry_driverId_idx" ON "public"."FuelEntry"("driverId");

-- CreateIndex
CREATE INDEX "Attachment_missionId_idx" ON "public"."Attachment"("missionId");

-- CreateIndex
CREATE INDEX "Attachment_fuelEntryId_idx" ON "public"."Attachment"("fuelEntryId");

-- AddForeignKey
ALTER TABLE "public"."DriverCredential" ADD CONSTRAINT "DriverCredential_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PushSubscription" ADD CONSTRAINT "PushSubscription_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_fuelEntryId_fkey" FOREIGN KEY ("fuelEntryId") REFERENCES "public"."FuelEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FuelEntry" ADD CONSTRAINT "FuelEntry_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FuelEntry" ADD CONSTRAINT "FuelEntry_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FuelEntry" ADD CONSTRAINT "FuelEntry_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "public"."Truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

