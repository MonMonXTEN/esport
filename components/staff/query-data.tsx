"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StaffTable from "@/components/staff/staff-table";

const queryClient = new QueryClient();

export default function StaffPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <section>
        <StaffTable />
      </section>
    </QueryClientProvider>
  );
}
