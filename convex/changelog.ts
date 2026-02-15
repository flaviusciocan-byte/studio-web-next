import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addChangelog = mutation({
  args: {
    message: v.string(),
    actorId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const changelogId = await ctx.db.insert("changelog", {
      message: args.message,
      createdAt: now,
    });

    await ctx.db.insert("auditLogs", {
      actorId: args.actorId,
      action: "changelog.add",
      entityType: "changelog",
      entityId: changelogId,
      createdAt: now,
    });

    return null;
  },
});

export const listChangelog = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("changelog")
      .withIndex("by_createdAt")
      .order("desc")
      .take(5);

    return entries.map((entry) => ({
      id: entry._id,
      message: entry.message,
      createdAt: entry.createdAt,
    }));
  },
});
