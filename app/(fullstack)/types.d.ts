import { Id } from "@/convex/_generated/dataModel";

export type Room = {
  _id: Id<"rooms">;
  _creationTime: number;
  code: string;
  members: string[];
};
