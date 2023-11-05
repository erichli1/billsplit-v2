import { Room } from "../types";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { formatMoney } from "../utils";
import { Separator } from "@/components/ui/separator";

function RenderPropertyComponent<ItemPropertyType extends string | number>({
  itemProperty,
  updateItemProperty,
  className,
}: {
  itemProperty: ItemPropertyType;
  updateItemProperty: (value: ItemPropertyType) => Promise<void>;
  className?: string;
}) {
  const [value, setValue] = useState<ItemPropertyType>(itemProperty);
  const [modified, setModified] = useState(false);

  useMemo(() => {
    if (!modified) setValue(itemProperty);
  }, [itemProperty, modified]);

  const handleEdit = (newValue: ItemPropertyType) => {
    setModified(newValue !== itemProperty);
    setValue(newValue);
  };

  return (
    <div className={className}>
      <Input
        value={value}
        type={typeof itemProperty === "number" ? "number" : undefined}
        // Update the input value as user types
        onChange={(e) => {
          const typedValue =
            typeof itemProperty === "number"
              ? Number(e.target.value)
              : e.target.value;
          handleEdit(typedValue as ItemPropertyType);
        }}
        // Select all text when user focuses
        onFocus={(e) => e.target.select()}
        // Trigger update with db when user blurs
        onBlur={() => {
          if (value !== itemProperty) {
            updateItemProperty(value)
              .then(() => {
                setModified(false);
              })
              .catch(console.error);
          }
        }}
      />
    </div>
  );
}

export default function ItemizedBill({ room }: { room: Room }) {
  const addItem = useMutation(api.myFunctions.addItem);
  const deleteItem = useMutation(api.myFunctions.deleteItem);
  const updateItemName = useMutation(api.myFunctions.updateItemName);
  const updateItemCost = useMutation(api.myFunctions.updateItemCost);

  return (
    <>
      <div className="grid grid-cols-12 gap-2">
        <div></div>
        <div className="col-span-4 text-sm font-bold">Item</div>
        <div className="col-span-3 text-sm font-bold">Cost</div>
        <div className="col-span-4 text-sm font-bold">Participants</div>
      </div>
      {room.items.map((item) => (
        <div key={item._id} className="grid grid-cols-12 gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              deleteItem({ itemId: item._id }).catch(console.error);
            }}
          >
            <Trash2Icon size="1.25em" />
          </Button>
          <RenderPropertyComponent
            itemProperty={item.name}
            updateItemProperty={async (value) => {
              await updateItemName({ itemId: item._id, name: value }).catch(
                console.error
              );
            }}
            className="col-span-4"
          />
          <RenderPropertyComponent
            itemProperty={item.cost}
            updateItemProperty={async (value) => {
              await updateItemCost({ itemId: item._id, cost: value }).catch(
                console.error
              );
            }}
            className="col-span-3"
          />
        </div>
      ))}
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              addItem({ roomId: room._id }).catch(console.error);
            }}
            className="w-max"
          >
            <div className="flex mx-2 items-center">
              <PlusCircleIcon size="1.25em" />
              <div className="text-sm ml-1">Add item</div>
            </div>
          </Button>
        </div>
        <div className="col-span-10 text-sm flex">
          <Separator />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-2">
        <div></div>
        <div className="col-span-4 text-sm font-bold">Total</div>
        <div className="col-span-3 text-sm font-bold">
          {formatMoney(room.items.reduce((acc, item) => acc + item.cost, 0))}
        </div>
      </div>
    </>
  );
}
