/*
  Warnings:

  - Added the required column `domeId` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domeId` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."experiences" ADD COLUMN     "domeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."tickets" ADD COLUMN     "domeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."experiences" ADD CONSTRAINT "experiences_domeId_fkey" FOREIGN KEY ("domeId") REFERENCES "public"."doms"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_domeId_fkey" FOREIGN KEY ("domeId") REFERENCES "public"."doms"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
