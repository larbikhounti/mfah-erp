-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "public"."experiences"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
