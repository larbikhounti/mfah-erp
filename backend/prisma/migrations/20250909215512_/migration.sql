/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `gameTypes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."gameTypes" DROP COLUMN "deleted_at",
ADD COLUMN     "deletedAt" TIMESTAMP(3);
