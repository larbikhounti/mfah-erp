// Dependencies: pnpm install lucide-react

import CardLayout from '@/components/shared-ui/layouts/card-layout';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrashIcon } from 'lucide-react';
import AccountsTable from '../get/accounts-table';
import TrashedAccountsTable from '../get/trashed-accounts-table';
export default function MainTabs() {
  return (
    <Tabs className="mt-4 h-full w-full" defaultValue="tab-1">
      <ScrollArea className="flex w-full items-start justify-start">
        <TabsList className="relative mb-3 flex h-auto w-full items-start justify-start gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
          <TabsTrigger
            value="tab-1"
            className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <Users
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="overflow-hidden rounded-b-none border-x border-t border-border bg-muted py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <TrashIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Trash Accounts
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="tab-1">
        <div className="flex w-full gap-x-2">
          <CardLayout className="min-h-96 w-full px-0 py-0">
            <AccountsTable />
          </CardLayout>
        </div>
      </TabsContent>
      <TabsContent value="tab-2">
        <CardLayout className="min-h-96 w-full px-0 py-0">
          <TrashedAccountsTable />
        </CardLayout>
      </TabsContent>
    </Tabs>
  );
}
