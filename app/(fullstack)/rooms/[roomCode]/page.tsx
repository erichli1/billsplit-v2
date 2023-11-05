"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Link } from "@/components/typography/link";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { X } from "lucide-react";
import ItemizedBill from "../../components/ItemizedBill";

export default function RoomPage({ params }: { params: { roomCode: string } }) {
  const [name, setName] = useState<string>("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<
    Array<Id<"members">>
  >([]);

  const room = useQuery(api.myFunctions.getRoom, { roomCode: params.roomCode });
  const addMemberToRoom = useMutation(api.myFunctions.addMemberToRoom);
  const removeMember = useMutation(api.myFunctions.removeMember);

  // Handle edge cases for room
  if (room === undefined) return <div>Loading...</div>;
  if (room === null) return <div>This room does not exist</div>;

  // Utilities for participant badges
  const handleBadgeClick = (memberId: Id<"members">) => {
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      setSelectedMemberIds(selectedMemberIds.concat(memberId));
    }
  };
  const handleBadgeDelete = (memberId: Id<"members">) => {
    removeMember({ memberId }).catch(console.error);
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

  return (
    <main className="container max-w-2xl flex flex-col gap-2 mt-8">
      <h1 className="text-4xl font-extrabold text-center">
        billsplit: {params.roomCode}
      </h1>

      <br />

      <Button variant="destructive" asChild>
        <Link href="/" className="no-underline">
          Return to home screen
        </Link>
      </Button>

      <br />

      <h2 className="font-bold">Participants</h2>

      <div className="flex w-full items-center space-x-2">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          disabled={name === ""}
          onClick={() => {
            addMemberToRoom({ roomId: room._id, name }).catch(console.error);
          }}
        >
          Add
        </Button>
      </div>

      {room.members.length > 0 && (
        <p className="text-sm">
          Click on one or multiple participants to see the bill from that view.
        </p>
      )}

      <div className="flex w-full space-x-2">
        {room.members.length > 0 && (
          <Badge
            onClick={handleClickAll}
            variant="outline"
            className="text-sm cursor-pointer"
          >
            {allMembersSelected ? "Deselect all" : "Select all"}
          </Badge>
        )}
        {room.members.map((member) => (
          <Badge
            key={member._id}
            variant={
              selectedMemberIds.includes(member._id) ? "default" : "outline"
            }
            className="text-sm cursor-pointer"
          >
            <X onClick={() => handleBadgeDelete(member._id)} size={16} />
            &nbsp;
            <span onClick={() => handleBadgeClick(member._id)}>
              {member.name}
            </span>
          </Badge>
        ))}
      </div>

      <br />

      <h2 className="font-bold">Itemized bill</h2>

      <ItemizedBill room={room} selectedMemberIds={selectedMemberIds} />
    </main>
  );
}
