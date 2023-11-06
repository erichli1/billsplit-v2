"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "@/components/typography/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [joinRoomInput, setJoinRoomInput] = useState<string>("");

  const router = useRouter();

  const getRoom = useQuery(api.myFunctions.getRoom, {
    roomCode: joinRoomInput,
  });

  const createRoom = useMutation(api.myFunctions.createRoom);

  return (
    <main className="container max-w-2xl flex flex-col gap-2 mt-8">
      <h1 className="text-4xl font-extrabold text-center">billsplit</h1>

      <br />

      <h2 className="font-bold">Create Room</h2>
      <Button
        variant="outline"
        onClick={() => {
          createRoom()
            .then((code) => router.push(`/rooms/${code}`))
            .catch(console.error);
        }}
      >
        Create room
      </Button>

      <br />

      <h2 className="font-bold">Join Room</h2>
      <div className="flex w-full items-center space-x-2">
        <Input
          placeholder="Room to join"
          value={joinRoomInput}
          onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
        />
        {getRoom && (
          <Button asChild>
            <Link href={`/rooms/${joinRoomInput}`} className="no-underline">
              Join Room
            </Link>
          </Button>
        )}
      </div>
    </main>
  );
}
