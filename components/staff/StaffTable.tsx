"use client"

import { useState } from "react"
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
} from "@tanstack/react-table"
import { rankItem } from "@tanstack/match-sorter-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  Pencil,
  Loader2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"
import AddButton from "./StaffAddButton";
import DeleteButton from "./StaffDeleteButton";
import AddStaffDialog from "./AddStaffDialog";
import EditStaffDialog from "./EditStaffDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { Staff } from "@/lib/types/staff";

interface StaffTableProps {
  data: Staff[]
  page: number
  pageSize: number
  total: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onSortChange: (sort: { by: string; order: "asc" | "desc" }) => void
}

/* Main Table */
export default function StaffTable({
  data,
  page,
  pageSize,
  total,
  isLoading,
  onPageChange,
  onSortChange
}: StaffTableProps) {
  /* ------- local UI state ------- */
  const [currentSort, setCurrentSort] = useState<{
    by: string;
    order: "asc" | "desc"
  }>({ by: "name", order: "asc" })

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
  const [addOpen, setAddOpen] = useState(false)

  const onSort = (s: { by: string; order: "asc" | "desc" }) => {
    setCurrentSort(s)
    onSortChange(s)
  };

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
    data,
    columns,
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
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
      const res = await fetch('/api/staffs/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error('ไม่สามารถลบได้')
      localStorage.setItem("toastStore", JSON.stringify({ type: "success", msg: json.message }))
      setConfirmOpen(false)
      table.resetRowSelection()
      window.location.reload()
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่ในภายหลัง")
    } finally {
      setDeleteLoading(false)
    }
  };

  const deleteSingle = async () => {
    if (!editingStaff) return
    setDeleteLoading(true)
    try {
      const res = await fetch("/api/staffs/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [editingStaff.id] }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error("ไม่สามารถลบได้")
      localStorage.setItem("toastStore", JSON.stringify({ type: "success", msg: json.message }))
      setConfirmOpen(false)
      table.resetRowSelection()
      setEditingStaff(null)
      window.location.reload()
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่ในภายหลัง")
    } finally {
      setDeleteLoading(false)
    }
  }
  return (
    <>
      {/* --- delete confirm dialog --- */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={selectedCount ? deleteSelected : deleteSingle}
        count={selectedCount || 1}
        loading={deleteLoading}
      />

      {/* --- add dialog --- */}
      <AddStaffDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => window.location.reload()}
      />

      {/* --- edit dialog --- */}
      <EditStaffDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditingStaff(null)
        }}
        staff={editingStaff}
        onUpdated={() => window.location.reload()}
      />

      {/* --- table wrapper --- */}
      <div className="w-full">
        {/* top bar */}
        <div className="flex items-center py-4">
          <Input
            placeholder="ค้นหา id / name / username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              table.setGlobalFilter(e.target.value)
            }}
            className="max-w-xs md:max-w-md lg:max-w-lg ml-auto"
          />
          <div className="ml-auto flex flex-nowrap">
            <AddButton
              onClick={() => setAddOpen(true)}
            />
            <DeleteButton
              selectedCount={selectedCount}
              onClick={() => {
                setEditingStaff(null);
                setConfirmOpen(true);
              }}
            />
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
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </div>

        {/* footer */}
        <div className="flex items-start justify-between gap-2 text-sm py-4 px-2">
          <div>
            <span className="text-muted-foreground flex-1">
              {selectedCount} จาก {table.getFilteredRowModel().rows.length} แถวที่เลือก
            </span>
          </div>
          <div className="flex justify-center items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft />
            </Button>
            <span className="text-muted-foreground">
              หน้า {page} / {Math.ceil(total / pageSize) || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page * pageSize >= total || isLoading}
            >
              <ChevronRight />
            </Button>
          </div>
          <div>
            <span className="text-muted-foreground">
              {total.toLocaleString()} รายการ
            </span>
          </div>
        </div>
      </div>
    </>
  )
}