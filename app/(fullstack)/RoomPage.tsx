import { Room } from "./types";

export default function RoomPage({ room }: { room: Room }) {
  return (
    <>
      <h2 className="font-bold">Members</h2>
      <p>{room.members.join(", ")}</p>
    </>
  );
}
