-- CreateEnum
CREATE TYPE "public"."TruckStatus" AS ENUM ('DISPO', 'EN_MISSION', 'MAINTENANCE', 'INDISPONIBLE');

-- CreateEnum
CREATE TYPE "public"."DriverStatus" AS ENUM ('ACTIF', 'EN_CONGE', 'INDISPONIBLE');

-- CreateEnum
CREATE TYPE "public"."AttachmentOwnerType" AS ENUM ('DRIVER', 'CLIENT', 'SUBCONTRACTOR');

-- CreateTable
CREATE TABLE "public"."Truck" (
    "id" SERIAL NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ptac" INTEGER NOT NULL,
    "status" "public"."TruckStatus" NOT NULL DEFAULT 'DISPO',
    "note" TEXT,
    "insuranceExpiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Driver" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "cin" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "public"."DriverStatus" NOT NULL DEFAULT 'ACTIF',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "ice" TEXT NOT NULL,
    "bankName" TEXT,
    "bankRib" TEXT,
    "bankIban" TEXT,
    "bankSwift" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientContract" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subcontractor" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "ice" TEXT NOT NULL,
    "bankName" TEXT,
    "bankRib" TEXT,
    "bankIban" TEXT,
    "bankSwift" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Subcontractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" SERIAL NOT NULL,
    "ownerType" "public"."AttachmentOwnerType" NOT NULL,
    "driverId" INTEGER,
    "clientId" INTEGER,
    "subcontractorId" INTEGER,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Truck_plateNumber_key" ON "public"."Truck"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_cin_key" ON "public"."Driver"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "Client_ice_key" ON "public"."Client"("ice");

-- CreateIndex
CREATE INDEX "ClientContract_clientId_idx" ON "public"."ClientContract"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Subcontractor_ice_key" ON "public"."Subcontractor"("ice");

-- CreateIndex
CREATE INDEX "Attachment_driverId_idx" ON "public"."Attachment"("driverId");

-- CreateIndex
CREATE INDEX "Attachment_clientId_idx" ON "public"."Attachment"("clientId");

-- CreateIndex
CREATE INDEX "Attachment_subcontractorId_idx" ON "public"."Attachment"("subcontractorId");

-- AddForeignKey
ALTER TABLE "public"."ClientContract" ADD CONSTRAINT "ClientContract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "public"."Subcontractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
