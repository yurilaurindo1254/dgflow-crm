"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  name: string // Added name for filtering demo
}

export const columns: ColumnDef<Payment>[] = [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
            <Badge variant={status === 'success' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'} className="capitalize">
                {status}
            </Badge>
        )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-white/10 hover:text-white"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => <div className="text-white font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium text-white">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
              className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">View customer</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Dummy Data
const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
    name: "Maria Silva"
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
    name: "João Santos"
  },
  {
    id: "348a1d12",
    amount: 50,
    status: "success",
    email: "test@domain.com",
    name: "Ana Costa"
  },
  {
    id: "998a1232",
    amount: 230,
    status: "success",
    email: "user@corp.com",
    name: "Pedro Lima"
  },
  {
    id: "123a1231",
    amount: 15,
    status: "failed",
    email: "fail@test.com",
    name: "Lucas Souza"
  },
  // Add more for pagination
  { id: "1", amount: 200, status: "success", email: "a@test.com", name: "Alice" },
  { id: "2", amount: 300, status: "pending", email: "b@test.com", name: "Bob" },
  { id: "3", amount: 400, status: "processing", email: "c@test.com", name: "Charlie" },
  { id: "4", amount: 500, status: "success", email: "d@test.com", name: "David" },
  { id: "5", amount: 600, status: "failed", email: "e@test.com", name: "Eve" },
  { id: "6", amount: 700, status: "success", email: "f@test.com", name: "Frank" },
]

export default function DataTablePage() {
    // Note: In a real scenario, filtering often happens inside the DataTable component or via props.
    // For this demo, we're just rendering the columns and data.
  return (
    <div className="container mx-auto py-10">
        <Card className="border-white/10 bg-zinc-950">
            <CardHeader>
                <CardTitle className="text-white">Transações Recentes</CardTitle>
                <CardDescription>Um exemplo de tabela de dados completa.</CardDescription>
            </CardHeader>
            <CardContent>
                 <DataTable columns={columns} data={data} searchKey="name" />
            </CardContent>
        </Card>
    </div>
  )
}
