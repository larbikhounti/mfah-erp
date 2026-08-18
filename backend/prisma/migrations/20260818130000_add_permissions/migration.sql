-- CreateEnum
CREATE TYPE "public"."PermissionModule" AS ENUM ('TRUCKS', 'DRIVERS', 'CLIENTS', 'SUBCONTRACTORS', 'MISSIONS', 'CLIENT_INVOICES', 'SUBCONTRACTOR_BILLS', 'DASHBOARD');

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "module" "public"."PermissionModule" NOT NULL,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_roleId_module_key" ON "public"."Permission"("roleId", "module");

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
