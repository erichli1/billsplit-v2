import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { generateRandomFourLetterString } from "./utils";

export const createRoom = mutation({
  args: {},
  handler: async (ctx) => {
    const code = generateRandomFourLetterString();
    await ctx.db.insert("rooms", {
      code: code,
      total: 0,
    });
    return code;
  },
});

export const getRoom = query({
  args: { roomCode: v.string() },
  handler: async (ctx, { roomCode }) => {
    const room = await ctx.db
      .query("rooms")
      .filter((q) => q.eq(q.field("code"), roomCode))
      .collect();
    if (!room || room.length === 0) return null;

    const members = await ctx.db
      .query("members")
      .filter((q) => q.eq(q.field("roomId"), room[0]._id))
      .collect();

    const items = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("roomId"), room[0]._id))
      .collect();

    return { ...room[0], members, items };
  },
});

export const deleteRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    // Delete all items of a room
    const items = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    await Promise.all(items.map((item) => ctx.db.delete(item._id)));

    // Delete all members of a room
    const members = await ctx.db
      .query("members")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    await Promise.all(members.map((member) => ctx.db.delete(member._id)));

    // Delete room
    await ctx.db.delete(roomId);
  },
});

export const addMembersToRoom = mutation({
  args: { roomId: v.id("rooms"), names: v.array(v.string()) },
  handler: async (ctx, { roomId, names }) => {
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");

    await Promise.all(
      names.map((name) => ctx.db.insert("members", { name, roomId }))
    );
  },
});

export const removeMember = mutation({
  args: { memberId: v.id("members"), roomId: v.id("rooms") },
  handler: async (ctx, { memberId, roomId }) => {
    const items = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();

    // Remove member from all items (if exists)
    for (const item of items) {
      const newMemberIds = item.memberIds.filter(
        (memberIdFromItem) => memberIdFromItem !== memberId
      );

      if (newMemberIds.length !== item.memberIds.length)
        await ctx.db.patch(item._id, { memberIds: newMemberIds });
    }

    await ctx.db.delete(memberId);
  },
});

export const addItem = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    await ctx.db.insert("items", {
      roomId,
      cost: 0,
      name: "",
      memberIds: [],
    });
  },
});

export const updateItemName = mutation({
  args: { itemId: v.id("items"), name: v.string() },
  handler: async (ctx, { itemId, name }) => {
    await ctx.db.patch(itemId, { name });
  },
});

export const updateItemCost = mutation({
  args: { itemId: v.id("items"), cost: v.number() },
  handler: async (ctx, { itemId, cost }) => {
    await ctx.db.patch(itemId, { cost });
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    await ctx.db.delete(itemId);
  },
});

export const addMembersToItem = mutation({
  args: { itemId: v.id("items"), memberIds: v.array(v.id("members")) },
  handler: async (ctx, { itemId, memberIds }) => {
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");

    const membersOfRoom = await ctx.db
      .query("members")
      .filter((q) => q.eq(q.field("roomId"), item.roomId))
      .collect();

    const validMemberIds = memberIds.filter(
      (memberId) =>
        membersOfRoom.find((member) => member._id === memberId) !== undefined
    );

    // Add new members to item
    const newMemberIds = Array.from(
      new Set([...item.memberIds, ...validMemberIds])
    );
    await ctx.db.patch(itemId, { memberIds: newMemberIds });
  },
});

export const removeMembersFromItem = mutation({
  args: { itemId: v.id("items"), memberIds: v.array(v.id("members")) },
  handler: async (ctx, { itemId, memberIds }) => {
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");

    // Remove members from item (if they exist)
    const newMemberIds = item.memberIds.filter(
      (memberId) => !memberIds.includes(memberId)
    );
    await ctx.db.patch(itemId, { memberIds: newMemberIds });
  },
});

export const updateRoomTotal = mutation({
  args: { roomId: v.id("rooms"), total: v.number() },
  handler: async (ctx, { roomId, total }) => {
    await ctx.db.patch(roomId, { total });
  },
});
