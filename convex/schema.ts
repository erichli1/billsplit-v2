// OPTIONAL: Rename this file to `schema.ts` to declare the shape
// of the data in your database.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    rooms: defineTable({
      code: v.string(),
      total: v.number(),
    }).index("byCode", ["code"]),
    members: defineTable({
      name: v.string(),
      roomId: v.id("rooms"),
    }).index("byRoomAndName", ["roomId"]),
    items: defineTable({
      roomId: v.id("rooms"),
      name: v.string(),
      cost: v.number(),
      memberIds: v.array(v.id("members")),
    }).index("byRoomId", ["roomId"]),
  },
  // If you ever get an error about schema mismatch
  // between your data and your schema, and you cannot
  // change the schema to match the current data in your database,
  // you can:
  //  1. Use the dashboard to delete tables or individual documents
  //     that are causing the error.
  //  2. Change this option to `false` and make changes to the data
  //     freely, ignoring the schema. Don't forget to change back to `true`!
  { schemaValidation: true }
);
