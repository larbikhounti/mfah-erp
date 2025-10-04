/*
  Warnings:

  - You are about to drop the column `syncedAt` on the `DomeSyncLog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."DomeSyncLog_syncedAt_idx";

-- AlterTable
ALTER TABLE "public"."DomeSyncLog" DROP COLUMN "syncedAt";

-- CreateTable
CREATE TABLE "public"."domeGames" (
    "id" SERIAL NOT NULL,
    "domeId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "domeGames_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domeGames_domeId_gameId_key" ON "public"."domeGames"("domeId", "gameId");

-- AddForeignKey
ALTER TABLE "public"."domeGames" ADD CONSTRAINT "domeGames_domeId_fkey" FOREIGN KEY ("domeId") REFERENCES "public"."doms"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."domeGames" ADD CONSTRAINT "domeGames_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
