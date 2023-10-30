"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function RoomPage({ params }: { params: { roomCode: string } }) {
  const searchParams = useSearchParams();
  const nameFromSearchParams = searchParams.get("name");
  const inRoomFromSearchParams = searchParams.get("inRoom") === "true";

  const [name, setName] = useState<string>(nameFromSearchParams ?? "");
  const [inRoom, setInRoom] = useState<boolean>(inRoomFromSearchParams);

  const room = useQuery(api.myFunctions.getRoom, { roomCode: params.roomCode });
  const joinRoom = useMutation(api.myFunctions.joinRoom);
  const leaveRoom = useMutation(api.myFunctions.leaveRoom);

  if (room === undefined) return <div>Loading...</div>;
  if (room === null) return <div>This room does not exist</div>;

  return (
    <main className="container max-w-2xl flex flex-col gap-2 mt-8">
      <h1 className="text-4xl font-extrabold text-center">
        billsplit: {params.roomCode}
      </h1>

      <br />

      {!inRoom && (
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            disabled={name === ""}
            onClick={() => {
              joinRoom({ roomId: room._id, name }).catch(console.error);
              setInRoom(true);
            }}
          >
            Join room
          </Button>
        </div>
      )}

      {inRoom && (
        <Button
          onClick={() => {
            leaveRoom({ roomId: room._id, name }).catch(console.error);
            setInRoom(false);
          }}
        >
          Leave room
        </Button>
      )}

      <br />

      <h2 className="font-bold">Members</h2>
      <ul className="list-disc list-inside">
        {room.members.map((member) => (
          <li key={member}>{member}</li>
        ))}
      </ul>
    </main>
  );
}
