import { Id } from "@/convex/_generated/dataModel";

export type Room = {
  _id: Id<"rooms">;
  _creationTime: number;
  code: string;
  members: Array<Member>;
  items: Array<Item>;
  total?: number;
};

export type Member = {
  _id: Id<"members">;
  _creationTime: number;
  name: string;
  roomId: Id<"rooms">;
};

export type Item = {
  _id: Id<"items">;
  _creationTime: number;
  roomId: Id<"rooms">;
  name: string;
  cost: number;
  memberIds: Array<Id<"members">>;
};

export type MemberBill = {
  memberId: Id<"members">;
  bill: number;
};
