'use client'

import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  ArrowUpDown,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react"
import { toast } from "sonner"
import { Team } from "@/lib/types/team"
import useTeams from "@/hooks/useTeams"
import useDeleteTeams from "@/hooks/useDeleteTeams"
import EditTeamDialog from "./EditTeamDialog"
import ConfirmDeleteDialog from "./ConfirmDeleteDialog"
import DeleteButton from "../TableDeleteButton"
import AddButton from "../TableAddButton"
import AddTeamDialog from "./AddTeamDialog"

async function toggleStatus(id: number, next: boolean) {
  const res = await fetch("/api/teams/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status: next }),
  })
  const json = await res.json()
  if (!res.ok) return toast.error(json.error || "เกิดข้อผิดพลาด")
  if (json.success) return toast.success("เปลี่ยน Status เรียบร้อยแล้ว")
}

export default function TeamTable() {
  const { teams, isLoading } = useTeams()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [addOpen, setAddOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const columns: ColumnDef<Team>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      id: "status",
      header: () => (
        <div className="text-center">
          Status
        </div>
      ),
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <Switch
            checked={row.original.status}
            onCheckedChange={(v) => toggleStatus(row.original.id, v)}
            className="cursor-pointer"
          />
        </div>
      )
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const team = row.original
        return (
          <div className="flex justify-center items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingTeam(team)
                  }}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  แก้ไข
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDeletingTeam(team)
                    setConfirmDeleteOpen(true)
                  }}
                  className="cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  ลบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: teams,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  })
  // Custom hook useDeleteTeams.ts
  const selectedIds = table.getSelectedRowModel().rows.map(r => r.original.id)
  const { deleteLoading, deleteTeamsByIds } = useDeleteTeams(
    () => {
      table.resetRowSelection()
      setConfirmDeleteOpen(false)
      setDeletingTeam(null)
    },
  )
  const onConfirmDelete = () => selectedIds.length ? deleteTeamsByIds(selectedIds) : deletingTeam && deleteTeamsByIds([deletingTeam.id])
  return (
    <>

      <AddTeamDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditTeamDialog
        open={!!editingTeam}
        team={editingTeam}
        onClose={() => {
          setEditingTeam(null)
        }}
      />
      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => {
          if (!deleteLoading) {
            setConfirmDeleteOpen(false)
            setDeletingTeam(null)
          }
        }}
        onConfirm={onConfirmDelete}
        count={selectedIds.length || 1}
        loading={deleteLoading}
      />

      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="ค้นหา ทีม"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-xs md:max-w-md lg:max-w-lg ml-auto"
          />
          <div className="ml-auto flex flex-nowrap">
            <AddButton
              onClick={() => setAddOpen(true)}
            />
            <DeleteButton
              selectedCount={selectedIds.length}
              onClick={() => {
                setConfirmDeleteOpen(true)
              }}
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
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
                table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-12 text-center"
                    >
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground p-2">
          {table.getFilteredSelectedRowModel().rows.length} จาก {" "}
          {table.getFilteredRowModel().rows.length} แถวที่เลือก
        </div>

        <div className="flex items-center justify-between py-1 flex-wrap gap-2">
          <Pagination>
            <PaginationContent>
              {/* Previous */}
              <PaginationItem>
                <PaginationPrevious

                  onClick={() => table.previousPage()}
                  aria-disabled={!table.getCanPreviousPage()}
                  className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50 user select-none" : "cursor-pointer select-none"}
                />
              </PaginationItem>

              {/* จำนวนหน้า */}
              {(() => {
                const pageCount = table.getPageCount()
                const current = pagination.pageIndex
                const pages: number[] = []

                if (pageCount <= 7) {
                  pages.push(...Array.from({ length: pageCount }, (_, i) => i))
                } else {
                  pages.push(0)
                  if (current > 3) pages.push(-1)

                  const start = Math.max(1, current - 1)
                  const end = Math.min(pageCount - 2, current + 1)
                  for (let i = start; i <= end; i++) pages.push(i)

                  if (current < pageCount - 4) pages.push(-1)
                  pages.push(pageCount - 1)
                }

                return pages.map((page) =>
                  page === -1 ? (
                    <PaginationItem key={page + Math.random()}>
                      <PaginationEllipsis className="select-none" />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === current}
                        onClick={() => table.setPageIndex(page)}
                        className="cursor-pointer select-none"
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )
              })()}

              {/* Next */}
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  aria-disabled={!table.getCanNextPage()}
                  className={!table.getCanNextPage() ? "pointer-events-none opacity-50 select-none" : "cursor-pointer select-none"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  )
}
