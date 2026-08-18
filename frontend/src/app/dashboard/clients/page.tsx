"use client";

import { useEffect } from "react";
import { useClientsStore } from "@/stores/clients-store";
import { EnhancedClientTable } from "@/components/client/enhanced-client-table";

export default function ClientsPage() {
  const { fetchClients } = useClientsStore();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-muted-foreground">
            Manage client companies: contact info, ICE, and bank details.
          </p>
        </div>
      </div>

      <EnhancedClientTable />
    </section>
  );
}
