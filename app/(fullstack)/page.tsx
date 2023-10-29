"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Room } from "./types";
import RoomPage from "./RoomPage";

export default function Home() {
  const rooms = useQuery(api.myFunctions.getRooms);
  const createRoom = useMutation(api.myFunctions.addRoom);
  const joinRoom = useMutation(api.myFunctions.joinRoom);
  const leaveRoom = useMutation(api.myFunctions.leaveRoom);

  const [name, setName] = useState<string>("Jane Doe"); // set as default for easy dev
  const [roomToJoin, setRoomToJoin] = useState<string>("");
  const [inRoom, setInRoom] = useState<Room | null>(null);

  useEffect(() => {
    const foundRoom = rooms?.find((r) => r.code === roomToJoin);
    if (foundRoom) {
      if (inRoom === null)
        joinRoom({ roomId: foundRoom._id, name }).catch(console.error);
      setInRoom(foundRoom ?? null);
    } else if (inRoom !== null && !foundRoom) {
      leaveRoom({ roomId: inRoom._id, name }).catch(console.error);
      setInRoom(null);
    }
  }, [rooms, roomToJoin, inRoom, joinRoom, name, leaveRoom]);

  return (
    <main className="container max-w-2xl flex flex-col gap-2 mt-8">
      <h1 className="text-4xl font-extrabold text-center">
        billsplit {inRoom ? ": " + inRoom?.code : ""}
      </h1>
      <h2 className="font-bold">Name</h2>
      <Input value={name} onChange={(e) => setName(e.target.value)} />

      <br />

      {!inRoom && (
        <>
          <h2 className="font-bold">Live rooms</h2>
          <ul className="list-disc list-inside">
            {rooms
              ? rooms?.map((room) => (
                  <li key={room._id}>
                    {room.code}: {room.members.join(", ")}
                  </li>
                ))
              : "Loading..."}
          </ul>

          <br />

          <h2 className="font-bold">Create Room</h2>
          {name === "" && (
            <p className="text-sm">
              You need to enter your name to create a room
            </p>
          )}
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                createRoom({ initiator: name }).catch(console.error);
              }}
              disabled={name === ""}
            >
              Create room
            </Button>
          </div>

          <br />
        </>
      )}

      <h2 className="font-bold">Join Room</h2>
      {name === "" && (
        <p className="text-sm">You need to enter your name to join a room</p>
      )}
      {rooms && (
        <Input
          placeholder="Room to join"
          value={roomToJoin}
          onChange={(e) => setRoomToJoin(e.target.value)}
          disabled={rooms.length === 0 || name === ""}
        />
      )}

      {inRoom && <RoomPage room={inRoom} />}
    </main>
  );
}
