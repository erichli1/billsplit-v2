"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Link } from "@/components/typography/link";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { CopyIcon, X } from "lucide-react";
import ItemizedBill from "../../components/ItemizedBill";
import { Split } from "../../components/Split";
import { formatMoney, splitBill } from "../../utils";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

export default function RoomPage({ params }: { params: { roomCode: string } }) {
  const [name, setName] = useState<string>("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<
    Array<Id<"members">>
  >([]);

  const room = useQuery(api.myFunctions.getRoom, {
    roomCode: params.roomCode.toUpperCase(),
  });
  const addMemberToRoom = useMutation(api.myFunctions.addMemberToRoom);
  const removeMember = useMutation(api.myFunctions.removeMember);

  const { toast } = useToast();

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
        <div className="flex items-center justify-center">
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

      <br />

      <Button variant="destructive" asChild>
        <Link href="/" className="no-underline">
          Return to home screen
        </Link>
      </Button>

      <br />

      <h2 className="font-bold underline">Add all participants</h2>

      <div className="flex w-full items-center space-x-2">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          disabled={
            name === "" || room.members.some((member) => member.name === name)
          }
          onClick={() => {
            addMemberToRoom({ roomId: room._id, name }).catch(console.error);
            setName("");
          }}
        >
          Add
        </Button>
      </div>
      {room.members.length > 0 && (
        <p className="text-sm">
          <span className="font-bold">Participants:</span>
          &nbsp;
          {room.members.map((member) => member.name).join(", ")}
        </p>
      )}
      <br />

      <h2 className="font-bold underline">Add items and tag participants</h2>

      {room.members.length > 0 && (
        <p className="text-sm">
          Click on one or multiple participants to see the bill from that view.
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
              <X
                onClick={(e) => {
                  e.stopPropagation();
                  handleBadgeDelete(member._id);
                }}
                size={16}
              />
              &nbsp;{member.name}
            </Badge>
          </div>
        ))}
      </div>
      <br />

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

      <Toaster />
    </main>
  );
}
