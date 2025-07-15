"use client";

import { useState } from "react";
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
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
        </DialogHeader>
        <p className="py-4">คุณต้องการลบรายการจำนวน {count} รายการใช่หรือไม่?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            ลบ
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
      order: "asc" | "desc";
    }>({ by: "name", order: "asc" });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [search, setSearch] = useState("");

  /* modal state */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const onSort = (s: { by: string; order: "asc" | "desc" }) => {
    setCurrentSort(s);
    onSortChange(s);
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

  const fuzzyFilter: FilterFn<Staff> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(String(row.getValue(columnId)), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount: Math.ceil( total / pageSize),
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

  const deleteSelected = () => {
    // TODO: call API
    console.log("Delete selected rows: ", table.getSelectedRowModel().rows);
    setConfirmOpen(false);
    table.resetRowSelection();
  };

  const deleteSingle = () => {
    console.log("Delete one: ", editingStaff);
    setConfirmOpen(false);
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
            <DeleteButton selectedCount={selectedCount} />
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
  );
}












// "use client";

// import * as React from "react";
// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
//   SortingState,
//   ColumnFiltersState,
//   VisibilityState,
// } from "@tanstack/react-table";
// import {
//   ArrowUpDown,
//   ChevronDown,
//   Loader2,
//   MoreHorizontal,
//   Pencil,
//   Trash2,
// } from "lucide-react";

// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuCheckboxItem,
// } from "@/components/ui/dropdown-menu";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";

// export type Staff = {
//   id: string;
//   name: string;
//   username: string;
//   role: "staff" | "admin";
// };

// type StaffTableProps = {
//   data: Staff[];
//   page: number;
//   pageSize: number;
//   total: number;
//   isLoading: boolean;
//   onPageChange: (page: number) => void;
//   onSortChange: (s: { by: string; order: "asc" | "desc" }) => void;
// };

// /* ---------------------- confirm / edit dialog helpers --------------------- */
// function ConfirmDeleteDialog({
//   open,
//   onClose,
//   count,
//   onConfirm,
// }: {
//   open: boolean;
//   onClose: () => void;
//   count: number;
//   onConfirm: () => void;
// }) {
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>ยืนยันการลบ</DialogTitle>
//         </DialogHeader>
//         <p className="py-4">คุณต้องการลบ {count} รายการใช่หรือไม่?</p>
//         <div className="flex justify-end gap-2">
//           <Button variant="outline" onClick={onClose}>
//             ยกเลิก
//           </Button>
//           <Button variant="destructive" onClick={onConfirm}>
//             ลบ
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function EditStaffDialog({
//   open,
//   onClose,
//   staff,
// }: {
//   open: boolean;
//   onClose: () => void;
//   staff: Staff | null;
// }) {
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>แก้ไขข้อมูล</DialogTitle>
//         </DialogHeader>
//         {staff && (
//           <form className="space-y-4">
//             <Input defaultValue={staff.name} placeholder="Name" />
//             <Input defaultValue={staff.username} placeholder="Username" />
//             <Input defaultValue={staff.role} placeholder="Role" />
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" type="button" onClick={onClose}>
//                 ยกเลิก
//               </Button>
//               <Button type="submit">บันทึก</Button>
//             </div>
//           </form>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ------------------------------ main table ------------------------------- */
// export default function StaffTable({
//   data,
//   page,
//   pageSize,
//   total,
//   isLoading,
//   onPageChange,
//   onSortChange,
// }: StaffTableProps) {
//   /* ---------- local states ---------- */
//   const [currentSort, setCurrentSort] = React.useState<{
//     by: string;
//     order: "asc" | "desc";
//   }>({ by: "name", order: "asc" });

//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = React.useState({});
//   const [search, setSearch] = React.useState("");

//   /* dialogs */
//   const [confirmOpen, setConfirmOpen] = React.useState(false);
//   const [editOpen, setEditOpen] = React.useState(false);
//   const [editingStaff, setEditingStaff] = React.useState<Staff | null>(null);

//   const onSort = (s: { by: string; order: "asc" | "desc" }) => {
//     setCurrentSort(s);
//     onSortChange(s);
//   };

//   /* -------------------- column defs (include checkbox & menu) ------------- */
  
//   const columns = React.useMemo<ColumnDef<Staff>[]>(
//     () => [
//       {
//         id: "select",
//         header: ({ table }) => (
//           <Checkbox
//             checked={
//               table.getIsAllPageRowsSelected() ||
//               (table.getIsSomePageRowsSelected() && "indeterminate")
//             }
//             onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
//             aria-label="Select all"
//           />
//         ),
//         cell: ({ row }) => (
//           <Checkbox
//             checked={row.getIsSelected()}
//             onCheckedChange={(v) => row.toggleSelected(!!v)}
//             aria-label="Select row"
//           />
//         ),
//         enableSorting: false,
//         enableHiding: false,
//         size: 48,
//       },
//       { accessorKey: "id", header: "ID", size: 90 },
//       {
//         accessorKey: "name",
//         header: ({ column }) => (
//           <Button
//             variant="ghost"
//             className="flex items-center gap-1"
//             onClick={() =>
//               onSort({
//                 by: "name",
//                 order:
//                   currentSort.by === "name" && currentSort.order === "asc"
//                     ? "desc"
//                     : "asc",
//               })
//             }
//           >
//             Name
//             <ArrowUpDown
//               className={cn(
//                 "h-3 w-3 transition-transform",
//                 currentSort.by === "name" &&
//                   currentSort.order === "desc" &&
//                   "rotate-180",
//               )}
//             />
//           </Button>
//         ),
//       },
//       {
//         accessorKey: "username",
//         header: ({ column }) => (
//           <Button
//             variant="ghost"
//             className="flex items-center gap-1"
//             onClick={() =>
//               onSort({
//                 by: "username",
//                 order:
//                   currentSort.by === "username" && currentSort.order === "asc"
//                     ? "desc"
//                     : "asc",
//               })
//             }
//           >
//             Username
//             <ArrowUpDown
//               className={cn(
//                 "h-3 w-3 transition-transform",
//                 currentSort.by === "username" &&
//                   currentSort.order === "desc" &&
//                   "rotate-180",
//               )}
//             />
//           </Button>
//         ),
//         cell: ({ row }) => (
//           <span className="font-mono">{row.getValue<string>("username")}</span>
//         ),
//       },
//       { accessorKey: "role", header: "Role" },
//       {
//         accessorKey: "actions",
//         header: "Actions",
//         id: "actions",
//         enableHiding: false,
//         cell: ({ row }) => {
//           const staff = row.original;
//           return (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="h-8 w-8 p-0">
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                 <DropdownMenuItem
//                   onClick={() => {
//                     setEditingStaff(staff);
//                     setEditOpen(true);
//                   }}
//                 >
//                   <Pencil className="mr-2 h-4 w-4" />
//                   Edit
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   onClick={() => {
//                     setEditingStaff(staff);
//                     setConfirmOpen(true);
//                   }}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           );
//         },
//         size: 64,
//       },
//     ],
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [currentSort],
//   );

//   /* ------------------- build react-table instance ------------------------ */
//   const table = useReactTable({
//     data,
//     columns,
//     manualPagination: true,
//     pageCount: Math.ceil(total / pageSize),
//     state: {
//       sorting,
//       columnFilters: filters,
//       columnVisibility,
//       rowSelection,
//     },
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

//   /* ------------- search filter (name & username) ------------------------- */
//   React.useEffect(() => {
//     table.getColumn("name")?.setFilterValue(search);
//     table.getColumn("username")?.setFilterValue(search);
//   }, [search]); // eslint-disable-line

//   const selected = table.getFilteredSelectedRowModel().rows.length;

//   /* ------------------------------ UI ------------------------------------ */
//   return (
//     <>
//       {/* dialogs */}
//       <ConfirmDeleteDialog
//         open={confirmOpen}
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={() => {
//           console.log("Delete …"); // call API
//           setConfirmOpen(false);
//           table.resetRowSelection();
//         }}
//         count={selected || 1}
//       />
//       <EditStaffDialog
//         open={editOpen}
//         onClose={() => setEditOpen(false)}
//         staff={editingStaff}
//       />

//       <div className="space-y-4">
//         {/* top controls */}
//         <div className="flex items-center gap-2">
//           <Input
//             placeholder="Search name / username..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="max-w-sm"
//           />
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" className="ml-auto">
//                 Columns <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               {table
//                 .getAllColumns()
//                 .filter((c) => c.getCanHide())
//                 .map((c) => (
//                   <DropdownMenuCheckboxItem
//                     key={c.id}
//                     checked={c.getIsVisible()}
//                     onCheckedChange={(v) => c.toggleVisibility(!!v)}
//                     className="capitalize"
//                   >
//                     {c.id}
//                   </DropdownMenuCheckboxItem>
//                 ))}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <Button
//             variant="destructive"
//             disabled={!selected}
//             onClick={() => {
//               setEditingStaff(null);
//               setConfirmOpen(true);
//             }}
//           >
//             Delete {selected ? `(${selected})` : ""}
//           </Button>
//         </div>

//         {/* table */}
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               {table.getHeaderGroups().map((hg) => (
//                 <TableRow key={hg.id}>
//                   {hg.headers.map((h) => (
//                     <TableHead key={h.id}>
//                       {h.isPlaceholder
//                         ? null
//                         : flexRender(
//                             h.column.columnDef.header,
//                             h.getContext(),
//                           )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {isLoading ? (
//                 <TableRow>
//                   <TableCell colSpan={columns.length} className="text-center">
//                     <Loader2 className="mx-auto h-4 w-4 animate-spin" />
//                   </TableCell>
//                 </TableRow>
//               ) : table.getRowModel().rows.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext(),
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="text-center h-24"
//                   >
//                     No data
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         {/* footer */}
//         <div className="flex items-center justify-end gap-2 text-sm">
//           <span className="text-muted-foreground flex-1">
//             {selected} of {table.getFilteredRowModel().rows.length} row(s)
//             selected.
//           </span>
//           <Separator orientation="vertical" />
//           <span className="text-muted-foreground">
//             {total.toLocaleString()} records
//           </span>
//           <span aria-hidden>•</span>
//           <span className="text-muted-foreground">
//             Page {page} / {Math.ceil(total / pageSize) || 1}
//           </span>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => onPageChange(page - 1)}
//             disabled={page === 1 || isLoading}
//           >
//             Prev
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => onPageChange(page + 1)}
//             disabled={page * pageSize >= total || isLoading}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// }

//***************************************************************************************** */

// "use client";

// import * as React from "react";
// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getPaginationRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { ArrowUpDown, Loader2 } from "lucide-react";

// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// export type Staff = {
//   id: string;
//   name: string;
//   username: string;
//   role: string;
// };

// type StaffTableProps = {
//   data: Staff[];
//   page: number;
//   pageSize: number;
//   total: number;
//   isLoading: boolean;
//   onPageChange: (page: number) => void;
//   onSortChange: (s: { by: string; order: "asc" | "desc" }) => void;
// };

// const makeColumns = (
//   currentSort: { by: string; order: "asc" | "desc" },
//   onSort: StaffTableProps["onSortChange"],
// ): ColumnDef<Staff>[] => [
//     {
//       accessorKey: "id",
//       header: "ID",
//     },
//     {
//       accessorKey: "name",
//       header: ({ column }) => (
//         <button
//           className="flex items-center gap-1"
//           onClick={() =>
//             onSort({
//               by: "name",
//               order: currentSort.by === "name" && currentSort.order === "asc" ? "desc" : "asc",
//             })
//           }
//         >
//           Name
//           <ArrowUpDown
//             className={cn(
//               "h-3 w-3 transition-transform",
//               currentSort.by === "name" && currentSort.order === "desc" && "rotate-180",
//             )}
//           />
//         </button>
//       ),
//       cell: (info) => info.getValue(),
//     },
//     {
//       accessorKey: "username",
//       header: ({ column }) => (
//         <button
//           className="flex items-center gap-1"
//           onClick={() =>
//             onSort({
//               by: "username",
//               order: currentSort.by === "username" && currentSort.order === "asc" ? "desc" : "asc",
//             })
//           }
//         >
//           Username
//           <ArrowUpDown
//             className={cn(
//               "h-3 w-3 transition-transform",
//               currentSort.by === "username" && currentSort.order === "desc" && "rotate-180",
//             )}
//           />
//         </button>
//       ),
//     },
//     {
//       accessorKey: "role",
//       header: "Role",
//     },
//   ];

// export default function StaffTable(props: StaffTableProps) {
//   const { data, page, pageSize, total, isLoading, onPageChange, onSortChange } =
//     props;

//   const [currentSort, setCurrentSort] = React.useState<{
//     by: string;
//     order: "asc" | "desc";
//   }>({ by: "name", order: "asc" });

//   const handleSort = (s: { by: string; order: "asc" | "desc" }) => {
//     setCurrentSort(s);
//     onSortChange(s);
//   };

//   const table = useReactTable({
//     data,
//     columns: makeColumns(currentSort, handleSort),
//     manualPagination: true,
//     pageCount: Math.ceil(total / pageSize),
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

//   return (
//     <div className="space-y-2">
//       <Table>
//         <TableHeader>
//           {table.getHeaderGroups().map((hg) => (
//             <TableRow key={hg.id}>
//               {hg.headers.map((h) => (
//                 <TableHead key={h.id} className="">
//                   {h.isPlaceholder
//                     ? null
//                     : flexRender(
//                       h.column.columnDef.header,
//                       h.getContext(),
//                     )}
//                 </TableHead>
//               ))}
//             </TableRow>
//           ))}
//         </TableHeader>
//         <TableBody>
//           {isLoading ? (
//             <TableRow>
//               <TableCell colSpan={4} className="text-center">
//                 <Loader2 className="mx-auto h-4 w-4 animate-spin" />
//               </TableCell>
//             </TableRow>
//           ) : table.getRowModel().rows.length ? (
//             table.getRowModel().rows.map((row) => (
//               <TableRow key={row.id}>
//                 {row.getVisibleCells().map((cell) => (
//                   <TableCell key={cell.id}>
//                     {flexRender(
//                       cell.column.columnDef.cell,
//                       cell.getContext(),
//                     )}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={4} className="text-center">
//                 No data
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>

//       <div className="flex items-center justify-center gap-2 pt-2">
//         <span className="text-muted-foreground">
//           {total.toLocaleString()} records
//         </span>
//         <span aria-hidden>•</span>
//         <span className="text-sm text-muted-foreground">
//           Page {page} / {Math.ceil(total / pageSize) || 1}
//         </span>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(page - 1)}
//           disabled={page === 1 || isLoading}
//         >
//           Prev
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(page + 1)}
//           disabled={page * pageSize >= total || isLoading}
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// }
