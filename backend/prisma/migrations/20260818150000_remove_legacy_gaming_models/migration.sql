-- DropForeignKey
ALTER TABLE "public"."DomeSyncLog" DROP CONSTRAINT "DomeSyncLog_domeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Users" DROP CONSTRAINT "Users_dom_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."domeGames" DROP CONSTRAINT "domeGames_domeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."domeGames" DROP CONSTRAINT "domeGames_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."experiences" DROP CONSTRAINT "experiences_domeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."experiences" DROP CONSTRAINT "experiences_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."experiences" DROP CONSTRAINT "experiences_machineId_fkey";

-- DropForeignKey
ALTER TABLE "public"."games" DROP CONSTRAINT "games_gameTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."games" DROP CONSTRAINT "games_machineTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."machineChairs" DROP CONSTRAINT "machineChairs_machineId_fkey";

-- DropForeignKey
ALTER TABLE "public"."machines" DROP CONSTRAINT "machines_domeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."machines" DROP CONSTRAINT "machines_machineTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_chairId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_domeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_experienceId_fkey";

-- AlterTable
ALTER TABLE "public"."Users" DROP COLUMN "dom_id",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."DomeSyncLog";

-- DropTable
DROP TABLE "public"."domeGames";

-- DropTable
DROP TABLE "public"."doms";

-- DropTable
DROP TABLE "public"."experiences";

-- DropTable
DROP TABLE "public"."gameTypes";

-- DropTable
DROP TABLE "public"."games";

-- DropTable
DROP TABLE "public"."machineChairs";

-- DropTable
DROP TABLE "public"."machineTypes";

-- DropTable
DROP TABLE "public"."machines";

-- DropTable
DROP TABLE "public"."tickets";
