"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  Pencil,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import AddButton from "./add-button";
import DeleteButton from "./delete-button";
import { toast } from "sonner"
import { staffSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Label } from "@/components/ui/label";

export interface Staff {
  id: string
  name: string
  username: string
  role: "staff" | "admin"
};

interface StaffTableProps {
  data: Staff[]
  page: number
  pageSize: number
  total: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onSortChange: (sort: { by: string; order: "asc" | "desc" }) => void
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

function AddStaffDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false)
  const [hasCreated, setHasCreated] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", username: "", password: "", role: "staff" },
  })

  const handleDialogClose = () => {
    onClose()
    if (hasCreated) {
      onCreated()
      setHasCreated(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof staffSchema>) => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/createstaff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error()
      toast.success("บันทึกสำเร็จ")
      setHasCreated(true)
      reset()
    } catch {
      toast.error("บันทึกไม่สำเร็จ ลองใหม่ภายหลัง")
    } finally {
      setLoading(false)
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มกรรมการ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-3">ชื่อ <span className="text-gray-400 font-normal">(ไม่จำเป็นต้องระบุ)</span></Label>
            <Input
              {...register("name")}
              placeholder="Name"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-3">ชื่อผู้ใช้</Label>
            <Input
              {...register("username")}
              placeholder="Username"
              disabled={loading}
            />
            {errors.username && (
              <p className="text-destructive text-xs mt-1">{errors.username.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-3">รหัสผ่าน</Label>
            <Input
              type="password"
              {...register("password")}
              placeholder="Password"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-3">หน้าที่</Label>
            <Select
              value={watch("role")}
              onValueChange={v => setValue("role", v as "staff" | "admin", { shouldValidate: true })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-destructive text-xs mt-1">{errors.role.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button className="cursor-pointer" variant="outline" type="button" onClick={handleDialogClose} disabled={loading}>
              ยกเลิก
            </Button>
            <Button className="cursor-pointer" type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditStaffDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<StaffInput>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", username: "", password: "", role: "staff" },
  });

  // reset ฟอร์มทุกครั้งที่ปิด dialog
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (data: StaffInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/createstaff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      onCreated();
      onClose();
    } catch {
      toast.error("บันทึกไม่สำเร็จ ลองใหม่ภายหลัง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มกรรมการ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Input
              {...register("name")}
              placeholder="ชื่อ"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          {/* Username */}
          <div>
            <Input
              {...register("username")}
              placeholder="Username"
              disabled={loading}
            />
            {errors.username && (
              <p className="text-destructive text-xs mt-1">{errors.username.message}</p>
            )}
          </div>
          {/* Role */}
          <div>
            <Select
              value={watch("role")}
              onValueChange={(v) => setValue("role", v as "staff" | "admin", { shouldValidate: true })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-destructive text-xs mt-1">{errors.role.message}</p>
            )}
          </div>
          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
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
      const res = await fetch('/api/admin/deletestaff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('ไม่สามารถลบได้')
      window.location.reload()
      setConfirmOpen(false)
      table.resetRowSelection()
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่ในภายหลัง")
      throw new Error("Internal Error")
    } finally {
      setDeleteLoading(false)
    }
  };

  const deleteSingle = async () => {
    if (!editingStaff) return
    setDeleteLoading(true)
    try {
      const res = await fetch("/api/admin/deletestaff", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [editingStaff.id] }),
      })
      if (!res.ok) throw new Error("ไม่สามารถลบได้");
      setConfirmOpen(false)
      table.resetRowSelection()
      setEditingStaff(null)
      window.location.reload()
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่ในภายหลัง")
      throw new Error("Internal Error")
    } finally {
      setDeleteLoading(false)
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

      {/* --- add dialog --- */}
      <AddStaffDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => window.location.reload()} />

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
    </>
  )
}