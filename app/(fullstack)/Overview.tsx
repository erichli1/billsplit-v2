import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

export default function Overview({
  rooms,
}: {
  rooms:
    | {
        _id: Id<"rooms">;
        _creationTime: number;
        code: string;
        members: string[];
      }[]
    | undefined;
}) {
  const createRoom = useMutation(api.myFunctions.addRoom);

  const [name, setName] = useState<string>("");

  return (
    <main className="container max-w-2xl flex flex-col gap-2">
      <h1 className="text-4xl font-extrabold my-8 text-center">billsplit</h1>
      <h2 className="font-bold">Rooms</h2>
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
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
    </main>
  );
}
