import { query } from "./_generated/server";

export const listAudit = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_project_createdAt")
      .order("desc")
      .take(10);

    return logs.map((log) => ({
      id: log._id,
      actorId: log.actorId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      createdAt: log.createdAt,
    }));
  },
});
