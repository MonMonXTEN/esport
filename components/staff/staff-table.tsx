"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ArrowUpDown, MoreHorizontal, Trash2, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AddButton from "./add-button";
import DeleteButton from "./delete-button";

export interface Staff {
  id: string
  name: string
  username: string
  role: "staff" | "admin"
};

interface StaffTableProps {
  /** page size for fetching data */
  pageSize?: number
}

/* Dialog ConfirmDelete */
function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  count,
  loading = false
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  count: number
  loading?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
        </DialogHeader>
        <p className="py-4">คุณต้องการลบรายการจำนวน {count} รายการใช่หรือไม่?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="cursor-pointer" disabled={loading} onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="destructive" className="cursor-pointer" disabled={loading} onClick={onConfirm}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> กำลังลบ...
              </span>
            ) : (
              "ลบ"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditStaffDialog({
  open,
  onClose,
  staff,
}: {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูล</DialogTitle>
        </DialogHeader>

        {staff && (
          <form className="space-y-4">
            <Input defaultValue={staff.name} placeholder="Name" />
            <Input defaultValue={staff.username} placeholder="Username" />
            <Input defaultValue={staff.role} placeholder="Role" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึก</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* Main Table */
export default function StaffTable({ pageSize = 10 }: StaffTableProps) {
  const [page, setPage] = useState(1)
  const [currentSort, setCurrentSort] = useState<{
      by: string;
      order: "asc" | "desc"
    }>({ by: "name", order: "asc" })
  /* ------- local UI state ------- */

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [search, setSearch] = useState("")

  /* modal state */
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const onSort = (s: { by: string; order: "asc" | "desc" }) => {
    setPage(1)
    setCurrentSort(s)
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["staff", page, pageSize, currentSort],
    queryFn: async (): Promise<{
      rows: Staff[];
      total: number;
      page: number;
      pageSize: number;
    }> => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
        sortBy: currentSort.by,
        order: currentSort.order,
      });
      const res = await fetch(`/api/admin/getstaff?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    placeholderData: keepPreviousData,
    refetchInterval: 3000,
  });

  const total = data?.total ?? 0
  const isLoading = isFetching

  const columns: ColumnDef<Staff>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 48,
    },
    { accessorKey: "id", header: "ID", size: 90 },
    {
        accessorKey: "name",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-1"
            onClick={() =>
              onSort({
                by: "name",
                order:
                  currentSort.by === "name" && currentSort.order === "asc"
                    ? "desc"
                    : "asc",
              })
            }
          >
            Name
            <ArrowUpDown
              className={cn(
                "h-3 w-3 transition-transform",
                currentSort.by === "name" &&
                  currentSort.order === "desc" &&
                  "rotate-180",
              )}
            />
          </Button>
        ),
      },
      {
        accessorKey: "username",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-1"
            onClick={() =>
              onSort({
                by: "username",
                order:
                  currentSort.by === "username" && currentSort.order === "asc"
                    ? "desc"
                    : "asc",
              })
            }
          >
            Username
            <ArrowUpDown
              className={cn(
                "h-3 w-3 transition-transform",
                currentSort.by === "username" &&
                  currentSort.order === "desc" &&
                  "rotate-180",
              )}
            />
          </Button>
        ),
      },
    // {
    //   accessorKey: "name",
    //   header: ({ column }) => (
    //     <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
    //       Name <ArrowUpDown className="ml-1 h-3 w-3" />
    //     </Button>
    //   ),
    // },
    // {
    //   accessorKey: "username",
    //   header: ({ column }) => (
    //     <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
    //       Username <ArrowUpDown className="ml-1 h-3 w-3" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => <span className="font-mono">{row.getValue<string>("username")}</span>,
    // },
    { accessorKey: "role", header: "Role" },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setEditingStaff(staff);
                  setEditOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditingStaff(staff);
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 64,
    },
  ];

  // Search Data
  const fuzzyFilter: FilterFn<Staff> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(String(row.getValue(columnId)), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

  const table = useReactTable({
    data: data?.rows ?? [],
    columns,
    manualPagination: true,
    pageCount: Math.ceil((data?.total ?? 0) / pageSize),
    globalFilterFn: fuzzyFilter,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /* ---------------------- handlers --------------------------- */
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const deleteSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const ids = selectedRows.map(r => r.original.id)
    setDeleteLoading(true)
    try {
    const res = await fetch('/api/admin/deletestaff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Delete failed');
    refetch();
    } catch {
      alert('เกิดข้อผิดพลาดขณะลบ');
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      table.resetRowSelection();
    }

    console.log("Delete selected rows: ", table.getSelectedRowModel().rows);
    setConfirmOpen(false);
    table.resetRowSelection();
  };

  const deleteSingle = async () => {
  if (!editingStaff) return;
  setDeleteLoading(true);
  try {
    const res = await fetch('/api/admin/deletestaff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [editingStaff.id] }),
    });
    if (!res.ok) throw new Error('Delete failed');
    refetch(); // refresh data
    } catch {
      alert('เกิดข้อผิดพลาดขณะลบ');
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
    }
  };

  /* ----------------------------- UI ------------------------- */
  return (
    <>
      {/* --- delete confirmation dialogs --- */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={selectedCount ? deleteSelected : deleteSingle}
        count={selectedCount || 1}
        loading={deleteLoading}
      />

      {/* --- edit dialog --- */}
      <EditStaffDialog open={editOpen} onClose={() => setEditOpen(false)} staff={editingStaff} />

      {/* --- table wrapper --- */}
      <div className="w-full">
        {/* top bar */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Search id / name / username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              table.setGlobalFilter(e.target.value)
            }}
            className="max-w-xs md:max-w-md lg:max-w-lg ml-auto"
          />
          <div className="ml-auto flex flex-nowrap">
            <AddButton />
            <DeleteButton
              selectedCount={selectedCount}
              onClick={() => {
                setEditingStaff(null);
                setConfirmOpen(true);
              }}
            />
            {/* bulk delete button */}
            {/* <Button
              variant="destructive"
              size="sm"
              className="ml-2"
              disabled={!selectedCount}
              onClick={() => {
                setEditingStaff(null);
                setConfirmOpen(true);
              }}
            >
              Delete {selectedCount ? `(${selectedCount})` : ""}
            </Button> */}
          </div>
        </div>

        {/* table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              </TableCell>
            </TableRow>
          ) : 
              table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )
            }
            </TableBody>
          </Table>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground flex-1">
            {selectedCount} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </span>
          <span className="text-muted-foreground">
            {total.toLocaleString()} records
          </span>
          <span aria-hidden>•</span>
          <span className="text-muted-foreground">
            Page {page} / {Math.ceil(total / pageSize) || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || isLoading}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page * pageSize >= total || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}