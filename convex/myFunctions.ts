import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { generateRandomFourLetterString } from "./utils";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db.query("numbers").take(args.count);
    return numbers.map((number) => number.value);
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});

export const createRoom = mutation({
  args: {},
  handler: async (ctx) => {
    const code = generateRandomFourLetterString();
    await ctx.db.insert("rooms", {
      code: code,
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

export const addMemberToRoom = mutation({
  args: { roomId: v.id("rooms"), name: v.string() },
  handler: async (ctx, { roomId, name }) => {
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");

    await ctx.db.insert("members", {
      name,
      roomId,
    });
  },
});

export const removeMember = mutation({
  args: { memberId: v.id("members") },
  handler: async (ctx, { memberId }) => {
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
