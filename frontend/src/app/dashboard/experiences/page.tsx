"use client";

import { EnhancedExperienceTable } from "@/components/experiences/enhanced-experience-table";

export default function ExperiencesPage() {
  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Experiences Management</h1>
          <p className="text-muted-foreground">
            Manage and oversee all experiences available in the system
          </p>
        </div>
      </div>
      <EnhancedExperienceTable />
    </section>
  );
}
