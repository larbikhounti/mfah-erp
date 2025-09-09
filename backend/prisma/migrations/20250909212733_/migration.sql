/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Users" DROP COLUMN "refreshToken",
ADD COLUMN     "accessToken" TEXT;
