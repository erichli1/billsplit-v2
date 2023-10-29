"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "@/components/typography/link";

export default function Home() {
  const [name, setName] = useState<string>("");
  const [joinRoomInput, setJoinRoomInput] = useState<string>("");

  const getRoom = useQuery(api.myFunctions.getRoom, {
    roomCode: joinRoomInput,
  });

  const createRoom = useMutation(api.myFunctions.addRoom);

  return (
    <main className="container max-w-2xl flex flex-col gap-2 mt-8">
      <h1 className="text-4xl font-extrabold text-center">billsplit</h1>

      <br />

      <h2 className="font-bold">Create Room</h2>
      {name === "" && (
        <p className="text-sm">You need to enter your name to create a room</p>
      )}
      <div className="flex w-full items-center space-x-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
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

      <h2 className="font-bold">Join Room</h2>
      <div className="flex w-full items-center space-x-2">
        <Input
          placeholder="Room to join"
          value={joinRoomInput}
          onChange={(e) => setJoinRoomInput(e.target.value)}
        />
        {getRoom && (
          <Button asChild>
            <Link href={`/rooms/${joinRoomInput}`}>Join Room</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
