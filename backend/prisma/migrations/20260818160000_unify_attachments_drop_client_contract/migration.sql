-- AlterEnum
ALTER TYPE "public"."AttachmentOwnerType" ADD VALUE 'TRUCK';

-- DropForeignKey
ALTER TABLE "public"."ClientContract" DROP CONSTRAINT "ClientContract_clientId_fkey";

-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "label" TEXT,
ADD COLUMN     "truckId" INTEGER;

-- Backfill label for any existing rows from the original file name, then
-- enforce NOT NULL going forward (new rows always provide a label).
UPDATE "public"."Attachment" SET "label" = "fileName" WHERE "label" IS NULL;
ALTER TABLE "public"."Attachment" ALTER COLUMN "label" SET NOT NULL;

-- DropTable
DROP TABLE "public"."ClientContract";

-- CreateIndex
CREATE INDEX "Attachment_truckId_idx" ON "public"."Attachment"("truckId");

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "public"."Truck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
