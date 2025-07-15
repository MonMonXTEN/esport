"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Loader2 } from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Staff = {
  id: string;
  name: string;
  username: string;
  role: string;
};

type StaffTableProps = {
  data: Staff[];
  page: number;
  pageSize: number;
  total: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSortChange: (s: { by: string; order: "asc" | "desc" }) => void;
};

const makeColumns = (
  currentSort: { by: string; order: "asc" | "desc" },
  onSort: StaffTableProps["onSortChange"],
): ColumnDef<Staff>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() =>
          onSort({
            by: "name",
            order: currentSort.by === "name" && currentSort.order === "asc" ? "desc" : "asc",
          })
        }
      >
        Name
        <ArrowUpDown
          className={cn(
            "h-3 w-3 transition-transform",
            currentSort.by === "name" && currentSort.order === "desc" && "rotate-180",
          )}
        />
      </button>
    ),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() =>
          onSort({
            by: "username",
            order: currentSort.by === "username" && currentSort.order === "asc" ? "desc" : "asc",
          })
        }
      >
        Username
        <ArrowUpDown
          className={cn(
            "h-3 w-3 transition-transform",
            currentSort.by === "username" && currentSort.order === "desc" && "rotate-180",
          )}
        />
      </button>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
  },
];

export default function StaffTable(props: StaffTableProps) {
  const { data, page, pageSize, total, isLoading, onPageChange, onSortChange } =
    props;

  const [currentSort, setCurrentSort] = React.useState<{
    by: string;
    order: "asc" | "desc";
  }>({ by: "name", order: "asc" });

  const handleSort = (s: { by: string; order: "asc" | "desc" }) => {
    setCurrentSort(s);
    onSortChange(s);
  };

  const table = useReactTable({
    data,
    columns: makeColumns(currentSort, handleSort),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id} className="">
                  {h.isPlaceholder
                    ? null
                    : flexRender(
                        h.column.columnDef.header,
                        h.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-center gap-2 pt-2">
        <span className="text-sm text-muted-foreground">
          Page {page} / {Math.ceil(total / pageSize) || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || isLoading}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page * pageSize >= total || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
