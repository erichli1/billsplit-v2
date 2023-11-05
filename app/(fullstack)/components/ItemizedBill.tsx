import { Item, Room } from "../types";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  CheckSquareIcon,
  PlusCircleIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { formatMoney } from "../utils";
import { Separator } from "@/components/ui/separator";
import { Id } from "@/convex/_generated/dataModel";

const allMemberIdsOnItem = (item: Item, memberIds: Array<Id<"members">>) => {
  return memberIds.every((memberId) => item.memberIds.includes(memberId));
};

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

export default function ItemizedBill({
  room,
  selectedMemberIds,
}: {
  room: Room;
  selectedMemberIds: Array<Id<"members">>;
}) {
  const addItem = useMutation(api.myFunctions.addItem);
  const deleteItem = useMutation(api.myFunctions.deleteItem);
  const updateItemName = useMutation(api.myFunctions.updateItemName);
  const updateItemCost = useMutation(api.myFunctions.updateItemCost);
  const addMembersToItem = useMutation(api.myFunctions.addMembersToItem);
  const removeMembersFromItem = useMutation(
    api.myFunctions.removeMembersFromItem
  );

  return (
    <>
      <div className="grid grid-cols-12 gap-2">
        <div></div>
        <div className="col-span-3 text-sm font-bold">Item</div>
        <div className="col-span-2 text-sm font-bold">Cost</div>
        <div className="col-span-6 text-sm font-bold">Participants</div>
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
            className="col-span-3"
          />
          <RenderPropertyComponent
            itemProperty={item.cost}
            updateItemProperty={async (value) => {
              await updateItemCost({ itemId: item._id, cost: value }).catch(
                console.error
              );
            }}
            className="col-span-2"
          />
          {selectedMemberIds.length > 0 &&
            (allMemberIdsOnItem(item, selectedMemberIds) ? (
              <div className="col-span-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    removeMembersFromItem({
                      itemId: item._id,
                      memberIds: selectedMemberIds,
                    }).catch(console.error);
                  }}
                >
                  <CheckSquareIcon size="1.25em" />
                </Button>
              </div>
            ) : (
              <div className="col-span-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    addMembersToItem({
                      itemId: item._id,
                      memberIds: selectedMemberIds,
                    }).catch(console.error);
                  }}
                >
                  <SquareIcon size="1.25em" />
                </Button>
              </div>
            ))}
          <div className="col-span-5 text-sm flex my-auto mx-0">
            {item.memberIds
              .map(
                (memberId) =>
                  room.members.find((member) => member._id === memberId)?.name
              )
              .join(", ")}
          </div>
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
