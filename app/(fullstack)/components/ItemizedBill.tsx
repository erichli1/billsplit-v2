import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Room, Item } from "../types";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SendHorizonal, Trash2 } from "lucide-react";

export default function ItemizedBill({ room }: { room: Room }) {
  const addItem = useMutation(api.myFunctions.addItem);
  const deleteItem = useMutation(api.myFunctions.deleteItem);
  const updateItemName = useMutation(api.myFunctions.updateItemName);
  const updateItemCost = useMutation(api.myFunctions.updateItemCost);

  const RenderNameComponent = ({ item }: { item: Item }) => {
    const [name, setName] = useState(item.name);
    const handleEdit = (value: string) => {
      setName(value);
    };

    return (
      <div className="flex w-full items-center">
        <Input value={name} onChange={(e) => handleEdit(e.target.value)} />
        {item.name !== name && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              updateItemName({ itemId: item._id, name }).catch(console.error);
            }}
          >
            <SendHorizonal size="1.25em" />
          </Button>
        )}
      </div>
    );
  };

  const RenderCostComponent = ({ item }: { item: Item }) => {
    const [cost, setCost] = useState(item.cost);
    const handleEdit = (value: number) => {
      setCost(value);
    };

    return (
      <div className="flex w-full items-center">
        <Input
          type="number"
          value={cost}
          onChange={(e) => handleEdit(Number(e.target.value))}
          // className={`${
          //   item.cost !== cost ? "bg-yellow-800 bg-opacity-50" : ""
          // }`}
        />
        {item.cost !== cost && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              updateItemCost({ itemId: item._id, cost }).catch(console.error);
            }}
          >
            <SendHorizonal size="1.25em" />
          </Button>
        )}
      </div>
    );
  };

  const columns: ColumnDef<Item>[] = [
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            deleteItem({ itemId: row.original._id }).catch(console.error);
          }}
        >
          <Trash2 size="1.25em" />
        </Button>
      ),
      footer: () => "",
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => <RenderNameComponent item={row.original} />,
      footer: () => "",
    },
    {
      id: "cost",
      header: "Cost",
      cell: ({ row }) => <RenderCostComponent item={row.original} />,
      footer: () =>
        "Total $" +
        room.items.reduce((acc, item) => acc + item.cost, 0).toFixed(2),
    },
    {
      id: "members",
      header: "Members",
      cell: ({ row }) => {
        row.original.memberIds.join(", ");
      },
      footer: () => "",
    },
  ];

  const table = useReactTable({
    data: useMemo(() => room.items, [room.items]),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
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
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableHeader>
          {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id}>
              {footerGroup.headers.map((footer) => {
                return (
                  <TableHead key={footer.id}>
                    {footer.isPlaceholder
                      ? null
                      : flexRender(
                          footer.column.columnDef.footer,
                          footer.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
      </Table>
      <br />
      <Button
        onClick={() => {
          addItem({ roomId: room._id }).catch(console.error);
        }}
      >
        Add item
      </Button>
    </>
  );
}
