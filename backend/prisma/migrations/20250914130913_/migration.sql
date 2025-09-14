-- CreateTable
CREATE TABLE "public"."DomeSyncLog" (
    "id" SERIAL NOT NULL,
    "domeId" INTEGER NOT NULL,
    "lastSyncAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasSuccess" BOOLEAN NOT NULL DEFAULT true,
    "dataCount" INTEGER,
    "error" TEXT,

    CONSTRAINT "DomeSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DomeSyncLog_domeId_idx" ON "public"."DomeSyncLog"("domeId");

-- CreateIndex
CREATE INDEX "DomeSyncLog_syncedAt_idx" ON "public"."DomeSyncLog"("syncedAt");

-- AddForeignKey
ALTER TABLE "public"."DomeSyncLog" ADD CONSTRAINT "DomeSyncLog_domeId_fkey" FOREIGN KEY ("domeId") REFERENCES "public"."doms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
