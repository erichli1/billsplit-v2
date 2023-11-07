import { Item, Room } from "../types";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  AlertCircleIcon,
  CheckSquareIcon,
  PlusCircleIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { formatMoney } from "../utils";
import { Separator } from "@/components/ui/separator";
import { Id } from "@/convex/_generated/dataModel";
import { Alert } from "@/components/ui/alert";

const getWindowDimensions = () => {
  if (typeof window === "undefined") return { width: 0, height: 0 };

  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};

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
  const [value, setValue] = useState<string>(itemProperty.toString());
  const [modified, setModified] = useState(false);

  useMemo(() => {
    if (!modified) setValue(itemProperty.toString());
  }, [itemProperty, modified]);

  const handleEdit = (newValue: string) => {
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
          if (typeof itemProperty === "number") {
            if (!Number.isNaN(Number(e.target.value)))
              handleEdit(e.target.value);
          } else {
            handleEdit(e.target.value);
          }
        }}
        // Select all text when user focuses
        onFocus={(e) => e.target.select()}
        // Trigger update with db when user blurs
        onBlur={() => {
          if (value !== itemProperty.toString()) {
            updateItemProperty(
              (typeof itemProperty === "number"
                ? Number(value)
                : value) as ItemPropertyType
            )
              .then(() => {
                setModified(false);
              })
              .catch(console.error);
          }
        }}
        inputMode={typeof itemProperty === "number" ? "decimal" : "text"}
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
  const updateRoomTotal = useMutation(api.myFunctions.updateRoomTotal);

  const subtotal = room.items.reduce((acc, item) => acc + item.cost, 0);
  const [total, setTotal] = useState<string>(room.total.toString());
  const numericTotal = Number(total);

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const actionColumnClassName = isMobile ? "col-span-2 " : "col-span-1 ";
  const itemColumnClassName = isMobile ? "col-span-6 " : "col-span-3 ";
  const costColumnClassName = isMobile ? "col-span-4 " : "col-span-2 ";
  const participantColumnClassName = isMobile ? "col-span-8 " : "col-span-5 ";

  useMemo(() => {
    setTotal(room.total.toString());
  }, [room.total]);

  return (
    <>
      <div className="grid grid-cols-12 gap-2">
        <div className={actionColumnClassName}></div>
        <div className={itemColumnClassName + "text-sm font-bold"}>Item</div>
        <div className={costColumnClassName + "text-sm font-bold"}>Cost</div>
        {!isMobile && (
          <div className="col-span-5 text-sm font-bold">Participants</div>
        )}
      </div>
      {room.items.map((item) => (
        <div key={item._id} className="grid grid-cols-12 gap-2">
          <div className={actionColumnClassName}>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                deleteItem({ itemId: item._id }).catch(console.error);
              }}
            >
              <Trash2Icon size="1.25em" />
            </Button>
          </div>
          <RenderPropertyComponent
            itemProperty={item.name}
            updateItemProperty={async (value) => {
              await updateItemName({ itemId: item._id, name: value }).catch(
                console.error
              );
            }}
            className={itemColumnClassName}
          />
          <RenderPropertyComponent
            itemProperty={item.cost}
            updateItemProperty={async (value) => {
              await updateItemCost({ itemId: item._id, cost: value }).catch(
                console.error
              );
            }}
            className={costColumnClassName}
          />
          {isMobile && <div className={actionColumnClassName}></div>}
          {selectedMemberIds.length > 0 &&
            (allMemberIdsOnItem(item, selectedMemberIds) ? (
              <div className={actionColumnClassName}>
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
              <div className={actionColumnClassName}>
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
          <div
            className={participantColumnClassName + "text-sm flex my-auto mx-0"}
          >
            {item.memberIds
              .map(
                (memberId) =>
                  room.members.find((member) => member._id === memberId)
                    ?.name ?? "deleted"
              )
              .join(", ")}
          </div>
        </div>
      ))}
      <div>
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
        <Separator />
      </div>
      <div className="grid grid-cols-12 gap-2">
        <div className={actionColumnClassName}></div>
        <div className={itemColumnClassName + "text-sm"}>Subtotal</div>
        <div className={costColumnClassName + "text-sm"}>
          {formatMoney(subtotal)}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-2">
        <div className={actionColumnClassName}></div>
        <div
          className={
            itemColumnClassName + "text-sm font-bold flex items-center"
          }
        >
          Total
        </div>
        <div className={costColumnClassName + "text-sm font-bold"}>
          <Input
            value={total}
            onChange={(e) => {
              if (!Number.isNaN(Number(e.target.value)))
                setTotal(e.target.value);
            }}
            onBlur={() => {
              if (numericTotal !== room.total)
                updateRoomTotal({
                  roomId: room._id,
                  total: numericTotal,
                }).catch(console.error);
            }}
            onFocus={(e) => e.target.select()}
            className={numericTotal < subtotal ? "text-red-500" : undefined}
            inputMode="decimal"
          />
        </div>
      </div>
      {room.total < subtotal && (
        <Alert className="bg-red-600">
          <div className="flex items-center">
            <AlertCircleIcon size="1.25em" color="white" />
            <div className="mx-2 text-white">
              The total is less than the subtotal.
            </div>
          </div>
        </Alert>
      )}
    </>
  );
}
