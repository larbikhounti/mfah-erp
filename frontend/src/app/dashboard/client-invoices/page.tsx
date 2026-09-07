"use client";

import { useEffect } from "react";
import { useClientInvoicesStore } from "@/stores/client-invoices-store";
import { EnhancedClientInvoiceTable } from "@/components/client-invoice/enhanced-client-invoice-table";

export default function ClientInvoicesPage() {
  const { fetchInvoices } = useClientInvoicesStore();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Client Invoices</h1>
        </div>
      </div>

      <EnhancedClientInvoiceTable />
    </section>
  );
}
