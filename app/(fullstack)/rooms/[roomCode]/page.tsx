"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Link } from "@/components/typography/link";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { CopyIcon, TrashIcon } from "lucide-react";
import ItemizedBill from "../../components/ItemizedBill";
import { Split } from "../../components/Split";
import { formatMoney, splitBill } from "../../utils";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default function RoomPage({ params }: { params: { roomCode: string } }) {
  const [name, setName] = useState<string>("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<
    Array<Id<"members">>
  >([]);

  const room = useQuery(api.myFunctions.getRoom, {
    roomCode: params.roomCode.toUpperCase(),
  });
  const addMembersToRoom = useMutation(api.myFunctions.addMembersToRoom);
  const removeMember = useMutation(api.myFunctions.removeMember);
  const deleteRoom = useMutation(api.myFunctions.deleteRoom);

  const { toast } = useToast();
  const router = useRouter();

  // Handle edge cases for room
  if (room === undefined)
    return (
      <div className="flex items-center justify-center h-screen mx-auto">
        Loading...
      </div>
    );
  if (room === null)
    return (
      <div className="flex items-center justify-center h-screen mx-auto">
        This room does not exist.
      </div>
    );

  // Utilities for participant badges
  const handleBadgeClick = (memberId: Id<"members">) => {
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      setSelectedMemberIds(selectedMemberIds.concat(memberId));
    }
  };
  const handleBadgeDelete = (memberId: Id<"members">) => {
    if (selectedMemberIds.includes(memberId))
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
    removeMember({ memberId, roomId: room._id }).catch(console.error);
  };

  // Utilities for select all badge
  const allMembersSelected = selectedMemberIds.length === room.members.length;
  const handleClickAll = () => {
    if (allMembersSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(room.members.map((member) => member._id));
    }
  };

  const memberBills = splitBill({
    total: room.total,
    items: room.items,
    members: room.members,
  });

  return (
    <main className="container max-w-2xl flex flex-col gap-2 mt-8">
      <h1 className="text-4xl font-extrabold">
        <div className="flex items-center">
          billsplit: {room.code}
          <Button
            onClick={() => {
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                  toast({
                    description: "Copied room link to clipboard",
                  });
                })
                .catch(console.error);
            }}
            variant="ghost"
          >
            <CopyIcon />
          </Button>
        </div>
      </h1>

      <div className="flex w-full space-x-2">
        <Button variant="secondary" asChild>
          <Link href="/" className="no-underline">
            Return to home screen
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger>
            <div>
              <Button variant="destructive">Delete room</Button>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will delete the room and all
                associated information.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deleteRoom({ roomId: room._id })
                    .then(() => {
                      router.push("/");
                    })
                    .catch(console.error);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <p className="text-sm">Rooms will be auto-deleted after 14 days.</p>

      <br />

      <h2 className="font-bold underline">Add all participants</h2>
      <p className="text-sm">
        You can use commas to add multiple participants at once.
      </p>

      <div className="flex w-full items-center space-x-2">
        <Input
          placeholder="Name(s)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          disabled={
            name === "" || room.members.some((member) => member.name === name)
          }
          onClick={() => {
            const names = name
              .split(",")
              .map((name) => name.trim())
              .filter((s) => s !== "");

            addMembersToRoom({
              roomId: room._id,
              names,
            }).catch(console.error);
            setName("");
          }}
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap w-full space-x-2">
        {room.members.map((member) => (
          <div className="pb-1" key={`add-${member._id}}`}>
            <Badge variant="outline" className="text-sm">
              <TrashIcon
                onClick={() => {
                  handleBadgeDelete(member._id);
                }}
                size="1em"
                className="cursor-pointer"
              />
              &nbsp;&nbsp;{member.name}
            </Badge>
          </div>
        ))}
      </div>
      <br />

      <h2 className="font-bold underline">Add items and tag participants</h2>

      {room.members.length > 0 && (
        <p className="text-sm">
          Click to select participants to tag them to specific items.
        </p>
      )}

      <div className="flex flex-wrap w-full space-x-2">
        {room.members.length > 0 && (
          <div className="pb-1">
            <Badge
              onClick={handleClickAll}
              variant="outline"
              className="text-sm cursor-pointer"
            >
              {allMembersSelected ? "Deselect all" : "Select all"}
            </Badge>
          </div>
        )}
        {room.members.map((member) => (
          <div className="pb-1" key={member._id}>
            <Badge
              variant={
                selectedMemberIds.includes(member._id) ? "default" : "outline"
              }
              className="text-sm cursor-pointer"
              onClick={() => handleBadgeClick(member._id)}
            >
              {member.name}
            </Badge>
          </div>
        ))}
      </div>

      <Separator />

      <ItemizedBill room={room} selectedMemberIds={selectedMemberIds} />
      <br />

      <h2>
        <span className="font-bold underline">See the split</span>
        <Button
          onClick={() => {
            const textToCopy = memberBills.reduce(
              (acc, item) =>
                (acc += `${item.memberName}: ${formatMoney(item.bill)};\n`),
              ""
            );
            navigator.clipboard
              .writeText(textToCopy)
              .then(() => {
                toast({ description: "Copied split to clipboard" });
              })
              .catch(console.error);
          }}
          variant="ghost"
          className="px-2"
        >
          <CopyIcon size="1em" />
        </Button>
      </h2>

      <Split memberBills={memberBills} total={room.total} />

      {/* <Button
        variant="destructive"
        onClick={() => {
          deleteRoom({ roomId: room._id }).catch(console.error);
        }}
      >
        Delete room
      </Button> */}
      <br />

      <Toaster />
    </main>
  );
}
