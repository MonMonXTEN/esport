"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import StaffTable, { Staff } from "@/components/staff/staff-table";

const queryClient = new QueryClient();

export default function StaffPage() {
  /* UI state (page & sort) */
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ by: string; order: "asc" | "desc" }>({
    by: "name",
    order: "asc",
  });

  const pageSize = 10;

  const { data, isFetching } = useQuery({
    queryKey: ["staff", page, pageSize, sort],
    queryFn: async (): Promise<{
      rows: Staff[];
      total: number;
      page: number;
      pageSize: number;
    }> => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
        sortBy: sort.by,
        order: sort.order,
      });
      const res = await fetch(`/api/admin/getstaff?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    placeholderData: keepPreviousData,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <section>
        <StaffTable
          data={data?.rows ?? []}
          page={page}
          pageSize={pageSize}
          total={data?.total ?? 0}
          isLoading={isFetching}
          onPageChange={setPage}
          onSortChange={(s) => {
            setPage(1);
            setSort(s);
          }}
        />
      </section>
    </QueryClientProvider>
  );
}
